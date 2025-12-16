"""
Backend Configuration Constants
Centralized defaults for CORS, URLs, and other settings
"""

import os

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", FRONTEND_URL).split(",")

# Ensure clean CORS origins (strip whitespace)
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS]

# Export for use in other modules
__all__ = ["FRONTEND_URL", "CORS_ORIGINS"]
