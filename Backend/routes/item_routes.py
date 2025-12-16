"""Item CRUD routes (file-backed storage + image handling).

This module handles basic item operations:
- Creating, reading, updating, and deleting items
- Uploading item images
- Locking/unlocking items for swap

Swap-related operations (request, approve, reject) have been moved to
swap_routes.py to follow separation of concerns (#cs162-separationofconcerns).

This implementation is local-only and meant for development. It uses
`Backend/services/storage_service.py` (JSON file storage) and
`Backend/services/image_service.py` (filesystem images).

This code follows #cs110-CodeReadability by using clear function names,
meaningful comments, consistent error messages, and helpful documentation.
"""

from typing import List, Optional
from datetime import datetime, timedelta
from uuid import uuid4
import json
import re

# Note: re module removed as it's no longer needed (credits parsing moved to swap_routes)


from fastapi import APIRouter, UploadFile, File, Body, HTTPException, status, Request
from pydantic import ValidationError

from models.item_model import ItemCreate, ItemOut, ItemUpdate
from services import storage_service
from services import image_service, auth_service, credit_service, swap_service

# Note: swap_service is still imported here because get_item() checks for pending requests


router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    request: Request,
    images: Optional[List[UploadFile]] = File(None),
):
    """Create a new item listing.

    This endpoint supports both JSON and multipart/form-data requests.
    For multipart requests, the item data should be in a form field named 'item'
    as a JSON string, with images in separate form fields.

    Upon successful creation, the user is automatically awarded 1 credit
    for uploading an item (using the item_upload transaction type).

    Args:
        request: FastAPI Request object containing item data and authentication
        images: Optional list of image files to upload with the item

    Returns:
        ItemOut: The created item with generated ID and image URLs

    Raises:
        HTTPException:
            - 401 if authentication fails
            - 400 if item payload is missing or invalid
            - 422 if validation fails
    """
    # Support JSON bodies and multipart/form-data with JSON in 'item' form field.
    # We parse manually to avoid FastAPI trying to parse Body() from multipart data.
    item = None
    ctype = request.headers.get("content-type", "")
    if ctype.startswith("application/json"):
        try:
            body = await request.json()
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Failed to parse JSON body: {str(e)}"
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
                        "received_data": body,
                    },
                )
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid item payload: {str(e)}. Received: {body}",
                )
    elif ctype.startswith("multipart/form-data"):
        # For multipart, try to get 'item' from form data as JSON string
        try:
            form_data = await request.form()
            item_str = form_data.get("item")
            if not item_str:
                raise HTTPException(
                    status_code=400,
                    detail="Missing 'item' field in form data. Expected JSON string in 'item' field.",
                )
            try:
                item_dict = json.loads(item_str)
            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to parse 'item' field as JSON: {str(e)}. Received: {item_str[:100]}",
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
                        "received_data": item_dict,
                    },
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing multipart form data: {str(e)}",
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
                            "received_data": body,
                        },
                    )
        except Exception:
            # If JSON parsing fails, we'll handle it below
            pass

    if item is None:
        raise HTTPException(
            status_code=400,
            detail="Item payload required. Expected JSON body with 'title' (required) and 'description' (optional) fields.",
        )

    # Require authentication and set owner_id from token
    # Using centralized auth helper to avoid code duplication (#cs162-separationofconcerns)
    owner_id = auth_service.get_user_id_from_request(request)

    item_id = str(uuid4())
    images_out = []
    if images:
        try:
            for up in images:
                url, img_id = await image_service.upload_image(up)
                images_out.append({"id": img_id, "url": url})
        except HTTPException:
            # Re-raise HTTPExceptions (validation errors, etc.)
            raise
        except Exception as e:
            # Wrap other exceptions (like Firebase errors) in HTTPException
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image: {str(e)}",
            )

    stored = {
        "id": item_id,
        "title": item.title,
        "description": item.description,
        "category": item.category,
        "size": item.size,
        "location": item.location,
        "condition": item.condition,
        "branded": item.branded,
        "credits": item.credits,
        "owner_id": owner_id,
        "status": "available",
        "images": images_out,
    }
    await storage_service.upsert_item(stored)

    # Award 1 credit to the user for uploading an item
    # Using transaction type constant to ensure consistency
    from utils.constants import TRANSACTION_TYPE_ITEM_UPLOAD

    try:
        new_balance = await credit_service.add_credits(
            user_id=owner_id,
            amount=1.0,
            transaction_type=TRANSACTION_TYPE_ITEM_UPLOAD,
            description=f"Credits awarded for uploading item: {item.title}",
        )
        print(
            f"Successfully awarded 1 credit to user {owner_id}. New balance: {new_balance}"
        )
    except Exception as e:
        # Log the error but don't fail the item creation
        import traceback

        print(f"ERROR: Failed to award credits to user {owner_id}: {str(e)}")
        print(traceback.format_exc())
    return ItemOut(**stored)


