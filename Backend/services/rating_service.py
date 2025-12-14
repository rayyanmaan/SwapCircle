"""Rating service using MongoDB.

Stores ratings in MongoDB `ratings` collection with support for async operations.
"""
from typing import Dict, Any, List, Optional
from bson import ObjectId
from datetime import datetime
from database.connection import get_db


def _convert_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to id for API compatibility."""
    if doc is None:
        return None
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


async def create_or_update_rating(
    rater_user_id: str,
    rated_user_id: str,
    stars: int
) -> Dict[str, Any]:
    """Create a new rating or update existing rating.
    
    Args:
        rater_user_id: ID of the user giving the rating
        rated_user_id: ID of the user being rated
        stars: Rating value (1-5)
    
    Returns:
        The created or updated rating document
    """
    if rater_user_id == rated_user_id:
        raise ValueError("Users cannot rate themselves")
    
    if stars < 1 or stars > 5:
        raise ValueError("Rating must be between 1 and 5 stars")
    
    db = get_db()
    ratings_collection = db["ratings"]
    
    # Check if rating already exists
    existing_rating = await ratings_collection.find_one({
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id
    })
    
    now = datetime.utcnow()
    
    if existing_rating:
        # Update existing rating
        await ratings_collection.update_one(
            {"_id": existing_rating["_id"]},
            {
                "$set": {
                    "stars": stars,
                    "updated_at": now
                }
            }
        )
        updated_rating = await ratings_collection.find_one({"_id": existing_rating["_id"]})
        return _convert_id(updated_rating)
    else:
        # Create new rating
        rating_doc = {
            "rater_user_id": rater_user_id,
            "rated_user_id": rated_user_id,
            "stars": stars,
            "created_at": now,
            "updated_at": now
        }
        result = await ratings_collection.insert_one(rating_doc)
        rating_doc["_id"] = result.inserted_id
        return _convert_id(rating_doc)


async def get_rating(
    rater_user_id: str,
    rated_user_id: str
) -> Optional[Dict[str, Any]]:
    """Get a specific rating if it exists.
    
    Args:
        rater_user_id: ID of the user who gave the rating
        rated_user_id: ID of the user who was rated
    
    Returns:
        The rating document or None if not found
    """
    db = get_db()
    ratings_collection = db["ratings"]
    rating = await ratings_collection.find_one({
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id
    })
    return _convert_id(rating)


async def get_user_ratings(rated_user_id: str) -> List[Dict[str, Any]]:
    """Get all ratings for a specific user.
    
    Args:
        rated_user_id: ID of the user whose ratings to retrieve
    
    Returns:
        List of rating documents
    """
    db = get_db()
    ratings_collection = db["ratings"]
    cursor = ratings_collection.find({"rated_user_id": rated_user_id})
    ratings = await cursor.to_list(length=None)
    return [_convert_id(rating) for rating in ratings]


async def get_user_rating_stats(rated_user_id: str) -> Dict[str, Any]:
    """Calculate and return rating statistics for a user using MongoDB aggregation.
    
    Uses aggregation pipeline for scalability - doesn't load all ratings into memory.
    
    Args:
        rated_user_id: ID of the user whose stats to calculate
    
    Returns:
        Dictionary with average_rating, total_ratings, and rating_breakdown
    """
    db = get_db()
    ratings_collection = db["ratings"]
    
    # Use MongoDB aggregation pipeline for efficient calculation
    pipeline = [
        {"$match": {"rated_user_id": rated_user_id}},
        {
            "$group": {
                "_id": None,
                "total_ratings": {"$sum": 1},
                "total_stars": {"$sum": "$stars"},
                "avg_rating": {"$avg": "$stars"},
                "breakdown": {
                    "$push": "$stars"
                }
            }
        }
    ]
    
    cursor = ratings_collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    if not result or result[0].get("total_ratings", 0) == 0:
        return {
            "average_rating": 0.0,
            "total_ratings": 0,
            "rating_breakdown": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    stats = result[0]
    total_ratings = stats["total_ratings"]
    average_rating = round(stats["avg_rating"], 2)
    
    # Calculate breakdown using a second aggregation stage for efficiency
    breakdown_pipeline = [
        {"$match": {"rated_user_id": rated_user_id}},
        {
            "$group": {
                "_id": "$stars",
                "count": {"$sum": 1}
            }
        }
    ]
    
    breakdown_cursor = ratings_collection.aggregate(breakdown_pipeline)
    breakdown_results = await breakdown_cursor.to_list(length=None)
    
    # Initialize breakdown with zeros
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for item in breakdown_results:
        stars = item["_id"]
        if 1 <= stars <= 5:
            breakdown[stars] = item["count"]
    
    return {
        "average_rating": average_rating,
        "total_ratings": total_ratings,
        "rating_breakdown": breakdown
    }


async def delete_rating(
    rater_user_id: str,
    rated_user_id: str
) -> bool:
    """Delete a rating.
    
    Args:
        rater_user_id: ID of the user who gave the rating
        rated_user_id: ID of the user who was rated
    
    Returns:
        True if rating was deleted, False if not found
    """
    db = get_db()
    ratings_collection = db["ratings"]
    result = await ratings_collection.delete_one({
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id
    })
    return result.deleted_count > 0

