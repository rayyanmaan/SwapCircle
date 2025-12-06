"""User-related routes (stubs)
"""
from fastapi import APIRouter, HTTPException, status, Body, Request
from services import user_service, auth_service, credit_service
from models.user_model import UserOut

router = APIRouter(prefix="/users", tags=["Users"])
@router.get("/")
async def list_users():
    rows = user_service.list_users()
    return {"users": rows}


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    u = user_service.get_user_by_id(user_id)
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    
    # Return credits from user object (updated after each transaction for performance)
    credits = u.get("credits", 0.0)
    
    # Return only public fields with credits
    return {
        "id": u.get("id"),
        "email": u.get("email"),
        "username": u.get("username"),
        "full_name": u.get("full_name"),
        "credits": credits,
    }


@router.patch("/{user_id}", response_model=UserOut)
async def patch_user(user_id: str, payload: dict = Body(...), request: Request = None):
    """Patch user profile fields. Allowed fields: `username`, `full_name`, `credits`.

    This route performs a simple file-backed update using the same storage
    format as `user_service`. It validates that the user exists and
    persists allowed updates.
    """
    # require authentication: only the owner may update their profile
    auth = request.headers.get("authorization") if request is not None else None
    if not auth:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing authorization header")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid authorization header")
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")
    try:
        token_user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")
    if token_user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")

    existing = user_service.get_user_by_id(user_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

    # Whitelist updates
    allowed = {"username", "full_name", "credits"}
    updates = {k: v for k, v in payload.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no valid fields to update")

    # Perform update by reading/writing users file via service-level helper if available,
    # otherwise manipulate the users list directly here to persist changes.
    try:
        # Try to use an update_user if present
        if hasattr(user_service, "update_user"):
            updated = user_service.update_user(user_id, updates)
        else:
            # Fallback: manually load and persist
            from services.user_service import _load_all, _save_all
            users = _load_all()
            updated = None
            for i, u in enumerate(users):
                if u.get("id") == user_id:
                    for k, v in updates.items():
                        u[k] = v
                    users[i] = u
                    _save_all(users)
                    updated = u
                    break

        if not updated:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="failed to update user")

        # Return credits from user object (updated after each transaction for performance)
        credits = updated.get("credits", 0.0)

        return {
            "id": updated.get("id"),
            "email": updated.get("email"),
            "username": updated.get("username"),
            "full_name": updated.get("full_name"),
            "credits": credits,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
