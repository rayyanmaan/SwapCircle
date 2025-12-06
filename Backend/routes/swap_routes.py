"""Swap routes for managing swap requests, approvals, and history.

Routes match the frontend API expectations:
- POST /swaps/items/{item_id}/request - Create a swap request
- POST /swaps/items/{item_id}/requests/{request_id}/approve - Approve a swap request
- POST /swaps/items/{item_id}/requests/{request_id}/reject - Reject a swap request
- GET /swaps/requests - Get swap requests for authenticated user
- GET /swaps/history - Get swap history (approved swaps) for authenticated user
"""
from fastapi import APIRouter, HTTPException, Request, status
import re

from services import auth_service, swap_service, storage_service, credit_service
from services.user_service import get_user_by_id

router = APIRouter(prefix="/swaps", tags=["swaps"])


@router.post("/items/{item_id}/request", status_code=status.HTTP_200_OK)
async def request_swap(item_id: str, request: Request):
    """Create a swap request for an item. Users cannot swap their own items.
    The owner must approve the request before credits are transferred.
    """
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)
    
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Prevent users from swapping their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id == user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot swap or purchase your own items"
        )
    
    # Check if item is available (not already swapped or has pending request)
    if it.get("status") not in ["available", "pending"]:
        raise HTTPException(
            status_code=400,
            detail=f"Item is not available for swap (current status: {it.get('status')})"
        )
    
    # Check if user already has a pending request for this item
    existing_requests = swap_service.get_requests_for_requester(user_id)
    for req in existing_requests:
        if req.get("item_id") == item_id and req.get("status") == "pending":
            raise HTTPException(
                status_code=400,
                detail="You already have a pending swap request for this item"
            )
    
    # Parse metadata from description to get credits required
    description = it.get("description", "")
    credits_required = 2.0  # Default
    if description:
        credits_match = re.search(r"Credits:\s*(\d+)", description, re.IGNORECASE)
        if credits_match:
            credits_required = float(credits_match.group(1))
    
    # Check if user has enough credits
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    
    user_credits = user.get("credits", 0.0)
    if user_credits < credits_required:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient credits. Required: {credits_required}, Available: {user_credits}"
        )
    
    # Create swap request (don't transfer credits yet)
    swap_request = swap_service.create_swap_request(
        item_id=item_id,
        requester_id=user_id,
        credits_required=credits_required
    )
    
    # Mark item as pending (has a swap request)
    it["status"] = "pending"
    storage_service.upsert_item(it)
    
    return {
        "status": "requested",
        "message": f"Swap request created. Waiting for owner approval.",
        "request_id": swap_request["id"],
        "item_id": item_id,
        "credits_required": credits_required
    }


@router.post("/items/{item_id}/requests/{request_id}/approve", status_code=status.HTTP_200_OK)
async def approve_swap(item_id: str, request_id: str, request: Request):
    """Approve a swap request. Only the item owner can approve."""
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)
    
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Verify user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the item owner can approve swap requests"
        )
    
    # Get the swap request
    swap_request = swap_service.get_swap_request(request_id)
    if not swap_request:
        raise HTTPException(status_code=404, detail="swap request not found")
    
    if swap_request.get("item_id") != item_id:
        raise HTTPException(status_code=400, detail="swap request does not match item")
    
    if swap_request.get("status") != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Swap request is not pending (current status: {swap_request.get('status')})"
        )
    
    requester_id = swap_request.get("requester_id")
    credits_required = swap_request.get("credits_required", 2.0)
    
    # Transfer credits from requester to owner
    credit_service.deduct_credits(
        user_id=requester_id,
        amount=credits_required,
        transaction_type="swap_credit",
        description=f"Credits deducted for approved swap of item: {it.get('title')}"
    )
    
    credit_service.add_credits(
        user_id=item_owner_id,
        amount=credits_required,
        transaction_type="swap_credit",
        description=f"Credits received from approved swap of item: {it.get('title')}"
    )
    
    # Update swap request status to approved
    swap_service.update_swap_request(request_id, "approved")
    
    # Cancel other pending requests for this item
    swap_service.cancel_other_pending_requests(item_id, request_id)
    
    # Mark item as swapped/locked
    it["status"] = "swapped"
    storage_service.upsert_item(it)
    
    return {
        "status": "approved",
        "message": f"Swap request approved. {credits_required} credits transferred.",
        "request_id": request_id,
        "item_id": item_id
    }


@router.post("/items/{item_id}/requests/{request_id}/reject", status_code=status.HTTP_200_OK)
async def reject_swap(item_id: str, request_id: str, request: Request):
    """Reject a swap request. Only the item owner can reject."""
    # Require authentication
    user_id = auth_service.get_user_id_from_request(request)
    
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Verify user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the item owner can reject swap requests"
        )
    
    # Get the swap request
    swap_request = swap_service.get_swap_request(request_id)
    if not swap_request:
        raise HTTPException(status_code=404, detail="swap request not found")
    
    if swap_request.get("item_id") != item_id:
        raise HTTPException(status_code=400, detail="swap request does not match item")
    
    if swap_request.get("status") != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Swap request is not pending (current status: {swap_request.get('status')})"
        )
    
    # Update swap request status to rejected
    swap_service.update_swap_request(request_id, "rejected")
    
    # Check if there are any other pending requests for this item
    pending_requests = swap_service.get_pending_requests_for_item(item_id)
    if not pending_requests:
        # No more pending requests, mark item as available again
        it["status"] = "available"
        storage_service.upsert_item(it)
    
    return {
        "status": "rejected",
        "message": "Swap request rejected.",
        "request_id": request_id,
        "item_id": item_id
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
    owner_requests = swap_service.get_pending_requests_for_owner(user_id)
    
    # Get requests as requester (requests I made)
    requester_requests = swap_service.get_requests_for_requester(user_id)
    
    # Enrich requests with item and user information
    enriched_owner_requests = []
    for req in owner_requests:
        item = storage_service.get_item(req.get("item_id"))
        requester = get_user_by_id(req.get("requester_id"))
        enriched_owner_requests.append({
            **req,
            "item": item,
            "requester": {
                "id": requester.get("id") if requester else None,
                "username": requester.get("username") if requester else "Unknown",
                "full_name": requester.get("full_name") if requester else None,
            } if requester else None
        })
    
    enriched_requester_requests = []
    for req in requester_requests:
        item = storage_service.get_item(req.get("item_id"))
        enriched_requester_requests.append({
            **req,
            "item": item
        })
    
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
    approved_swaps = swap_service.get_approved_swaps_for_user(user_id)
    
    # Enrich swaps with item and user information
    enriched_swaps = []
    for swap in approved_swaps:
        item = storage_service.get_item(swap.get("item_id"))
        requester = get_user_by_id(swap.get("requester_id"))
        item_owner_id = item.get("owner_id") if item else None
        
        enriched_swaps.append({
            **swap,
            "item": item,
            "requester": {
                "id": requester.get("id") if requester else None,
                "username": requester.get("username") if requester else "Unknown",
                "full_name": requester.get("full_name") if requester else None,
            } if requester else None,
            "owner": {
                "id": item_owner_id,
                "username": get_user_by_id(item_owner_id).get("username") if item_owner_id else "Unknown",
                "full_name": get_user_by_id(item_owner_id).get("full_name") if item_owner_id else None,
            } if item_owner_id else None
        })
    
    return enriched_swaps

