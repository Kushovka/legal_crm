import logging
import smtplib
from datetime import datetime
from email.message import EmailMessage

from app.core.config import settings
from app.models.client import Client, ClientStatus
from app.schemas.client import AiAnalysisResponse, STATUS_LABELS

logger = logging.getLogger("uvicorn.error")


def _smtp_configured() -> bool:
    return all(
        [
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
            settings.SMTP_FROM,
        ]
    )


def _format_status(status: ClientStatus) -> str:
    return STATUS_LABELS.get(status, status.value)


def _format_date(value: datetime) -> str:
    return value.strftime("%d.%m.%Y %H:%M")


def _format_list(items: list[str]) -> list[str]:
    if not items:
        return ["- Нет данных"]
    return [f"- {item}" for item in items]


def _send_email(subject: str, recipient_email: str, lines: list[str], log_context: str) -> None:
    if not _smtp_configured():
        logger.warning("%s email skipped: SMTP settings are incomplete", log_context)
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM
    message["To"] = recipient_email or settings.NOTIFICATION_EMAIL
    message.set_content("\n".join(lines))

    try:
        if settings.SMTP_USE_SSL:
            smtp_class = smtplib.SMTP_SSL
        else:
            smtp_class = smtplib.SMTP

        with smtp_class(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=settings.SMTP_TIMEOUT_SECONDS,
        ) as smtp:
            if not settings.SMTP_USE_SSL:
                smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)

        logger.info("%s email sent to %s", log_context, message["To"])
    except Exception:
        logger.exception("Could not send %s email", log_context)


def send_new_client_email(client: Client, recipient_email: str) -> None:
    _send_email(
        subject="Новый клиент добавлен в CRM",
        recipient_email=recipient_email,
        log_context="New client",
        lines=[
            "В юридическую CRM добавлен новый клиент.",
            "",
            f"ФИО клиента: {client.name}",
            f"Телефон: {client.phone}",
            f"Статус: {_format_status(client.status)}",
            f"Дата добавления: {_format_date(client.created_at)}",
        ],
    )


def send_client_status_changed_email(
    client: Client,
    previous_status: ClientStatus,
    recipient_email: str,
) -> None:
    _send_email(
        subject="В CRM изменен статус клиента",
        recipient_email=recipient_email,
        log_context="Client status changed",
        lines=[
            "В юридической CRM изменен статус клиента.",
            "",
            f"ФИО клиента: {client.name}",
            f"Телефон: {client.phone}",
            f"Было: {_format_status(previous_status)}",
            f"Стало: {_format_status(client.status)}",
            f"Дата изменения: {_format_date(client.updated_at)}",
        ],
    )


def send_client_deleted_email(
    client_name: str,
    client_phone: str,
    client_status: ClientStatus,
    recipient_email: str,
) -> None:
    _send_email(
        subject="Клиент удален из CRM",
        recipient_email=recipient_email,
        log_context="Client deleted",
        lines=[
            "Из юридической CRM удален клиент.",
            "",
            f"ФИО клиента: {client_name}",
            f"Телефон: {client_phone}",
            f"Статус на момент удаления: {_format_status(client_status)}",
            f"Дата удаления: {_format_date(datetime.now())}",
        ],
    )


def send_client_ai_analysis_email(
    client: Client,
    case_description: str,
    analysis: AiAnalysisResponse,
    recipient_email: str,
) -> None:
    _send_email(
        subject="В CRM сформировано AI-досье клиента",
        recipient_email=recipient_email,
        log_context="Client AI analysis",
        lines=[
            "В юридической CRM сформировано AI-досье клиента.",
            "",
            f"ФИО клиента: {client.name}",
            f"Статус клиента: {_format_status(client.status)}",
            f"Дата формирования: {_format_date(datetime.now())}",
            "",
            "Запрос юриста:",
            case_description,
            "",
            "Ответ AI:",
            "",
            "Краткое резюме:",
            analysis.summary,
            "",
            "Следующие шаги:",
            *_format_list(analysis.next_steps),
            "",
            "Вопросы клиенту:",
            *_format_list(analysis.questions),
            "",
            "Возможные риски:",
            *_format_list(analysis.risks),
            "",
            "Черновик сообщения клиенту:",
            analysis.draft_message,
            "",
            "AI-досье является черновиком. Перед использованием проверьте информацию.",
        ],
    )
