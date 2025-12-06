"""Authentication helpers for auth routes.

Development-only implementation:
- Passwords hashed with SHA-256 + salt
- Access tokens are HMAC-signed strings: "user_id|signature"
"""
from hashlib import sha256
import hmac
import uuid
from config import settings


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Hash password with salt. Returns (salt, hashed_password)."""
    if salt is None:
        salt = uuid.uuid4().hex
    h = sha256()
    h.update((salt + password).encode("utf-8"))
    return salt, h.hexdigest()


def verify_password(plain: str, salt: str, hashed: str) -> bool:
    """Verify plain password against stored salt and hash."""
    _, computed_hash = hash_password(plain, salt)
    return computed_hash == hashed


def create_access_token(user_id: str) -> str:
    """Create HMAC-signed token. Format: user_id|signature"""
    key = settings.secret_key.encode("utf-8")
    msg = user_id.encode("utf-8")
    sig = hmac.new(key, msg, sha256).hexdigest()
    return f"{user_id}|{sig}"


def verify_access_token(token: str) -> bool:
    """Verify HMAC token signature. Returns True if valid."""
    try:
        user_id, sig = token.split("|", 1)
    except ValueError:
        return False
    
    expected = hmac.new(
        settings.secret_key.encode("utf-8"),
        user_id.encode("utf-8"),
        sha256
    ).hexdigest()
    return hmac.compare_digest(expected, sig)
