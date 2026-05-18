from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timezone
from app.database import get_db
from app.models.usage import UsageLog, PLAN_LIMITS
from app.services.auth import get_current_user
import uuid

router = APIRouter(prefix="/usage", tags=["usage"])

async def log_usage(db: AsyncSession, user_id: str, action: str, tokens: int = 0, file_kb: float = 0):
    log = UsageLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        action=action,
        tokens_used=tokens,
        file_size_kb=file_kb,
    )
    db.add(log)
    await db.commit()

@router.get("/stats")
async def get_usage_stats(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = str(current_user.id)
    now = datetime.now(timezone.utc)
    month = now.month
    year = now.year

    # Count actions this month
    async def count_action(action: str):
        result = await db.execute(
            select(func.count(UsageLog.id)).where(
                UsageLog.user_id == user_id,
                UsageLog.action == action,
                extract('month', UsageLog.created_at) == month,
                extract('year', UsageLog.created_at) == year,
            )
        )
        return result.scalar() or 0

    queries = await count_action('query')
    uploads = await count_action('upload')
    agent_runs = await count_action('agent')
    index_repos = await count_action('index_repo')

    # Total all time
    total_result = await db.execute(
        select(func.count(UsageLog.id)).where(UsageLog.user_id == user_id)
    )
    total_all_time = total_result.scalar() or 0

    plan = getattr(current_user, 'plan', 'free') or 'free'
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

    return {
        "plan": plan,
        "period": f"{year}-{month:02d}",
        "this_month": {
            "queries": queries,
            "uploads": uploads,
            "agent_runs": agent_runs,
            "index_repos": index_repos,
        },
        "limits": limits,
        "total_all_time": total_all_time,
    }
