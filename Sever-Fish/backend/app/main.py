# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os
import traceback
import uvicorn
from fastapi.responses import JSONResponse

from app.routers import auth, products, cart, orders, users
from app.services import ais_integration
from app.config import PORT, HOST, PRODUCTS_IMAGES_DIR, SECRET_KEY

# Настройка логирования
logging.basicConfig(
    filename="api.log",
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(
    title="Север-Рыба API",
    description="API для системы управления продажами и запасами морепродуктов",
    version="1.0.0",
)

# Настройка CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview
    "http://localhost:3000",  # React dev server
    "http://localhost:8000",  # FastAPI server
    "http://localhost",       # Общий localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Обработчик ошибок для всего приложения
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error(f"Необработанная ошибка: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Внутренняя ошибка сервера: {str(exc)}"}
    )

# Монтирование маршрутов
app.include_router(auth.router, tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])

# Маршруты API для фронтенда
app.include_router(products.router, prefix="/api/products", tags=["Products API"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart API"])

# Монтирование статических файлов для изображений продуктов
if os.path.exists(PRODUCTS_IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=PRODUCTS_IMAGES_DIR), name="images")
    logger.info(f"Mounted images directory: {PRODUCTS_IMAGES_DIR}")
else:
    logger.warning(f"Products images directory not found: {PRODUCTS_IMAGES_DIR}")

@app.get("/")
async def root():
    """Корневой маршрут API."""
    return {
        "message": "Добро пожаловать в API Север-Рыба!",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Проверка работоспособности API."""
    return {
        "status": "healthy",
        "version": "1.0.0",
    }

@app.get("/routes", tags=["API Info"])
async def get_routes():
    """Returns all available API routes for frontend discovery"""
    routes = [
        {"path": "/api/products", "method": "GET", "description": "Get all products"},
        {"path": "/products/{product_id}", "method": "GET", "description": "Get product by ID"},
        {"path": "/api/categories", "method": "GET", "description": "Get all categories"},
        {"path": "/api/cart", "method": "GET", "description": "Get cart contents"},
        {"path": "/api/cart", "method": "POST", "description": "Add item to cart"},
        {"path": "/api/cart/{cart_id}", "method": "PUT", "description": "Update cart item quantity"},
        {"path": "/api/cart/{cart_id}", "method": "DELETE", "description": "Remove item from cart"},
        {"path": "/api/cart/clear", "method": "DELETE", "description": "Clear cart"},
        {"path": "/health", "method": "GET", "description": "API health check"}
    ]
    return routes

@app.get("/ais-status")
async def ais_integration_status():
    """Проверка статуса интеграции с AIS."""
    try:
        status = await ais_integration.check_connection()
        return {
            "status": "connected" if status else "disconnected",
            "message": "AIS интеграция работает нормально" if status else "Нет соединения с AIS"
        }
    except Exception as e:
        logger.error(f"Ошибка при проверке соединения с AIS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ошибка при проверке соединения с AIS: {str(e)}"
        )

# Запуск сервера через функцию для удобства разработки
if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)