"""Firebase Storage-backed image upload/delete utilities.

Uploads images to Firebase Storage and returns public URLs.
"""
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status
import uuid
import asyncio
import firebase_admin
from firebase_admin import credentials, storage
from config_defaults.settings import settings


# Initialize Firebase Admin SDK (singleton pattern)
_firebase_initialized = False


def _initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    global _firebase_initialized
    if _firebase_initialized:
        return
    
    if not settings.firebase_storage_bucket:
        raise RuntimeError(
            "Firebase Storage bucket not configured. Set FIREBASE_STORAGE_BUCKET in .env file."
        )
    
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        _firebase_initialized = True
        return
    except ValueError:
        # Firebase not initialized yet
        pass
    
    # Initialize Firebase
    if settings.firebase_credentials_path:
        # Use service account file - resolve path relative to Backend directory
        from pathlib import Path
        cred_path = Path(settings.firebase_credentials_path)
        
        if cred_path.is_absolute():
            # Use absolute path as-is
            final_path = cred_path
        else:
            # Resolve relative to Backend directory (where image_service.py is located)
            # __file__ is Backend/services/image_service.py, so parent.parent is Backend/
            backend_dir = Path(__file__).resolve().parent.parent
            # Remove "Backend/" prefix if present in the path
            path_str = str(cred_path).replace('Backend/', '').replace('Backend\\', '')
            final_path = backend_dir / path_str
        
        if not final_path.exists():
            raise RuntimeError(
                f"Firebase credentials file not found: {final_path}. "
                f"Please check FIREBASE_CREDENTIALS_PATH in .env file. "
                f"Expected path relative to Backend directory or absolute path."
            )
        
        try:
            cred = credentials.Certificate(str(final_path))
            firebase_admin.initialize_app(cred, {
                'storageBucket': settings.firebase_storage_bucket
            })
        except Exception as e:
            raise RuntimeError(
                f"Failed to load Firebase credentials from {final_path}: {str(e)}"
            )
    else:
        # Try to use default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
        try:
            firebase_admin.initialize_app(options={
                'storageBucket': settings.firebase_storage_bucket
            })
        except Exception as e:
            raise RuntimeError(
                f"Failed to initialize Firebase. Provide FIREBASE_CREDENTIALS_PATH in .env or set GOOGLE_APPLICATION_CREDENTIALS environment variable. Error: {str(e)}"
            )
    
    _firebase_initialized = True


def _get_storage_bucket():
    """Get Firebase Storage bucket instance."""
    _initialize_firebase()
    return storage.bucket()


def _make_filename(image_id: str, original_filename: str) -> str:
    """Generate filename for Firebase Storage."""
    suffix = Path(original_filename).suffix or ".jpg"
    return f"images/{image_id}{suffix}"


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


async def upload_image(upload: UploadFile, validate: bool = True) -> Tuple[str, str]:
    """Upload image to Firebase Storage and return (public_url, image_id).
    
    Args:
        upload: The uploaded file
        validate: Whether to validate the image (default: True)
    
    Returns:
        Tuple of (public_url, image_id)
    
    Raises:
        HTTPException: If validation fails or Firebase upload fails
        RuntimeError: If Firebase is not configured
    """
    if validate:
        validate_image(upload)
    
    image_id = str(uuid.uuid4())
    filename = _make_filename(image_id, upload.filename or "image.jpg")
    
    # Read file content into memory for async upload
    upload.file.seek(0)
    file_content = await upload.read()
    content_type = upload.content_type or "image/jpeg"
    
    # Run Firebase operations in thread pool to avoid blocking
    def _upload_to_firebase():
        try:
            bucket = _get_storage_bucket()
            blob = bucket.blob(filename)
            
            # Set content type for proper serving
            blob.content_type = content_type
            
            # Set metadata
            blob.metadata = {
                "image_id": image_id,
                "original_filename": upload.filename or "image.jpg"
            }
            
            # Upload file content
            blob.upload_from_string(file_content, content_type=content_type)
            
            # Make the blob publicly accessible
            blob.make_public()
            
            # Get public URL
            return blob.public_url
        except RuntimeError as e:
            # Re-raise RuntimeError (configuration issues)
            raise
        except Exception as e:
            # Wrap other exceptions
            raise RuntimeError(f"Failed to upload image to Firebase: {str(e)}")
    
    try:
        public_url = await asyncio.to_thread(_upload_to_firebase)
    except RuntimeError as e:
        # Convert RuntimeError to HTTPException for better API responses
        error_msg = str(e)
        if "not configured" in error_msg.lower() or "firebase" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Image storage not configured: {error_msg}. Please configure Firebase Storage."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {error_msg}"
        )
    
    return (public_url, image_id)


async def delete_image(image_id: str) -> bool:
    """Delete image from Firebase Storage by image_id.
    
    Args:
        image_id: The image ID to delete
    
    Returns:
        True if image was found and deleted, False otherwise
    """
    def _delete_from_firebase():
        try:
            bucket = _get_storage_bucket()
            
            # List all blobs in the images/ directory
            blobs = bucket.list_blobs(prefix="images/")
            
            # Find blob with matching image_id in filename or metadata
            for blob in blobs:
                if image_id in blob.name or (blob.metadata and blob.metadata.get("image_id") == image_id):
                    blob.delete()
                    return True
            
            return False
        except Exception as e:
            print(f"Error deleting image {image_id}: {str(e)}")
            return False
    
    return await asyncio.to_thread(_delete_from_firebase)
