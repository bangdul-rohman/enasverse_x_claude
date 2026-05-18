from fastapi import APIRouter
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/health", tags=["health"])

START_TIME = datetime.now(timezone.utc)

@router.get("/")
async def health_check():
    uptime = (datetime.now(timezone.utc) - START_TIME).total_seconds()
    return {
        "status": "ok",
        "uptime_seconds": round(uptime),
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production"),
    }

@router.get("/detailed")
async def detailed_health():
    checks = {}
    
    # DB check
    try:
        from app.database import engine
        async with engine.connect() as conn:
            await conn.execute(__import__('sqlalchemy').text('SELECT 1'))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)[:50]}"

    # Qdrant check
    try:
        from app.services.retriever import qdrant_client
        qdrant_client.get_collections()
        checks["qdrant"] = "ok"
    except Exception as e:
        checks["qdrant"] = f"error: {str(e)[:50]}"

    all_ok = all(v == "ok" for v in checks.values())
    return {
        "status": "ok" if all_ok else "degraded",
        "checks": checks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
