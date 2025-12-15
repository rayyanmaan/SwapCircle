"""Comprehensive tests for credit routes."""
import pytest
from fastapi.testclient import TestClient
from fastapi import Depends
from unittest.mock import AsyncMock, patch

from main import app
from routes.credit_routes import get_current_user_id


@pytest.fixture
def client():
    return TestClient(app)




class TestGetBalance:
    """Tests for GET /credits/balance endpoint."""
    
    def test_get_balance_success(self, client, mock_user, mock_token):
        """Test getting credit balance."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            with patch("services.credit_service.get_user_balance", new_callable=AsyncMock, return_value={"credits": 10.0, "locked_credits": 2.0, "available_credits": 8.0}):
                response = client.get(
                    "/credits/balance",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert "balance" in data
                assert data["user_id"] == mock_user["id"]
        finally:
            app.dependency_overrides.clear()
    
    def test_get_balance_no_auth(self, client):
        """Test getting balance without authentication."""
        response = client.get("/credits/balance")
        assert response.status_code == 401


class TestAddCredits:
    """Tests for POST /credits/add endpoint."""
    
    def test_add_credits_success(self, client, mock_user, mock_token):
        """Test adding credits."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            with patch("services.credit_service.add_credits", new_callable=AsyncMock, return_value=12.0):
                response = client.post(
                    "/credits/add?amount=2.0",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["amount_added"] == 2.0
                assert data["new_balance"] == 12.0
        finally:
            app.dependency_overrides.clear()
    
    def test_add_credits_negative_amount(self, client, mock_user, mock_token):
        """Test adding negative credits (should fail)."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            response = client.post(
                "/credits/add?amount=-1.0",
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 400
            assert "must be positive" in response.json()["detail"]
        finally:
            app.dependency_overrides.clear()
    
    def test_add_credits_zero_amount(self, client, mock_user, mock_token):
        """Test adding zero credits (should fail)."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            response = client.post(
                "/credits/add?amount=0",
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestDeductCredits:
    """Tests for POST /credits/deduct endpoint."""
    
    def test_deduct_credits_success(self, client, mock_user, mock_token):
        """Test deducting credits."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            with patch("services.credit_service.deduct_credits", new_callable=AsyncMock, return_value=8.0):
                response = client.post(
                    "/credits/deduct?amount=2.0",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["amount_deducted"] == 2.0
                assert data["new_balance"] == 8.0
        finally:
            app.dependency_overrides.clear()
    
    def test_deduct_credits_insufficient(self, client, mock_user, mock_token):
        """Test deducting more credits than available."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            with patch("services.credit_service.deduct_credits", new_callable=AsyncMock, side_effect=ValueError("Insufficient credits")):
                response = client.post(
                    "/credits/deduct?amount=100.0",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 400
        finally:
            app.dependency_overrides.clear()
    
    def test_deduct_credits_negative_amount(self, client, mock_user, mock_token):
        """Test deducting negative credits (should fail)."""
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            response = client.post(
                "/credits/deduct?amount=-1.0",
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestGetTransactions:
    """Tests for GET /credits/transactions endpoint."""
    
    def test_get_transactions_success(self, client, mock_user, mock_token):
        """Test getting transaction history."""
        transactions = [
            {
                "id": "trans1",
                "user_id": mock_user["id"],
                "amount": 1.0,
                "type": "credit",
                "reason": "Item listed",
                "created_at": "2024-01-01T00:00:00"
            }
        ]
        app.dependency_overrides[get_current_user_id] = lambda: mock_user["id"]
        try:
            with patch("services.credit_service.get_user_transactions", new_callable=AsyncMock, return_value=transactions):
                response = client.get(
                    "/credits/transactions",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert "transactions" in data
                assert isinstance(data["transactions"], list)
                assert len(data["transactions"]) > 0
        finally:
            app.dependency_overrides.clear()
    
    def test_get_transactions_no_auth(self, client):
        """Test getting transactions without authentication."""
        response = client.get("/credits/transactions")
        assert response.status_code == 401

