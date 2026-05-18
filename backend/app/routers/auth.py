from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

def get_real_ip(request):
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    from slowapi.util import get_remote_address
    return get_remote_address(request)

limiter = Limiter(key_func=get_real_ip)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user
from app.services.email import send_reset_email
from app.config import settings
from pydantic import BaseModel, EmailStr
import uuid
import secrets
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
async def register(request: Request, body: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        hashed_password=hash_password(body.password),
        tenant_id=str(uuid.uuid4()),
        plan="free"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, body: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user:
        old_tokens = await db.execute(
            select(PasswordResetToken).where(PasswordResetToken.email == body.email)
        )
        for token in old_tokens.scalars().all():
            await db.delete(token)
        raw_token = secrets.token_urlsafe(32)
        reset_token = PasswordResetToken(
            id=str(uuid.uuid4()),
            email=body.email,
            token=raw_token,
            expires_at=datetime.utcnow() + timedelta(minutes=15)
        )
        db.add(reset_token)
        await db.commit()
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://enasverse-x-claude.vercel.app')
        reset_link = f"{frontend_url}/reset-password?token={raw_token}"
        try:
            send_reset_email(body.email, reset_link)
        except Exception as e:
            print(f"Email send error: {e}")
    return {"message": "Jika email terdaftar, link reset password telah dikirim."}

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == body.token,
            PasswordResetToken.used == False
        )
    )
    reset_token = result.scalar_one_or_none()
    if not reset_token:
        raise HTTPException(status_code=400, detail="Token tidak valid atau sudah digunakan")
    if datetime.utcnow() > reset_token.expires_at:
        raise HTTPException(status_code=400, detail="Token sudah kedaluwarsa. Silakan minta reset ulang.")
    result = await db.execute(select(User).where(User.email == reset_token.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    user.hashed_password = hash_password(body.new_password)
    reset_token.used = True
    await db.commit()
    return {"message": "Password berhasil diubah. Silakan login dengan password baru."}
