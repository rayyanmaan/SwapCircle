"""Credit-related routes (stubs)
"""
from fastapi import APIRouter

router = APIRouter(prefix="/credits", tags=["credits"])


@router.get("/balance")
async def get_balance():
    return {"balance": 0}


@router.post("/add")
async def add_credits():
    return {"message": "add credits stub"}
