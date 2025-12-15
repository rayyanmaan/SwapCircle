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
        # For mongodb+srv (MongoDB Atlas), SSL/TLS is automatically enabled
        # We just need to ensure proper timeout settings
        # Note: mongodb+srv:// automatically uses TLS, don't add tls=True as it may cause conflicts

        # Build connection options
        client_options = {
            "serverSelectionTimeoutMS": 30000,
            "connectTimeoutMS": 30000,
        }

        # For mongodb+srv, TLS is handled automatically by the connection string
        # For regular mongodb://, we might need to add TLS options
        if settings.mongodb_tls and not settings.mongodb_uri.startswith(
            "mongodb+srv://"
        ):
            # Only add TLS options for non-SRV connections if explicitly enabled
            import ssl

            ssl.create_default_context()
            client_options["tls"] = True
            client_options["tlsAllowInvalidCertificates"] = False

        _db_client = AsyncIOMotorClient(settings.mongodb_uri, **client_options)

        _database = _db_client[settings.database_name]
        # Test the connection
        await _db_client.admin.command("ping")
        print(f"MongoDB connected to {settings.database_name}")
    except Exception as e:
        error_msg = str(e).lower()

        # Check for SSL/TLS errors
        if "ssl" in error_msg or "tls" in error_msg or "handshake" in error_msg:
            print("\n" + "=" * 60)
            print("MongoDB SSL/TLS Connection Error!")
            print("=" * 60)
            print("Failed to establish SSL connection to MongoDB Atlas.")
            print("\nPossible issues:")
            print(
                "1. Missing CA certificates in Docker image (should be fixed in Dockerfile)"
            )
            print("2. Network/firewall blocking SSL connections")
            print("3. MongoDB Atlas IP whitelist doesn't include Render's IP ranges")
            print("4. Connection string format issue")
            print("\nSolutions:")
            print("- Ensure Dockerfile includes 'ca-certificates' package")
            print("- Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access (for testing)")
            print("- Verify connection string uses 'mongodb+srv://' for Atlas")
            print("=" * 60 + "\n")
        elif "authentication failed" in error_msg or "bad auth" in error_msg:
            print("\n" + "=" * 60)
            print("MongoDB Authentication Error!")
            print("=" * 60)
            print(
                "Failed to connect to MongoDB with URI: "
                f"{settings.mongodb_uri.split('@')[1] if '@' in settings.mongodb_uri else 'hidden'}"
            )
            print("\nPossible issues:")
            print("1. Incorrect username or password in MongoDB URI")
            print("2. Database user doesn't have proper permissions")
            print("3. IP address not whitelisted (for MongoDB Atlas)")
            print("\nFor local MongoDB (no authentication):")
            print("  MONGODB_URI=mongodb://localhost:27017/swapcircle")
            print("\nFor MongoDB Atlas:")
            print(
                "  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority"
            )
            print("=" * 60 + "\n")
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
