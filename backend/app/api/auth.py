from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import AuthPayload, AuthResponse, UserRead
from app.services.auth_service import (
    create_access_token,
    create_user,
    get_current_user,
    get_user_by_email,
    verify_password,
)
from app.services.seed import seed_clients_for_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: AuthPayload, db: Session = Depends(get_db)):
    if get_user_by_email(db, str(payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Пользователь с такой почтой уже есть")

    user = create_user(db, str(payload.email), payload.password)
    if settings.DEV_SEED_ENABLED:
        seed_clients_for_user(db, user.id)
    return AuthResponse(access_token=create_access_token(user), user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthPayload, db: Session = Depends(get_db)):
    user = get_user_by_email(db, str(payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверная почта или пароль")

    return AuthResponse(access_token=create_access_token(user), user=user)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return user
