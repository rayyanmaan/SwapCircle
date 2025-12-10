"""Contact routes for handling contact form submissions.

This module handles contact form submissions from users (contact, feedback, bug reports).
- Sends confirmation email to the user
- Sends notification email to admin
- Uses email_service for email delivery
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from services import email_service

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactRequest(BaseModel):
    """Request model for contact form submissions"""
    name: str
    email: EmailStr
    subject: str
    message: str
    type: str  # 'contact' | 'feedback' | 'bug'


@router.post("", status_code=status.HTTP_200_OK)
async def submit_contact_form(request: ContactRequest):
    """Submit a contact form.
    
    Sends two emails:
    1. Confirmation email to the user
    2. Notification email to admin (afzal@uni.minerva.edu)
    
    Args:
        request: ContactRequest with name, email, subject, message, and type
        
    Returns:
        Dictionary with status confirmation
        
    Raises:
        HTTPException: 400 if email sending fails
    """
    try:
        # Email 1: Confirmation to user
        user_confirmation_body = f"""Hi {request.name},

Thanks for reaching out to SwapCircle! We've received your message:

Subject: {request.subject}
Message: {request.message}

Our team will get back to you as soon as possible.

Best regards,
SwapCircle Team
---
This is an automated confirmation email. Please do not reply directly to this email.
If you need to follow up, please visit https://swapcircle.com/contact
        """
        
        user_email_sent = email_service.send_email(
            to=request.email,
            subject=f"We received your message - {request.subject}",
            body=user_confirmation_body
        )
        
        if not user_email_sent:
            raise HTTPException(
                status_code=400,
                detail="Failed to send confirmation email to user"
            )
        
        # Email 2: Notification to admin
        admin_notification_body = f"""New {request.type.upper()} submission from SwapCircle Contact Form

From: {request.name} ({request.email})
Type: {request.type}
Subject: {request.subject}

Message:
{request.message}

---
This is an automated notification. To respond, reply to {request.email}
        """
        
        admin_email_sent = email_service.send_email(
            to="afzal@uni.minerva.edu",
            subject=f"[SwapCircle] New {request.type} submission: {request.subject}",
            body=admin_notification_body
        )
        
        if not admin_email_sent:
            raise HTTPException(
                status_code=400,
                detail="Failed to send notification to admin"
            )
        
        return {
            "status": "success",
            "message": "Your message has been received. A confirmation email has been sent to your inbox.",
            "email": request.email,
            "type": request.type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process contact form: {str(e)}"
        )