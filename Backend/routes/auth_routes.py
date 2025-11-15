from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.auth_service import AuthService
from app.database.connection import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    instagram_handle: str | None = None
    whatsapp_number: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(request: RegisterRequest, db=Depends(get_db)):
    auth = AuthService(db)
    user_id = await auth.register_user(request)
    return {"message": "User registered", "user_id": user_id}


@router.post("/login")
async def login(request: LoginRequest, db=Depends(get_db)):
    auth = AuthService(db)
    return await auth.login_user(request.email, request.password)
