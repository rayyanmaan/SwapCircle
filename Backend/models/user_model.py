from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from typing import Optional


def user_document(
    name,
    email,
    password_hash,
    profile_pic=None,
    instagram_handle=None,
    whatsapp_number=None,
):
    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "profile_pic": profile_pic,
        "credits": 5,
        "base_credits": 5,
        "instagram_handle": instagram_handle,
        "whatsapp_number": whatsapp_number,
        "items_listed": [],
        "created_at": datetime.utcnow(),
    }


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str]
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str]
    bio: Optional[str] = None
    credits: Optional[float] = 0
    profile_pic: Optional[str] = None
    instagram_handle: Optional[str] = None
    whatsapp_number: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_url: Optional[str] = None


class Login(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut
