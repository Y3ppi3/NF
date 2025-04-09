from fastapi import APIRouter, Depends, HTTPException, logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryResponse
from typing import List

router = APIRouter()

# Получение списка всех категорий
@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    try:
        categories = db.query(Category).all()

        # Явная отладка
        print(f"Найдено категорий: {len(categories)}")
        for category in categories:
            print(f"Категория: ID={category.id}, Название={category.name}")

        return categories
    except Exception as e:
        print(f"Ошибка при получении категорий: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Создание новой категории
@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(name=category.name, parent_category_id=category.parent_category_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Получение категории по id
@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category
