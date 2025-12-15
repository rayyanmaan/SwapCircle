"""Configuration and environment helpers.

This module is written to work with both pydantic v1 (BaseSettings) and
pydantic v2 where BaseSettings moved to the `pydantic-settings` package.
If you're using pydantic v2 it's recommended to install `pydantic-settings`.
"""
from typing import Optional

# Try to import BaseSettings - pydantic v1 vs v2
try:
    # pydantic v1 compatibility
    from pydantic import BaseSettings
    PYDANTIC_V2 = False
except ImportError:
    # pydantic v2 - BaseSettings moved to pydantic-settings
    try:
        from pydantic_settings import BaseSettings
        PYDANTIC_V2 = True
        # Try to import ConfigDict for v2
        try:
            from pydantic import ConfigDict
        except ImportError:
            # Older pydantic v2 versions might not have ConfigDict
            ConfigDict = None
    except ImportError:
        raise ImportError("Neither pydantic.BaseSettings nor pydantic_settings.BaseSettings found. Install pydantic-settings for pydantic v2.")


if PYDANTIC_V2:
    # Pydantic v2 Settings class
    if ConfigDict is not None:
        # Use ConfigDict (pydantic v2.0+)
        class Settings(BaseSettings):
            mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
            mongodb_tls: bool = False
            database_name: str = "swapcircle"
            secret_key: str = "changeme"
            # Firebase configuration
            firebase_storage_bucket: str = ""  # e.g., "your-project.appspot.com"
            firebase_credentials_path: Optional[str] = None  # Path to Firebase service account JSON file

            model_config = ConfigDict(
                env_file=".env",
                extra="ignore"  # Ignore extra fields from environment variables (like jwt_secret_key)
            )
    else:
        # Fallback for older pydantic v2 (use class Config)
        class Settings(BaseSettings):
            mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
            mongodb_tls: bool = False
            database_name: str = "swapcircle"
            secret_key: str = "changeme"
            # Firebase configuration
            firebase_storage_bucket: str = ""  # e.g., "your-project.appspot.com"
            firebase_credentials_path: Optional[str] = None  # Path to Firebase service account JSON file

            class Config:
                env_file = ".env"
                extra = "ignore"  # Ignore extra fields from environment variables
else:
    # Pydantic v1 Settings class
    class Settings(BaseSettings):
        mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
        mongodb_tls: bool = False
        database_name: str = "swapcircle"
        secret_key: str = "changeme"
        # Firebase configuration
        firebase_storage_bucket: str = ""  # e.g., "your-project.appspot.com"
        firebase_credentials_path: Optional[str] = None  # Path to Firebase service account JSON file

        class Config:
            env_file = ".env"
            extra = "ignore"  # Ignore extra fields from environment variables


settings = Settings()
