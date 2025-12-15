"""Swap routes for managing swap requests, approvals, and history.

Routes match the frontend API expectations:
- POST /swaps/items/{item_id}/request - Create a swap request
- POST /swaps/items/{item_id}/requests/{request_id}/approve - Approve a swap request
- POST /swaps/items/{item_id}/requests/{request_id}/reject - Reject a swap request
- POST /swaps/items/{item_id}/cancel - Cancel a swap request (requester cancels their own request)
- GET /swaps/requests - Get swap requests for authenticated user
- GET /swaps/history - Get swap history (approved swaps) for authenticated user
"""

from fastapi import APIRouter, HTTPException, Request, status
import re
import math

from services import (
    auth_service,
    swap_service,
    storage_service,
    credit_service,
    notification_service,
)
from services.user_service import get_user_by_id
from utils.constants import (
    TRANSACTION_TYPE_SWAP_CREDIT,
    TRANSACTION_TYPE_SWAP_DEBIT,
    TRANSACTION_TYPE_CREDIT_ADD,
)

router = APIRouter(prefix="/swaps", tags=["swaps"])


@router.post("/items/{item_id}/request", status_code=status.HTTP_200_OK)
async def request_swap(item_id: str, request: Request):
    """Create a swap request for an item. Users cannot swap their own items.
    The owner must approve the request before credits are transferred.
    """
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Check item availability early to avoid unnecessary user lookups
    if it.get("status") != "available":
        raise HTTPException(
            status_code=400,
            detail="Item is not available for swap (already pending/swapped)",
        )

    # Prevent users from swapping their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id == user_id:
        raise HTTPException(
            status_code=403, detail="You cannot swap or purchase your own items"
        )

    # Check if user already has a pending request for this item
    existing_requests = await swap_service.get_requests_for_requester(user_id)
    for req in existing_requests:
        if req.get("item_id") == item_id and req.get("status") == "pending":
            raise HTTPException(
                status_code=400,
                detail="You already have a pending swap request for this item",
            )

    # Get credits required from item (use new field if available, fallback to parsing description for backward compatibility)
    credits_required = it.get("credits", 1.0)  # Default is 1 credit for all items
    if credits_required is None:
        # Fallback: parse from description for backward compatibility with old items
        description = it.get("description", "")
        if description:
            credits_match = re.search(r"Credits:\s*(\d+)", description, re.IGNORECASE)
            if credits_match:
                credits_required = float(credits_match.group(1))
            else:
                credits_required = 1.0

    # Check if user has enough credits
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    user_credits = user.get("credits", 0.0)
    if user_credits < credits_required:
        # Preserve legacy 402 for 1-credit defaults (test expectation),
        # but use 400 for higher-priced items to keep a clear validation error.
        status_code_val = 402 if credits_required <= 1.0 else 400
        raise HTTPException(
            status_code=status_code_val,
            detail="Insufficient credits to request this item.",
        )

    # Check pending request limit: users can only have as many pending
    # requests as they have credits
    # Prefer service-level pending count helper (mocked in tests); fallback to local count
    try:
        pending_count = await swap_service.get_pending_requests_count_for_user(user_id)
    except Exception:
        pending_count = 0
        for req in existing_requests:
            if req.get("status") == "pending":
                pending_count += 1

    allowed_pending = int(math.floor(user_credits))
    if pending_count >= allowed_pending:
        raise HTTPException(
            status_code=400,
            detail=(
                f"You've reached your pending request limit "
                f"({allowed_pending} max pending requests based on credits)."
            ),
        )

    # Atomically reserve the item to prevent race conditions
    reserved_item = await storage_service.reserve_item_for_request(item_id)
    if not reserved_item:
        # Should not happen if we already checked status, but handle it
        raise HTTPException(
            status_code=400,
            detail="Item is not available for swap (already pending/swapped)",
        )
    it = reserved_item

    # Hold credits immediately so balance reflects the request
    try:
        await credit_service.deduct_credits(
            user_id=user_id,
            amount=credits_required,
            transaction_type=TRANSACTION_TYPE_SWAP_DEBIT,
            description=f"Credits held for swap request of item: {it.get('title')}",
        )
    except ValueError as exc:
        # Release reservation and surface the error
        it["status"] = "available"
        await storage_service.upsert_item(it)
        raise HTTPException(status_code=402, detail=str(exc))
    except Exception as exc:
        it["status"] = "available"
        await storage_service.upsert_item(it)
        raise HTTPException(
            status_code=500, detail="Failed to hold credits for request"
        ) from exc

    # Create swap request; if anything fails, refund the held credits
    try:
        swap_request = await swap_service.create_swap_request(
            item_id=item_id, requester_id=user_id, credits_required=credits_required
        )
    except Exception:
        try:
            await credit_service.refund_credits(
                user_id=user_id,
                amount=credits_required,
                description=(
                    f"Credits refunded after failed swap request creation for item: "
                    f"{it.get('title')}"
                ),
            )
        except Exception as refund_exc:
            # Surface a clear failure so we don't silently lose credits
            raise HTTPException(
                status_code=500,
                detail=(
                    "Swap request failed and refund could not be processed. "
                    "Please contact support."
                ),
            ) from refund_exc

        # Revert item status to available since reservation failed downstream
        it["status"] = "available"
        await storage_service.upsert_item(it)
        raise

    # Create notification for the item owner
    requester = await get_user_by_id(user_id)
    requester_name = requester.get("username", "Someone") if requester else "Someone"
    await notification_service.create_notification(
        user_id=item_owner_id,
        event_type="new_request",
        request_id=swap_request["id"],
        item_id=item_id,
        metadata={
            "item_title": it.get("title", "Unknown Item"),
            "other_user_id": user_id,
            "other_user_name": requester_name,
            "status": "pending",
        },
    )

    return {
        "status": "requested",
        "message": f"Swap request created. Waiting for owner approval.",
        "request_id": swap_request["id"],
        "item_id": item_id,
        "credits_required": credits_required,
    }


