from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Float,
    JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    # Поля из фактической БД
    total_amount = Column(Float, nullable=False)   # вместо total_price
    delivery_address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)      # вместо contact_phone
    email = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)      # вместо client_name
    comment = Column(Text, nullable=True)
    payment_method = Column(String(50), nullable=True)
    
    # Дополнительные поля для доставки
    tracking_number = Column(String(50), nullable=True)
    courier_name = Column(String(100), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    
    # Связи
    user = relationship("User", back_populates="orders")
    # Импортируем модель только если она действительно существует
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="order", cascade="all, delete-orphan")