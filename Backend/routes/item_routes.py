"""Compatibility shim for item routes.

This file keeps the original import path (Backend.routes.item_routes) but
re-exports the router implemented in item_routes_impl.py. This allows the
application to pick up the new router without changing other imports.
"""
from .item_routes_impl import router as router

