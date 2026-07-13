import logging
import smtplib
from datetime import datetime
from email.message import EmailMessage

from app.core.config import settings
from app.models.client import Client, ClientStatus
from app.schemas.client import STATUS_LABELS

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


def send_new_client_email(client: Client, recipient_email: str) -> None:
    if not _smtp_configured():
        logger.warning("New client email skipped: SMTP settings are incomplete")
        return

    message = EmailMessage()
    message["Subject"] = "Новый клиент добавлен в CRM"
    message["From"] = settings.SMTP_FROM
    message["To"] = recipient_email or settings.NOTIFICATION_EMAIL
    message.set_content(
        "\n".join(
            [
                "В юридическую CRM добавлен новый клиент.",
                "",
                f"Имя клиента: {client.name}",
                f"Телефон: {client.phone}",
                f"Статус: {_format_status(client.status)}",
                f"Дата добавления: {_format_date(client.created_at)}",
            ]
        )
    )

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

        logger.info("New client email sent to %s", message["To"])
    except Exception:
        logger.exception("Could not send new client email")
