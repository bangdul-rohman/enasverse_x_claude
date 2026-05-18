from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import secrets, hashlib, uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models.api_key import APIKey
from app.services.auth import get_current_user

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

def generate_api_key() -> tuple[str, str, str]:
    raw = "env_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    prefix = raw[:12]
    return raw, key_hash, prefix

class CreateKeyRequest(BaseModel):
    name: str
    expires_days: Optional[int] = None

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]

@router.post("/")
async def create_api_key(
    req: CreateKeyRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw_key, key_hash, prefix = generate_api_key()
    expires_at = None
    if req.expires_days:
        from datetime import timedelta
        expires_at = datetime.utcnow() + timedelta(days=req.expires_days)

    api_key = APIKey(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        name=req.name,
        key_hash=key_hash,
        key_prefix=prefix,
        expires_at=expires_at,
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": raw_key,  # Only shown once!
        "key_prefix": prefix,
        "created_at": api_key.created_at,
        "message": "Simpan API key ini sekarang. Tidak akan ditampilkan lagi."
    }

@router.get("/")
async def list_api_keys(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(APIKey)
        .where(APIKey.user_id == str(current_user.id))
        .order_by(APIKey.created_at.desc())
    )
    keys = result.scalars().all()
    return [
        {
            "id": k.id,
            "name": k.name,
            "key_prefix": k.key_prefix,
            "is_active": k.is_active,
            "created_at": k.created_at,
            "last_used_at": k.last_used_at,
            "expires_at": k.expires_at,
        }
        for k in keys
    ]

@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == str(current_user.id)
        )
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key tidak ditemukan")

    key.is_active = False
    await db.commit()
    return {"message": "API key berhasil dinonaktifkan"}
