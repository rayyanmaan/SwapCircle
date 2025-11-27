"""Entry point for the Backend app.

Mounts static files and includes the items router. Uses the database
connection helpers in `Backend/database/connection.py`.
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from Backend.database.connection import connect_db, close_db
from Backend.routes.item_routes import router as items_router
from Backend.routes.auth_routes import router as auth_router

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

# mount static so uploaded images under Backend/static/images are reachable
app.mount("/static", StaticFiles(directory="Backend/static"), name="static")

# include items router
app.include_router(items_router)
# include auth router
app.include_router(auth_router)

# CORS - allow frontend dev origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Note: startup/shutdown are handled by the `lifespan` asynccontextmanager above.


@app.get("/")
async def root():
    return {"message": "SwapCircle Backend running"}
