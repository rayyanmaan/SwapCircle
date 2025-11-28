"""Item CRUD routes (file-backed storage + image handling).

This implementation is local-only and meant for development. It uses
`Backend/services/storage_service.py` (JSON file storage) and
`Backend/services/image_service.py` (filesystem images).
"""
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Body, HTTPException, status, Request

from Backend.models.item_model import ItemCreate, ItemOut, ItemUpdate
from Backend.services import storage_service
from Backend.services import image_service, auth_service


router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: Optional[ItemCreate] = Body(None),
    images: Optional[List[UploadFile]] = File(None),
    request: Request = None,
):
    # Support JSON bodies even when `images` File param exists. If the
    # request's content-type is application/json, parse JSON manually.
    if request is not None:
        ctype = request.headers.get("content-type", "")
        if ctype.startswith("application/json"):
            try:
                body = await request.json()
            except Exception:
                body = None
            if body:
                try:
                    item = ItemCreate(**body)
                except Exception:
                    raise HTTPException(status_code=400, detail="invalid item payload")
    if item is None:
        raise HTTPException(status_code=400, detail="Item payload required")

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
    return ItemOut(**stored)


@router.get("/", response_model=List[ItemOut])
async def list_items():
    rows = storage_service.list_items()
    return [ItemOut(**r) for r in rows]


@router.get("/{item_id}", response_model=ItemOut)
async def get_item(item_id: str):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
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
async def lock_item(item_id: str):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    if it.get("status") == "locked":
        raise HTTPException(status_code=400, detail="already locked")
    it["status"] = "locked"
    storage_service.upsert_item(it)
    return {"status": "locked"}


@router.post("/{item_id}/unlock", status_code=status.HTTP_200_OK)
async def unlock_item(item_id: str):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")
    if it.get("status") != "locked":
        raise HTTPException(status_code=400, detail="not locked")
    it["status"] = "available"
    storage_service.upsert_item(it)
    return {"status": "available"}
