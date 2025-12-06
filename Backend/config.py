"""Configuration and environment helpers.

This module is written to work with both pydantic v1 (BaseSettings) and
pydantic v2 where BaseSettings moved to the `pydantic-settings` package.
If you're using pydantic v2 it's recommended to install `pydantic-settings`.
"""
from typing import Optional
try:
    # pydantic v1 compatibility
    from pydantic import BaseSettings
except Exception:  # pragma: no cover - fallback for pydantic v2
    from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
    database_name: str = "swapcircle"
    secret_key: str = "changeme"
    # Firebase configuration
    firebase_storage_bucket: str = ""  # e.g., "your-project.appspot.com"
    firebase_credentials_path: Optional[str] = None  # Path to Firebase service account JSON file

    class Config:
        env_file = ".env"


settings = Settings()
