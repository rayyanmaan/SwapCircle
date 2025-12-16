"""Database connection helpers using Motor (async MongoDB driver).

This module provides MongoDB connection management with support for
local and production environments via environment variables.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

from config_defaults.settings import settings


_db_client: Optional[AsyncIOMotorClient] = None
_database = None


async def connect_db():
    """Connect to MongoDB using Motor async client.
    
    Tries to connect to the primary MongoDB URI from environment variables.
    If that fails, falls back to local MongoDB (mongodb://mongo:27017/swapcircle).
    """
    global _db_client, _database
    
    # Primary MongoDB URI from environment (usually remote/Atlas)
    primary_uri = settings.mongodb_uri
    # Fallback to local MongoDB service (Docker Compose service name)
    # Use the same database name from settings
    fallback_uri = f"mongodb://mongo:27017/{settings.database_name}"
    
    # Build connection options
    client_options = {
        "serverSelectionTimeoutMS": 10000,  # Reduced timeout for faster fallback
        "connectTimeoutMS": 10000,
    }
    
    # For mongodb+srv, TLS is handled automatically by the connection string
    # For regular mongodb://, we might need to add TLS options
    if settings.mongodb_tls and not primary_uri.startswith("mongodb+srv://"):
        # Only add TLS options for non-SRV connections if explicitly enabled
        import ssl
        ssl.create_default_context()
        client_options["tls"] = True
        client_options["tlsAllowInvalidCertificates"] = False
    
    # Try primary connection first
    try:
        print(f"Attempting to connect to primary MongoDB: {primary_uri.split('@')[1] if '@' in primary_uri else primary_uri}")
        _db_client = AsyncIOMotorClient(primary_uri, **client_options)
        _database = _db_client[settings.database_name]
        # Test the connection
        await _db_client.admin.command("ping")
        print(f"✓ MongoDB connected successfully to primary database: {settings.database_name}")
        return
    except Exception as e:
        print(f"✗ Primary MongoDB connection failed: {str(e)}")
        
        # Only try fallback if primary URI is not already the local one
        if primary_uri != fallback_uri:
            print(f"Attempting fallback to local MongoDB: {fallback_uri}")
            try:
                # Close the failed connection
                if _db_client:
                    _db_client.close()
                
                # Try local MongoDB with shorter timeout
                fallback_options = {
                    "serverSelectionTimeoutMS": 5000,
                    "connectTimeoutMS": 5000,
                }
                _db_client = AsyncIOMotorClient(fallback_uri, **fallback_options)
                _database = _db_client[settings.database_name]
                # Test the connection
                await _db_client.admin.command("ping")
                print(f"✓ MongoDB connected successfully to local fallback database: {settings.database_name}")
                return
            except Exception as fallback_error:
                print(f"✗ Local MongoDB fallback also failed: {str(fallback_error)}")
                # Re-raise the original error for better diagnostics
                raise e
        else:
            # Primary was already local, just raise the error
            raise e
    
    # This should never be reached, but just in case
    raise RuntimeError("Failed to connect to MongoDB (both primary and fallback failed)")


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
