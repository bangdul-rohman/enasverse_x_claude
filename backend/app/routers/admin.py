from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.database import get_db
from app.models.user import User
from app.models.usage import UsageLog
from app.services.auth import get_current_user
import os

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@enasverse.com")

async def require_admin(current_user=Depends(get_current_user)):
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Akses ditolak. Admin only.")
    return current_user

@router.get("/users")
async def list_users(
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "plan": getattr(u, 'plan', 'free') or 'free',
            "tenant_id": u.tenant_id,
            "created_at": getattr(u, 'created_at', None),
            "plan_expires_at": getattr(u, 'plan_expires_at', None),
        }
        for u in users
    ]

@router.get("/stats")
async def global_stats(
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    pro_users = (await db.execute(select(func.count(User.id)).where(User.plan == 'pro'))).scalar() or 0
    total_actions = (await db.execute(select(func.count(UsageLog.id)))).scalar() or 0
    total_queries = (await db.execute(select(func.count(UsageLog.id)).where(UsageLog.action == 'query'))).scalar() or 0
    total_uploads = (await db.execute(select(func.count(UsageLog.id)).where(UsageLog.action == 'upload'))).scalar() or 0

    return {
        "total_users": total_users,
        "free_users": total_users - pro_users,
        "pro_users": pro_users,
        "total_actions": total_actions,
        "total_queries": total_queries,
        "total_uploads": total_uploads,
        "mrr_idr": pro_users * 99000,
    }

@router.patch("/users/{user_id}/plan")
async def update_user_plan(
    user_id: str,
    plan: str,
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if plan not in ("free", "pro"):
        raise HTTPException(status_code=400, detail="Plan harus 'free' atau 'pro'")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    await db.execute(update(User).where(User.id == user_id).values(plan=plan))
    await db.commit()
    return {"message": f"Plan user {user.email} diubah ke {plan}"}
