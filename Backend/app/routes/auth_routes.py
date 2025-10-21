"""Authentication routes (stubs)
"""
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login():
    return {"message": "login stub"}


@router.post("/register")
async def register():
    return {"message": "register stub"}
