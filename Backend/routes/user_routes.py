"""User-related routes (profile get/update with auth)"""

from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File, Depends
from typing import Optional, List
from fastapi import Query
from services import storage_service
from services import user_service, auth_service, image_service
from models.user_model import UserOut

router = APIRouter(prefix="/users", tags=["Users"])


def get_authenticated_user_id(request: Request) -> str:
    """FastAPI dependency to extract and verify user ID from token.

    Returns:
        str: The authenticated user ID from the token

    Raises:
        HTTPException: If token is missing, invalid, or malformed
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    if not auth_service.verify_access_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    try:
        user_id, _ = token.split("|", 1)
        return user_id
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format"
        )

@router.get("/search")
async def search_users(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Search for users by username or full name.
    
    Query parameters:
    - q: Search query (required, 1-100 characters)
    - limit: Max number of results (1-50, default 10)
    
    Examples:
    - GET /users/search?q=aiman
    - GET /users/search?q=sarah&limit=5
    """
    
    search_query = q.lower().strip()
    
    if not search_query:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty"
        )
    
    try:
        # Get all users from storage
        all_users = await storage_service.list_users()
        
        if not all_users:
            return {"users": [], "total": 0}
        
        # Filter users by username or full name (case-insensitive)
        matching_users = []
        for user in all_users:
            username = user.get("username", "").lower()
            full_name = user.get("full_name", "").lower()
            
            if search_query in username or search_query in full_name:
                matching_users.append(user)
        
        # Sort by relevance
        def relevance_score(user):
            username = user.get("username", "").lower()
            full_name = user.get("full_name", "").lower()
            
            if username == search_query:
                return 0
            if search_query in username:
                return 1
            if search_query in full_name:
                return 2
            return 3
        
        matching_users.sort(key=relevance_score)
        matching_users = matching_users[:limit]
        
        # Format response with rating stats
        from services import rating_service
        
        formatted_users = []
        for user in matching_users:
            rating_stats = await rating_service.get_user_rating_stats(user.get("id"))
            
            formatted_users.append({
                "id": user.get("id"),
                "username": user.get("username", ""),
                "full_name": user.get("full_name", ""),
                "avatar": user.get("profile_pic", ""),
                "initials": (user.get("full_name") or user.get("username", "U"))[0].upper(),
                "location": user.get("location", ""),
                "averageRating": rating_stats.get("average_rating", 0.0),
                "totalRatings": rating_stats.get("total_ratings", 0),
                "totalSwaps": user.get("stats", {}).get("totalSwaps", 0) if "stats" in user else 0,
            })
        
        return {
            "users": formatted_users,
            "total": len(formatted_users),
            "query": q
        }
        
    except Exception as e:
        print(f"Error searching users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search users: {str(e)}"
        )

@router.get("/")
async def list_users():
    """List all users"""
    rows = await user_service.list_users()
    return {"users": rows}


@router.get("/username/{username}", response_model=UserOut)
async def get_user_by_username(username: str):
    """Get user by username"""
    user = await user_service.get_user_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get rating stats
    from services import rating_service

    rating_stats = await rating_service.get_user_rating_stats(user.get("id"))

    # Return public fields only
    return UserOut(
        id=user.get("id"),
        email=user.get("email", ""),
        username=user.get("username"),
        full_name=user.get("full_name", ""),
        location=user.get("location"),
        credits=user.get("credits", 0.0),
        email_verified=user.get("email_verified", False),
        bio=user.get("bio"),
        profile_pic=user.get("profile_pic"),
        instagram_handle=user.get("instagram_handle"),
        whatsapp_number=user.get("whatsapp_number"),
        facebook_url=user.get("facebook_url"),
        twitter_handle=user.get("twitter_handle"),
        linkedin_url=user.get("linkedin_url"),
        favorites=user.get("favorites", []),
        average_rating=rating_stats.get("average_rating"),
        total_ratings=rating_stats.get("total_ratings", 0),
    )


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, request: Request):
    """Get user by ID. Credits are only visible to the user themselves."""
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get rating stats
    from services import rating_service

    rating_stats = await rating_service.get_user_rating_stats(user_id)

    # Check if requesting user is the same as the requested user
    # to determine if we should show credits
    requesting_user_id = None
    try:
        requesting_user_id = get_authenticated_user_id(request)
    except Exception:
        # Not authenticated or invalid token - that's okay
        pass

    # Only show credits if viewing own profile
    is_own_profile = requesting_user_id == user_id
    credits_to_show = user.get("credits", 0.0) if is_own_profile else 0.0

    # Return public fields only
    return UserOut(
        id=user.get("id"),
        email=user.get("email"),
        username=user.get("username"),
        full_name=user.get("full_name", ""),
        location=user.get("location"),
        credits=credits_to_show,
        email_verified=user.get("email_verified", False),
        bio=user.get("bio"),
        profile_pic=user.get("profile_pic"),
        instagram_handle=user.get("instagram_handle"),
        whatsapp_number=user.get("whatsapp_number"),
        facebook_url=user.get("facebook_url"),
        twitter_handle=user.get("twitter_handle"),
        linkedin_url=user.get("linkedin_url"),
        favorites=user.get("favorites", []),
        average_rating=rating_stats.get("average_rating"),
        total_ratings=rating_stats.get("total_ratings", 0),
    )


