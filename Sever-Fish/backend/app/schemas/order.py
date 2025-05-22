from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    shipping_address: str
    contact_phone: str

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    user_id: int
    status: str
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True