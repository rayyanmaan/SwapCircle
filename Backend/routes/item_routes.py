"""Item CRUD routes (file-backed storage + image handling).

This implementation is local-only and meant for development. It uses
`Backend/services/storage_service.py` (JSON file storage) and
`Backend/services/image_service.py` (filesystem images).
"""
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Body, HTTPException, status

from Backend.models.item_model import ItemCreate, ItemOut, ItemUpdate
from Backend.services import storage_service
from Backend.services import image_service


router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: Optional[ItemCreate] = Body(None),
    images: Optional[List[UploadFile]] = File(None),
):
    if item is None:
        raise HTTPException(status_code=400, detail="Item payload required")

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
        "owner_id": None,
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
    patch: ItemUpdate = Body(...),
    images: Optional[List[UploadFile]] = File(None),
):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    if patch.title is not None:
        it["title"] = patch.title
    if patch.description is not None:
        it["description"] = patch.description
    if patch.status is not None:
        it["status"] = patch.status

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
