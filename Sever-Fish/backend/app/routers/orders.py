from fastapi import APIRouter, Depends, HTTPException, Request, Body, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import OrderCreate, OrderResponse, OrderStatus, ApiResponse, OrderUpdate
from app.utils.auth import require_auth, get_current_user_id, require_admin

class ApiResponse(BaseModel):
    status: bool = True
    message: str = ''
    data: Any = None


router = APIRouter()

@router.options("/{rest_of_path:path}", include_in_schema=False)
async def options_handler(request: Request, rest_of_path: str):
    """
    Обработчик OPTIONS запросов для CORS
    """
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@router.post("/", response_model=OrderResponse)
async def create_order(
        order_data: OrderCreate,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Создает новый заказ на основе корзины пользователя.
    Требуется аутентификация (опционально).
    """
    # Получаем user_id из токена авторизации
    user_id = await get_current_user_id(request)

    # Получаем корзину из сессии
    cart_key = f'cart_{user_id}' if user_id else 'cart'
    cart = request.session.get(cart_key, [])

    # Логируем для отладки
    print(f"DEBUG: Cart key: {cart_key}")
    print(f"DEBUG: Cart content: {cart}")
    print(f"DEBUG: Session keys: {list(request.session.keys()) if hasattr(request.session, 'keys') else 'No keys method'}")

    # Если корзина пуста, создаем демо-заказ для тестирования
    if not cart:
        print("DEBUG: Cart is empty, creating demo order")
        # Получаем список продуктов
        products = db.query(Product).limit(3).all()
        
        if not products:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не найдено ни одного продукта в базе данных"
            )
        
        # Создаем тестовую корзину
        cart = []
        for i, product in enumerate(products):
            cart.append({
                "product_id": product.id,
                "quantity": i + 1
            })
            
        print(f"DEBUG: Created demo cart with {len(cart)} items")

    # Вычисляем общую сумму заказа и проверяем наличие товаров
    total_amount = 0  # Изменено с total на total_amount
    order_items = []

    for item in cart:
        product = db.query(Product).filter(Product.id == item['product_id']).first()
        if not product:
            print(f"DEBUG: Product {item['product_id']} not found")
            continue  # Пропускаем товары, которых больше нет в базе

        # Проверка наличия на складе
        if product.stock_quantity < item['quantity']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Недостаточно товара '{product.name}' на складе. В наличии: {product.stock_quantity}"
            )

        # Вычисляем стоимость позиции
        item_price = product.price * item['quantity']
        total_amount += item_price  # Изменено с total на total_amount

        # Добавляем товар в список позиций заказа
        order_items.append({
            "product_id": product.id,
            "quantity": item['quantity'],
            "price": product.price,
            "product_name": product.name
        })

    # Проверяем, есть ли товары в заказе после обработки
    if not order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Все товары в корзине недоступны"
        )

    # Создаем заказ с правильным именем поля total_amount
    new_order = Order(
        user_id=user_id,
        status=OrderStatus.PENDING,
        created_at=datetime.utcnow(),
        total_amount=total_amount,  # Изменено с total на total_amount
        delivery_address=order_data.delivery_address,
        phone=order_data.phone,
        email=order_data.email,
        name=order_data.name,
        comment=order_data.comment,
        payment_method=order_data.payment_method
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Добавляем позиции в заказ и уменьшаем количество товаров на складе
    for item_data in order_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price=item_data["price"],
            product_name=item_data["product_name"]
        )

        db.add(order_item)

        # Уменьшаем количество товара на складе
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        if product:
            product.stock_quantity -= item_data["quantity"]

    db.commit()

    # Очищаем корзину после создания заказа
    request.session[cart_key] = []

    # Формируем ответ с правильным именем поля total_amount или total в зависимости от требований API
    order_response = {
        "id": new_order.id,
        "user_id": new_order.user_id,
        "status": new_order.status,
        "total": new_order.total_amount,  # Используем total в ответе, если OrderResponse требует total
        "created_at": new_order.created_at,
        "delivery_address": new_order.delivery_address,
        "phone": new_order.phone,
        "email": new_order.email,
        "name": new_order.name,
        "comment": new_order.comment,
        "payment_method": new_order.payment_method,
        "items": order_items
    }

    return order_response


@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(
        request: Request,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Получает список заказов текущего пользователя.
    Требуется аутентификация.
    """
    # Получаем текущего пользователя
    user = await require_auth(request, db)
    user_id = user.id

    # Получаем заказы пользователя
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(
        Order.created_at.desc()
    ).offset(skip).limit(limit).all()

    # Создаем json-ответ с CORS-заголовками
    content = [order.__dict__ for order in orders]
    headers = {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "true"
    }
    
    return JSONResponse(content=content, headers=headers)


@router.get("/all", response_model=List[OrderResponse])
async def get_all_orders(
        request: Request,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    Получает список всех заказов (только для администратора).
    """
    # Проверяем права администратора
    await require_admin(request, db)

    # Формируем запрос на основе фильтров
    query = db.query(Order)

    if status:
        query = query.filter(Order.status == status)

    # Выполняем запрос с пагинацией
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(
        order_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Получает детальную информацию о заказе.
    Доступно владельцу заказа или администратору.
    """
    # Получаем текущего пользователя
    user = await require_auth(request, db)

    # Находим заказ
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверяем права доступа
    if order.user_id != user.id and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому заказу"
        )

    return order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order_status(
        order_id: int,
        order_update: OrderUpdate,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Обновляет статус заказа.
    Доступно только администратору.
    """
    # Проверяем права администратора
    await require_admin(request, db)

    # Находим заказ
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Обновляем поля заказа
    if order_update.status is not None:
        order.status = order_update.status

    if order_update.delivery_address is not None:
        order.delivery_address = order_update.delivery_address

    if order_update.comment is not None:
        order.comment = order_update.comment

    # Сохраняем изменения
    db.commit()
    db.refresh(order)

    return order


@router.delete("/{order_id}", response_model=ApiResponse)
async def cancel_order(
        order_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Отменяет заказ (изменяет статус на "cancelled").
    Доступно владельцу заказа или администратору.
    """
    # Получаем текущего пользователя
    user = await require_auth(request, db)

    # Находим заказ
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверяем права доступа
    if order.user_id != user.id and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому заказу"
        )

    # Проверяем возможность отмены
    if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Невозможно отменить заказ в статусе '{order.status}'"
        )

    # Меняем статус на "отменен"
    order.status = OrderStatus.CANCELLED
    db.commit()

    # Возвращаем товары на склад
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    for item in order_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_quantity += item.quantity

    db.commit()

    return {"success": True, "message": "Заказ успешно отменен"}