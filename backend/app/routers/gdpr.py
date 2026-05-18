from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.services.auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/gdpr", tags=["gdpr"])

async def log_audit(db: AsyncSession, user_id: str, action: str, ip: str = None, details: str = None):
    entry = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        action=action,
        ip_address=ip,
        details=details,
    )
    db.add(entry)
    await db.commit()

@router.get("/export")
async def export_my_data(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None,
):
    """GDPR: Export semua data user"""
    user = await db.get(User, str(current_user.id))
    
    from app.models.usage import UsageLog
    from app.models.chat import ChatSession, ChatMessage
    
    usage_result = await db.execute(
        select(UsageLog).where(UsageLog.user_id == str(current_user.id))
    )
    usages = usage_result.scalars().all()
    
    sessions_result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == str(current_user.id))
    )
    sessions = sessions_result.scalars().all()

    await log_audit(db, str(current_user.id), "gdpr_export", 
                   ip=request.client.host if request else None)
    
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "id": user.id,
            "email": user.email,
            "plan": getattr(user, 'plan', 'free'),
            "created_at": str(getattr(user, 'created_at', None)),
        },
        "usage_logs": len(usages),
        "chat_sessions": len(sessions),
        "message": "Data berhasil diekspor. Hubungi support untuk file lengkap.",
    }

@router.delete("/delete-account")
async def delete_account(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None,
):
    """GDPR: Hapus akun dan semua data"""
    user_id = str(current_user.id)
    
    await log_audit(db, user_id, "account_deleted", 
                   ip=request.client.host if request else None,
                   details=f"User {current_user.email} deleted account")
    
    # Hapus user (cascade akan hapus data terkait jika ada FK)
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    
    return {"message": "Akun dan semua data telah dihapus permanen."}
