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
from uuid import uuid4
import json

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

    Upon successful creation, the user is automatically awarded 2 credits
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
    # Using transaction type constant to ensure consistency
    from utils.constants import TRANSACTION_TYPE_ITEM_UPLOAD

    try:
        credit_service.add_credits(
            user_id=owner_id,
            amount=2.0,
            transaction_type=TRANSACTION_TYPE_ITEM_UPLOAD,
            description=f"Credits awarded for uploading item: {item.title}",
        )
    except Exception as e:
        # Log the error but don't fail the item creation
        print(f"Warning: Failed to award credits to user {owner_id}: {str(e)}")

    return ItemOut(**stored)


@router.get("/", response_model=List[ItemOut])
async def list_items():
    """List all items in the system.

    Items with pending swap requests will have their status automatically
    updated to 'pending' for display purposes. This provides a real-time
    view of item availability.

    Returns:
        List[ItemOut]: List of all items, with status updated based on pending requests
    """
    rows = storage_service.list_items()
    # Check for pending requests and update status if needed
    for item in rows:
        if item.get("status") == "available":
            pending_requests = swap_service.get_pending_requests_for_item(
                item.get("id")
            )
            if len(pending_requests) > 0:
                item["status"] = "pending"
    return [ItemOut(**r) for r in rows]


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
    """Update an existing item.

    Only the item owner can update their items. This endpoint supports
    partial updates (PATCH semantics) - only provided fields will be updated.
    New images can be added by including them in the request.

    Args:
        item_id: The unique identifier of the item to update
        patch: Optional dictionary containing fields to update (title, description, status)
        images: Optional list of new image files to add to the item
        request: FastAPI Request object containing authentication header

    Returns:
        ItemOut: The updated item

    Raises:
        HTTPException:
            - 401 if authentication fails
            - 403 if user is not the item owner
            - 404 if item not found
            - 400 if patch payload is missing
    """
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    # Require authentication and ensure the caller is the owner
    token_user_id = auth_service.get_user_id_from_request(request)
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
    """Delete an item and all associated images.

    This operation permanently removes the item from the system and
    deletes all uploaded images associated with it.

    Args:
        item_id: The unique identifier of the item to delete

    Returns:
        None (204 No Content on success)

    Raises:
        HTTPException: 404 if item not found
    """
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    for img in it.get("images", []):
        image_service.delete_image(img.get("id"))

    storage_service.delete_item(item_id)
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

    it = storage_service.get_item(item_id)
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
    storage_service.upsert_item(it)
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

    it = storage_service.get_item(item_id)
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
    storage_service.upsert_item(it)
    return {"status": "available"}
