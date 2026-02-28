import json
import time
import logging
from google import genai

from app.core.config import settings

log = logging.getLogger(__name__)

SYSTEM_INSTRUCTIONS = (
    "Você é um Assistente Pedagógico. Gere uma descrição curta e útil para alunos, "
    "e recomende exatamente 3 tags. Responda SOMENTE com JSON estrito no formato: "
    '{"description":"...","tags":["tag1","tag2","tag3"]}. '
    "Não inclua texto fora do JSON."
)


def _mock_response(title: str, rtype: str) -> dict:
    time.sleep(1.0)
    return {
        "description": (
            f"Material do tipo {rtype} sobre '{title}', "
            "com foco em aprendizado objetivo e exemplos práticos."
        ),
        "tags": ["educação", "conteúdo", "estudos"],
    }


def generate_suggestion(title: str, rtype: str) -> dict:
    if settings.use_mock_ai or not settings.gemini_api_key:
        return _mock_response(title, rtype)

    client = genai.Client(api_key=settings.gemini_api_key)

    start = time.time()
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=f"{SYSTEM_INSTRUCTIONS}\n\nTítulo: {title}\nTipo: {rtype}\n",
    )
    latency = time.time() - start

    text = (response.text or "").strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        log.warning(
            'AI returned non-JSON. latency=%.3fs text="%s"',
            latency,
            text[:200],
        )
        data = _mock_response(title, rtype)

    tags = data.get("tags", [])
    if not isinstance(tags, list):
        tags = []

    tags = [str(t).strip() for t in tags][:3]
    while len(tags) < 3:
        tags.append("educação")

    out = {
        "description": str(data.get("description", "")).strip(),
        "tags": tags,
    }

    log.info(
        'AI Request: Title="%s", Latency=%.3fs, Mock=%s',
        title,
        latency,
        settings.use_mock_ai,
    )
    return out