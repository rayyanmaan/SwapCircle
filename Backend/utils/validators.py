"""Validation helpers (stubs)
"""

def validate_email(email: str) -> bool:
    return "@" in email


def validate_password(password: str) -> bool:
    return len(password) >= 6
