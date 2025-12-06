"""
Swap service file for handling all swap request logic.

I'm trying to keep this file simple and consistent with the style of
the existing storage_service.py file so it fits naturally into the project.
Just reading and writing from a JSON file using basic Python I/O
"""

import json
import os
from uuid import uuid4

# Path to the swap requests JSON file
DATA_FILE = os.path.join("data", "swap_requests.json")


def _load():
    """Internal helper to load the JSON list from disk."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            # If the file is corrupted, return empty list
            return []


def _save(rows):
    """Internal helper to write the JSON list back to disk."""
    with open(DATA_FILE, "w") as f:
        json.dump(rows, f, indent=2)


def create_swap_request(item_id: str, requester_id: str, credits_required: float):
    """
    Create a new swap request.
    Each request is stored as a simple dict. Keeping fields
    consistent so it's easy for us to query later.
    """
    rows = _load()
    req = {
        "id": str(uuid4()),
        "item_id": item_id,
        "requester_id": requester_id,
        "credits_required": credits_required,
        "status": "pending"
    }
    rows.append(req)
    _save(rows)
    return req


def get_swap_request(request_id: str):
    """Return a single swap request by id."""
    rows = _load()
    for r in rows:
        if r.get("id") == request_id:
            return r
    return None


def update_swap_request(request_id: str, new_status: str):
    """
    Update the status of a swap request (approved, rejected, etc).
    Very straightforward: loop, modify, save.
    """
    rows = _load()
    for r in rows:
        if r.get("id") == request_id:
            r["status"] = new_status
            _save(rows)
            return r
    return None


def get_pending_requests_for_item(item_id: str):
    """Return all pending requests for a specific item."""
    rows = _load()
    return [
        r for r in rows
        if r.get("item_id") == item_id and r.get("status") == "pending"
    ]


def get_pending_requests_for_owner(owner_id: str):
    """
    Return pending requests for items owned by this user.
    IMPORTANT: item ownership is not stored here, so we must check item_routes
    which already loads items through storage_service.
    """
    from services import storage_service

    rows = _load()
    result = []

    for r in rows:
        if r.get("status") != "pending":
            continue
        item = storage_service.get_item(r.get("item_id"))
        if item and item.get("owner_id") == owner_id:
            result.append(r)

    return result


def get_requests_for_requester(requester_id: str):
    """Return all swap requests created by a specific user."""
    rows = _load()
    return [r for r in rows if r.get("requester_id") == requester_id]


def cancel_other_pending_requests(item_id: str, approved_request_id: str):
    """Cancel all other pending requests for the same item."""
    rows = _load()
    for r in rows:
        if (
            r.get("item_id") == item_id
            and r.get("id") != approved_request_id
            and r.get("status") == "pending"
        ):
            r["status"] = "cancelled"
    _save(rows)


def get_approved_swaps_for_user(user_id: str):
    """
    Return all approved swaps where the user is either
    the item owner OR the requester.
    """
    from services import storage_service

    rows = _load()
    result = []

    for r in rows:
        if r.get("status") != "approved":
            continue

        item = storage_service.get_item(r.get("item_id"))
        if not item:
            continue

        # user may be owner OR requester
        if item.get("owner_id") == user_id or r.get("requester_id") == user_id:
            result.append(r)

    return result
"""Swap request service for managing swap requests and approvals.

Stores swap requests in Backend/data/swap_requests.json.
"""
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import threading
import uuid
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
SWAP_REQUESTS_FILE = DATA_DIR / "swap_requests.json"

_lock = threading.Lock()


def _load_requests() -> List[Dict[str, Any]]:
    """Load swap requests from JSON file"""
    if not SWAP_REQUESTS_FILE.exists():
        return []
    with SWAP_REQUESTS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_requests(requests: List[Dict[str, Any]]):
    """Save swap requests to JSON file"""
    with SWAP_REQUESTS_FILE.open("w", encoding="utf-8") as f:
        json.dump(requests, f, ensure_ascii=False, indent=2)


def create_swap_request(item_id: str, requester_id: str, credits_required: float) -> Dict[str, Any]:
    """Create a new swap request"""
    request = {
        "id": str(uuid.uuid4()),
        "item_id": item_id,
        "requester_id": requester_id,
        "credits_required": credits_required,
        "status": "pending",  # pending, approved, rejected, cancelled
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    with _lock:
        requests = _load_requests()
        requests.append(request)
        _save_requests(requests)

    return request


def get_swap_request(request_id: str) -> Optional[Dict[str, Any]]:
    """Get a swap request by ID"""
    requests = _load_requests()
    for req in requests:
        if req.get("id") == request_id:
            return req
    return None


def get_pending_requests_for_item(item_id: str) -> List[Dict[str, Any]]:
    """Get all pending swap requests for an item"""
    requests = _load_requests()
    return [
        req for req in requests
        if req.get("item_id") == item_id and req.get("status") == "pending"
    ]


def get_pending_requests_for_owner(owner_id: str) -> List[Dict[str, Any]]:
    """Get all pending swap requests for items owned by a user"""
    from services.storage_service import get_item
    
    requests = _load_requests()
    owner_requests = []
    
    for req in requests:
        if req.get("status") == "pending":
            item = get_item(req.get("item_id"))
            if item and item.get("owner_id") == owner_id:
                owner_requests.append(req)
    
    return owner_requests


def get_requests_for_requester(requester_id: str) -> List[Dict[str, Any]]:
    """Get all swap requests made by a user"""
    requests = _load_requests()
    return [
        req for req in requests
        if req.get("requester_id") == requester_id
    ]


def get_approved_swaps_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all approved swap requests where user is either owner or requester"""
    from services.storage_service import get_item
    
    requests = _load_requests()
    approved_swaps = []
    
    for req in requests:
        if req.get("status") == "approved":
            item = get_item(req.get("item_id"))
            item_owner_id = item.get("owner_id") if item else None
            requester_id = req.get("requester_id")
            
            # Include if user is the owner or the requester
            if item_owner_id == user_id or requester_id == user_id:
                approved_swaps.append(req)
    
    return approved_swaps


def update_swap_request(request_id: str, status: str) -> Optional[Dict[str, Any]]:
    """Update swap request status (approved, rejected, cancelled)"""
    with _lock:
        requests = _load_requests()
        for i, req in enumerate(requests):
            if req.get("id") == request_id:
                req["status"] = status
                req["updated_at"] = datetime.now().isoformat()
                requests[i] = req
                _save_requests(requests)
                return req
    return None


def cancel_other_pending_requests(item_id: str, exclude_request_id: str = None):
    """Cancel all other pending requests for an item (when one is approved)"""
    with _lock:
        requests = _load_requests()
        for req in requests:
            if (req.get("item_id") == item_id and 
                req.get("status") == "pending" and 
                req.get("id") != exclude_request_id):
                req["status"] = "cancelled"
                req["updated_at"] = datetime.now().isoformat()
        _save_requests(requests)

