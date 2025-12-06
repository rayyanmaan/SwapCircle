"""Authentication routes (register / login) for development.

These endpoints use `user_service` (file-backed users) and `auth_service`
for password hashing and token creation.
"""
from fastapi import APIRouter, HTTPException, status, Request
from models.user_model import UserCreate, UserOut, Login, AuthResponse
from services import user_service, auth_service
from typing import Dict

router = APIRouter(prefix="/auth", tags=["Authentication"])
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    """Register a new user"""
    # prevent duplicate emails
    existing = await user_service.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="email already registered")
    
    # prevent duplicate usernames
    existing_username = await user_service.get_user_by_username(payload.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="username already taken")

    salt, hashed = auth_service.hash_password(payload.password)
    user = await user_service.create_user(payload.email, payload.username, payload.full_name or "", salt, hashed)
    token = auth_service.create_access_token(user["id"])
    # Return UserOut model for consistency
    user_out = UserOut(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user.get("full_name", ""),
        credits=user.get("credits", 0.0),
        email_verified=user.get("email_verified", False),
        bio=user.get("bio"),
        profile_pic=user.get("profile_pic"),
        instagram_handle=user.get("instagram_handle"),
        whatsapp_number=user.get("whatsapp_number"),
        facebook_url=user.get("facebook_url"),
        twitter_handle=user.get("twitter_handle"),
        linkedin_url=user.get("linkedin_url")
    )
    return {"token": token, "user": user_out}


@router.post("/login")
async def login(payload: Login):
    """Login with email and password"""
    # accept email + password only
    user = await user_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if not auth_service.verify_password(payload.password, user.get("salt"), user.get("password_hash")):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = auth_service.create_access_token(user["id"])
    # Return UserOut model for consistency
    user_out = UserOut(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user.get("full_name", ""),
        credits=user.get("credits", 0.0),
        email_verified=user.get("email_verified", False),
        bio=user.get("bio"),
        profile_pic=user.get("profile_pic"),
        instagram_handle=user.get("instagram_handle"),
        whatsapp_number=user.get("whatsapp_number"),
        facebook_url=user.get("facebook_url"),
        twitter_handle=user.get("twitter_handle"),
        linkedin_url=user.get("linkedin_url")
    )
    return {"token": token, "user": user_out}


@router.get("/me")
async def me(request: Request) -> Dict:
    """Get current authenticated user"""
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
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    # Return credits from user object (updated after each transaction for performance)
    credits = user.get("credits", 0.0)
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "full_name": user.get("full_name"),
        "credits": credits,
    }


@router.post("/verify/{token}")
async def verify_email(token: str):
    """Verify email via token"""
    # For development: accept the same HMAC access token format for verification links.
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=400, detail="invalid token")
    try:
        user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid token")
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    # mark email verified
    await user_service.update_user(user_id, {"email_verified": True})
    return {"message": "email verified"}
