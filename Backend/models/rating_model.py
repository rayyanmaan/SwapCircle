from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class RatingCreate(BaseModel):
    """Model for creating a rating."""
    stars: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")


class RatingOut(BaseModel):
    """Model for rating output."""
    id: str
    rater_user_id: str
    rated_user_id: str
    stars: int = Field(..., ge=1, le=5)
    created_at: datetime
    updated_at: datetime


class UserRatingStats(BaseModel):
    """Model for user rating statistics."""
    average_rating: float = Field(..., ge=0.0, le=5.0)
    total_ratings: int = Field(..., ge=0)
    rating_breakdown: Optional[dict] = None  # Optional: {1: count, 2: count, ...}

