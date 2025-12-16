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
from config_defaults.constants import CORS_ORIGINS
from routes.item_routes import router as items_router
from routes.auth_routes import router as auth_router
from routes.user_routes import router as users_router
from routes.swap_routes import router as swaps_router
from routes.notification_routes import router as notifications_router
from routes.rating_routes import router as ratings_router
from routes.contact_routes import router as contact_router
from routes.credit_routes import router as credits_router
from routes.report_routes import router as reports_router


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

# CORS - configure allowed origins from environment variable
# IMPORTANT: CORS middleware must be added BEFORE routers to handle OPTIONS preflight requests
# CORS configuration imported from centralized constants at top of file
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os

# Toggle noisy CORS debug logging via env. Default false to keep logs clean in Docker.
DEBUG_CORS = os.getenv("DEBUG_CORS", "false").lower() == "true"

# CORS origins are already normalized in config_defaults/constants.py
allowed_origins = CORS_ORIGINS

# Debug: Print CORS configuration on startup (guarded by DEBUG_CORS)
if DEBUG_CORS:
    print(f"CORS Configuration: allowed_origins={allowed_origins}")


# Custom middleware to handle OPTIONS requests before they hit route handlers
class OptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log ALL requests for debugging (guarded)
        if DEBUG_CORS:
            print("\n" + "=" * 80)
            print(f"[OptionsMiddleware] Request received:")
            print(f"  Method: {request.method}")
            print(f"  Path: {request.url.path}")
            print(f"  Full URL: {request.url}")
            print(f"  Origin: {request.headers.get('origin', 'None')}")
            print(f"  Headers: {dict(request.headers)}")
            print(f"  Query params: {dict(request.query_params)}")
            print("=" * 80)

        # Handle OPTIONS requests immediately
        if request.method == "OPTIONS":
            origin = request.headers.get("origin")
            if DEBUG_CORS:
                print(
                    f"[OptionsMiddleware] OPTIONS request intercepted: {request.url.path} from origin: {origin}"
                )
                print(f"[OptionsMiddleware] Allowed origins: {allowed_origins}")

            headers = {
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }

            # Normalize origin (remove trailing slash) for comparison
            normalized_origin = origin.rstrip("/") if origin else None

            # Only set Access-Control-Allow-Origin if origin is in allowed list
            if normalized_origin and normalized_origin in allowed_origins:
                headers["Access-Control-Allow-Origin"] = origin  # Use original origin in header
                if DEBUG_CORS:
                    print(
                        f"[OptionsMiddleware] ✅ OPTIONS request ALLOWED for origin: {origin}"
                    )
            elif origin:
                if DEBUG_CORS:
                    print(
                        f"[OptionsMiddleware] ❌ OPTIONS request BLOCKED - origin '{origin}' (normalized: '{normalized_origin}') not in allowed_origins: {allowed_origins}"
                    )
            else:
                if DEBUG_CORS:
                    print("[OptionsMiddleware] ⚠️ OPTIONS request with no origin header")

            if DEBUG_CORS:
                print(f"[OptionsMiddleware] Returning 200 OK with headers: {headers}")
            return Response(content="", status_code=200, headers=headers)

        # For non-OPTIONS requests, continue to next middleware/handler
        if DEBUG_CORS:
            print(
                f"[OptionsMiddleware] Non-OPTIONS request ({request.method}), passing to next handler for {request.url.path}..."
            )
        try:
            response = await call_next(request)
            if DEBUG_CORS:
                print(
                    f"[OptionsMiddleware] ✅ Response status: {response.status_code} for {request.method} {request.url.path}"
                )

            # Add CORS headers to all responses (including 405 errors)
            origin = request.headers.get("origin")
            normalized_origin = origin.rstrip("/") if origin else None
            if normalized_origin and normalized_origin in allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = (
                    origin  # Use original origin
                )
                response.headers["Access-Control-Allow-Credentials"] = "true"
                if DEBUG_CORS:
                    print(
                        f"[OptionsMiddleware] Added CORS headers to response for origin: {origin}"
                    )

            # Log 405 errors specifically
            if response.status_code == 405:
                if DEBUG_CORS:
                    print(
                        f"[OptionsMiddleware] ⚠️ 405 Method Not Allowed for {request.method} {request.url.path}"
                    )
                    print(
                        f"[OptionsMiddleware] This means FastAPI found a route for the path but not the method"
                    )

            return response
        except Exception as e:
            print(
                f"[OptionsMiddleware] ❌ Exception in call_next for {request.method} {request.url.path}: {type(e).__name__}: {e}"
            )
            import traceback

            print(traceback.format_exc())
            raise


# Add FastAPI CORS middleware first (will execute last due to reverse order)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add custom OPTIONS middleware LAST (will execute FIRST due to reverse order)
# This ensures OPTIONS requests are intercepted before they reach route handlers
app.add_middleware(OptionsMiddleware)


# Add security headers middleware to protect against common vulnerabilities
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add standard security headers to all responses.
    
    Headers added:
    - X-Content-Type-Options: nosniff - Prevents MIME-sniffing attacks
    - X-Frame-Options: DENY - Prevents clickjacking by blocking iframe embedding
    - X-XSS-Protection: 1; mode=block - Enables XSS filter in older browsers
    
    These headers follow OWASP security best practices.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


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

    # Get the origin from the request to set appropriate CORS header
    origin = request.headers.get("origin")
    normalized_origin = origin.rstrip("/") if origin else None
    cors_headers = {}
    if normalized_origin and normalized_origin in allowed_origins:
        cors_headers = {
            "Access-Control-Allow-Origin": origin,  # Use original origin
            "Access-Control-Allow-Credentials": "true",
        }

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
        headers=cors_headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors to provide detailed error messages."""
    print("\n" + "=" * 80)
    print(f"[ValidationExceptionHandler] Validation error caught!")
    print(f"  Method: {request.method}")
    print(f"  Path: {request.url.path}")
    print(f"  Origin: {request.headers.get('origin', 'None')}")
    print(f"  Error: {exc}")
    print("=" * 80)

    # For OPTIONS requests, return 200 OK with CORS headers instead of validation error
    if request.method == "OPTIONS":
        print(
            "[ValidationExceptionHandler] OPTIONS request hit validation error - returning 200 OK"
        )
        origin = request.headers.get("origin")
        normalized_origin = origin.rstrip("/") if origin else None
        headers = {}
        if normalized_origin and normalized_origin in allowed_origins:
            headers = {
                "Access-Control-Allow-Origin": origin,  # Use original origin
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            }
            print(
                f"[ValidationExceptionHandler] ✅ Returning 200 OK with CORS headers for origin: {origin}"
            )
        else:
            print(
                f"[ValidationExceptionHandler] ⚠️ Origin '{origin}' (normalized: '{normalized_origin}') not in allowed list: {allowed_origins}"
            )
        return JSONResponse(content={}, headers=headers, status_code=200)

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

# Include routers - the middleware handles OPTIONS, so we don't need a catch-all OPTIONS route
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
# include ratings router
app.include_router(ratings_router)
# include contact router
app.include_router(contact_router)
# include credits router
app.include_router(credits_router)
# include reports router
app.include_router(reports_router)

# Debug: Print all registered routes on startup
print("\n" + "=" * 80)
print("Registered Routes:")
for route in app.routes:
    if hasattr(route, "methods") and hasattr(route, "path"):
        print(f"  {', '.join(route.methods)} {route.path}")
    elif hasattr(route, "path"):
        print(f"  {route.path} (mount/static)")
print("=" * 80 + "\n")

# Note: startup/shutdown are handled by the `lifespan` asynccontextmanager above.
# Note: CORS middleware is added earlier (before routers) to handle OPTIONS preflight requests


@app.get("/")
async def root():
    return {"message": "SwapCircle Backend running"}
