"""Image upload/processing stubs
"""
from typing import Tuple


def upload_image(file_bytes: bytes) -> Tuple[str, str]:
    # returns (url, id)
    return ("http://example.com/image.jpg", "img_123")


def delete_image(image_id: str) -> bool:
    return True
