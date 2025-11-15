from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from utils.token_utils import decode_access_token
from database.connection import get_db

router = APIRouter(prefix="/users", tags=["Users"])


async def get_current_user(token: str, db):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail=("Invalid or expired token." " Please log in again."),
        )
    user = await db["users"].find_one({"_id": ObjectId(payload["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@router.get("/me")
async def me(token: str, db=Depends(get_db)):
    user = await get_current_user(token, db)
    user["_id"] = str(user["_id"])
    return user


@router.get("/{user_id}")
async def get_user(user_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user["_id"] = str(user["_id"])
    return user
