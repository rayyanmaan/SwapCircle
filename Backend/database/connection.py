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
    _db_client = AsyncIOMotorClient(settings.mongodb_uri)
    _database = _db_client[settings.database_name]
    # Test the connection
    await _db_client.admin.command('ping')
    print(f"MongoDB connected to {settings.database_name}")


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