@router.get("/", response_model=List[ItemOut])
async def list_items(owner_id: str = None, status: str = None):
    """
    List all items with optional filtering.

    Query parameters:
    - owner_id: Filter items by owner
    - status: Filter by status (available, pending, sold)

    Items with pending swap requests will automatically get status 'pending'.
    """
    rows = await storage_service.list_items(owner_id=owner_id, status=status)

    # Apply status filter
    if status:
        rows = [item for item in rows if item.get("status") == status]

    # Update status based on pending swap requests
    for item in rows:
        if item.get("status") == "available":
            pending_requests = await swap_service.get_pending_requests_for_item(
                item.get("id")
            )
            if pending_requests:
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
    owner_requests = await swap_service.get_pending_requests_for_owner(user_id)

    # Get requests as requester (requests I made)
    requester_requests = await swap_service.get_requests_for_requester(user_id)

    # Enrich requests with item and user information
    from services.user_service import get_user_by_id

    enriched_owner_requests = []
    for req in owner_requests:
        item = await storage_service.get_item(req.get("item_id"))
        requester = await get_user_by_id(req.get("requester_id"))
        enriched_owner_requests.append(
            {
                **req,
                "item": (
                    {
                        "id": item.get("id") if item else None,
                        "title": item.get("title") if item else "Unknown",
                        "images": item.get("images", []) if item else [],
                    }
                    if item
                    else None
                ),
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
        enriched_requester_requests.append(
            {
                **req,
                "item": (
                    {
                        "id": item.get("id") if item else None,
                        "title": item.get("title") if item else "Unknown",
                        "images": item.get("images", []) if item else [],
                    }
                    if item
                    else None
                ),
            }
        )

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
    approved_swaps = await swap_service.get_approved_swaps_for_user(user_id)

    # Enrich swaps with item and user information
    from services.user_service import get_user_by_id

    enriched_swaps = []
    for swap in approved_swaps:
        item = await storage_service.get_item(swap.get("item_id"))
        requester = await get_user_by_id(swap.get("requester_id"))
        item_owner = await get_user_by_id(item.get("owner_id")) if item else None

        # Determine if user is the seller (owner) or buyer (requester)
        is_seller = item and item.get("owner_id") == user_id
        other_user = item_owner if not is_seller else requester

        enriched_swaps.append(
            {
                **swap,
                "item": (
                    {
                        "id": item.get("id") if item else None,
                        "title": item.get("title") if item else "Unknown",
                        "images": item.get("images", []) if item else [],
                    }
                    if item
                    else None
                ),
                "other_user": (
                    {
                        "id": other_user.get("id") if other_user else None,
                        "username": (
                            other_user.get("username") if other_user else "Unknown"
                        ),
                        "full_name": (
                            other_user.get("full_name") if other_user else None
                        ),
                    }
                    if other_user
                    else None
                ),
                "is_seller": is_seller,
            }
        )

    return enriched_swaps


@router.get("/{item_id}", response_model=ItemOut)
async def get_item(item_id: str):
    """Get a single item by ID.

    The item's status will be automatically updated to 'pending' if there
    are any pending swap requests for this item, providing accurate
    availability information.

    Args:
        item_id: The unique identifier of the item to retrieve

    Returns:
        ItemOut: The requested item

    Raises:
        HTTPException: 404 if item not found
    """
    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Check for pending requests and update status if needed
    if it.get("status") == "available":
        pending_requests = await swap_service.get_pending_requests_for_item(item_id)
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
    """Update an existing item.

    Only the item owner can update their items. This endpoint supports
    partial updates (PATCH semantics) - only provided fields will be updated.
    New images can be added by including them in the request. Existing images
    can be removed by specifying which image IDs to keep in the keepImageIds field.

    This endpoint supports both JSON and multipart/form-data requests.
    For multipart requests, the item data should be in a form field named 'item'
    as a JSON string, with images in separate form fields.

    Args:
        item_id: The unique identifier of the item to update
        patch: Optional dictionary containing fields to update (title, description, status, keepImageIds)
        images: Optional list of new image files to add to the item
        request: FastAPI Request object containing authentication header

    Patch Fields:
        keepImageIds (list[str], optional): List of existing image IDs to keep.
            Images not in this list will be removed from the item.

    Returns:
        ItemOut: The updated item with modified images array

    Raises:
        HTTPException:
            - 401 if authentication fails
            - 403 if user is not the item owner
            - 404 if item not found
            - 400 if patch payload is missing
    """
    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    # Require authentication and ensure the caller is the owner
    token_user_id = auth_service.get_user_id_from_request(request)
    # If item has an owner, only allow owner to modify
    if it.get("owner_id") and it.get("owner_id") != token_user_id:
        raise HTTPException(status_code=403, detail="forbidden")

    # Support JSON bodies and multipart/form-data with JSON in 'item' form field.
    # We parse manually to avoid FastAPI trying to parse Body() from multipart data.
    patch_data = patch
    if request is not None:
        ctype = request.headers.get("content-type", "")
        if ctype.startswith("application/json"):
            try:
                patch_data = await request.json()
            except Exception:
                patch_data = patch
        elif ctype.startswith("multipart/form-data"):
            # For multipart, try to get 'item' from form data as JSON string
            try:
                form_data = await request.form()
                item_str = form_data.get("item")
                if item_str:
                    try:
                        patch_data = json.loads(item_str)
                    except json.JSONDecodeError as e:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Failed to parse 'item' field as JSON: {str(e)}",
                        )
                # If no 'item' field in multipart and patch is None, that's an error
                elif patch is None:
                    raise HTTPException(
                        status_code=400,
                        detail="Missing 'item' field in form data for multipart request",
                    )
            except HTTPException:
                raise
            except Exception as e:
                # If form parsing fails, try to continue with patch if provided
                if patch is None:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Error processing multipart form data: {str(e)}",
                    )

    if patch_data is None:
        raise HTTPException(status_code=400, detail="patch payload required")

    if "title" in patch_data:
        it["title"] = patch_data.get("title")
    if "description" in patch_data:
        it["description"] = patch_data.get("description")
    if "category" in patch_data:
        it["category"] = patch_data.get("category")
    if "size" in patch_data:
        it["size"] = patch_data.get("size")
    if "location" in patch_data:
        it["location"] = patch_data.get("location")
    if "condition" in patch_data:
        it["condition"] = patch_data.get("condition")
    if "branded" in patch_data:
        it["branded"] = patch_data.get("branded")
    if "credits" in patch_data:
        it["credits"] = patch_data.get("credits")
    if "status" in patch_data:
        it["status"] = patch_data.get("status")

    # Handle image updates: keep only specified existing images + add new ones
    if "keepImageIds" in patch_data:
        keep_ids = patch_data.get("keepImageIds", [])
        if isinstance(keep_ids, list):
            # Filter existing images to keep only those in keepImageIds
            existing_images = it.get("images", [])
            kept_images = [img for img in existing_images if img.get("id") in keep_ids]
            it["images"] = kept_images
    
    # Add new images if provided
    if images:
        for up in images:
            url, img_id = await image_service.upload_image(up)
            it.setdefault("images", []).append({"id": img_id, "url": url})

    await storage_service.upsert_item(it)
    return ItemOut(**it)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, request: Request):
    """Delete an item and all associated images.

    Anti-fraud measure: If the item is 'available', the user loses the credit
    they earned for uploading it. If the item is 'pending', 'swapped', or 'locked',
    no credits are deducted because the user legitimately earned those credits
    from someone purchasing/swapping with their item.

    This prevents users from creating items to farm credits and then deleting them.

    Args:
        item_id: The unique identifier of the item to delete
        request: FastAPI Request object containing authentication header

    Returns:
        None (204 No Content on success)

    Raises:
        HTTPException:
            - 401 if authentication fails
            - 403 if user is not the item owner
            - 404 if item not found
    """
    # Require authentication and verify ownership
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Verify the user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the item owner can delete this item")

    # Anti-fraud: Only deduct credits if item is still available
    # If item is pending/swapped/locked, the credits were earned legitimately
    item_status = it.get("status", "available")
    credits_to_deduct = it.get("credits", 1.0)

    if item_status == "available":
        # Deduct the upload credit since the item was never actually swapped
        try:
            from utils.constants import TRANSACTION_TYPE_ITEM_DELETION
            await credit_service.deduct_credits(
                user_id=user_id,
                amount=credits_to_deduct,
                transaction_type=TRANSACTION_TYPE_ITEM_DELETION,
                description=f"Credits deducted for deleting available item: {it.get('title')}"
            )
        except Exception as e:
            # Log error but still allow deletion
            import traceback
            print(f"WARNING: Failed to deduct credits for deleted item {item_id}: {str(e)}")
            print(traceback.format_exc())
    else:
        # Item is pending/swapped/locked - user earned these credits legitimately
        # Don't deduct them
        print(f"Item {item_id} has status '{item_status}' - not deducting credits on deletion")

    # Delete item images
    for img in it.get("images", []):
        try:
            await image_service.delete_image(img.get("id"))
        except Exception as e:
            # Log error but continue with deletion
            print(f"WARNING: Failed to delete image {img.get('id')}: {str(e)}")

    # Delete the item itself
    await storage_service.delete_item(item_id)
    return None


