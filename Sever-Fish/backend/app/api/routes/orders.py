from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models.cart import CartItem
from app.db.models.order import Order, OrderItem
from app.db.models.product import Product
from app.db.models.user import User
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Получение списка заказов пользователя."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Получение информации о конкретном заказе."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    return order

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Создание нового заказа из корзины."""
    # Получение всех товаров из корзины
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")
    
    # Создание заказа
    order = Order(
        user_id=current_user.id,
        total_amount=0,
        shipping_address=order_in.shipping_address,
        contact_phone=order_in.contact_phone,
        status="pending"
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    total_amount = 0
    
    # Добавление товаров из корзины в заказ
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        
        if not product:
            continue
        
        # Проверка наличия товара
        if product.stock < cart_item.quantity:
            db.delete(order)
            db.commit()
            raise HTTPException(
                status_code=400, 
                detail=f"Недостаточно товара '{product.name}' на складе"
            )
        
        # Создание элемента заказа
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            unit_price=product.price
        )
        
        db.add(order_item)
        
        # Уменьшение количества товара на складе
        product.stock -= cart_item.quantity
        
        # Добавление к общей сумме
        item_total = float(product.price) * cart_item.quantity
        total_amount += item_total
    
    # Обновление общей стоимости заказа
    order.total_amount = total_amount
    
    # Очистка корзины
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(order)
    
    return order

@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Отмена заказа."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    if order.status == "completed":
        raise HTTPException(status_code=400, detail="Невозможно отменить выполненный заказ")
    
    if order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Заказ уже отменен")
    
    # Возврат товаров на склад
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    for order_item in order_items:
        product = db.query(Product).filter(Product.id == order_item.product_id).first()
        if product:
            product.stock += order_item.quantity
    
    # Отмена заказа
    order.status = "cancelled"
    
    db.commit()
    
    return {"detail": "Заказ успешно отменен"}