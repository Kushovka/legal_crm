from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User
from app.schemas.client import ClientCreate, ClientRead, ClientStats, ClientStatusUpdate
from app.services.auth_service import get_current_user
from app.services.client_service import (
    create_client,
    delete_client,
    get_client,
    get_client_stats,
    list_clients,
    serialize_client,
    update_client_status,
)
from app.services.email_service import send_new_client_email

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientRead])
def read_clients(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [serialize_client(client) for client in list_clients(db, user.id)]


@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def add_client(
    payload: ClientCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    client = create_client(db, payload, user.id)
    background_tasks.add_task(send_new_client_email, client, user.email)
    return serialize_client(client)


@router.get("/stats", response_model=ClientStats)
def read_client_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_client_stats(db, user.id)


@router.get("/{client_id}", response_model=ClientRead)
def read_client(
    client_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    client = get_client(db, client_id, user.id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клиент не найден")

    return serialize_client(client)


@router.patch("/{client_id}/status", response_model=ClientRead)
def change_client_status(
    client_id: int,
    payload: ClientStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    client = get_client(db, client_id, user.id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клиент не найден")

    return serialize_client(update_client_status(db, client, payload.status))


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_client(
    client_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    client = get_client(db, client_id, user.id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клиент не найден")

    delete_client(db, client)
