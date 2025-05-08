# app/routers/warehouse.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user, get_current_admin
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from app.schemas.enums import WarehouseType
from app.crud import warehouse as warehouse_crud

router = APIRouter(
    prefix="/warehouses",
    tags=["warehouses"],
    responses={404: {"description": "Склад не найден"}},
)


@router.get("/", response_model=List[Dict[str, Any]])
def get_warehouses(
        skip: int = 0,
        limit: int = 100,
        name: Optional[str] = None,
        type: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение списка складов с возможностью фильтрации.
    """
    # Преобразуем тип склада из строки в enum при необходимости
    warehouse_type = None
    if type:
        try:
            warehouse_type = WarehouseType(type.upper())
        except ValueError:
            # Если не удалось преобразовать, используем маппинг
            type_map = {
                "general": WarehouseType.WAREHOUSE,
                "display": WarehouseType.STORE,
                "fridge": WarehouseType.FRIDGE,
                "freezer": WarehouseType.FREEZER,
                "external": WarehouseType.EXTERNAL
            }
            warehouse_type = type_map.get(type.lower())

    return warehouse_crud.get_all_warehouses(
        db, skip=skip, limit=limit,
        name=name, type=warehouse_type
    )


@router.get("/statistics", response_model=Dict[str, Any])
def get_warehouse_statistics(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение общей статистики по всем складам.
    """
    return warehouse_crud.get_warehouse_statistics(db)


@router.get("/{warehouse_id}", response_model=Dict[str, Any])
def get_warehouse(
        warehouse_id: str,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение информации о складе по ID.
    """
    warehouse = warehouse_crud.get_warehouse_by_id(db, int(warehouse_id))
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Склад с ID {warehouse_id} не найден"
        )
    return warehouse


@router.get("/{warehouse_id}/stocks", response_model=Dict[str, Any])
def get_warehouse_stocks(
        warehouse_id: str,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение информации о складе вместе со списком всех запасов на нем.
    """
    warehouse = warehouse_crud.get_warehouse_with_stocks(db, int(warehouse_id))
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Склад с ID {warehouse_id} не найден"
        )
    return warehouse


@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_warehouse(
        warehouse_data: WarehouseCreate,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Создание нового склада.
    """
    try:
        return warehouse_crud.create_warehouse(db, warehouse_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось создать склад: {str(e)}"
        )


@router.put("/{warehouse_id}", response_model=Dict[str, Any])
def update_warehouse(
        warehouse_id: str,
        warehouse_data: WarehouseUpdate,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Обновление информации о складе.
    """
    try:
        updated_warehouse = warehouse_crud.update_warehouse(
            db, int(warehouse_id), warehouse_data
        )

        if not updated_warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Склад с ID {warehouse_id} не найден"
            )

        return updated_warehouse
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось обновить склад: {str(e)}"
        )


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(
        warehouse_id: str,
        db: Session = Depends(get_db),
        current_admin=Depends(get_current_admin)
):
    """
    Удаление склада, если на нем нет запасов.
    """
    success = warehouse_crud.delete_warehouse(db, int(warehouse_id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не удалось удалить склад. Возможно, на нем есть запасы."
        )
    return {"success": True}


@router.get("/{warehouse_id}/low-stock", response_model=List[Dict[str, Any]])
def get_warehouse_low_stock(
        warehouse_id: str,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение списка товаров с низким запасом на складе.
    """
    warehouse = warehouse_crud.get_warehouse_with_stocks(db, int(warehouse_id))
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Склад с ID {warehouse_id} не найден"
        )

    # Фильтруем только товары с низким запасом
    from app.schemas.enums import StockStatus
    low_stock_items = [
        item for item in warehouse["stocks"]
        if item["status"] == StockStatus.LOW_STOCK.value
    ]

    return low_stock_items