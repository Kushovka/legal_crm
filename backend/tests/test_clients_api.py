from collections.abc import Generator
import os

os.environ["DEV_SEED_ENABLED"] = "false"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.deps import get_db
from app.main import app


engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def client() -> TestClient:
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def auth_headers(client: TestClient, email: str = "lawyer@example.com") -> dict[str, str]:
    response = client.post("/api/auth/register", json={"email": email, "password": "secret123"})
    assert response.status_code == 201
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_client(client: TestClient) -> None:
    headers = auth_headers(client)

    response = client.post(
        "/api/clients",
        headers=headers,
        json={"name": "Иван Иванов", "phone": "+7 900 000-00-00", "status": "new"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Иван Иванов"
    assert data["phone"] == "+7 900 000-00-00"
    assert data["status"] == "new"
    assert data["status_label"] == "Новый"


def test_get_clients_sorted_newest_first(client: TestClient) -> None:
    headers = auth_headers(client)
    client.post("/api/clients", headers=headers, json={"name": "Первый", "phone": "+7 900 000-00-01", "status": "new"})
    client.post("/api/clients", headers=headers, json={"name": "Второй", "phone": "+7 900 000-00-02", "status": "closed"})

    response = client.get("/api/clients", headers=headers)

    assert response.status_code == 200
    assert [item["name"] for item in response.json()][:2] == ["Второй", "Первый"]


def test_change_status(client: TestClient) -> None:
    headers = auth_headers(client)
    created = client.post(
        "/api/clients",
        headers=headers,
        json={"name": "Мария", "phone": "+7 900 000-00-03", "status": "new"},
    ).json()

    response = client.patch(f"/api/clients/{created['id']}/status", headers=headers, json={"status": "in_progress"})

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"
    assert response.json()["status_label"] == "В работе"


def test_stats(client: TestClient) -> None:
    headers = auth_headers(client)
    payloads = [
        {"name": "А", "phone": "+7 900 000-00-04", "status": "new"},
        {"name": "Б", "phone": "+7 900 000-00-05", "status": "in_progress"},
        {"name": "В", "phone": "+7 900 000-00-06", "status": "closed"},
    ]
    for payload in payloads:
        client.post("/api/clients", headers=headers, json=payload)

    response = client.get("/api/clients/stats", headers=headers)

    assert response.status_code == 200
    assert response.json() == {"total": 3, "new": 1, "in_progress": 1, "closed": 1}


def test_invalid_status(client: TestClient) -> None:
    headers = auth_headers(client)
    response = client.post(
        "/api/clients",
        headers=headers,
        json={"name": "Олег", "phone": "+7 900 000-00-07", "status": "paused"},
    )

    assert response.status_code == 422


def test_client_not_found(client: TestClient) -> None:
    headers = auth_headers(client)
    response = client.patch("/api/clients/999/status", headers=headers, json={"status": "closed"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Клиент не найден"


def test_get_client_details(client: TestClient) -> None:
    headers = auth_headers(client)
    created = client.post(
        "/api/clients",
        headers=headers,
        json={"name": "Детальный клиент", "phone": "8 (900) 000-00-08", "status": "new"},
    ).json()

    response = client.get(f"/api/clients/{created['id']}", headers=headers)

    assert response.status_code == 200
    assert response.json()["name"] == "Детальный клиент"
    assert response.json()["phone"] == "+7 900 000-00-08"


def test_delete_client(client: TestClient) -> None:
    headers = auth_headers(client)
    created = client.post(
        "/api/clients",
        headers=headers,
        json={"name": "Удаляемый клиент", "phone": "+7 900 000-00-09", "status": "new"},
    ).json()

    response = client.delete(f"/api/clients/{created['id']}", headers=headers)
    stats_response = client.get("/api/clients/stats", headers=headers)

    assert response.status_code == 204
    assert client.get(f"/api/clients/{created['id']}", headers=headers).status_code == 404
    assert stats_response.json()["total"] == 0


def test_invalid_russian_phone(client: TestClient) -> None:
    headers = auth_headers(client)
    response = client.post(
        "/api/clients",
        headers=headers,
        json={"name": "Олег", "phone": "+1 555 000-00-00", "status": "new"},
    )

    assert response.status_code == 422


def test_clients_require_auth(client: TestClient) -> None:
    response = client.get("/api/clients")

    assert response.status_code == 401
