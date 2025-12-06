"""Credit-related routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from services import credit_service, auth_service
from models.transaction_model import TransactionCreate, TransactionOut

router = APIRouter(prefix="/credits", tags=["credits"])


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


@router.get("/balance")
async def get_balance(user_id: str = Depends(get_current_user_id)):
    """Get current user's credit balance"""
    try:
        balance = await credit_service.get_user_balance(user_id)
        return {"user_id": user_id, "balance": balance}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving balance: {str(e)}"
        )


@router.post("/add")
async def add_credits(amount: float, user_id: str = Depends(get_current_user_id)):
    """Add credits to user's account"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    try:
        new_balance = await credit_service.add_credits(user_id, amount)
        return {
            "user_id": user_id,
            "amount_added": amount,
            "new_balance": new_balance,
            "message": f"Successfully added {amount} credits",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding credits: {str(e)}")


@router.post("/deduct")
async def deduct_credits(amount: float, user_id: str = Depends(get_current_user_id)):
    """Deduct credits from user's account (for swaps/purchases)"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    try:
        new_balance = await credit_service.deduct_credits(user_id, amount)
        return {
            "user_id": user_id,
            "amount_deducted": amount,
            "new_balance": new_balance,
            "message": f"Successfully deducted {amount} credits",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deducting credits: {str(e)}"
        )


@router.get("/transactions")
async def get_user_transactions(user_id: str = Depends(get_current_user_id)):
    """Get transaction history for current user"""
    try:
        transactions = await credit_service.get_user_transactions(user_id)
        return {"user_id": user_id, "transactions": transactions}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving transactions: {str(e)}"
        )
