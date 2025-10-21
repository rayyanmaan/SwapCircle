"""Token utilities (stubs)
"""
from typing import Optional


def decode_token(token: str) -> Optional[dict]:
    if token.startswith("token-for-"):
        user_id = token.replace("token-for-", "")
        return {"user_id": user_id}
    return None


def requires_auth(token: str) -> bool:
    return decode_token(token) is not None
