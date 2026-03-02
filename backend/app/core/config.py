import os
from dotenv import load_dotenv

load_dotenv()


def _get_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


class Settings:
    def __init__(self) -> None:
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.use_mock_ai = _get_bool("USE_MOCK_AI", True)
        self.cors_origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173",
        ).split(",")
        self.sqlite_path = os.getenv("SQLITE_PATH", "./data/app.db").strip()


settings = Settings()
