"""User-related routes (stubs)
"""
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def list_users():
    return {"users": []}


@router.get("/{user_id}")
async def get_user(user_id: str):
    return {"user": {"id": user_id}}
