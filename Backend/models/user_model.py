from datetime import datetime
from bson import ObjectId


def user_document(
    name,
    email,
    password_hash,
    profile_pic=None,
    instagram_handle=None,
    whatsapp_number=None,
):
    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "profile_pic": profile_pic,
        "credits": 5,
        "base_credits": 5,
        "instagram_handle": instagram_handle,
        "whatsapp_number": whatsapp_number,
        "items_listed": [],
        "created_at": datetime.utcnow(),
    }
