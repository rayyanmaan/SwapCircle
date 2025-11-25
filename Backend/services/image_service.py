"""Filesystem-backed image upload/delete utilities.

Saves uploaded files under `Backend/static/images` and returns (url, id).
This is a simple, local-only implementation suitable for development.
"""
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile
import uuid
import shutil


ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "static" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def _make_filename(image_id: str, original_filename: str) -> str:
    suffix = Path(original_filename).suffix or ""
    return f"{image_id}{suffix}"


def upload_image(upload: UploadFile) -> Tuple[str, str]:
    """Save `UploadFile` to disk and return (url, id)."""
    image_id = str(uuid.uuid4())
    filename = _make_filename(image_id, upload.filename)
    dest = IMAGES_DIR / filename
    with dest.open("wb") as out_file:
        shutil.copyfileobj(upload.file, out_file)
    url = f"/static/images/{filename}"
    return (url, image_id)


def delete_image(image_id: str) -> bool:
    """Delete any file that starts with the given image_id in the images dir."""
    found = False
    for p in IMAGES_DIR.iterdir():
        if p.name.startswith(image_id):
            try:
                p.unlink()
                found = True
            except OSError:
                pass
    return found
