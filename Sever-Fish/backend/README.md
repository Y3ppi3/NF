# Север-Рыба: Бэкенд

Бэкенд для клиентского приложения "Север-Рыба", разработанный на FastAPI.

## Функциональность

- Авторизация и регистрация пользователей
- Каталог товаров с поддержкой категорий
- Корзина покупок
- Система заказов
- Личный кабинет пользователя
- Интеграция с AIS (Административной информационной системой)

## Технологический стек

- **FastAPI**: современный, высокопроизводительный веб-фреймворк для Python
- **SQLAlchemy**: Python SQL toolkit и ORM
- **Pydantic**: валидация данных
- **Alembic**: миграции базы данных
- **PostgreSQL**: основная база данных
- **JWT**: аутентификация через токены
- **Docker**: контейнеризация приложения

## Запуск приложения

### Через Docker

```bash
docker build -t sever-fish-backend .
docker run -p 8000:8000 --name sever-fish-api sever-fish-backend
```

### Локально

1. Создайте виртуальное окружение:
```bash
python -m venv .venv
source .venv/bin/activate  # для Linux/Mac
.venv\Scripts\activate     # для Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Настройте переменные окружения:
```bash
# создайте файл .env в корне проекта
DATABASE_URL=postgresql://northf_user:north_fish_password@localhost:5432/north_fish
SECRET_KEY=your-secret-key-here
```

4. Запустите миграции:
```bash
alembic upgrade head
```

5. Запустите приложение:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Информация о текущем пользователе

### Товары
- `GET /api/products` - Список товаров
- `GET /api/products/{id}` - Детали товара
- `GET /api/categories` - Список категорий

### Корзина
- `GET /api/cart` - Содержимое корзины
- `POST /api/cart` - Добавление товара в корзину
- `PUT /api/cart/{product_id}` - Обновление количества
- `DELETE /api/cart/{product_id}` - Удаление товара из корзины
- `DELETE /api/cart` - Очистка корзины

### Заказы
- `GET /api/orders` - Список заказов пользователя
- `GET /api/orders/{id}` - Детали заказа
- `POST /api/orders` - Создание нового заказа
- `PUT /api/orders/{id}/cancel` - Отмена заказа

## Документация API

После запуска приложения, документация API доступна по адресу:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Разработка

### Создание миграций

```bash
alembic revision --autogenerate -m "описание изменений"
alembic upgrade head
```

### Тестирование

```bash
pytest
```

## Интеграция с AIS

Интеграция с Административной информационной системой осуществляется через API Gateway. Для корректной работы необходимо, чтобы API Gateway был настроен и запущен.

## Лицензия

Этот проект распространяется под лицензией MIT.