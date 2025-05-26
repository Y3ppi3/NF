from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models.cart import CartItem
from app.db.models.product import Product
from app.db.models.user import User
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate

router = APIRouter()

@router.get("/", response_model=List[CartItemResponse])
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Получение содержимого корзины текущего пользователя."""
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    return cart_items

@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Добавление товара в корзину."""
    # Проверка наличия товара
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    # Проверка, есть ли уже товар в корзине
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == cart_item.product_id
    ).first()
    
    if existing_item:
        # Обновление количества
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    # Создание нового элемента в корзине
    new_cart_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
    )
    
    db.add(new_cart_item)
    db.commit()
    db.refresh(new_cart_item)
    
    return new_cart_item

@router.put("/{product_id}", response_model=CartItemResponse)
async def update_cart_item(
    product_id: int = Path(..., title="ID товара для обновления"),
    cart_item: CartItemUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Обновление количества товара в корзине."""
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id
    ).first()
    
    if not existing_item:
        raise HTTPException(status_code=404, detail="Товар не найден в корзине")
    
    if cart_item.quantity <= 0:
        # Если количество <= 0, удаляем товар из корзины
        db.delete(existing_item)
        db.commit()
        raise HTTPException(status_code=200, detail="Товар удален из корзины")
    
    # Обновление количества
    existing_item.quantity = cart_item.quantity
    db.commit()
    db.refresh(existing_item)
    
    return existing_item

@router.delete("/{product_id}")
async def remove_from_cart(
    product_id: int = Path(..., title="ID товара для удаления из корзины"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Удаление товара из корзины."""
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Товар не найден в корзине")
    
    db.delete(cart_item)
    db.commit()
    
    return {"detail": "Товар успешно удален из корзины"}

@router.delete("/")
async def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Очистка корзины."""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    
    return {"detail": "Корзина успешно очищена"}