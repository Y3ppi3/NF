from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import auth, products, orders, cart, users
from app.core.config import settings
from app.db.database import engine, Base

# Создание таблиц при запуске (в продакшене лучше использовать миграции)
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Север-Рыба API",
    description="API для клиентского приложения Север-Рыба",
    version="1.0.0",
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение маршрутов
app.include_router(auth.router, prefix="/api/auth", tags=["Аутентификация"])
app.include_router(users.router, prefix="/api/users", tags=["Пользователи"])
app.include_router(products.router, prefix="/api/products", tags=["Товары"])
app.include_router(cart.router, prefix="/api/cart", tags=["Корзина"])
app.include_router(orders.router, prefix="/api/orders", tags=["Заказы"])

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "Сервис Север-Рыба работает!"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Произошла ошибка: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)