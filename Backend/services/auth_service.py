"""Auth helpers (stubs)
"""
from typing import Optional


def verify_password(plain: str, hashed: str) -> bool:
    return plain == hashed


def hash_password(password: str) -> str:
    return password


def create_access_token(user_id: str) -> str:
    return f"token-for-{user_id}"
