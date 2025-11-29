"""Simple file-backed storage for items.

Keeps item records in Backend/data/items.json to enable quick local
development without a database.
"""
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import threading


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ITEMS_FILE = DATA_DIR / "items.json"

_lock = threading.Lock()


def _load_all() -> List[Dict[str, Any]]:
    if not ITEMS_FILE.exists():
        return []
    with ITEMS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_all(items: List[Dict[str, Any]]):
    with ITEMS_FILE.open("w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def list_items() -> List[Dict[str, Any]]:
    return _load_all()


def get_item(item_id: str) -> Optional[Dict[str, Any]]:
    for it in _load_all():
        if it.get("id") == item_id:
            return it
    return None


def upsert_item(item: Dict[str, Any]) -> Dict[str, Any]:
    with _lock:
        items = _load_all()
        for i, it in enumerate(items):
            if it.get("id") == item.get("id"):
                items[i] = item
                _save_all(items)
                return item
        items.append(item)
        _save_all(items)
        return item


def delete_item(item_id: str) -> bool:
    with _lock:
        items = _load_all()
        new_items = [it for it in items if it.get("id") != item_id]
        if len(new_items) == len(items):
            return False
        _save_all(new_items)
        return True
