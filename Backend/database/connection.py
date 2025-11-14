"""Database connection helpers (stubs)
"""
import asyncio

from Backend.config import settings


_db_client = None


async def connect_db():
    global _db_client
    # stub: in production use Motor or AsyncIOMotorClient
    _db_client = {"connected": True, "uri": settings.mongodb_uri}
    print("db connected")


async def close_db():
    global _db_client
    _db_client = None
    print("db closed")


def get_db():
    return _db_client
