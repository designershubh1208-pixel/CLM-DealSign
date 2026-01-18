from pydantic_settings import BaseSettings
import os
from pathlib import Path

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    PORT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **data):
        super().__init__(**data)
        # Try to load from environment variable if not set
        if not self.OPENAI_API_KEY:
            self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

settings = Settings()

# Validate that API key is configured
if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "your-api-key-here":
    print("⚠️  WARNING: OPENAI_API_KEY is not configured or using placeholder.")
    print("📝 To fix this:")
    print("   1. Go to https://platform.openai.com/api-keys")
    print("   2. Create a new API key")
    print("   3. Make sure your account has billing set up")
    print("   4. Update the OPENAI_API_KEY in .env file")
    print("   5. Restart the AI service")
    print("\n   Note: Free trial credits may have expired. Check your account status.")
else:
    print("✅ OpenAI API key loaded successfully")