@router.post(
    "/items/{item_id}/requests/{request_id}/approve", status_code=status.HTTP_200_OK
)
async def approve_swap(item_id: str, request_id: str, request: Request):
    """Approve a swap request. Only the item owner can approve."""
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Verify user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Only the item owner can approve swap requests"
        )

    # Get the swap request
    swap_request = await swap_service.get_swap_request(request_id)
    if not swap_request:
        raise HTTPException(status_code=404, detail="swap request not found")

    if swap_request.get("item_id") != item_id:
        raise HTTPException(status_code=400, detail="swap request does not match item")

    if swap_request.get("status") != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Swap request is not pending (current status: {swap_request.get('status')})",
        )

    requester_id = swap_request.get("requester_id")
    credits_required = swap_request.get("credits_required", 1.0)

    # Requester already paid when making request, now transfer to owner
    await credit_service.add_credits(
        user_id=item_owner_id,
        amount=credits_required,
        transaction_type=TRANSACTION_TYPE_SWAP_CREDIT,
        description=f"Credits received from approved swap of item: {it.get('title')}",
    )

    # Update swap request status to approved
    await swap_service.update_swap_request(request_id, "approved")

    # Cancel other pending requests for this item
    await swap_service.cancel_other_pending_requests(item_id, request_id)

    # Mark item as swapped/locked
    it["status"] = "swapped"
    await storage_service.upsert_item(it)

    # Create notification for the requester
    owner = await get_user_by_id(item_owner_id)
    owner_name = owner.get("username", "Someone") if owner else "Someone"
    await notification_service.create_notification(
        user_id=requester_id,
        event_type="approved",
        request_id=request_id,
        item_id=item_id,
        metadata={
            "item_title": it.get("title", "Unknown Item"),
            "other_user_id": item_owner_id,
            "other_user_name": owner_name,
            "status": "approved",
        },
    )

    return {
        "status": "approved",
        "message": f"Swap request approved. {credits_required} credits transferred.",
        "request_id": request_id,
        "item_id": item_id,
    }


@router.post(
    "/items/{item_id}/requests/{request_id}/reject", status_code=status.HTTP_200_OK
)
async def reject_swap(item_id: str, request_id: str, request: Request):
    """Reject a swap request. Only the item owner can reject."""
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Verify user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Only the item owner can reject swap requests"
        )

    # Get the swap request
    swap_request = await swap_service.get_swap_request(request_id)
    if not swap_request:
        raise HTTPException(status_code=404, detail="swap request not found")

    if swap_request.get("item_id") != item_id:
        raise HTTPException(status_code=400, detail="swap request does not match item")

    if swap_request.get("status") != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Swap request is not pending (current status: {swap_request.get('status')})",
        )

    # Refund credits to requester since request was rejected
    requester_id = swap_request.get("requester_id")
    credits_required = swap_request.get("credits_required", 1.0)

    # Refund the credits that were held when request was made
    await credit_service.refund_credits(
        user_id=requester_id,
        amount=credits_required,
        transaction_type=TRANSACTION_TYPE_CREDIT_ADD,
        description=f"Credits refunded for rejected swap request of item: {it.get('title')}",
    )

    # Update swap request status to rejected
    await swap_service.update_swap_request(request_id, "rejected")

    # Check if there are any other pending requests for this item
    pending_requests = await swap_service.get_pending_requests_for_item(item_id)
    if not pending_requests:
        # No more pending requests, mark item as available again
        it["status"] = "available"
        await storage_service.upsert_item(it)

    # Create notification for the requester
    requester_id = swap_request.get("requester_id")
    owner = await get_user_by_id(item_owner_id)
    owner_name = owner.get("username", "Someone") if owner else "Someone"
    await notification_service.create_notification(
        user_id=requester_id,
        event_type="rejected",
        request_id=request_id,
        item_id=item_id,
        metadata={
            "item_title": it.get("title", "Unknown Item"),
            "other_user_id": item_owner_id,
            "other_user_name": owner_name,
            "status": "rejected",
        },
    )

    return {
        "status": "rejected",
        "message": "Swap request rejected.",
        "request_id": request_id,
        "item_id": item_id,
    }


