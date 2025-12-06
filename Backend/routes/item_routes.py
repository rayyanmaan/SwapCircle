"""Item CRUD routes (file-backed storage + image handling).

This implementation is local-only and meant for development. It uses
`Backend/services/storage_service.py` (JSON file storage) and
`Backend/services/image_service.py` (filesystem images).
"""
from typing import List, Optional
from uuid import uuid4
import json
import re

from fastapi import APIRouter, UploadFile, File, Body, HTTPException, status, Request
from pydantic import ValidationError

from models.item_model import ItemCreate, ItemOut, ItemUpdate
from services import storage_service
from services import image_service, auth_service, credit_service


router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    request: Request,
    images: Optional[List[UploadFile]] = File(None),
):
    # Support JSON bodies and multipart/form-data with JSON in 'item' form field.
    # We parse manually to avoid FastAPI trying to parse Body() from multipart data.
    item = None
    ctype = request.headers.get("content-type", "")
    
    if ctype.startswith("application/json"):
        try:
            body = await request.json()
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse JSON body: {str(e)}"
            )
        if body:
            try:
                item = ItemCreate(**body)
            except ValidationError as e:
                # Format Pydantic validation errors for better readability
                errors = []
                for error in e.errors():
                    field = " -> ".join(str(loc) for loc in error["loc"])
                    msg = error["msg"]
                    errors.append(f"{field}: {msg}")
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": "Validation error",
                        "errors": errors,
                        "received_data": body
                    }
                )
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid item payload: {str(e)}. Received: {body}"
                )
    elif ctype.startswith("multipart/form-data"):
        # For multipart, try to get 'item' from form data as JSON string
        try:
            form_data = await request.form()
            item_str = form_data.get("item")
            if not item_str:
                raise HTTPException(
                    status_code=400,
                    detail="Missing 'item' field in form data. Expected JSON string in 'item' field."
                )
            try:
                item_dict = json.loads(item_str)
            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to parse 'item' field as JSON: {str(e)}. Received: {item_str[:100]}"
                )
            try:
                item = ItemCreate(**item_dict)
            except ValidationError as e:
                # Format Pydantic validation errors for better readability
                errors = []
                for error in e.errors():
                    field = " -> ".join(str(loc) for loc in error["loc"])
                    msg = error["msg"]
                    errors.append(f"{field}: {msg}")
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": "Validation error",
                        "errors": errors,
                        "received_data": item_dict
                    }
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing multipart form data: {str(e)}"
            )
    else:
        # If content-type is not JSON or multipart, try to parse as JSON anyway
        try:
            body = await request.json()
            if body:
                try:
                    item = ItemCreate(**body)
                except ValidationError as e:
                    errors = []
                    for error in e.errors():
                        field = " -> ".join(str(loc) for loc in error["loc"])
                        msg = error["msg"]
                        errors.append(f"{field}: {msg}")
                    raise HTTPException(
                        status_code=422,
                        detail={
                            "message": "Validation error",
                            "errors": errors,
                            "received_data": body
                        }
                    )
        except Exception:
            # If JSON parsing fails, we'll handle it below
            pass
    
    if item is None:
        raise HTTPException(
            status_code=400,
            detail="Item payload required. Expected JSON body with 'title' (required) and 'description' (optional) fields."
        )

    # Require authentication and set owner_id from token
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        owner_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")

    item_id = str(uuid4())
    images_out = []
    if images:
        for up in images:
            url, img_id = image_service.upload_image(up)
            images_out.append({"id": img_id, "url": url})

    stored = {
        "id": item_id,
        "title": item.title,
        "description": item.description,
        "owner_id": owner_id,
        "status": "available",
        "images": images_out,
    }
    storage_service.upsert_item(stored)
    
    # Award 2 credits to the user for uploading an item
    try:
        credit_service.add_credits(
            user_id=owner_id,
            amount=2.0,
            transaction_type="item_upload",
            description=f"Credits awarded for uploading item: {item.title}"
        )
    except Exception as e:
        # Log the error but don't fail the item creation
        print(f"Warning: Failed to award credits to user {owner_id}: {str(e)}")
    
    return ItemOut(**stored)


@router.get("/", response_model=List[ItemOut])
async def list_items():
    """List all items. Items with pending swap requests will have status 'pending'."""
    rows = storage_service.list_items()
    # Check for pending requests and update status if needed
    for item in rows:
        if item.get("status") == "available":
            pending_requests = swap_service.get_pending_requests_for_item(item.get("id"))
            if len(pending_requests) > 0:
                item["status"] = "pending"
    return [ItemOut(**r) for r in rows]


