# Юридическая мини-CRM

Рабочий fullstack-прототип CRM для юриста: список клиентов, статусы дел, статистика и email-уведомление при добавлении нового клиента.

## Стек

- Frontend: React, TypeScript, Vite, Tailwind CSS, axios.
- Backend: Python, FastAPI, SQLAlchemy, Pydantic.
- Database: PostgreSQL.
- Миграции: Alembic.
- Инфраструктура: Docker Compose, nginx для frontend-контейнера.

## Возможности

- Просмотр клиентов с сортировкой по дате создания.
- Добавление клиента с именем, телефоном и статусом.
- Смена статуса: `Новый`, `В работе`, `Закрыт`.
- Счетчики клиентов по статусам и общий счетчик.
- Seed-данные для локальной разработки без повторных дублей.
- Регистрация и вход юриста по email/паролю.
- SMTP-уведомление юристу через Яндекс Почту на email текущего аккаунта.
- Ошибка email не отменяет создание клиента и логируется backend-сервисом.

## Запуск через Docker

```bash
cp .env.example .env
docker compose up --build
```

После запуска:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8001/api/health](http://localhost:8001/api/health)
- Swagger/OpenAPI: [http://localhost:8001/docs](http://localhost:8001/docs)
- PostgreSQL: `localhost:5432`

## Переменные окружения

Основные переменные описаны в `.env.example`.

```env
POSTGRES_USER=lawcrm
POSTGRES_PASSWORD=lawcrm
POSTGRES_DB=law_crm_db
POSTGRES_PUBLIC_PORT=5432
BACKEND_PUBLIC_PORT=8001
FRONTEND_PUBLIC_PORT=5173
BACKEND_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
VITE_API_URL=http://localhost:8001/api
DEV_SEED_ENABLED=true
SECRET_KEY=change-this-secret-key-for-local-development
```

## SMTP Яндекс Почты

Заполните в `.env`:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USERNAME=your-login@yandex.ru
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-login@yandex.ru
NOTIFICATION_EMAIL=
SMTP_USE_SSL=true
```

Используйте пароль приложения Яндекса, а не основной пароль аккаунта. `SMTP_FROM` обычно совпадает с `SMTP_USERNAME`. Уведомления отправляются на email пользователя, который вошел в CRM; `NOTIFICATION_EMAIL` можно оставить пустым как резервную переменную. Реальный `.env` игнорируется Git и не должен попадать в репозиторий.

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/{id}/status`
- `GET /api/clients/stats`

## Миграции

В Docker миграции применяются автоматически при запуске backend-контейнера.

Локально из папки `backend`:

```bash
alembic upgrade head
alembic revision --autogenerate -m "message"
```

## Тесты и проверки

Backend:

```bash
cd backend
python -m pytest
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Архитектура

- `backend/app/models/client.py` - модель клиента и enum статусов.
- `backend/app/schemas/client.py` - входные и выходные схемы API.
- `backend/app/api/clients.py` - REST endpoints.
- `backend/app/services/client_service.py` - операции с клиентами и статистикой.
- `backend/app/services/email_service.py` - SMTP-уведомления.
- `backend/app/services/seed.py` - локальные seed-данные.
- `frontend/src/api` - API-клиент.
- `frontend/src/hooks/useClients.ts` - загрузка и мутации клиентов.
- `frontend/src/components` - dashboard-компоненты.

## AI

AI использовался как инструмент разработки для ускорения анализа, редактирования и проверки. Архитектура, финальная реализация, запуск и контроль качества остаются зоной ответственности разработчика.
