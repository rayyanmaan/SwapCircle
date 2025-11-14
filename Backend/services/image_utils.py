"""Filesystem-backed image utilities (internal to Backend).

This is a small alternative to the old image_service stub and is imported by
the item routes so we don't need external dependencies.
"""
from typing import Tuple
from fastapi import UploadFile
from pathlib import Path
import uuid
import shutil


ROOT = Path(__file__).resolve().parents[2]
IMAGES_DIR = ROOT / "static" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def _make_filename(image_id: str, original_filename: str) -> str:
    suffix = Path(original_filename).suffix or ""
    return f"{image_id}{suffix}"


def upload_image(upload: UploadFile) -> Tuple[str, str]:
    image_id = str(uuid.uuid4())
    filename = _make_filename(image_id, upload.filename)
    dest = IMAGES_DIR / filename
    with dest.open("wb") as out_file:
        shutil.copyfileobj(upload.file, out_file)
    url = f"/static/images/{filename}"
    return (url, image_id)


def delete_image(image_id: str) -> bool:
    found = False
    for p in IMAGES_DIR.iterdir():
        if p.name.startswith(image_id):
            try:
                p.unlink()
                found = True
            except OSError:
                pass
    return found
