import re


def validate_email(email: str) -> bool:
    campus_pattern = r"^[A-Za-z0-9._%+-]+@.+\.edu$"
    return bool(re.match(campus_pattern, email))


def validate_password(password: str) -> bool:
    return len(password) >= 6


def validate_instagram(handle: str) -> bool:
    if handle is None:
        return True
    return handle.startswith("@") and len(handle) > 1


def validate_whatsapp(number: str) -> bool:
    if number is None:
        return True
    return number.isdigit() and len(number) >= 8
