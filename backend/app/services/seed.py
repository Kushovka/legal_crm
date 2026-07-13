from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.client import Client, ClientStatus


SEED_CLIENTS = [
    ("Анна Петрова", "+7 900 111-22-33", ClientStatus.new),
    ("Михаил Соколов", "+7 900 222-33-44", ClientStatus.in_progress),
    ("Елена Орлова", "+7 900 333-44-55", ClientStatus.closed),
]


def seed_clients(db: Session) -> None:
    existing_names = set(db.scalars(select(Client.name)).all())
    for name, phone, status in SEED_CLIENTS:
        if name not in existing_names:
            db.add(Client(name=name, phone=phone, status=status))
    db.commit()


def seed_clients_for_user(db: Session, user_id: int) -> None:
    existing_names = set(db.scalars(select(Client.name).where(Client.user_id == user_id)).all())
    for name, phone, status in SEED_CLIENTS:
        if name not in existing_names:
            db.add(Client(name=name, phone=phone, status=status, user_id=user_id))
    db.commit()
