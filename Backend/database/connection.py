"""Database connection helpers using Motor (async MongoDB driver).

This module provides MongoDB connection management with support for
local and production environments via environment variables.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

from config import settings


_db_client: Optional[AsyncIOMotorClient] = None
_database = None


async def connect_db():
    """Connect to MongoDB using Motor async client."""
    global _db_client, _database
    try:
        _db_client = AsyncIOMotorClient(settings.mongodb_uri)
        _database = _db_client[settings.database_name]
        # Test the connection
        await _db_client.admin.command('ping')
        print(f"MongoDB connected to {settings.database_name}")
    except Exception as e:
        error_msg = str(e)
        if "authentication failed" in error_msg.lower() or "bad auth" in error_msg.lower():
            print("\n" + "="*60)
            print("MongoDB Authentication Error!")
            print("="*60)
            print(f"Failed to connect to MongoDB with URI: {settings.mongodb_uri.split('@')[1] if '@' in settings.mongodb_uri else 'hidden'}")
            print("\nPossible issues:")
            print("1. Incorrect username or password in MongoDB URI")
            print("2. Database user doesn't have proper permissions")
            print("3. IP address not whitelisted (for MongoDB Atlas)")
            print("\nFor local MongoDB (no authentication):")
            print("  MONGODB_URI=mongodb://localhost:27017/swapcircle")
            print("\nFor MongoDB Atlas:")
            print("  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority")
            print("="*60 + "\n")
        raise


async def close_db():
    """Close MongoDB connection."""
    global _db_client, _database
    if _db_client:
        _db_client.close()
        _db_client = None
        _database = None
    print("MongoDB connection closed")


def get_db():
    """Get the database instance."""
    if _database is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _database
