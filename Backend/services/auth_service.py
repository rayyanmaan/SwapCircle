from passlib.context import CryptContext
from fastapi import HTTPException
from app.models.user_model import user_document
from app.utils.validators import (
    validate_email,
    validate_password,
    validate_instagram,
    validate_whatsapp,
)
from app.utils.token_utils import create_access_token
from pydantic import BaseModel, EmailStr
from bson import ObjectId
"""Authentication helpers used by the auth routes.

This is a small, development-only implementation:
- Passwords are hashed with SHA-256 + salt and stored by `user_service`.
- Access tokens are simple HMAC-signed strings built from the user id and
  the project's secret key. For production, replace with JWTs (PyJWT or
  python-jose) and a proper auth flow.
"""
from hashlib import sha256
import hmac
import uuid
from typing import Tuple

from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str, salt: str = None) -> Tuple[str, str]:
    """Return (salt, hashed) for a given password."""
    if salt is None:
        salt = uuid.uuid4().hex
    h = sha256()
    h.update((salt + password).encode("utf-8"))
    return salt, h.hexdigest()

class AuthService:

    def __init__(self, db):
        self.users = db["users"]
def verify_password(plain: str, salt: str, hashed: str) -> bool:
    s, h = hash_password(plain, salt)
    return h == hashed

    def hash_password(self, password: str):
        return pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    async def register_user(self, user_data):
        name = user_data.name
        email = user_data.email
        password = user_data.password
        instagram = user_data.instagram_handle
        whatsapp = user_data.whatsapp_number

        if not validate_email(email):
            raise HTTPException(status_code=400, detail="Email must be a .edu address.")

        if not validate_password(password):
            raise HTTPException(
                status_code=400, detail="Password must be at least 6 characters."
            )

        if not validate_instagram(instagram):
            raise HTTPException(status_code=400, detail="Instagram handle not valid.")

        if not validate_whatsapp(whatsapp):
            raise HTTPException(status_code=400, detail="WhatsApp number invalid.")

        existing = await self.users.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=400, detail="User already exists.")

        hashed_pw = self.hash_password(password)

        user_doc = user_document(
            name=name,
            email=email,
            password_hash=hashed_pw,
            profile_pic=None,
            instagram_handle=instagram,
            whatsapp_number=whatsapp,
        )

        result = await self.users.insert_one(user_doc)
        return str(result.inserted_id)

    async def login_user(self, email: str, password: str):
        user = await self.users.find_one({"email": email})
        if not user or not self.verify_password(password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_access_token(
            {"user_id": str(user["_id"]), "email": user["email"]}
        )

        return {"access_token": token, "token_type": "bearer"}
def create_access_token(user_id: str) -> str:
    """Create a simple HMAC-signed token for development.

    Format: user_id|hmac_hex
    """
    key = settings.secret_key.encode("utf-8")
    msg = user_id.encode("utf-8")
    sig = hmac.new(key, msg, sha256).hexdigest()
    return f"{user_id}|{sig}"


def verify_access_token(token: str) -> bool:
    try:
        user_id, sig = token.split("|", 1)
    except ValueError:
        return False
    expected = hmac.new(settings.secret_key.encode("utf-8"), user_id.encode("utf-8"), sha256).hexdigest()
    return hmac.compare_digest(expected, sig)
