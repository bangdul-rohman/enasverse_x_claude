import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_reset_email(to_email: str, reset_link: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset Password Enasverse"
    msg["From"] = settings.GMAIL_USER
    msg["To"] = to_email

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f0f1a; color: #fff; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: #1a1a2e; border-radius: 12px; padding: 32px; border: 1px solid #2d2d4e;">
            <h2 style="color: #818cf8;">Reset Password Enasverse</h2>
            <p style="color: #9ca3af;">Kami menerima permintaan reset password untuk akun kamu.</p>
            <p style="color: #9ca3af;">Klik tombol di bawah untuk membuat password baru. Link ini berlaku selama <strong style="color:#fff">15 menit</strong>.</p>
            <a href="{reset_link}" style="display:inline-block; margin: 24px 0; background: #4f46e5; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Reset Password
            </a>
            <p style="color: #6b7280; font-size: 12px;">Jika kamu tidak meminta reset password, abaikan email ini.</p>
            <p style="color: #6b7280; font-size: 12px;">Link: {reset_link}</p>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(settings.GMAIL_USER, to_email, msg.as_string())
