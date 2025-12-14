"""Rating routes for user ratings."""
from fastapi import APIRouter, HTTPException, status, Request
from typing import Optional

from services import auth_service, rating_service
from models.rating_model import RatingCreate, RatingOut, UserRatingStats

router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.post("/{rated_user_id}", response_model=RatingOut, status_code=status.HTTP_200_OK)
async def give_rating(rated_user_id: str, request: Request, rating: RatingCreate):
    """Give or update a rating for a user.
    
    Requires authentication. Users cannot rate themselves.
    """
    rater_user_id = auth_service.get_user_id_from_request(request)
    
    # Prevent self-rating
    if rater_user_id == rated_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Users cannot rate themselves"
        )
    
    try:
        rating_doc = await rating_service.create_or_update_rating(
            rater_user_id=rater_user_id,
            rated_user_id=rated_user_id,
            stars=rating.stars
        )
        
        return RatingOut(
            id=rating_doc["id"],
            rater_user_id=rating_doc["rater_user_id"],
            rated_user_id=rating_doc["rated_user_id"],
            stars=rating_doc["stars"],
            created_at=rating_doc["created_at"],
            updated_at=rating_doc["updated_at"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create/update rating: {str(e)}"
        )


@router.get("/{rated_user_id}/my-rating", response_model=Optional[RatingOut])
async def get_my_rating(rated_user_id: str, request: Request):
    """Get the current user's rating for a specific user.
    
    Requires authentication. Returns null if user hasn't rated this user yet.
    """
    rater_user_id = auth_service.get_user_id_from_request(request)
    
    rating_doc = await rating_service.get_rating(
        rater_user_id=rater_user_id,
        rated_user_id=rated_user_id
    )
    
    if not rating_doc:
        return None
    
    return RatingOut(
        id=rating_doc["id"],
        rater_user_id=rating_doc["rater_user_id"],
        rated_user_id=rating_doc["rated_user_id"],
        stars=rating_doc["stars"],
        created_at=rating_doc["created_at"],
        updated_at=rating_doc["updated_at"]
    )


@router.get("/{rated_user_id}/stats", response_model=UserRatingStats)
async def get_rating_stats(rated_user_id: str):
    """Get rating statistics for a user.
    
    Public endpoint - no authentication required.
    """
    stats = await rating_service.get_user_rating_stats(rated_user_id)
    
    return UserRatingStats(
        average_rating=stats["average_rating"],
        total_ratings=stats["total_ratings"],
        rating_breakdown=stats.get("rating_breakdown")
    )

