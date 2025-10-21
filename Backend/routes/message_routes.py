"""Message routes (stubs)
"""
from fastapi import APIRouter

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/")
async def send_message():
    return {"message": "send message stub"}


@router.get("/")
async def list_messages():
    return {"messages": []}
