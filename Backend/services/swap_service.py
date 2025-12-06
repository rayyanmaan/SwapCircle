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