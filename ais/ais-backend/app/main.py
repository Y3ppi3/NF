import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text
import httpx

# Load environment variables before importing other modules
load_dotenv()

# Import modules after environment variables are loaded
from app.database import engine, get_db
from app.models import Base  # Import Base from models instead of database
from app.services.admin_service import create_default_admin
from app.services.message_service import register_message_handlers

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AIS Backend API",
    description="Автоматизированная информационная система предприятия",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

# Проверка подключения к базе данных
try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    logger.info("Подключение к базе данных установлено!")
except Exception as e:
    logger.error(f"Ошибка подключения к базе данных: {e}")
    raise e

# Get API URL from environment
AIS_API = os.getenv("AIS_API", "http://localhost:8001")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.157:5173",
    "http://192.168.0.157:8000",
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:8080",
    "http://0.0.0.0:8001",
    "http://ais-frontend:5174",
    "http://api-gateway:8080",
    "http://sever-fish-frontend:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("✅ CORS middleware подключен!")

# Include routers after app is created
# Import routers here to avoid circular imports
from app.routers import (
    users, administrators, product,
    category, orders, payments,
    shipments, auth, integration,
    warehouse, delivery, supply, stock, stock_movement
)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(administrators.router, prefix="/administrators", tags=["Administrators"])
app.include_router(product.router, prefix="/api/products", tags=["Products"])
app.include_router(category.router, prefix="/api", tags=["Categories"])
app.include_router(category.router, tags=["Categories"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(orders.router, tags=["Orders"])
app.include_router(payments.router, prefix="/api", tags=["Payments"])
app.include_router(payments.router, tags=["Payments"])
app.include_router(warehouse.router, prefix="/api", tags=["Warehouses"])
app.include_router(warehouse.router, tags=["Warehouses"])
app.include_router(shipments.router, prefix="/shipments", tags=["Shipments"])
app.include_router(integration.router, prefix="/api/integration", tags=["Integration"])
app.include_router(delivery.router, prefix="/api/delivery", tags=["Delivery"])
app.include_router(supply.router, prefix="/api/supplies", tags=["Supply"])
app.include_router(supply.router, tags=["Supply"])
app.include_router(stock.router, prefix="/api", tags=["Stocks"])
app.include_router(stock.router, tags=["Stocks"])
app.include_router(stock_movement.router, prefix="/api", tags=["Stock Movements"])
app.include_router(stock_movement.router, tags=["Stock Movements"])


@app.get("/")
def read_root():
    return {"message": "AIS Backend is running"}


@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    return {"user_id": user_id, "name": "John Doe"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


async def proxy_request(target_url: str, request: Request):
    """
    Проксирует запрос на указанный URL
    """
    # Получение метода, заголовков и тела запроса
    method = request.method
    headers = dict(request.headers)
    body = await request.body()

    # Не передаем заголовок host, так как он относится к API Gateway
    if "host" in headers:
        del headers["host"]

    try:
        async with httpx.AsyncClient() as client:
            logger.info(f"Отправка запроса: {method} {target_url}")

            response = await client.request(
                method=method,
                url=target_url,
                headers=headers,
                content=body,
                follow_redirects=True
            )

            logger.info(f"Ответ получен: {response.status_code}")

            # Создание ответа с теми же заголовками и статус-кодом
            from fastapi.responses import Response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
            )
    except Exception as e:
        logger.error(f"Ошибка при проксировании запроса: {e}")
        raise HTTPException(status_code=502, detail=f"Ошибка прокси: {str(e)}")


@app.api_route("/ais/administrators/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def ais_admin_proxy(path: str, request: Request):
    """Проксирование запросов к AIS Administrators API"""
    return await proxy_request(f"{AIS_API}/administrators/{path}", request)


# Use @app.on_event instead of deprecated @app.on_event
@app.on_event("startup")
async def startup_event():
    """
    Действия при запуске приложения
    """
    logger.info("Запуск АИС Backend...")

    # Создаем администратора
    try:
        create_default_admin()
    except Exception as e:
        logger.error(f"Ошибка при создании администратора по умолчанию: {e}")

    # Регистрация обработчиков сообщений
    try:
        register_message_handlers()
    except Exception as e:
        logger.error(f"Ошибка при регистрации обработчиков сообщений: {e}")

    logger.info("АИС Backend успешно запущен!")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Действия при остановке приложения
    """
    logger.info("Остановка АИС Backend...")
    logger.info("АИС Backend успешно остановлен!")