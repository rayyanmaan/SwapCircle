"""Database connection helpers (minimal stub).

This module provides a connect/close/get API. For local development we keep
it small; replace with Motor/PyMongo when moving to a real database.
"""
import asyncio

from config import settings


_db_client = None


async def connect_db():
    global _db_client
    # lightweight stub: in production use Motor (AsyncIOMotorClient)
    _db_client = {"connected": True, "uri": settings.mongodb_uri}
    print("db connected")


async def close_db():
    global _db_client
    _db_client = None
    print("db closed")


def get_db():
    return _db_client