@router.post("/{item_id}/lock", status_code=status.HTTP_200_OK)
async def lock_item(item_id: str, request: Request):
    """Lock an item for swap/purchase.

    Locking an item reserves it for the authenticated user, preventing
    other users from requesting it. Users cannot lock their own items.

    Args:
        item_id: The unique identifier of the item to lock
        request: FastAPI Request object containing authentication header

    Returns:
        Dictionary with status confirmation

    Raises:
        HTTPException:
            - 401 if authentication fails
            - 403 if user tries to lock their own item
            - 404 if item not found
            - 400 if item is already locked
    """
    # Require authentication using centralized auth helper
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    # Prevent users from locking their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id == user_id:
        raise HTTPException(
            status_code=403, detail="You cannot swap or purchase your own items"
        )

    if it.get("status") == "locked":
        raise HTTPException(status_code=400, detail="already locked")
    it["status"] = "locked"
    # Set lock metadata so clients can show expiry and who locked it
    it["locked_by"] = user_id
    it["locked_until"] = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    await storage_service.upsert_item(it)
    return {"status": "locked"}


@router.post("/{item_id}/unlock", status_code=status.HTTP_200_OK)
async def unlock_item(item_id: str, request: Request):
    """Unlock an item.

    Only the item owner can unlock their own items. This makes the item
    available again for other users to request.

    Args:
        item_id: The unique identifier of the item to unlock
        request: FastAPI Request object containing authentication header

    Returns:
        Dictionary with status confirmation

    Raises:
        HTTPException:
            - 401 if authentication fails
            - 403 if user is not the item owner
            - 404 if item not found
            - 400 if item is not currently locked
    """
    # Require authentication using centralized auth helper
    user_id = auth_service.get_user_id_from_request(request)

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    # Only the owner can unlock their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Only the item owner can unlock this item"
        )

    if it.get("status") != "locked":
        raise HTTPException(status_code=400, detail="not locked")

    it["status"] = "available"
    # Clear lock metadata
    it.pop("locked_until", None)
    it.pop("locked_by", None)
    await storage_service.upsert_item(it)
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

    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Prevent users from swapping their own items
    item_owner_id = it.get("owner_id")
    if item_owner_id and item_owner_id == user_id:
        raise HTTPException(
            status_code=403, detail="You cannot swap or purchase your own items"
        )

    # Check if item is available (not already swapped or has pending request)
    if it.get("status") not in ["available", "pending"]:
        raise HTTPException(
            status_code=400,
            detail=f"Item is not available for swap (current status: {it.get('status')})",
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
    from services.user_service import get_user_by_id

    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    user_credits = user.get("credits", 0.0)
    if user_credits < credits_required:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient credits. Required: {credits_required}, Available: {user_credits}",
        )

    # Create swap request (don't transfer credits yet)
    swap_request = await swap_service.create_swap_request(
        item_id=item_id, requester_id=user_id, credits_required=credits_required
    )

    # Mark item as pending (has a swap request)
    it["status"] = "pending"
    await storage_service.upsert_item(it)

    return {
        "status": "requested",
        "message": f"Swap request created. Waiting for owner approval.",
        "request_id": swap_request["id"],
        "item_id": item_id,
        "credits_required": credits_required,
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

    # Get the item
    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Verify the user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Only the item owner can approve swap requests"
        )

    requester_id = swap_request.get("requester_id")
    credits_required = swap_request.get("credits_required", 1.0)

    # Verify requester still has enough credits
    from services.user_service import get_user_by_id

    requester = await get_user_by_id(requester_id)
    if not requester:
        raise HTTPException(status_code=404, detail="requester not found")

    requester_credits = requester.get("credits", 0.0)
    if requester_credits < credits_required:
        raise HTTPException(
            status_code=400,
            detail=f"Requester no longer has sufficient credits. Required: {credits_required}, Available: {requester_credits}",
        )

    # Update swap request status to approved
    await swap_service.update_swap_request(request_id, "approved")

    # Cancel other pending requests for this item
    await swap_service.cancel_other_pending_requests(item_id, request_id)

    # Mark item as swapped/locked
    it["status"] = "swapped"
    await storage_service.upsert_item(it)

    # NOW transfer credits (only after approval)
    # Deduct credits from buyer
    await credit_service.deduct_credits(user_id=requester_id, amount=credits_required)

    # Add credits to seller
    await credit_service.add_credits(
        user_id=item_owner_id,
        amount=credits_required,
        transaction_type="swap_credit",
        description=f"Credits received from approved swap of item: {it.get('title')}",
    )

    return {
        "status": "approved",
        "message": f"Swap request approved. {credits_required} credits transferred.",
        "request_id": request_id,
        "item_id": item_id,
        "credits_transferred": credits_required,
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

    # Get the item
    it = await storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    # Verify the user is the owner
    item_owner_id = it.get("owner_id")
    if not item_owner_id or item_owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Only the item owner can reject swap requests"
        )

    # Update swap request status to rejected
    await swap_service.update_swap_request(request_id, "rejected")

    # If no other pending requests, mark item as available again
    pending_requests = swap_service.get_pending_requests_for_item(item_id)
    if len(pending_requests) == 0:
        it["status"] = "available"
        await storage_service.upsert_item(it)

    return {
        "status": "rejected",
        "message": "Swap request rejected.",
        "request_id": request_id,
        "item_id": item_id,
    }