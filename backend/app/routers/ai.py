from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.session import get_db
from app.services.ai_gemini import generate_suggestion

router = APIRouter(prefix="/ai", tags=["ai"])


class AIRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    type: Literal["Video", "PDF", "Link"]


class AIResponse(BaseModel):
    description: str
    tags: list[str]


@router.post("/generate", response_model=AIResponse)
def ai_generate(payload: AIRequest, db: Session = Depends(get_db)):
    data = generate_suggestion(payload.title, payload.type, db=db)
    return AIResponse(**data)