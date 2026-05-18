import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

def send_reset_email(to_email: str, reset_link: str):
    logger.info(f'Sending reset email to {to_email} via Resend')
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f0f1a; color: #fff; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: #1a1a2e; border-radius: 12px; padding: 32px; border: 1px solid #2d2d4e;">
            <h2 style="color: #818cf8;">Reset Password Enasverse</h2>
            <p style="color: #9ca3af;">Kami menerima permintaan reset password untuk akun kamu.</p>
            <p style="color: #9ca3af;">Klik tombol di bawah untuk membuat password baru. Link berlaku <strong style="color:#fff">15 menit</strong>.</p>
            <a href="{reset_link}" style="display:inline-block; margin: 24px 0; background: #4f46e5; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Reset Password
            </a>
            <p style="color: #6b7280; font-size: 12px;">Jika tidak meminta reset, abaikan email ini.</p>
        </div>
    </body>
    </html>
    """
    response = httpx.post(
        'https://api.resend.com/emails',
        headers={
            'Authorization': f'Bearer {settings.resend_api_key}',
            'Content-Type': 'application/json',
        },
        json={
            'from': 'Enasverse <onboarding@resend.dev>',
            'to': [to_email],
            'subject': 'Reset Password Enasverse',
            'html': html,
        },
        timeout=30
    )
    if response.status_code != 200:
        logger.error(f'Resend error: {response.status_code} {response.text}')
        raise Exception(f'Failed to send email: {response.text}')
    logger.info(f'Email sent successfully to {to_email}')
