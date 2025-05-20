import os
import logging
import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from starlette.background import BackgroundTask

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получение URL сервисов из переменных окружения
# Исправление: использование переменных AIS_URL и SEVER_FISH_URL из docker-compose.yml
AIS_API = os.getenv("AIS_URL", "http://ais-backend:8001")
SEVER_RYBA_API = os.getenv("SEVER_FISH_URL", "http://sever-fish-backend:8000")

# Логирование настроек для отладки
logger.info(f"AIS API URL: {AIS_API}")
logger.info(f"SEVER RYBA API URL: {SEVER_RYBA_API}")

app = FastAPI(
    title="NF API Gateway",
    description="API Gateway для системы NF, объединяющий АИС и Север-Рыба",
    version="1.0.0",
)

# Настройка CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://localhost:8080",
    # Docker container hosts
    "http://ais-frontend:5174",
    "http://sever-fish-frontend:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Функция для проверки работоспособности сервисов
async def check_services():
    services_status = {}

    # Проверка АИС
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{AIS_API}/health", timeout=5.0)
            services_status["ais"] = {
                "status": "online" if response.status_code == 200 else "error",
                "message": response.json() if response.status_code == 200 else str(response.status_code)
            }
    except Exception as e:
        services_status["ais"] = {"status": "offline", "message": str(e)}
        logger.error(f"Ошибка при проверке AIS: {e}")

    # Проверка Север-Рыба
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SEVER_RYBA_API}/health", timeout=5.0)
            services_status["sever_ryba"] = {
                "status": "online" if response.status_code == 200 else "error",
                "message": response.json() if response.status_code == 200 else str(response.status_code)
            }
    except Exception as e:
        services_status["sever_ryba"] = {"status": "offline", "message": str(e)}
        logger.error(f"Ошибка при проверке Север-Рыба: {e}")

    return services_status


@app.get("/")
async def read_root():
    return {"message": "NF API Gateway is running"}


@app.get("/health")
async def health_check():
    services_status = await check_services()
    return {
        "gateway": "online",
        "services": services_status
    }


# Универсальная функция проксирования запросов
async def proxy_request(request: Request, path: str, target_url: str, service_name: str):
    # Получение метода, заголовков и тела запроса
    method = request.method
    headers = dict(request.headers)
    body = await request.body()

    # Не передаем заголовок host, так как он относится к API Gateway
    if "host" in headers:
        del headers["host"]

    full_url = f"{target_url}/{path}"
    logger.info(f"Проксирование запроса в {service_name}: {method} {full_url}")

    try:
        async with httpx.AsyncClient() as client:
            logger.info(f"Отправка запроса: {method} {full_url}")

            # Передаем все параметры запроса, включая авторизационные заголовки
            response = await client.request(
                method=method,
                url=full_url,
                headers=headers,
                content=body,
                follow_redirects=True  # Автоматически следуем за редиректами
            )

            logger.info(f"Ответ получен: {response.status_code}")

            # Создание ответа с теми же заголовками и статус-кодом
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
            )
    except Exception as e:
        logger.error(f"Ошибка при проксировании запроса: {e}")
        raise HTTPException(status_code=502, detail=f"Ошибка прокси: {str(e)}")


# Маршруты для АИС
@app.api_route("/ais/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def ais_proxy(request: Request, path: str):
    return await proxy_request(request, path, AIS_API, "АИС")


# Маршруты для Север-Рыба
@app.api_route("/sever-ryba/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def sever_ryba_proxy(request: Request, path: str):
    return await proxy_request(request, path, SEVER_RYBA_API, "Север-Рыба")
