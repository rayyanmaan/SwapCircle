"""Configuration and environment helpers (stub)
"""
from pydantic import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017/swapcircle"
    database_name: str = "swapcircle"
    secret_key: str = "changeme"

    class Config:
        env_file = ".env"


settings = Settings()
