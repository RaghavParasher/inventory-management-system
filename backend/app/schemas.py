from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(..., ge=0.0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        orm_mode = True

# Customer Schemas
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        orm_mode = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    customer_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True
