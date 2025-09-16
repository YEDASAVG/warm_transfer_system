from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # LiveKit Configuration
    livekit_api_key: str
    livekit_api_secret: str
    livekit_ws_url: str
    
    # LLM Configuration
    openai_api_key: str
    groq_api_key: str
    
    # Application Settings
    app_name: str = "Warm Transfer System"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings()