import time
import logging
from typing import Literal

from pydantic import BaseModel, Field, ValidationError
from google import genai

from app.core.config import settings

log = logging.getLogger(__name__)

SYSTEM_INSTRUCTIONS = (
    "Você é um Assistente Pedagógico. Gere uma descrição baseada no título e no tipo do conteúdo fornecido que seja curta e autoexplicativa para alunos, "
    "e recomende exatamente 3 tags relevantes ao conteúdo."
)


class AISuggestion(BaseModel):
    description: str = Field(min_length=1)
    tags: list[str] = Field(min_length=3, max_length=3)


def _mock_response(title: str, rtype: str) -> dict:
    time.sleep(1.0)
    return {
        "description": (
            f"Material do tipo {rtype} sobre '{title}', "
            "com foco em aprendizado objetivo e exemplos práticos."
        ),
        "tags": ["educação", "conteúdo", "estudos"],
    }


def generate_suggestion(title: str, rtype: Literal["Video", "PDF", "Link"]) -> dict:
    if settings.use_mock_ai or not settings.gemini_api_key:
        return _mock_response(title, rtype)

    client = genai.Client(api_key=settings.gemini_api_key)
    model_name = "gemini-2.5-flash-lite"
    contents = f"{SYSTEM_INSTRUCTIONS}\n\nTítulo: {title}\nTipo: {rtype}\n"

    input_tokens_estimation = None
    try:
        token_count = client.models.count_tokens(model=model_name, contents=contents)
        input_tokens_estimation = getattr(token_count, "total_tokens", None)
    except Exception:
        log.warning('AI count_tokens failed. title="%s"', title)

    start = time.time()
    response = client.models.generate_content(
        model=model_name,
        contents=contents,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": AISuggestion.model_json_schema(),
        },
    )
    latency = time.time() - start

    usage = response.usage_metadata
    input_tokens_accounted = getattr(usage, "prompt_token_count", None)
    output_tokens = getattr(usage, "candidates_token_count", None)
    total_tokens_used = getattr(usage, "total_token_count", None)

    text = (response.text or "").strip()

    try:
        validated = AISuggestion.model_validate_json(text)
        data = validated.model_dump()
    except (ValidationError, ValueError):
        log.warning('AI returned invalid structured response. latency=%.3fs text="%s"', latency, text[:200])
        data = _mock_response(title, rtype)

    tags = [str(t).strip() for t in data.get("tags", [])][:3]
    while len(tags) < 3:
        tags.append("educação")

    out = {
        "description": str(data.get("description", "")).strip(),
        "tags": tags,
    }

    log.info(
        'AI Request: Title="%s", Latency=%.3fs, Mock=%s, InputTokensEstimation=%s, InputTokensAccounted=%s, OutputTokens=%s, TotalTokensUsed=%s',
        title,
        latency,
        settings.use_mock_ai,
        input_tokens_estimation,
        input_tokens_accounted,
        output_tokens,
        total_tokens_used,
    )
    return out