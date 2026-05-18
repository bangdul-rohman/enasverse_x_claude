import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_reset_email(to_email: str, reset_link: str):
    gmail_user = settings.gmail_user
    gmail_password = settings.gmail_app_password
    logger.info(f'Sending reset email to {to_email}')
    logger.info(f'GMAIL_USER configured: {bool(gmail_user)}')
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Reset Password Enasverse'
        msg['From'] = f'Enasverse <{gmail_user}>'
        msg['To'] = to_email
        html = f"""<html><body style='font-family:Arial;background:#0f0f1a;padding:40px'><div style='max-width:480px;margin:auto;background:#1a1a2e;border-radius:12px;padding:32px;border:1px solid #2d2d4e'><h2 style='color:#818cf8'>Reset Password Enasverse</h2><p style='color:#9ca3af'>Klik tombol di bawah untuk reset password kamu. Link berlaku 15 menit.</p><a href='{reset_link}' style='display:inline-block;margin:24px 0;background:#4f46e5;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold'>Reset Password</a><p style='color:#6b7280;font-size:12px'>Jika tidak meminta reset, abaikan email ini.</p></div></body></html>"""
        msg.attach(MIMEText(html, 'html'))
        logger.info('Connecting to SMTP...')
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=30) as server:
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
        logger.info(f'Email sent successfully to {to_email}')
    except Exception as e:
        logger.error(f'SMTP ERROR sending to {to_email}: {type(e).__name__}: {str(e)}')
        raise
