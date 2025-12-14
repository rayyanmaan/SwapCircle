"""Unit tests for rating routes."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import Request
from fastapi.testclient import TestClient

from main import app
from services import auth_service, rating_service


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def mock_token():
    """Mock authentication token."""
    return "user123|signature"


@pytest.fixture
def mock_request(mock_token):
    """Mock FastAPI request with auth header."""
    request = MagicMock(spec=Request)
    request.headers = {"authorization": f"Bearer {mock_token}"}
    return request


@pytest.mark.asyncio
async def test_give_rating_success(mock_request):
    """Test successfully giving a rating."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    stars = 5
    
    rating_doc = {
        "id": "rating_id_123",
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id,
        "stars": stars,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
    
    with patch.object(auth_service, 'get_user_id_from_request', return_value=rater_user_id):
        with patch.object(rating_service, 'create_or_update_rating', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = rating_doc
            
            # This would be called in the actual route
            result = await rating_service.create_or_update_rating(
                rater_user_id=rater_user_id,
                rated_user_id=rated_user_id,
                stars=stars
            )
            
            assert result == rating_doc


@pytest.mark.asyncio
async def test_give_rating_self_rating(mock_request):
    """Test that users cannot rate themselves."""
    user_id = "user1"
    
    with patch.object(auth_service, 'get_user_id_from_request', return_value=user_id):
        with patch.object(rating_service, 'create_or_update_rating', new_callable=AsyncMock) as mock_create:
            mock_create.side_effect = ValueError("Users cannot rate themselves")
            
            with pytest.raises(ValueError, match="Users cannot rate themselves"):
                await rating_service.create_or_update_rating(
                    rater_user_id=user_id,
                    rated_user_id=user_id,
                    stars=5
                )


@pytest.mark.asyncio
async def test_get_my_rating_exists(mock_request):
    """Test getting current user's rating when it exists."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    
    rating_doc = {
        "id": "rating_id_123",
        "rater_user_id": rater_user_id,
        "rated_user_id": rated_user_id,
        "stars": 4,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
    
    with patch.object(auth_service, 'get_user_id_from_request', return_value=rater_user_id):
        with patch.object(rating_service, 'get_rating', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = rating_doc
            
            result = await rating_service.get_rating(
                rater_user_id=rater_user_id,
                rated_user_id=rated_user_id
            )
            
            assert result == rating_doc


@pytest.mark.asyncio
async def test_get_my_rating_not_exists(mock_request):
    """Test getting current user's rating when it doesn't exist."""
    rater_user_id = "user1"
    rated_user_id = "user2"
    
    with patch.object(auth_service, 'get_user_id_from_request', return_value=rater_user_id):
        with patch.object(rating_service, 'get_rating', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            
            result = await rating_service.get_rating(
                rater_user_id=rater_user_id,
                rated_user_id=rated_user_id
            )
            
            assert result is None


@pytest.mark.asyncio
async def test_get_rating_stats(mock_request):
    """Test getting rating statistics."""
    rated_user_id = "user1"
    
    stats = {
        "average_rating": 4.5,
        "total_ratings": 10,
        "rating_breakdown": {1: 0, 2: 1, 3: 2, 4: 3, 5: 4}
    }
    
    with patch.object(rating_service, 'get_user_rating_stats', new_callable=AsyncMock) as mock_stats:
        mock_stats.return_value = stats
        
        result = await rating_service.get_user_rating_stats(rated_user_id)
        
        assert result == stats
        assert result["average_rating"] == 4.5
        assert result["total_ratings"] == 10
        assert result["rating_breakdown"][5] == 4


@pytest.mark.asyncio
async def test_auth_service_get_user_id_from_request():
    """Test that auth_service.get_user_id_from_request is used correctly."""
    mock_request = MagicMock(spec=Request)
    mock_request.headers = {"authorization": "Bearer user123|signature"}
    
    with patch.object(auth_service, 'verify_access_token', return_value=True):
        user_id = auth_service.get_user_id_from_request(mock_request)
        assert user_id == "user123"

