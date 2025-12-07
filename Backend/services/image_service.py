"""Filesystem-backed image upload/delete utilities.

Saves uploaded files under `Backend/static/images` and returns (url, id).
This is a simple, local-only implementation suitable for development.
"""
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
import uuid
import shutil


ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "static" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def _make_filename(image_id: str, original_filename: str) -> str:
    suffix = Path(original_filename).suffix or ""
    return f"{image_id}{suffix}"


# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
}

# Maximum file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes


def validate_image(upload: UploadFile) -> None:
    """Validate image file type and size.
    
    Raises HTTPException if validation fails.
    """
    # Check content type
    content_type = upload.content_type
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: JPEG, PNG, GIF, WebP. Got: {content_type}"
        )
    
    # Check file extension as additional validation
    if upload.filename:
        ext = Path(upload.filename).suffix.lower()
        allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension. Allowed: {', '.join(allowed_extensions)}. Got: {ext}"
            )
    
    # Check file size
    # Read the file to get its size
    upload.file.seek(0, 2)  # Seek to end
    file_size = upload.file.tell()
    upload.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024):.1f}MB. Got: {file_size / (1024 * 1024):.2f}MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )


def upload_image(upload: UploadFile, validate: bool = True) -> Tuple[str, str]:
    """Save `UploadFile` to disk and return (url, id).
    
    Args:
        upload: The uploaded file
        validate: Whether to validate the image (default: True)
    
    Returns:
        Tuple of (url, image_id)
    
    Raises:
        HTTPException: If validation fails
    """
    if validate:
        validate_image(upload)
    
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
