from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.services.retriever import init_collection

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_collection()
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
