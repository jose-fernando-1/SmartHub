from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.db.session import engine
from app.db.base import Base

from app.routers.health import router as health_router
from app.routers.resources import router as resources_router
from app.routers.ai import router as ai_router
from app.routers.logs import router as logs_router

setup_logging()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartHub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(resources_router)
app.include_router(ai_router)
app.include_router(logs_router)
