"""Notification routes for managing user notifications.

Routes:
- GET /notifications - Get all notifications for authenticated user
- GET /notifications/recent - Get recent notifications (legacy endpoint)
- GET /notifications/unread-count - Get count of unread notifications
- PATCH /notifications/{notification_id}/read - Mark a notification as read
- PATCH /notifications/read-all - Mark all notifications as read
- DELETE /notifications/{notification_id} - Delete a notification
"""
from fastapi import APIRouter, Request, HTTPException, status
from typing import List, Dict, Any
from pydantic import BaseModel

from services import auth_service, notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


class MarkReadResponse(BaseModel):
    success: bool
    message: str


@router.get("", response_model=List[Dict[str, Any]])
async def get_notifications(
    request: Request,
    limit: int = 50,
    unread_only: bool = False
):
    """Get all notifications for the authenticated user.
    
    Args:
        request: FastAPI Request object for authentication
        limit: Maximum number of notifications to return (default: 50)
        unread_only: If true, only return unread notifications
    
    Returns:
        List of notification dictionaries
    """
    user_id = auth_service.get_user_id_from_request(request)
    
    try:
        notifications = await notification_service.get_user_notifications(
            user_id=user_id,
            limit=limit,
            unread_only=unread_only
        )
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving notifications: {str(e)}"
        )


@router.get("/recent", response_model=List[Dict[str, Any]])
async def get_recent_notifications(request: Request, since_minutes: int = 5):
    """Get recent swap events for the authenticated user (legacy endpoint).
    
    This endpoint is kept for backward compatibility but now returns
    notifications from the database.
    
    Args:
        request: FastAPI Request object for authentication
        since_minutes: How many minutes back to look (default: 5, max: 60)
    
    Returns:
        List of event dictionaries with event_type, request_id, item_id, etc.
    """
    user_id = auth_service.get_user_id_from_request(request)
    
    # Limit since_minutes to prevent abuse
    if since_minutes > 60:
        since_minutes = 60
    if since_minutes < 1:
        since_minutes = 1
    
    try:
        events = await notification_service.get_recent_swap_events(
            user_id=user_id,
            since_minutes=since_minutes
        )
        return events
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving notifications: {str(e)}"
        )


@router.get("/unread-count")
async def get_unread_count(request: Request):
    """Get the count of unread notifications for the authenticated user.
    
    Returns:
        Dictionary with "count" key
    """
    user_id = auth_service.get_user_id_from_request(request)
    
    try:
        count = await notification_service.get_unread_count(user_id)
        return {"count": count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving unread count: {str(e)}"
        )


@router.patch("/{notification_id}/read", response_model=MarkReadResponse)
async def mark_notification_as_read(notification_id: str, request: Request):
    """Mark a specific notification as read.
    
    Args:
        notification_id: The notification ID to mark as read
        request: FastAPI Request object for authentication
    
    Returns:
        Success response
    """
    user_id = auth_service.get_user_id_from_request(request)
    
    try:
        success = await notification_service.mark_notification_as_read(
            notification_id=notification_id,
            user_id=user_id
        )
        if success:
            return MarkReadResponse(success=True, message="Notification marked as read")
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking notification as read: {str(e)}"
        )


@router.patch("/read-all", response_model=MarkReadResponse)
async def mark_all_as_read(request: Request):
    """Mark all notifications as read for the authenticated user.
    
    Returns:
        Success response with count of notifications marked
    """
    user_id = auth_service.get_user_id_from_request(request)
    
    try:
        count = await notification_service.mark_all_as_read(user_id)
        return MarkReadResponse(
            success=True,
            message=f"{count} notification(s) marked as read"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking notifications as read: {str(e)}"
        )


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, request: Request):
    """Delete a notification.
    
    Args:
        notification_id: The notification ID to delete
        request: FastAPI Request object for authentication
    
    Returns:
        Success response
    """
    user_id = auth_service.get_user_id_from_request(request)
    
    try:
        success = await notification_service.delete_notification(
            notification_id=notification_id,
            user_id=user_id
        )
        if success:
            return {"success": True, "message": "Notification deleted"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting notification: {str(e)}"
        )
