from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import engine, Base
from app.services.retriever import init_collection
from app.routers import query, documents, auth, agent, indexer
from app.logger import setup_logger
import logging

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await init_collection()
    logger = setup_logger(settings.betterstack_token)
    logging.getLogger("enasverse").info("Enasverse API started", extra={"env": settings.app_env})
    yield

app = FastAPI(
    title="Enasverse API",
    description="Persistent memory + agentic AI system",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(query.router)
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
