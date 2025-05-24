from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date


class OrderItemBase(BaseModel):
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    price: float
    subtotal: Optional[float] = None


class OrderBase(BaseModel):
    user_id: Optional[int] = None
    status: str = "pending"
    delivery_address: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None


class OrderCreate(OrderBase):
    total_amount: float
    items: Optional[List[OrderItemBase]] = None


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    name: Optional[str] = None
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[Union[date, datetime]] = None
    actual_delivery: Optional[datetime] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None


class OrderInDB(BaseModel):
    id: int
    user_id: Optional[int] = None
    status: str = "pending"
    created_at: datetime
    total_amount: float
    delivery_address: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[Union[date, datetime]] = None
    actual_delivery: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class PaymentBase(BaseModel):
    id: int
    payment_status: str
    payment_method: str
    transaction_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True


class OrderResponse(OrderInDB):
    pass


class OrderWithPayment(BaseModel):
    id: int
    user_id: Optional[int] = None
    status: str
    created_at: datetime
    total_amount: float
    delivery_address: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[Union[date, datetime]] = None
    actual_delivery: Optional[datetime] = None
    order_items: Optional[List[Dict[str, Any]]] = None
    payment: Optional[PaymentBase] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None