"""Authentication routes (register / login) for development.

These endpoints use `user_service` (file-backed users) and `auth_service`
for password hashing and token creation.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Request
from Backend.models.user_model import UserCreate, UserOut, Login, AuthResponse
from Backend.services import user_service
from Backend.services import auth_service

from typing import Dict

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    # prevent duplicate emails
    existing = user_service.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="email already registered")

    salt, hashed = auth_service.hash_password(payload.password)
    user = user_service.create_user(payload.email, payload.username, payload.full_name or "", salt, hashed)
    token = auth_service.create_access_token(user["id"])
    # return minimal user
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "username": user["username"], "full_name": user.get("full_name")}}


@router.post("/login")
async def login(payload: Login):
    # accept email + password only
    user = user_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if not auth_service.verify_password(payload.password, user.get("salt"), user.get("password_hash")):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = auth_service.create_access_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "username": user["username"]}}



@router.get("/me")
async def me(request: Request) -> Dict:
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    # token format is user_id|sig
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return {"id": user["id"], "email": user["email"], "username": user["username"], "full_name": user.get("full_name")}



@router.post("/verify/{token}")
async def verify_email(token: str):
    # For development: accept the same HMAC access token format for verification links.
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=400, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid token")
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    # mark email verified
    if hasattr(user_service, "update_user"):
        user_service.update_user(user_id, {"email_verified": True})
    else:
        from Backend.services.user_service import _load_all, _save_all
        users = _load_all()
        for i, u in enumerate(users):
            if u.get("id") == user_id:
                u["email_verified"] = True
                users[i] = u
                _save_all(users)
                break
    return {"message": "email verified"}
