# app/config.py
import os
from dotenv import load_dotenv
from pathlib import Path

# Загружаем .env файл если он существует
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

# Базовые настройки приложения
APP_NAME = "Север-Рыба API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "API для системы управления продажами и запасами морепродуктов"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Настройки базы данных
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db"
)

# Настройки JWT аутентификации
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_for_jwt_tokens_please_change_in_production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Настройки CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173,http://localhost:3000,http://localhost:8000").split(",")

# Настройки интеграции с AIS
AIS_BASE_URL = os.getenv("AIS_BASE_URL", "http://localhost:8080")
AIS_API_KEY = os.getenv("AIS_API_KEY", "default_api_key")

# Настройки сервера
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")

# Пути для файлов
BASE_DIR = Path(__file__).resolve().parent.parent
PRODUCTS_IMAGES_DIR = os.getenv("PRODUCTS_IMAGES_DIR", os.path.join(BASE_DIR, "products_images"))

# Настройки Redis для кеширования (опционально)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Максимальное количество элементов в корзине
MAX_CART_ITEMS = int(os.getenv("MAX_CART_ITEMS", "99"))

# Настройки логирования
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", os.path.join(BASE_DIR, "api.log"))