@router.get("/swap-requests", status_code=status.HTTP_200_OK)
async def get_swap_requests(request: Request):
    """Get swap requests for the authenticated user.
    Returns pending requests for items owned by the user (as owner) 
    and all requests made by the user (as requester).
    """
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
    # Get requests as owner (pending requests for items I own)
    owner_requests = swap_service.get_pending_requests_for_owner(user_id)
    
    # Get requests as requester (requests I made)
    requester_requests = swap_service.get_requests_for_requester(user_id)
    
    # Enrich requests with item and user information
    from services.user_service import get_user_by_id
    
    enriched_owner_requests = []
    for req in owner_requests:
        item = storage_service.get_item(req.get("item_id"))
        requester = get_user_by_id(req.get("requester_id"))
        enriched_owner_requests.append({
            **req,
            "item": {
                "id": item.get("id") if item else None,
                "title": item.get("title") if item else "Unknown",
                "images": item.get("images", []) if item else [],
            } if item else None,
            "requester": {
                "id": requester.get("id") if requester else None,
                "username": requester.get("username") if requester else "Unknown",
                "full_name": requester.get("full_name") if requester else None,
            } if requester else None,
        })
    
    enriched_requester_requests = []
    for req in requester_requests:
        item = storage_service.get_item(req.get("item_id"))
        enriched_requester_requests.append({
            **req,
            "item": {
                "id": item.get("id") if item else None,
                "title": item.get("title") if item else "Unknown",
                "images": item.get("images", []) if item else [],
            } if item else None,
        })
    
    return {
        "as_owner": enriched_owner_requests,  # Requests for my items (I need to approve/reject)
        "as_requester": enriched_requester_requests,  # Requests I made
    }


@router.get("/swap-history", status_code=status.HTTP_200_OK)
async def get_swap_history(request: Request):
    """Get swap history (approved swaps) for the authenticated user."""
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
    # Get approved swaps where user is owner or requester
    approved_swaps = swap_service.get_approved_swaps_for_user(user_id)
    
    # Enrich swaps with item and user information
    from services.user_service import get_user_by_id
    
    enriched_swaps = []
    for swap in approved_swaps:
        item = storage_service.get_item(swap.get("item_id"))
        requester = get_user_by_id(swap.get("requester_id"))
        item_owner = get_user_by_id(item.get("owner_id")) if item else None
        
        # Determine if user is the seller (owner) or buyer (requester)
        is_seller = item and item.get("owner_id") == user_id
        other_user = item_owner if not is_seller else requester
        
        enriched_swaps.append({
            **swap,
            "item": {
                "id": item.get("id") if item else None,
                "title": item.get("title") if item else "Unknown",
                "images": item.get("images", []) if item else [],
            } if item else None,
            "other_user": {
                "id": other_user.get("id") if other_user else None,
                "username": other_user.get("username") if other_user else "Unknown",
                "full_name": other_user.get("full_name") if other_user else None,
            } if other_user else None,
            "is_seller": is_seller,
        })
    
    return enriched_swaps


@router.get("/{item_id}", response_model=ItemOut)
async def get_item(item_id: str):
    """Get a single item. Status will be 'pending' if there are pending swap requests."""
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Check for pending requests and update status if needed
    if it.get("status") == "available":
        pending_requests = swap_service.get_pending_requests_for_item(item_id)
        if len(pending_requests) > 0:
            it["status"] = "pending"
    
    return ItemOut(**it)


@router.patch("/{item_id}", response_model=ItemOut)
async def update_item(
    item_id: str,
    patch: Optional[dict] = Body(None),
    images: Optional[List[UploadFile]] = File(None),
    request: Request = None,
):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    # Require authentication and ensure the caller is the owner
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        token_user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    # If item has an owner, only allow owner to modify
    if it.get("owner_id") and it.get("owner_id") != token_user_id:
        raise HTTPException(status_code=403, detail="forbidden")
    # Support JSON body patch when Content-Type is application/json
    patch_data = patch
    if request is not None:
        ctype = request.headers.get("content-type", "")
        if ctype.startswith("application/json"):
            try:
                patch_data = await request.json()
            except Exception:
                patch_data = patch

    if patch_data is None:
        raise HTTPException(status_code=400, detail="patch payload required")

    if "title" in patch_data:
        it["title"] = patch_data.get("title")
    if "description" in patch_data:
        it["description"] = patch_data.get("description")
    if "status" in patch_data:
        it["status"] = patch_data.get("status")

    if images:
        for up in images:
            url, img_id = image_service.upload_image(up)
            it.setdefault("images", []).append({"id": img_id, "url": url})

    storage_service.upsert_item(it)
    return ItemOut(**it)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    for img in it.get("images", []):
        image_service.delete_image(img.get("id"))

    storage_service.delete_item(item_id)
    return None


