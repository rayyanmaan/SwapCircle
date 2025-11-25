"""User model (Pydantic / MongoDB schema stubs)
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


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


class Login(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut
