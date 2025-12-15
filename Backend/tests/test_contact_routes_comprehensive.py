"""Comprehensive tests for contact routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestSubmitContactForm:
    """Tests for POST /contact endpoint."""
    
    def test_submit_contact_form_success(self, client):
        """Test successfully submitting contact form."""
        with patch("routes.contact_routes.email_service.send_email", return_value=True):
            response = client.post(
                "/contact",
                json={
                    "name": "Test User",
                    "email": "test@example.com",
                    "subject": "Test Subject",
                    "message": "Test message content",
                    "type": "contact"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "message" in data
    
    def test_submit_contact_form_feedback(self, client):
        """Test submitting feedback form."""
        with patch("routes.contact_routes.email_service.send_email", return_value=True):
            response = client.post(
                "/contact",
                json={
                    "name": "Test User",
                    "email": "test@example.com",
                    "subject": "Feedback",
                    "message": "Great app!",
                    "type": "feedback"
                }
            )
            assert response.status_code == 200
    
    def test_submit_contact_form_bug_report(self, client):
        """Test submitting bug report."""
        with patch("routes.contact_routes.email_service.send_email", return_value=True):
            response = client.post(
                "/contact",
                json={
                    "name": "Test User",
                    "email": "test@example.com",
                    "subject": "Bug Report",
                    "message": "Found a bug",
                    "type": "bug"
                }
            )
            assert response.status_code == 200
    
    def test_submit_contact_form_missing_fields(self, client):
        """Test submitting contact form with missing fields."""
        response = client.post(
            "/contact",
            json={
                "name": "Test User"
                # Missing email, subject, message, type
            }
        )
        assert response.status_code == 422
    
    def test_submit_contact_form_invalid_email(self, client):
        """Test submitting contact form with invalid email."""
        response = client.post(
            "/contact",
            json={
                "name": "Test User",
                "email": "invalid-email",
                "subject": "Test",
                "message": "Test message",
                "type": "contact"
            }
        )
        assert response.status_code == 422
    
    def test_submit_contact_form_email_failure(self, client):
        """Test submitting contact form when email sending fails."""
        with patch("routes.contact_routes.email_service.send_email", return_value=False):
            response = client.post(
                "/contact",
                json={
                    "name": "Test User",
                    "email": "test@example.com",
                    "subject": "Test Subject",
                    "message": "Test message",
                    "type": "contact"
                }
            )
            assert response.status_code == 400
            assert "Failed to send" in response.json()["detail"]

