"""User-related routes (profile get/update with auth)"""
from fastapi import APIRouter, HTTPException, status, Request

from services import user_service, auth_service
from models.user_model import UserOut

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
async def list_users():
    """List all users"""
    rows = user_service.list_users()
    return {"users": rows}


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    """Get user by ID"""
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    # Return public fields only
    return UserOut(
        id=user.get("id"),
        email=user.get("email"),
        username=user.get("username"),
        full_name=user.get("full_name", ""),
        credits=user.get("credits", 0)
    )


@router.patch("/{user_id}", response_model=UserOut)
async def patch_user(user_id: str, request: Request):
    """Update user profile (requires Bearer token authentication)
    
    Allowed fields to update: username, full_name, credits
    Owner must provide valid Bearer token for their own user_id.
    """
    # Extract and validate Bearer token
    auth_header = request.headers.get("authorization", "")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Extract user_id from token (format: "user_id|signature")
    try:
        token_user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )
    
    # Check ownership: user can only update their own profile
    if token_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: cannot update another user's profile"
        )
    
    # Verify user exists
    existing_user = user_service.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get and parse request body
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON body"
        )
    
    # Whitelist allowed update fields
    allowed_fields = {"username", "full_name", "credits"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )
    
    # Perform update
    try:
        updated_user = user_service.update_user(user_id, updates)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )
        
        return UserOut(
            id=updated_user.get("id"),
            email=updated_user.get("email"),
            username=updated_user.get("username"),
            full_name=updated_user.get("full_name", ""),
            credits=updated_user.get("credits", 0)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )
