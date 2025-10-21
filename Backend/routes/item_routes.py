"""Item routes (stubs)
"""
from fastapi import APIRouter

router = APIRouter(prefix="/items", tags=["items"])


@router.post("/")
async def create_item():
    return {"message": "create item stub"}


@router.get("/")
async def list_items():
    return {"items": []}
