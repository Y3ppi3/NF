from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Float
)
from sqlalchemy.orm import relationship
from app.database import Base


class OrderItem(Base):
    """
    Модель элемента заказа в системе
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)
    
    # Связи
    order = relationship("Order", back_populates="items")
    product = relationship("Product")