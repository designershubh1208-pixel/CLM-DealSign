from pydantic_settings import BaseSettings
import os
from pathlib import Path

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

if settings.GEMINI_API_KEY:
    print("✅ Gemini API key configured")
elif settings.OPENAI_API_KEY:
    print("✅ OpenAI API key configured")
else:
    print("⚠️ No AI API keys configured")
