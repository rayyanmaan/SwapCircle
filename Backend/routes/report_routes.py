"""Report routes for handling item/user reports by authenticated users.

Creates a report document and emails admin. Keeps payload minimal to avoid PII leaks.
"""

from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional

from services import auth_service, email_service
from database.connection import get_db
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportRequest(BaseModel):
    target_type: str  # 'item' | 'user'
    target_id: str
    reason: str  # e.g. 'inappropriate', 'spam', 'fake', 'other'
    details: Optional[str] = None
    item_url: Optional[str] = None


@router.post("", status_code=status.HTTP_200_OK)
async def submit_report(request: Request, body: ReportRequest):
    """Submit a report for an item or user (auth required).

    Persists to Mongo in 'reports' collection and emails admin with context.
    """
    # Authenticate user
    try:
        reporter_id = auth_service.get_user_id_from_request(request)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    if body.target_type not in {"item", "user"}:
        raise HTTPException(status_code=400, detail="Invalid target_type")

    # Store report
    db = get_db()
    reports = db["reports"]
    doc = {
        "reporter_id": reporter_id,
        "target_type": body.target_type,
        "target_id": body.target_id,
        "reason": body.reason,
        "details": body.details,
        "item_url": body.item_url,
        "created_at": datetime.utcnow(),
    }
    await reports.insert_one(doc)

    # Email admin
    subject = f"[SwapCircle] New report on {body.target_type}: {body.target_id}"
    message = (
        f"Reporter: {reporter_id}\n"
        f"Target: {body.target_type} {body.target_id}\n"
        f"Reason: {body.reason}\n"
        f"Details: {body.details or '-'}\n"
        f"Item URL: {body.item_url or '-'}\n"
        f"Timestamp (UTC): {doc['created_at'].isoformat()}\n"
    )
    try:
        email_service.send_email(
            to="afzal@uni.minerva.edu",
            subject=subject,
            body=message,
        )
    except Exception:
        # Don't block user on email failure; report is still recorded
        pass

    return {"status": "ok", "message": "Report submitted. Our team will review it."}
