"""
Backend Configuration Constants
Centralized defaults for CORS, URLs, and other settings
"""

import os

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Parse, normalize, and filter CORS origins (strip whitespace, remove trailing slashes, filter empties)
CORS_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", FRONTEND_URL).split(",")
    if origin.strip()
]

# Export for use in other modules
__all__ = ["FRONTEND_URL", "CORS_ORIGINS"]
