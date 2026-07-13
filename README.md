# Юридическая мини-CRM

Рабочий fullstack-прототип CRM для юриста: список клиентов, статусы дел, статистика и email-уведомление при добавлении нового клиента.

## Стек

- Frontend: React, TypeScript, Vite, Tailwind CSS, axios.
- Backend: Python, FastAPI, SQLAlchemy, Pydantic.
- Database: PostgreSQL.
- Local AI: Ollama + `gemma3:4b`.
- Миграции: Alembic.
- Инфраструктура: Docker Compose, nginx для frontend-контейнера.

## Возможности

- Просмотр клиентов с сортировкой по дате создания.
- Добавление клиента с именем, телефоном и статусом.
- Смена статуса: `Новый`, `В работе`, `Закрыт`.
- Счетчики клиентов по статусам и общий счетчик.
- Seed-данные для локальной разработки без повторных дублей.
- Регистрация и вход юриста по email/паролю.
- SMTP-уведомления юристу через Яндекс Почту на email текущего аккаунта: новый клиент, смена статуса, удаление клиента и формирование AI-досье.
- Ошибка email не отменяет создание клиента и логируется backend-сервисом.
- AI-помощник юриста по клиенту: локально анализирует описание ситуации через Ollama, возвращает резюме, шаги, вопросы, риски и черновик сообщения. Телефон клиента в prompt не передается.

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
- Ollama: [http://localhost:11434](http://localhost:11434)

Первый запуск будет дольше обычного: Docker скачает образ Ollama и модель `gemma3:4b`. В зависимости от сети загрузка модели обычно занимает несколько минут. Модель хранится в volume `affordable_law_ollama_data`, поэтому при следующих запусках повторно скачиваться не должна.

Для комфортной работы `gemma3:4b` желательно иметь примерно 8 GB RAM или больше. На слабой машине генерация может идти заметно медленнее.

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
OLLAMA_PUBLIC_PORT=11434
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_TIMEOUT=120
DEV_SEED_ENABLED=true
SECRET_KEY=change-this-secret-key-for-local-development
```

`OLLAMA_BASE_URL` внутри Docker должен указывать на внутренний hostname `http://ollama:11434`. Чтобы поменять модель, измените `OLLAMA_MODEL`, например на другую модель из каталога Ollama, и перезапустите compose.

## Local AI через Ollama

Автоматическая загрузка модели выполняется сервисом `ollama-init`:

```bash
docker compose up --build
```

Если модель уже есть в Docker volume, init-сервис пропустит скачивание.

Скачать модель вручную:

```bash
docker compose exec ollama ollama pull gemma3:4b
```

Проверить Ollama:

```bash
docker compose exec ollama ollama list
curl http://localhost:11434/api/tags
```

Проверить доступность Ollama из backend-контейнера:

```bash
docker compose exec api python -c "import os, httpx; print(httpx.get(os.getenv('OLLAMA_BASE_URL') + '/api/tags', timeout=5).status_code)"
```

AI-анализ не отправляет данные во внешние AI API и работает только через локальный Ollama. Результат не является юридическим заключением: интерфейс показывает предупреждение, что AI формирует черновик и информацию нужно проверить.

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
- `POST /api/clients/{id}/ai-analysis`

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
- `backend/app/services/ai_analysis_service.py` - локальный AI-анализ клиента через Ollama.
- `backend/app/services/email_service.py` - SMTP-уведомления.
- `backend/app/services/seed.py` - локальные seed-данные.
- `frontend/src/api` - API-клиент.
- `frontend/src/hooks/useClients.ts` - загрузка и мутации клиентов.
- `frontend/src/components` - dashboard-компоненты.

## AI

AI использовался как инструмент разработки для ускорения анализа, редактирования и проверки. Архитектура, финальная реализация, запуск и контроль качества остаются зоной ответственности разработчика.
