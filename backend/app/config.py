from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "enasverse"
    app_env: str = "development"
    secret_key: str = "dev-secret-key"
    
    database_url: str = "postgresql+asyncpg://enasverse:enasverse@localhost:5432/enasverse"
    
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "enasverse_docs"
    qdrant_api_key: str = ""
    
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    
    github_token: str = ""
    github_webhook_secret: str = ""
    betterstack_token: str = ""
    betterstack_host: str = "s2444508.eu-fsn-3.betterstackdata.com"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
