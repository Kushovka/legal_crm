from __future__ import annotations

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.client import Client, ClientStatus
from app.schemas.client import ClientCreate, ClientStats, STATUS_LABELS


def serialize_client(client: Client) -> dict:
    return {
        "id": client.id,
        "name": client.name,
        "phone": client.phone,
        "status": client.status,
        "status_label": STATUS_LABELS[client.status],
        "created_at": client.created_at,
        "updated_at": client.updated_at,
    }


def list_clients(db: Session, user_id: int) -> list[Client]:
    return list(
        db.scalars(
            select(Client)
            .where(Client.user_id == user_id)
            .order_by(desc(Client.created_at), desc(Client.id))
        )
    )


def create_client(db: Session, payload: ClientCreate, user_id: int) -> Client:
    client = Client(name=payload.name, phone=payload.phone, status=payload.status, user_id=user_id)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get_client(db: Session, client_id: int, user_id: int) -> Client | None:
    return db.scalar(select(Client).where(Client.id == client_id, Client.user_id == user_id))


def update_client_status(db: Session, client: Client, status: ClientStatus) -> Client:
    client.status = status
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def delete_client(db: Session, client: Client) -> None:
    db.delete(client)
    db.commit()


def get_client_stats(db: Session, user_id: int) -> ClientStats:
    rows = db.execute(
        select(Client.status, func.count(Client.id))
        .where(Client.user_id == user_id)
        .group_by(Client.status)
    ).all()
    counts = {status.value: count for status, count in rows}
    total = sum(counts.values())
    return ClientStats(
        total=total,
        new=counts.get(ClientStatus.new.value, 0),
        in_progress=counts.get(ClientStatus.in_progress.value, 0),
        closed=counts.get(ClientStatus.closed.value, 0),
    )
