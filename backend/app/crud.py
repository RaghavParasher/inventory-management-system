from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas

# --- Products ---

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session):
    return db.query(models.Product).all()

def create_product(db: Session, product: schemas.ProductCreate):
    if get_product_by_sku(db, product.sku):
        raise HTTPException(status_code=400, detail="SKU already registered")
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductCreate):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if new SKU conflicts with existing other products
    existing_product = get_product_by_sku(db, product_update.sku)
    if existing_product and existing_product.id != product_id:
        raise HTTPException(status_code=400, detail="SKU already registered by another product")
        
    for key, value in product_update.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

# --- Customers ---

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session):
    return db.query(models.Customer).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    if get_customer_by_email(db, customer.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted"}

# --- Orders ---

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session):
    return db.query(models.Order).all()

def create_order(db: Session, order: schemas.OrderCreate):
    # Validate customer
    customer = get_customer(db, order.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total_amount = 0.0
    db_order_items = []
    
    # Pre-validate and calculate
    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient inventory for product {product.name} (SKU: {product.sku})")
        
        # Decrease stock
        product.quantity -= item.quantity
        
        # Accumulate total
        total_amount += product.price * item.quantity
        
        db_item = models.OrderItem(product_id=product.id, quantity=item.quantity)
        db_order_items.append(db_item)
    
    # Create order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        items=db_order_items
    )
    db.add(db_order)
    
    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while placing the order")

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Optional: restore inventory when order is cancelled
    for item in db_order.items:
        product = get_product(db, item.product_id)
        if product:
            product.quantity += item.quantity
            
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted"}