@router.patch("/{user_id}", response_model=UserOut)
async def patch_user(user_id: str, request: Request):
    """Update user profile (requires Bearer token authentication)

    Allowed fields to update: username, full_name, credits, instagram_handle,
    whatsapp_number, facebook_url, twitter_handle, linkedin_url, bio, profile_pic, location
    Owner must provide valid Bearer token for their own user_id.
    """
    # Extract and validate Bearer token
    auth_header = request.headers.get("authorization", "")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    # Extract user_id from token (format: "user_id|signature")
    try:
        token_user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format"
        )

    # Check ownership: user can only update their own profile
    if token_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: cannot update another user's profile",
        )

    # Verify user exists
    existing_user = await user_service.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get and parse request body
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON body"
        )

    # Whitelist allowed update fields
    allowed_fields = {
        "username",
        "full_name",
        "bio",
        "credits",
        "profile_pic",
        "instagram_handle",
        "whatsapp_number",
        "facebook_url",
        "twitter_handle",
        "linkedin_url",
        "location",
    }
    updates = {k: v for k, v in body.items() if k in allowed_fields}

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update"
        )

    # Check username uniqueness if username is being updated
    if "username" in updates:
        new_username = updates["username"]
        existing_user_with_username = await user_service.get_user_by_username(
            new_username
        )
        # Allow if it's the same user (no change) or username doesn't exist
        if (
            existing_user_with_username
            and existing_user_with_username.get("id") != user_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="username already taken"
            )

    # Perform update
    try:
        updated_user = await user_service.update_user(user_id, updates)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user",
            )

        # Get rating stats
        from services import rating_service

        rating_stats = await rating_service.get_user_rating_stats(user_id)

        return UserOut(
            id=updated_user.get("id"),
            email=updated_user.get("email"),
            username=updated_user.get("username"),
            full_name=updated_user.get("full_name", ""),
            location=updated_user.get("location"),
            credits=updated_user.get("credits", 0.0),
            email_verified=updated_user.get("email_verified", False),
            bio=updated_user.get("bio"),
            profile_pic=updated_user.get("profile_pic"),
            instagram_handle=updated_user.get("instagram_handle"),
            whatsapp_number=updated_user.get("whatsapp_number"),
            facebook_url=updated_user.get("facebook_url"),
            twitter_handle=updated_user.get("twitter_handle"),
            linkedin_url=updated_user.get("linkedin_url"),
            average_rating=rating_stats.get("average_rating"),
            total_ratings=rating_stats.get("total_ratings", 0),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}",
        )


@router.post("/{user_id}/profile-picture", response_model=UserOut)
async def upload_profile_picture(
    user_id: str, request: Request, file: UploadFile = File(...)
):
    """Upload a profile picture for the authenticated user.

    Requires Bearer token authentication. User can only upload their own profile picture.
    Validates file type (JPEG, PNG, GIF, WebP) and size (max 5MB).
    """
    # Extract and validate Bearer token
    auth_header = request.headers.get("authorization", "")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    # Extract user_id from token
    try:
        token_user_id, _ = token.split("|", 1)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format"
        )

    # Check ownership: user can only upload their own profile picture
    if token_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: cannot upload profile picture for another user",
        )

    # Verify user exists
    existing_user = await user_service.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Upload and validate image
    try:
        url, image_id = await image_service.upload_image(file, validate=True)

        # Update user's profile_pic
        updated_user = await user_service.update_user(user_id, {"profile_pic": url})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile picture",
            )

        # Get rating stats
        from services import rating_service

        rating_stats = await rating_service.get_user_rating_stats(user_id)

        return UserOut(
            id=updated_user.get("id"),
            email=updated_user.get("email"),
            username=updated_user.get("username"),
            full_name=updated_user.get("full_name", ""),
            credits=updated_user.get("credits", 0.0),
            email_verified=updated_user.get("email_verified", False),
            bio=updated_user.get("bio"),
            profile_pic=updated_user.get("profile_pic"),
            instagram_handle=updated_user.get("instagram_handle"),
            whatsapp_number=updated_user.get("whatsapp_number"),
            facebook_url=updated_user.get("facebook_url"),
            twitter_handle=updated_user.get("twitter_handle"),
            linkedin_url=updated_user.get("linkedin_url"),
            favorites=updated_user.get("favorites", []),
            average_rating=rating_stats.get("average_rating"),
            total_ratings=rating_stats.get("total_ratings", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile picture: {str(e)}",
        )


@router.post("/{user_id}/favorites/{item_id}")
async def add_favorite(
    user_id: str, item_id: str, auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Add item to user's favorites (requires authentication)"""
    # Check if user is adding to their own favorites
    if auth_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this user's favorites",
        )

    updated_user = await user_service.add_favorite(user_id, item_id)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {
        "message": "Item added to favorites",
        "favorites": updated_user.get("favorites", []),
    }


@router.delete("/{user_id}/favorites/{item_id}")
async def remove_favorite(
    user_id: str, item_id: str, auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Remove item from user's favorites (requires authentication)"""
    # Check if user is updating their own favorites
    if auth_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this user's favorites",
        )

    updated_user = await user_service.remove_favorite(user_id, item_id)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {
        "message": "Item removed from favorites",
        "favorites": updated_user.get("favorites", []),
    }


@router.get("/{user_id}/favorites")
async def get_favorites(
    user_id: str, auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Get user's favorite item IDs (requires authentication)"""
    # Check if user is accessing their own favorites
    if auth_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's favorites",
        )

    favorites = await user_service.get_user_favorites(user_id)
    return {"favorites": favorites}