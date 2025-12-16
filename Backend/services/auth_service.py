"""Authentication helpers used by the auth routes.

This is a small, development-only implementation:
- Passwords are hashed with SHA-256 + salt and stored by `user_service`.
- Access tokens are simple HMAC-signed strings built from the user id and
  the project's secret key. For production, replace with JWTs (PyJWT or
  python-jose) and a proper auth flow.
"""
from fastapi import HTTPException, Request
from hashlib import sha256
import hmac
import uuid
from typing import Tuple

from config_defaults.settings import settings


def hash_password(password: str, salt: str = None) -> Tuple[str, str]:
    """Return (salt, hashed) for a given password."""
    if salt is None:
        salt = uuid.uuid4().hex
    h = sha256()
    h.update((salt + password).encode("utf-8"))
    return salt, h.hexdigest()


def verify_password(plain: str, salt: str, hashed: str) -> bool:
    """Verify a password against a salt and hash."""
    s, h = hash_password(plain, salt)
    return h == hashed


def create_access_token(user_id: str) -> str:
    """Create a simple HMAC-signed token for development.

    Format: user_id|hmac_hex
    """
    key = settings.secret_key.encode("utf-8")
    msg = user_id.encode("utf-8")
    sig = hmac.new(key, msg, sha256).hexdigest()
    return f"{user_id}|{sig}"


def verify_access_token(token: str) -> bool:
    """Verify an HMAC-signed access token."""
    try:
        user_id, sig = token.split("|", 1)
    except ValueError:
        return False
    expected = hmac.new(
        settings.secret_key.encode("utf-8"), user_id.encode("utf-8"), sha256
    ).hexdigest()
    return hmac.compare_digest(expected, sig)


def get_user_id_from_request(request: Request) -> str:
    """Extract and validate user ID from request authorization header.
    
    Raises HTTPException if authentication fails.
    Returns the user_id string if valid.
    """
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="missing authorization header")
    
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid authorization header")
    
    token = parts[1]
    if not verify_access_token(token):
        raise HTTPException(status_code=401, detail="invalid token")
    
    # token format is user_id|sig
    try:
        user_id, _ = token.split("|", 1)
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token format")
