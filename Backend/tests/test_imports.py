"""Test all relative imports work correctly"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def test_backend_imports_relative():
    """Test that all backend imports use relative paths, not absolute Backend.* paths"""
    
    # These should all succeed with relative imports
    from services import auth_service, user_service, message_service, credit_service, storage_service
    from models.user_model import UserCreate, UserOut, Login, AuthResponse
    from routes import auth_routes, user_routes, item_routes, message_routes, credit_routes
    
    # Verify imports worked
    assert auth_service is not None
    assert user_service is not None
    assert auth_routes is not None
    
    # Verify no "Backend." prefixed imports by checking module names
    assert not "Backend.services" in str(auth_service)
    assert not "Backend.models" in str(UserCreate)


def test_service_imports_relative():
    """Test services use relative imports"""
    from services import auth_service, user_service
    
    # Should have the expected functions
    assert hasattr(auth_service, 'hash_password')
    assert hasattr(auth_service, 'verify_password')
    assert hasattr(auth_service, 'create_access_token')
    assert hasattr(auth_service, 'verify_access_token')
    
    assert hasattr(user_service, 'get_user_by_id')
    assert hasattr(user_service, 'get_user_by_email')
    assert hasattr(user_service, 'create_user')


def test_route_imports_relative():
    """Test routes use relative imports"""
    from routes import auth_routes, user_routes, item_routes
    
    # Should have router objects
    assert hasattr(auth_routes, 'router')
    assert hasattr(user_routes, 'router')
    assert hasattr(item_routes, 'router')


def test_no_absolute_backend_imports():
    """Test that no files import using absolute 'Backend.' pattern"""
    backend_dir = Path(__file__).resolve().parent.parent
    
    # Scan all Python files for old import pattern
    old_import_pattern = "from Backend."
    
    found_old_imports = []
    for py_file in backend_dir.rglob("*.py"):
        if "test" in str(py_file):
            continue  # Skip test files
        
        try:
            with open(py_file, 'r') as f:
                content = f.read()
                if old_import_pattern in content:
                    found_old_imports.append(py_file)
        except Exception:
            pass
    
    # Should have no old imports
    assert len(found_old_imports) == 0, f"Found old imports in: {found_old_imports}"


def test_config_import():
    """Test config import works"""
    from config import settings
    
    assert settings is not None
    # Settings should have either database_file or mongodb_uri
    assert hasattr(settings, 'secret_key')
