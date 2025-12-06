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
    try:
        user_id, sig = token.split("|", 1)
    except ValueError:
        return False
    expected = hmac.new(settings.secret_key.encode("utf-8"), user_id.encode("utf-8"), sha256).hexdigest()
    return hmac.compare_digest(expected, sig)
