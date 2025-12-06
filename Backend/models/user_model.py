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
    credits: Optional[float] = 0


class Login(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut
