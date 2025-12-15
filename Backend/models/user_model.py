from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


def user_document(
    email: str,
    username: str,
    full_name: str,
    salt: str,
    password_hash: str,
    profile_pic: Optional[str] = None,
    instagram_handle: Optional[str] = None,
    whatsapp_number: Optional[str] = None,
    facebook_url: Optional[str] = None,
    twitter_handle: Optional[str] = None,
    linkedin_url: Optional[str] = None,
    bio: Optional[str] = None,
    location: Optional[str] = None,
):
    """Create a user document matching the JSON storage structure."""
    return {
        "email": email,
        "username": username,
        "full_name": full_name,
        "credits": 0.0,
        "email_verified": False,
        "salt": salt,
        "password_hash": password_hash,
        "profile_pic": profile_pic,
        "instagram_handle": instagram_handle,
        "whatsapp_number": whatsapp_number,
        "facebook_url": facebook_url,
        "twitter_handle": twitter_handle,
        "linkedin_url": linkedin_url,
        "bio": bio,
        "location": location,
        "favorites": [],
    }


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = ""
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    instagram_handle: Optional[str] = None
    whatsapp_number: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_url: Optional[str] = None
    location: Optional[str] = None
    credits: Optional[float] = None
    email_verified: Optional[bool] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = ""
    bio: Optional[str] = None
    location: Optional[str] = None
    credits: float = 0.0
    email_verified: bool = False
    profile_pic: Optional[str] = None
    instagram_handle: Optional[str] = None
    whatsapp_number: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_url: Optional[str] = None
    favorites: List[str] = Field(default_factory=list)  # List of item IDs
    average_rating: Optional[float] = None
    total_ratings: int = 0


class Login(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut
