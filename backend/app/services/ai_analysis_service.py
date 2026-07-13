import json
import logging
import re

import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.models.client import Client
from app.schemas.client import AiAnalysisResponse, STATUS_LABELS


logger = logging.getLogger(__name__)


class OllamaUnavailableError(RuntimeError):
    pass


class AiAnalysisFormatError(RuntimeError):
    pass


SYSTEM_PROMPT = """Ты помощник юриста в CRM. Ты не даешь окончательных юридических заключений и не заменяешь профессиональную консультацию. Анализируй только предоставленную информацию.

Верни строго JSON следующего формата:

{
  "summary": "Краткое нейтральное резюме ситуации",
  "next_steps": ["Следующий шаг 1", "Следующий шаг 2"],
  "questions": ["Вопрос клиенту 1", "Вопрос клиенту 2"],
  "risks": ["Риск или недостающая информация 1"],
  "draft_message": "Вежливый черновик сообщения клиенту"
}

Не добавляй markdown, пояснения или текст вне JSON."""


RETRY_FORMAT_PROMPT = (
    "Предыдущий ответ не был валидным JSON нужной структуры. "
    "Верни только JSON с ключами summary, next_steps, questions, risks, draft_message. "
    "Без markdown, без code fence, без пояснений."
)


def strip_json_code_fence(value: str) -> str:
    cleaned = value.strip()
    match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", cleaned, flags=re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return cleaned


def parse_ai_analysis_response(raw_response: str) -> AiAnalysisResponse:
    cleaned = strip_json_code_fence(raw_response)
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise AiAnalysisFormatError("AI response is not valid JSON") from exc

    try:
        return AiAnalysisResponse.model_validate(payload)
    except ValidationError as exc:
        raise AiAnalysisFormatError("AI response has invalid structure") from exc


def build_user_prompt(client: Client, case_description: str) -> str:
    status_label = STATUS_LABELS.get(client.status, client.status.value)
    return (
        "Данные клиента для анализа:\n"
        f"- Имя клиента: {client.name}\n"
        f"- Текущий статус: {status_label}\n"
        "- Телефон клиента не передается в модель.\n\n"
        "Описание ситуации от пользователя:\n"
        f"{case_description.strip()}"
    )


def request_ollama(prompt: str, system_prompt: str) -> str:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "system": system_prompt,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2,
        },
    }

    try:
        with httpx.Client(timeout=settings.OLLAMA_TIMEOUT) as client:
            response = client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
            response.raise_for_status()
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("Ollama request failed: %s", exc.__class__.__name__)
        raise OllamaUnavailableError("Ollama is unavailable") from exc

    data = response.json()
    model_response = data.get("response")
    if not isinstance(model_response, str):
        raise AiAnalysisFormatError("Ollama response does not contain text")
    return model_response


def generate_client_ai_analysis(client: Client, case_description: str) -> AiAnalysisResponse:
    prompt = build_user_prompt(client, case_description)

    raw_response = request_ollama(prompt, SYSTEM_PROMPT)
    try:
        return parse_ai_analysis_response(raw_response)
    except AiAnalysisFormatError:
        logger.warning("AI analysis response had invalid JSON, retrying once")

    retry_prompt = f"{prompt}\n\n{RETRY_FORMAT_PROMPT}"
    raw_retry_response = request_ollama(retry_prompt, SYSTEM_PROMPT)
    return parse_ai_analysis_response(raw_retry_response)
