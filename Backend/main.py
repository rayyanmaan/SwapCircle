"""Entry point for the Backend app (stub)
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from Backend.database.connection import connect_db, close_db
from Backend.routes.item_routes import router as items_router

app = FastAPI(title="SwapCircle Backend")

# mount static so uploaded images under Backend/static/images are reachable
app.mount("/static", StaticFiles(directory="Backend/static"), name="static")

# include items router (implemented in item_routes_impl.py)
app.include_router(items_router)


@app.on_event("startup")
async def startup_event():
    await connect_db()


@app.on_event("shutdown")
async def shutdown_event():
    await close_db()


@app.get("/")
async def root():
    return {"message": "SwapCircle Backend running (stubs)"}
