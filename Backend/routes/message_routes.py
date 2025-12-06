"""Message routes implementation"""

from fastapi import APIRouter, HTTPException, Depends, Header, Body
from typing import Optional, List
from services import message_service, auth_service
from models.message_model import MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate user ID from authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1]
    if not auth_service.verify_access_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        user_id, _ = token.split("|", 1)
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token format")


@router.post("/", response_model=MessageOut)
async def send_message(
    message: MessageCreate, current_user_id: str = Depends(get_current_user_id)
):
    """Send a message to another user"""
    # Ensure the sender is the authenticated user
    if message.sender_id != current_user_id:
        raise HTTPException(
            status_code=403, detail="Can only send messages as yourself"
        )

    try:
        created_message = await message_service.create_message(
            sender_id=message.sender_id,
            recipient_id=message.recipient_id,
            content=message.content,
        )
        return created_message
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.get("/", response_model=List[MessageOut])
async def get_messages(
    current_user_id: str = Depends(get_current_user_id),
    conversation_with: Optional[str] = None,
):
    """Get messages for current user, optionally filtered by conversation partner"""
    try:
        if conversation_with:
            # Get conversation between two users
            messages = await message_service.get_conversation(
                current_user_id, conversation_with
            )
        else:
            # Get all messages involving the current user
            messages = await message_service.get_user_messages(current_user_id)

        return messages
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving messages: {str(e)}"
        )


@router.get("/conversations")
async def get_conversations(current_user_id: str = Depends(get_current_user_id)):
    """Get list of users that current user has conversations with"""
    try:
        conversations = await message_service.get_user_conversations(current_user_id)
        return {"user_id": current_user_id, "conversations": conversations}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving conversations: {str(e)}"
        )


@router.get("/{message_id}", response_model=MessageOut)
async def get_message(
    message_id: str, current_user_id: str = Depends(get_current_user_id)
):
    """Get a specific message by ID"""
    try:
        message = await message_service.get_message_by_id(message_id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        # Check if current user is either sender or recipient
        if (
            message.get("sender_id") != current_user_id
            and message.get("recipient_id") != current_user_id
        ):
            raise HTTPException(status_code=403, detail="Access denied")

        return message
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving message: {str(e)}"
        )
