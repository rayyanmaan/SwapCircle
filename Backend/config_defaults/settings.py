"""Centralized runtime settings.

Preferred import point for backend configuration. Uses pydantic BaseSettings
(with pydantic v1 or pydantic-settings for v2) to load environment-backed
settings. Keeps defaults in code while allowing overrides via .env/.env.local.
"""
from typing import Optional

# Try to import BaseSettings (pydantic v1) and fall back to pydantic-settings for v2
try:
    from pydantic import BaseSettings  # pydantic v1
    PYDANTIC_V2 = False
    ConfigDict = None
except ImportError:
    try:
        from pydantic_settings import BaseSettings  # pydantic v2
        from pydantic import ConfigDict  # type: ignore
        PYDANTIC_V2 = True
    except ImportError as exc:  # pragma: no cover - import-time failure path
        raise ImportError(
            "Neither pydantic.BaseSettings nor pydantic_settings.BaseSettings found. "
            "Install pydantic-settings for pydantic v2."
        ) from exc


if PYDANTIC_V2:
    # Pydantic v2 Settings class
    if ConfigDict is not None:
        class Settings(BaseSettings):
            mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
            mongodb_tls: bool = False
            database_name: str = "swapcircle"
            secret_key: str = "changeme"
            firebase_storage_bucket: str = ""
            firebase_credentials_path: Optional[str] = None

            model_config = ConfigDict(
                env_file=[".env.local", ".env"],
                extra="ignore",
            )
    else:
        # Fallback for older pydantic v2 versions
        class Settings(BaseSettings):
            mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
            mongodb_tls: bool = False
            database_name: str = "swapcircle"
            secret_key: str = "changeme"
            firebase_storage_bucket: str = ""
            firebase_credentials_path: Optional[str] = None

            class Config:
                env_file = [".env.local", ".env"]
                extra = "ignore"
else:
    # Pydantic v1 Settings class
    class Settings(BaseSettings):
        mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
        mongodb_tls: bool = False
        database_name: str = "swapcircle"
        secret_key: str = "changeme"
        firebase_storage_bucket: str = ""
        firebase_credentials_path: Optional[str] = None

        class Config:
            env_file = [".env.local", ".env"]
            extra = "ignore"


settings = Settings()

__all__ = ["Settings", "settings", "PYDANTIC_V2", "ConfigDict"]