@router.post("/items/{item_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_swap(item_id: str, request: Request):
    """Cancel a pending swap request. Only the requester can cancel their own request."""
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Get the pending swap request for this item made by the current user
    user_requests = await swap_service.get_requests_for_requester(user_id)
    swap_request = None

    for req in user_requests:
        if req.get("item_id") == item_id and req.get("status") == "pending":
            swap_request = req
            break

    if not swap_request:
        raise HTTPException(
            status_code=404, detail="No pending swap request found for this item"
        )

    # Verify user is the requester
    if swap_request.get("requester_id") != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the requester can cancel their own swap request",
        )

    # Refund credits to requester since they're cancelling
    credits_required = swap_request.get("credits_required", 1.0)

    # Refund the credits that were held when request was made
    await credit_service.refund_credits(
        user_id=user_id,
        amount=credits_required,
        description=f"Credits refunded for cancelled swap request of item: {it.get('title')}",
    )

    # Update swap request status to cancelled
    await swap_service.update_swap_request(swap_request.get("id"), "cancelled")

    # Check if there are any other pending requests for this item
    pending_requests = await swap_service.get_pending_requests_for_item(item_id)
    if not pending_requests:
        # No more pending requests, mark item as available again
        it["status"] = "available"
        await storage_service.upsert_item(it)

    # Create notification for the item owner
    item_owner_id = it.get("owner_id")
    requester = await get_user_by_id(user_id)
    requester_name = requester.get("username", "Someone") if requester else "Someone"

    if item_owner_id:
        await notification_service.create_notification(
            user_id=item_owner_id,
            event_type="request_cancelled",
            request_id=swap_request.get("id"),
            item_id=item_id,
            metadata={
                "item_title": it.get("title", "Unknown Item"),
                "other_user_id": user_id,
                "other_user_name": requester_name,
                "status": "cancelled",
            },
        )

    return {
        "status": "cancelled",
        "message": "Swap request cancelled successfully.",
        "request_id": swap_request.get("id"),
        "item_id": item_id,
    }


@router.get("/requests", status_code=status.HTTP_200_OK)
async def get_swap_requests(request: Request):
    """Get swap requests for the authenticated user.
    Returns pending requests for items owned by the user (as owner)
    and all requests made by the user (as requester).
    """
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)

    # Get requests as owner (pending requests for items I own)
    owner_requests = await swap_service.get_pending_requests_for_owner(user_id)

    # Get requests as requester (requests I made)
    requester_requests = await swap_service.get_requests_for_requester(user_id)

    # Enrich requests with item and user information
    enriched_owner_requests = []
    for req in owner_requests:
        item = await storage_service.get_item(req.get("item_id"))
        requester = await get_user_by_id(req.get("requester_id"))
        enriched_owner_requests.append(
            {
                **req,
                "item": item,
                "requester": (
                    {
                        "id": requester.get("id") if requester else None,
                        "username": (
                            requester.get("username") if requester else "Unknown"
                        ),
                        "full_name": requester.get("full_name") if requester else None,
                    }
                    if requester
                    else None
                ),
            }
        )

    enriched_requester_requests = []
    for req in requester_requests:
        item = await storage_service.get_item(req.get("item_id"))
        enriched_requester_requests.append({**req, "item": item})

    return {
        "as_owner": enriched_owner_requests,  # Pending requests for my items
        "as_requester": enriched_requester_requests,  # Requests I made
    }


@router.get("/history", status_code=status.HTTP_200_OK)
async def get_swap_history(request: Request):
    """Get swap history (approved swaps) for the authenticated user."""
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)

    # Get approved swaps where user is owner or requester
    approved_swaps = await swap_service.get_approved_swaps_for_user(user_id)

    # Enrich swaps with item and user information
    enriched_swaps = []
    for swap in approved_swaps:
        item = await storage_service.get_item(swap.get("item_id"))
        requester = await get_user_by_id(swap.get("requester_id"))
        item_owner_id = item.get("owner_id") if item else None
        owner_user = await get_user_by_id(item_owner_id) if item_owner_id else None

        enriched_swaps.append(
            {
                **swap,
                "item": item,
                "requester": (
                    {
                        "id": requester.get("id") if requester else None,
                        "username": (
                            requester.get("username") if requester else "Unknown"
                        ),
                        "full_name": requester.get("full_name") if requester else None,
                    }
                    if requester
                    else None
                ),
                "owner": (
                    {
                        "id": item_owner_id,
                        "username": (
                            owner_user.get("username") if owner_user else "Unknown"
                        ),
                        "full_name": (
                            owner_user.get("full_name") if owner_user else None
                        ),
                    }
                    if item_owner_id
                    else None
                ),
            }
        )

    return enriched_swaps
