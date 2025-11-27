"""Simple user storage for development.

Stores users in `Backend/data/users.json` with the fields:
 - id
 - email
 - username
 - full_name
 - salt
 - password_hash

This is intentionally minimal and synchronous.
"""
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import threading
import uuid

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
USERS_FILE = DATA_DIR / "users.json"

_lock = threading.Lock()


def _load_all() -> List[Dict[str, Any]]:
    if not USERS_FILE.exists():
        return []
    with USERS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_all(items: List[Dict[str, Any]]):
    with USERS_FILE.open("w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def list_users() -> List[Dict[str, Any]]:
    return _load_all()


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    for u in _load_all():
        if u.get("email") == email:
            return u
    return None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    for u in _load_all():
        if u.get("id") == user_id:
            return u
    return None


def create_user(email: str, username: str, full_name: str, salt: str, password_hash: str) -> Dict[str, Any]:
    user = {
        "id": uuid.uuid4().hex,
        "email": email,
        "username": username,
        "full_name": full_name,
        "salt": salt,
        "password_hash": password_hash,
    }
    with _lock:
        users = _load_all()
        users.append(user)
        _save_all(users)
    return user
