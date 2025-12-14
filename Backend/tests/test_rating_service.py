"""Unit tests for rating service."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from typing import Dict, Any

from services.rating_service import (
    create_or_update_rating,
    get_rating,
    get_user_rating_stats,
    delete_rating
)


@pytest.fixture
def mock_db():
    """Mock database connection."""
    db = MagicMock()
    return db


@pytest.fixture
def mock_ratings_collection(mock_db):
    """Mock ratings collection."""
    collection = MagicMock()
    mock_db.__getitem__.return_value = collection
    return collection


@pytest.mark.asyncio
async def test_create_or_update_rating_new_rating(mock_ratings_collection):
    """Test creating a new rating."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    stars = 5
    
    # Mock find_one to return None (no existing rating)
    mock_ratings_collection.find_one = AsyncMock(return_value=None)
    
    # Mock insert_one
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = "rating_id_123"
    mock_ratings_collection.insert_one = AsyncMock(return_value=mock_insert_result)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await create_or_update_rating(
            rater_user_id=rater_user_id,
            rated_user_id=rated_user_id,
            stars=stars
        )
    
    assert result is not None
    assert result["id"] == "rating_id_123"
    assert result["rater_user_id"] == rater_user_id
    assert result["rated_user_id"] == rated_user_id
    assert result["stars"] == stars
    assert "created_at" in result
    assert "updated_at" in result
    
    # Verify insert_one was called
    mock_ratings_collection.insert_one.assert_called_once()


@pytest.mark.asyncio
async def test_create_or_update_rating_update_existing(mock_ratings_collection):
    """Test updating an existing rating."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    stars = 4
    
    # Mock existing rating
    existing_rating = {
        "_id": "rating_id_123",
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id,
        "stars": 3,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    updated_rating = {
        "_id": "rating_id_123",
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id,
        "stars": stars,
        "created_at": existing_rating["created_at"],
        "updated_at": datetime.utcnow()
    }
    
    mock_ratings_collection.find_one = AsyncMock(return_value=existing_rating)
    mock_ratings_collection.update_one = AsyncMock()
    mock_ratings_collection.find_one = AsyncMock(side_effect=[existing_rating, updated_rating])
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await create_or_update_rating(
            rater_user_id=rater_user_id,
            rated_user_id=rated_user_id,
            stars=stars
        )
    
    assert result is not None
    assert result["id"] == "rating_id_123"
    assert result["stars"] == stars
    # Verify update_one was called
    mock_ratings_collection.update_one.assert_called_once()


@pytest.mark.asyncio
async def test_create_or_update_rating_self_rating():
    """Test that users cannot rate themselves."""
    user_id = "user1"
    
    with pytest.raises(ValueError, match="Users cannot rate themselves"):
        await create_or_update_rating(
            rater_user_id=user_id,
            rated_user_id=user_id,
            stars=5
        )


@pytest.mark.asyncio
async def test_create_or_update_rating_invalid_stars():
    """Test that rating must be between 1 and 5."""
    with pytest.raises(ValueError, match="Rating must be between 1 and 5 stars"):
        await create_or_update_rating(
            rater_user_id="user1",
            rated_user_id="user2",
            stars=6
        )
    
    with pytest.raises(ValueError, match="Rating must be between 1 and 5 stars"):
        await create_or_update_rating(
            rater_user_id="user1",
            rated_user_id="user2",
            stars=0
        )


@pytest.mark.asyncio
async def test_get_rating_exists(mock_ratings_collection):
    """Test getting an existing rating."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    
    rating_doc = {
        "_id": "rating_id_123",
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id,
        "stars": 5,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    mock_ratings_collection.find_one = AsyncMock(return_value=rating_doc)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await get_rating(
            rater_user_id=rater_user_id,
            rated_user_id=rated_user_id
        )
    
    assert result is not None
    assert result["id"] == "rating_id_123"
    assert result["rater_user_id"] == rater_user_id
    assert result["rated_user_id"] == rated_user_id


@pytest.mark.asyncio
async def test_get_rating_not_exists(mock_ratings_collection):
    """Test getting a non-existent rating."""
    mock_ratings_collection.find_one = AsyncMock(return_value=None)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await get_rating(
            rater_user_id="user1",
            rated_user_id="user2"
        )
    
    assert result is None


@pytest.mark.asyncio
async def test_get_user_rating_stats_no_ratings(mock_ratings_collection):
    """Test getting stats when user has no ratings."""
    rated_user_id = "user1"
    
    # Mock aggregation pipeline returning empty result
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=[])
    mock_ratings_collection.aggregate = MagicMock(return_value=mock_cursor)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await get_user_rating_stats(rated_user_id)
    
    assert result["average_rating"] == 0.0
    assert result["total_ratings"] == 0
    assert result["rating_breakdown"] == {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}


@pytest.mark.asyncio
async def test_get_user_rating_stats_with_ratings(mock_ratings_collection):
    """Test getting stats when user has ratings."""
    rated_user_id = "user1"
    
    # Mock aggregation pipeline for stats
    stats_result = [{
        "_id": None,
        "total_ratings": 5,
        "total_stars": 20,
        "avg_rating": 4.0
    }]
    
    # Mock breakdown aggregation
    breakdown_results = [
        {"_id": 5, "count": 2},
        {"_id": 4, "count": 2},
        {"_id": 3, "count": 1}
    ]
    
    mock_stats_cursor = MagicMock()
    mock_stats_cursor.to_list = AsyncMock(return_value=stats_result)
    
    mock_breakdown_cursor = MagicMock()
    mock_breakdown_cursor.to_list = AsyncMock(return_value=breakdown_results)
    
    # Setup aggregate to return different cursors for different calls
    call_count = 0
    def aggregate_side_effect(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return mock_stats_cursor
        else:
            return mock_breakdown_cursor
    
    mock_ratings_collection.aggregate = MagicMock(side_effect=aggregate_side_effect)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await get_user_rating_stats(rated_user_id)
    
    assert result["average_rating"] == 4.0
    assert result["total_ratings"] == 5
    assert result["rating_breakdown"][5] == 2
    assert result["rating_breakdown"][4] == 2
    assert result["rating_breakdown"][3] == 1
    assert result["rating_breakdown"][1] == 0
    assert result["rating_breakdown"][2] == 0


@pytest.mark.asyncio
async def test_delete_rating_exists(mock_ratings_collection):
    """Test deleting an existing rating."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    
    mock_delete_result = MagicMock()
    mock_delete_result.deleted_count = 1
    mock_ratings_collection.delete_one = AsyncMock(return_value=mock_delete_result)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await delete_rating(
            rater_user_id=rater_user_id,
            rated_user_id=rated_user_id
        )
    
    assert result is True
    mock_ratings_collection.delete_one.assert_called_once()


@pytest.mark.asyncio
async def test_delete_rating_not_exists(mock_ratings_collection):
    """Test deleting a non-existent rating."""
    mock_delete_result = MagicMock()
    mock_delete_result.deleted_count = 0
    mock_ratings_collection.delete_one = AsyncMock(return_value=mock_delete_result)
    
    with patch('services.rating_service.get_db') as mock_get_db:
        mock_get_db.return_value.__getitem__.return_value = mock_ratings_collection
        
        result = await delete_rating(
            rater_user_id="user1",
            rated_user_id="user2"
        )
    
    assert result is False