@router.post("/{item_id}/lock", status_code=status.HTTP_200_OK)
async def lock_item(item_id: str, request: Request):
    """Lock an item for swap/purchase. Users cannot lock their own items."""
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Prevent users from locking their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id == user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot swap or purchase your own items"
        )
    
    if it.get("status") == "locked":
        raise HTTPException(status_code=400, detail="already locked")
    
    it["status"] = "locked"
    storage_service.upsert_item(it)
    return {"status": "locked"}


@router.post("/{item_id}/unlock", status_code=status.HTTP_200_OK)
async def unlock_item(item_id: str, request: Request):
    """Unlock an item. Only the item owner can unlock their own items."""
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Only the owner can unlock their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the item owner can unlock this item"
        )
    
    if it.get("status") != "locked":
        raise HTTPException(status_code=400, detail="not locked")
    
    it["status"] = "available"
    storage_service.upsert_item(it)
    return {"status": "available"}


@router.post("/{item_id}/swap", status_code=status.HTTP_200_OK)
async def request_swap(item_id: str, request: Request):
    """Create a swap request for an item. Users cannot swap their own items.
    The owner must approve the request before credits are transferred.
    """
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
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
    from services.user_service import get_user_by_id
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


@router.post("/{item_id}/swap/{request_id}/approve", status_code=status.HTTP_200_OK)
async def approve_swap(item_id: str, request_id: str, request: Request):
    """Approve a swap request. Only the item owner can approve."""
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
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
    
    # Get the item
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Verify the user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the item owner can approve swap requests"
        )
    
    requester_id = swap_request.get("requester_id")
    credits_required = swap_request.get("credits_required", 2.0)
    
    # Verify requester still has enough credits
    from services.user_service import get_user_by_id
    requester = get_user_by_id(requester_id)
    if not requester:
        raise HTTPException(status_code=404, detail="requester not found")
    
    requester_credits = requester.get("credits", 0.0)
    if requester_credits < credits_required:
        raise HTTPException(
            status_code=400,
            detail=f"Requester no longer has sufficient credits. Required: {credits_required}, Available: {requester_credits}"
        )
    
    # Update swap request status to approved
    swap_service.update_swap_request(request_id, "approved")
    
    # Cancel other pending requests for this item
    swap_service.cancel_other_pending_requests(item_id, request_id)
    
    # Mark item as swapped/locked
    it["status"] = "swapped"
    storage_service.upsert_item(it)
    
    # NOW transfer credits (only after approval)
    # Deduct credits from buyer
    credit_service.deduct_credits(
        user_id=requester_id,
        amount=credits_required
    )
    
    # Add credits to seller
    credit_service.add_credits(
        user_id=item_owner_id,
        amount=credits_required,
        transaction_type="swap_credit",
        description=f"Credits received from approved swap of item: {it.get('title')}"
    )
    
    return {
        "status": "approved",
        "message": f"Swap request approved. {credits_required} credits transferred.",
        "request_id": request_id,
        "item_id": item_id,
        "credits_transferred": credits_required
    }


@router.post("/{item_id}/swap/{request_id}/reject", status_code=status.HTTP_200_OK)
async def reject_swap(item_id: str, request_id: str, request: Request):
    """Reject a swap request. Only the item owner can reject."""
    # Require authentication
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    
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
    
    # Get the item
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    
    # Verify the user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the item owner can reject swap requests"
        )
    
    # Update swap request status to rejected
    swap_service.update_swap_request(request_id, "rejected")
    
    # If no other pending requests, mark item as available again
    pending_requests = swap_service.get_pending_requests_for_item(item_id)
    if len(pending_requests) == 0:
        it["status"] = "available"
        storage_service.upsert_item(it)
    
    return {
        "status": "rejected",
        "message": "Swap request rejected.",
        "request_id": request_id,
        "item_id": item_id
    }
