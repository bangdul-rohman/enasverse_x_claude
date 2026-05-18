from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from app.limiter import limiter

from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import engine, Base
from app.models.audit import AuditLog  # noqa - trigger table creation
from app.models.usage import UsageLog  # noqa
from app.models.api_key import APIKey  # noqa
from app.services.retriever import init_collection
from app.routers import (api_keys, usage, billing, admin, query, documents, auth, agent, indexer, history)
from app.models import chat
from app.logger import setup_logger
import logging
import traceback

settings = get_settings()




@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Migrate existing tables - add new columns if not exist
        async with engine.begin() as migrate_conn:
            migrations = [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR DEFAULT 'free' NOT NULL",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
            ]
            for sql in migrations:
                try:
                    await migrate_conn.execute(__import__('sqlalchemy').text(sql))
                except Exception:
                    pass
    await init_collection()
    setup_logger(settings.betterstack_token, settings.betterstack_host)
    logging.info("Enasverse API started")
    yield

app = FastAPI(
    title="Enasverse API",
    description="Persistent memory + agentic AI system",
    version="0.1.0",
    lifespan=lifespan,
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    tb = traceback.format_exc()
    logging.error(f"Unhandled exception: {exc}
{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": tb[-500:]}
    )

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.include_router(auth.router)
app.include_router(query.router)
app.include_router(api_keys.router)
app.include_router(usage.router)
app.include_router(billing.router)
app.include_router(admin.router)
app.include_router(documents.router)
app.include_router(agent.router)
app.include_router(indexer.router)

@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "status": "running",
        "env": settings.app_env,
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
