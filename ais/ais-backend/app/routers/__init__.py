"""
Router imports for the AIS Backend.
This file exports all router modules to make importing them in main.py cleaner.
"""

# Import all routers to make them available from the package
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.administrators import router as administrators_router
from app.routers.product import router as product_router
from app.routers.category import router as category_router
from app.routers.orders import router as orders_router
from app.routers.payments import router as payments_router
from app.routers.shipments import router as shipments_router
from app.routers.integration import router as integration_router
from app.routers.warehouse import router as warehouse_router
from app.routers.delivery import router as delivery_router
from app.routers.supply import router as supply_router
from app.routers.stock import router as stock_router
from app.routers.stock_movement import router as stock_movement_router

# Export the routers with their common names for easier imports
auth = auth_router
users = users_router
administrators = administrators_router
product = product_router
category = category_router
orders = orders_router
payments = payments_router
shipments = shipments_router
integration = integration_router
warehouse = warehouse_router
delivery = delivery_router
supply = supply_router
stock = stock_router
stock_movement = stock_movement_router

# List of all routers for automatic registration
all_routers = [
    auth_router,
    users_router,
    administrators_router,
    product_router,
    category_router,
    orders_router,
    payments_router,
    shipments_router,
    integration_router,
    warehouse_router,
    delivery_router,
    supply_router,
    stock_router,
    stock_movement_router
]

__all__ = [
    'auth',
    'users',
    'administrators',
    'product',
    'category',
    'orders',
    'payments',
    'shipments',
    'integration',
    'warehouse',
    'delivery',
    'supply',
    'stock',
    'stock_movement',
    'all_routers'
]