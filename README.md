# Север-Рыба и АИС

## Описание проекта

Интегрированная система для компании "Север-Рыба", состоящая из двух основных компонентов:

1. **Клиентская часть (Север-Рыба)** - интернет-магазин морепродуктов с каталогом товаров, корзиной покупок и системой оформления заказов
2. **Административная панель (АИС)** - система управления товарами, заказами, платежами и аналитикой для администраторов компании

## Архитектура проекта

Проект использует микросервисную архитектуру с API Gateway:

- **Frontend**:
  - Север-Рыба (React + Tailwind CSS)
  - АИС Frontend (React + Tailwind CSS)
- **Backend**:
  - Север-Рыба API (FastAPI)
  - АИС API (FastAPI)
- **API Gateway** - единая точка входа для всех API

## Технологический стек

### Frontend
- TypeScript
- React
- React Router
- Tailwind CSS
- Vite

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy ORM
- Pydantic
- Alembic (миграции)
- PostgreSQL

### Инфраструктура
- API Gateway (FastAPI)
- Uvicorn (ASGI-сервер)

## Установка и запуск

### Предварительные требования
- Python 3.10+
- Node.js 16+
- npm 8+
- PostgreSQL 13+

### Установка зависимостей

#### Backend Север-Рыба
```bash
cd Sever-Fish/backend
python -m venv .venv
.venv\Scripts\activate  # На Windows
source .venv/bin/activate  # На Unix/MacOS
pip install -r requirements.txt
```

#### Frontend Север-Рыба
```bash
cd Sever-Fish/frontend
npm install
```

#### Backend АИС
```bash
cd ais/ais-backend
python -m venv .venv
.venv\Scripts\activate  # На Windows
source .venv/bin/activate  # На Unix/MacOS
pip install -r requirements.txt
```

#### Frontend АИС
```bash
cd ais/ais-frontend
npm install
```

#### API Gateway
```bash
cd api-gateway
python -m venv .venv
.venv\Scripts\activate  # На Windows
source .venv/bin/activate  # На Unix/MacOS
pip install -r requirements.txt
```

### Настройка базы данных

1. Создайте БД PostgreSQL
2. Настройте переменные окружения в файлах .env:
   - `Sever-Fish/backend/.env`
   - `ais/ais-backend/.env`
   - `api-gateway/.env`

Пример файла .env для Backend:
```
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/sever_ryba_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Миграции

Применение миграций для Север-Рыба:
```bash
cd Sever-Fish/backend
alembic upgrade head
```

Применение миграций для АИС:
```bash
cd ais/ais-backend
alembic upgrade head
```

### Запуск

Для удобства запуска предусмотрены BAT-скрипты (для Windows):

- `run-all.bat` - запускает все компоненты системы
- `run-ais-backend.bat` - запускает только АИС API
- `run-api-gateway.bat` - запускает только API Gateway
- `run-ais-frontend.bat` - запускает только АИС Frontend
- `run-sever-ryba-frontend.bat` - запускает только Север-Рыба Frontend
- `simple-start-all.bat` - запускает все компоненты (упрощенная версия)
- `simple-stop-all.bat` - останавливает все запущенные компоненты

#### Запуск вручную

**Север-Рыба API**:
```bash
cd Sever-Fish/backend
uvicorn main:app --reload --port 8000
```

**Север-Рыба Frontend**:
```bash
cd Sever-Fish/frontend
npm run dev
```

**АИС API**:
```bash
cd ais/ais-backend
uvicorn app.main:app --reload --port 8001
```

**АИС Frontend**:
```bash
cd ais/ais-frontend
npm run dev -- --port 3000
```

**API Gateway**:
```bash
cd api-gateway
uvicorn main:app --reload --port 8080
```

## Структура проекта

```
.
├── Sever-Fish             # Клиентская часть
│   ├── backend            # Backend API для интернет-магазина
│   └── frontend           # Frontend интернет-магазина
├── ais                    # Административная панель
│   ├── ais-backend        # Backend API для администраторов
│   └── ais-frontend       # Frontend административной панели
├── api-gateway            # API Gateway для интеграции сервисов
├── logs                   # Логи приложений
└── *.bat                  # Скрипты для запуска компонентов
```

## Основные функции

### Север-Рыба (интернет-магазин)
- Каталог товаров с категориями
- Детальные страницы товаров
- Корзина покупок
- Оформление заказа
- Личный кабинет пользователя
- Страницы "О компании", "Производство", "Рецепты", "Контакты"

### АИС (административная панель)
- Управление товарами и категориями
- Управление заказами и отслеживание статуса
- Управление платежами
- Аналитика продаж
- Синхронизация данных между системами

## Разработка

### Создание миграций

Для Север-Рыба:
```bash
cd Sever-Fish/backend
alembic revision --autogenerate -m "Описание изменений"
```

Для АИС:
```bash
cd ais/ais-backend
alembic revision --autogenerate -m "Описание изменений"
```

### Документация API

После запуска сервисов, документация API доступна по следующим адресам:
- Север-Рыба API: http://localhost:8000/docs
- АИС API: http://localhost:8001/docs
- API Gateway: http://localhost:8080/docs

### АИС
- Логин: admin
- Пароль: admin1234

## Лицензия

Проект разработан для внутреннего использования компании "Север-Рыба" и не подлежит распространению без согласия владельцев.

## Контакты

По вопросам сотрудничества и технической поддержки обращайтесь:
- Email: info@sever-ryba.ru
- Телефон: +7 (815) 123-45-67
