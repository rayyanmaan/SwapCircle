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

