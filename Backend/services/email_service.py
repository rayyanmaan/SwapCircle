import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

logger = logging.getLogger(__name__)

async def send_contact_email(email: str, name: str, subject: str, message: str, contact_type: str) -> Tuple[bool, str]:
    try:
        GMAIL_USER = "sys@uni.minerva.edu"
        GMAIL_PASSWORD = "your_app_password"
        ADMIN_EMAIL = "sys@uni.minerva.edu"
        
        user_msg = MIMEMultipart()
        user_msg["From"] = GMAIL_USER
        user_msg["To"] = email
        user_msg["Subject"] = f"We received your {contact_type} - {subject}"
        
        user_body = f"""Hi {name},

Thank you for reaching out to SwapCircle. We've received your {contact_type} and will review it shortly.

Your message:
Subject: {subject}
{message}

We appreciate your feedback and will get back to you soon!

Best regards,
SwapCircle Team"""
        
        user_msg.attach(MIMEText(user_body, "plain"))
        
        admin_msg = MIMEMultipart()
        admin_msg["From"] = GMAIL_USER
        admin_msg["To"] = ADMIN_EMAIL
        admin_msg["Subject"] = f"New {contact_type.upper()} from {name}"
        
        admin_body = f"""New {contact_type} submission:

From: {name}
Email: {email}
Type: {contact_type}
Subject: {subject}
Message: {message}"""
        
        admin_msg.attach(MIMEText(admin_body, "plain"))
        
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(GMAIL_USER, GMAIL_PASSWORD)
                server.send_message(user_msg)
            logger.info(f"User confirmation email sent to {email} for {contact_type}")
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP authentication failed when sending to {email}: {str(e)}")
            return False, "Authentication error. Please try again later."
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error when sending confirmation email to {email}: {str(e)}")
            return False, "Email service error. Please try again later."
        except Exception as e:
            logger.error(f"Unexpected error sending confirmation email to {email}: {str(e)}")
            return False, "Failed to send confirmation email. Please try again."
        
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(GMAIL_USER, GMAIL_PASSWORD)
                server.send_message(admin_msg)
            logger.info(f"Admin notification email sent for {contact_type} from {email}")
        except smtplib.SMTPException as e:
            logger.warning(f"Failed to send admin notification for {contact_type} from {email}: {str(e)}")
        except Exception as e:
            logger.warning(f"Unexpected error sending admin notification: {str(e)}")
        
        return True, f"{contact_type.capitalize()} received successfully"
        
    except Exception as e:
        logger.error(f"Unexpected error in send_contact_email for {email}: {str(e)}")
        return False, "An unexpected error occurred. Please try again later."


def send_email(to: str, subject: str, body: str) -> bool:
    """Simple email sending function for general use.
    
    Args:
        to: Recipient email address
        subject: Email subject
        body: Email body text
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        GMAIL_USER = "sys@uni.minerva.edu"
        GMAIL_PASSWORD = "your_app_password"
        
        msg = MIMEMultipart()
        msg["From"] = GMAIL_USER
        msg["To"] = to
        msg["Subject"] = subject
        
        msg.attach(MIMEText(body, "plain"))
        
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(GMAIL_USER, GMAIL_PASSWORD)
                server.send_message(msg)
            logger.info(f"Email sent to {to} with subject: {subject}")
            return True
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP authentication failed when sending to {to}: {str(e)}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error when sending email to {to}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to}: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"Unexpected error in send_email for {to}: {str(e)}")
        return False
