from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.product import Category, Product
from app.schemas.product import CategoryResponse, ProductResponse

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
) -> Any:
    """Получение списка товаров с фильтрацией и пагинацией."""
    query = db.query(Product)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)) -> Any:
    """Получение информации о конкретном товаре."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)) -> Any:
    """Получение списка категорий."""
    categories = db.query(Category).all()
    return categories

@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)) -> Any:
    """Получение информации о конкретной категории."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category

@router.get("/categories/{category_id}/products", response_model=List[ProductResponse])
async def get_products_by_category(
    category_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
) -> Any:
    """Получение товаров по категории."""
    products = db.query(Product).filter(
        Product.category_id == category_id
    ).offset(skip).limit(limit).all()
    
    return products