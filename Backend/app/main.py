"""Entry point for the Backend app (stub)
"""

from fastapi import FastAPI

from app.database.connection import connect_db, close_db

app = FastAPI(title="SwapCircle Backend (stub)")


@app.on_event("startup")
async def startup_event():
    await connect_db()


@app.on_event("shutdown")
async def shutdown_event():
    await close_db()


@app.get("/")
async def root():
    return {"message": "SwapCircle Backend running (stubs)"}
