"""Compatibility wrapper for settings.

Prefer importing from config_defaults.settings. This module re-exports
those objects so existing imports continue to work while we consolidate
configuration under config_defaults/.
"""

from config_defaults.settings import (
    Settings,
    settings,
    PYDANTIC_V2,
    ConfigDict,
)
