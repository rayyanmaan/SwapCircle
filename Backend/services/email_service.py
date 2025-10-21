"""Email service stub
"""

def send_email(to: str, subject: str, body: str) -> bool:
    # stub - integrate with an email provider in production
    print(f"sending email to {to}: {subject}")
    return True
