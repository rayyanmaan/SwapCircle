"""Entry point for the Backend app.

Mounts static files and includes the items router. Uses the database
connection helpers in `Backend/database/connection.py`.
"""
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from contextlib import asynccontextmanager

from database.connection import connect_db, close_db
from routes.item_routes import router as items_router
from routes.auth_routes import router as auth_router
from routes.user_routes import router as users_router
from routes.swap_routes import router as swaps_router
from routes.notification_routes import router as notifications_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await connect_db()
    try:
        yield
    finally:
        # shutdown
        await close_db()


app = FastAPI(title="SwapCircle Backend", lifespan=lifespan)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are included in error responses."""
    from fastapi import HTTPException
    import traceback
    
    # Don't handle HTTPException here - let FastAPI handle it normally
    if isinstance(exc, HTTPException):
        raise exc
    
    # Log the full error for debugging
    print(f"Unhandled exception: {exc}")
    print(traceback.format_exc())
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors to provide detailed error messages."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        msg = error["msg"]
        error_type = error.get("type", "unknown")
        errors.append({"field": field, "message": msg, "type": error_type})

    # Try to get body data, handling different content types
    body_data = None
    if hasattr(exc, "body") and exc.body is not None:
        try:
            # Check if it's a FormData object (multipart)
            from starlette.datastructures import FormData

            if isinstance(exc.body, FormData):
                # Convert FormData to a serializable dict
                body_data = {}
                for key, value in exc.body.items():
                    # Handle file uploads specially
                    if hasattr(value, "filename"):
                        body_data[key] = f"<file: {value.filename}>"
                    else:
                        body_data[key] = value
            # If it's bytes, try to decode as JSON
            elif isinstance(exc.body, bytes):
                try:
                    import json

                    body_data = json.loads(exc.body.decode("utf-8"))
                except:
                    body_data = f"<bytes: {len(exc.body)} bytes>"
            # If it's already a dict or list, use it directly
            elif isinstance(exc.body, (dict, list, str, int, float, bool, type(None))):
                body_data = exc.body
            # Otherwise, convert to string representation
            else:
                body_data = f"<{type(exc.body).__name__}>"
        except Exception as e:
            # If we can't serialize it, just note the type
            body_data = f"<unable to serialize: {type(exc.body).__name__}>"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": {
                "message": "Validation error",
                "errors": errors,
                "body": body_data,
                "content_type": request.headers.get("content-type", "unknown"),
            }
        },
    )


# mount static so uploaded images under static/images are reachable
# Note: Static files are only mounted if the directory exists and is writable
# In production (Vercel), we use Firebase Storage instead, so static mounting is optional
ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"

# Only create static directory if we're not on a read-only filesystem (e.g., Vercel)
# Since we're using Firebase Storage, this is mainly for local development
try:
    STATIC_DIR.mkdir(exist_ok=True)
    # Only mount static files if directory creation succeeded
    if STATIC_DIR.exists():
        app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
except OSError:
    # Read-only filesystem (e.g., Vercel) - skip static mounting
    # Images are served from Firebase Storage instead
    pass

# include items router
app.include_router(items_router)
# include auth router
app.include_router(auth_router)
# include users router
app.include_router(users_router)
# include swaps router (swap requests, approvals, history)
app.include_router(swaps_router)
# include notifications router
app.include_router(notifications_router)

# CORS - configure allowed origins from environment variable
# Default to localhost for development, but allow production URL via env var
import os
from config import settings

# Get allowed origins from environment variable, default to localhost
allowed_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Note: startup/shutdown are handled by the `lifespan` asynccontextmanager above.


@app.get("/")
async def root():
    return {"message": "SwapCircle Backend running"}
