# app/crud/supply.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.supply import Supply, SupplyItem
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.schemas.supply import SupplyCreate, SupplyUpdate, SupplyItemUpdate
from app.schemas.enums import SupplyStatus, MovementType


def get_supply(db: Session, supply_id: int) -> Optional[Supply]:
    """Получение поставки по ID"""
    return db.query(Supply).filter(Supply.id == supply_id).first()


def get_supplies(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        supplier: Optional[str] = None,
        warehouse_id: Optional[int] = None,
        status: Optional[SupplyStatus] = None
) -> List[Supply]:
    """Получение списка поставок с возможностью фильтрации"""
    query = db.query(Supply)

    if supplier:
        query = query.filter(Supply.supplier.ilike(f"%{supplier}%"))
    if warehouse_id:
        query = query.filter(Supply.warehouse_id == warehouse_id)
    if status:
        query = query.filter(Supply.status == status)

    return query.order_by(desc(Supply.created_at)).offset(skip).limit(limit).all()


def create_supply(db: Session, supply: SupplyCreate, username: str) -> Supply:
    """Создание новой поставки с элементами"""
    # Создаем запись поставки
    db_supply = Supply(
        supplier=supply.supplier,
        warehouse_id=supply.warehouse_id,
        status=supply.status,
        shipment_date=supply.shipment_date,
        expected_arrival_date=supply.expected_arrival_date,
        reference_number=supply.reference_number,
        notes=supply.notes,
        created_by=username,  # Используем имя текущего пользователя
    )
    db.add(db_supply)
    db.flush()  # Получаем ID поставки

    # Добавляем элементы поставки
    for item in supply.items:
        # Получаем название продукта, если не указано
        product_name = item.product_name
        if not product_name:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product_name = product.name
            else:
                product_name = f"Продукт ID: {item.product_id}"

        # Создаем элемент поставки
        db_item = SupplyItem(
            supply_id=db_supply.id,
            product_id=item.product_id,
            product_name=product_name,
            quantity_ordered=item.quantity_ordered,
            unit_price=item.unit_price,
            warehouse_id=item.warehouse_id,
            is_received=False
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_supply)
    return db_supply


def update_supply(db: Session, supply_id: int, supply_update: SupplyUpdate) -> Optional[Supply]:
    """Обновление существующей поставки"""
    db_supply = get_supply(db, supply_id)
    if not db_supply:
        return None

    # Обновляем поля поставки
    update_data = supply_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supply, key, value)

    db.commit()
    db.refresh(db_supply)
    return db_supply


def delete_supply(db: Session, supply_id: int) -> bool:
    """Удаление поставки"""
    db_supply = get_supply(db, supply_id)
    if not db_supply:
        return False

    db.delete(db_supply)
    db.commit()
    return True


def get_supply_item(db: Session, item_id: int) -> Optional[SupplyItem]:
    """Получение элемента поставки по ID"""
    return db.query(SupplyItem).filter(SupplyItem.id == item_id).first()


def update_supply_item(db: Session, item_id: int, item_update: SupplyItemUpdate) -> Optional[SupplyItem]:
    """Обновление элемента поставки"""
    db_item = get_supply_item(db, item_id)
    if not db_item:
        return None

    # Обновляем поля элемента
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    # Если отмечаем как полученный и дата получения не указана, устанавливаем текущую дату
    if update_data.get("is_received") and not db_item.received_date:
        db_item.received_date = datetime.utcnow()

    db.commit()
    db.refresh(db_item)
    return db_item


def process_received_supply(db: Session, supply_id: int, username: str) -> bool:
    """
    Обработка полученной поставки путем создания движений запасов для каждого элемента.
    """
    from app.models.stock_movement import StockMovement

    supply = get_supply(db, supply_id)
    if not supply or supply.status != SupplyStatus.RECEIVED:  # Используем enum вместо строки
        return False

    # Обрабатываем каждый полученный элемент
    for item in supply.items:
        if item.is_received and item.quantity_received:
            # Создаем движение запасов (входящее на склад)
            movement = StockMovement(
                movement_type=MovementType.RECEIPT,  # Используем enum
                product_id=item.product_id,
                quantity=item.quantity_received,
                target_warehouse_id=item.warehouse_id,
                reference_id=supply.id,  # Добавляем ID поставки как ссылку
                notes=f"Поставка #{supply.id} получена: {item.product_name}",
                created_by=username,
                created_at=datetime.utcnow()
            )
            db.add(movement)

            # Обновляем запасы на складе
            from app.crud.stock import adjust_stock_quantity
            adjust_stock_quantity(
                db,
                product_id=item.product_id,
                warehouse_id=item.warehouse_id,
                quantity_change=item.quantity_received
            )

    # Отмечаем поставку как обработанную
    supply.status = SupplyStatus.PROCESSED  # Используем enum
    supply.updated_at = datetime.utcnow()  # Обновляем дату изменения

    db.commit()
    return True


def get_supply_with_details(db: Session, supply_id: int) -> Dict[str, Any]:
    """Получение поставки с дополнительными данными о складе"""
    supply = get_supply(db, supply_id)
    if not supply:
        return None

    # Получаем имя склада
    warehouse = db.query(Warehouse.name).filter(Warehouse.id == supply.warehouse_id).first()
    warehouse_name = warehouse[0] if warehouse else None

    # Конвертируем в словарь для добавления дополнительных данных
    supply_dict = {
        "id": supply.id,
        "supplier": supply.supplier,
        "warehouse_id": supply.warehouse_id,
        "warehouse_name": warehouse_name,
        "status": supply.status,
        "shipment_date": supply.shipment_date,
        "expected_arrival_date": supply.expected_arrival_date,
        "actual_arrival_date": supply.actual_arrival_date,
        "reference_number": supply.reference_number,
        "created_by": supply.created_by,
        "created_at": supply.created_at,
        "updated_at": supply.updated_at,
        "notes": supply.notes,
        "items": []
    }

    # Добавляем элементы поставки
    for item in supply.items:
        item_dict = {
            "id": item.id,
            "supply_id": item.supply_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity_ordered": item.quantity_ordered,
            "quantity_received": item.quantity_received,
            "unit_price": float(item.unit_price),
            "warehouse_id": item.warehouse_id,
            "is_received": item.is_received,
            "received_date": item.received_date,
            "notes": item.notes
        }
        supply_dict["items"].append(item_dict)

    return supply_dict