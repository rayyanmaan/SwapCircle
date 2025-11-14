"""Full item routes implementation (used by Backend/routes/item_routes.py shim).

This file implements CRUD operations, image upload/delete, and simple locking.
It intentionally stays inside Backend/ and uses the file-backed storage and image
utilities already added under Backend/services.
"""
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Body, HTTPException, status

from Backend.models.item_model import ItemCreate, ItemOut, ItemUpdate, ImageOut
from Backend.services import storage_service
from Backend.services import image_utils


router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: Optional[ItemCreate] = Body(None),
    images: Optional[List[UploadFile]] = File(None),
):
    if item is None:
        raise HTTPException(status_code=400, detail="Item payload required")

    item_id = str(uuid4())
    images_out: List[ImageOut] = []
    if images:
        for up in images:
            url, img_id = image_utils.upload_image(up)
            images_out.append(ImageOut(id=img_id, url=url))

    stored = {
        "id": item_id,
        "title": item.title,
        "description": item.description,
        "owner_id": None,
        "contact_info": item.contact_info.dict() if item.contact_info else None,
        "status": "available",
        "images": [img.dict() for img in images_out],
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
    if patch.contact_info is not None:
        it["contact_info"] = patch.contact_info.dict()
    if patch.status is not None:
        it["status"] = patch.status.value

    if images:
        for up in images:
            url, img_id = image_utils.upload_image(up)
            it.setdefault("images", []).append({"id": img_id, "url": url})

    storage_service.upsert_item(it)
    return ItemOut(**it)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    for img in it.get("images", []):
        image_utils.delete_image(img.get("id"))

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
"""Implementation of item routes (new file).

If your application imports Backend.routes.item_routes, replace that import with
`from Backend.routes.item_routes_impl import router as items_router` or
update Backend/main.py to include this router.
"""
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Body, HTTPException, status

from Backend.models.item_model import ItemCreate, ItemOut, ItemUpdate, ImageOut
from Backend.services import storage_service
from Backend.services import image_utils


router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: Optional[ItemCreate] = Body(None),
    images: Optional[List[UploadFile]] = File(None),
):
    if item is None:
        raise HTTPException(status_code=400, detail="Item payload required")

    item_id = str(uuid4())
    images_out: List[ImageOut] = []
    if images:
        for up in images:
            url, img_id = image_utils.upload_image(up)
            images_out.append(ImageOut(id=img_id, url=url))

    stored = {
        "id": item_id,
        "title": item.title,
        "description": item.description,
        "owner_id": None,
        "contact_info": item.contact_info.dict() if item.contact_info else None,
        "status": "available",
        "images": [img.dict() for img in images_out],
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
    if patch.contact_info is not None:
        it["contact_info"] = patch.contact_info.dict()
    if patch.status is not None:
        it["status"] = patch.status.value

    if images:
        for up in images:
            url, img_id = image_utils.upload_image(up)
            it.setdefault("images", []).append({"id": img_id, "url": url})

    storage_service.upsert_item(it)
    return ItemOut(**it)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str):
    it = storage_service.get_item(item_id)
    if not it:
        raise HTTPException(status_code=404, detail="item not found")

    for img in it.get("images", []):
        image_utils.delete_image(img.get("id"))

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
