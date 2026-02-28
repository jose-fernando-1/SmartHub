from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from app.services.ai_gemini import generate_suggestion

router = APIRouter(prefix="/ai", tags=["ai"])


class AIRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    type: Literal["Video", "PDF", "Link"]


class AIResponse(BaseModel):
    description: str
    tags: list[str]


@router.post("/generate", response_model=AIResponse)
def ai_generate(payload: AIRequest):
    data = generate_suggestion(payload.title, payload.type)
    return AIResponse(**data)