from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.client import ClientStatus


STATUS_LABELS: dict[ClientStatus, str] = {
    ClientStatus.new: "Новый",
    ClientStatus.in_progress: "В работе",
    ClientStatus.closed: "Закрыт",
}


def format_russian_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) == 11 and digits[0] == "8":
        digits = "7" + digits[1:]

    if len(digits) != 11 or digits[0] != "7":
        raise ValueError("Введите российский номер в формате +7 900 000-00-00")

    return f"+7 {digits[1:4]} {digits[4:7]}-{digits[7:9]}-{digits[9:11]}"


class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=64)
    status: ClientStatus = ClientStatus.new

    @field_validator("name")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Поле обязательно")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Поле обязательно")
        return format_russian_phone(cleaned)


class ClientStatusUpdate(BaseModel):
    status: ClientStatus


class ClientRead(BaseModel):
    id: int
    name: str
    phone: str
    status: ClientStatus
    status_label: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClientStats(BaseModel):
    total: int
    new: int
    in_progress: int
    closed: int
