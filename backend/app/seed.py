import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import SessionLocal, engine, Base
from . import models, auth

def ensure_schema_columns(bind):
    """Ensure newly added columns exist on pre-existing database tables without requiring manual migrations."""
    with bind.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'Computing & Displays';"))
            conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR;"))
            conn.commit()
        except Exception as e:
            # Fallback if IF NOT EXISTS is unsupported or table doesn't exist yet
            try:
                conn.execute(text("ALTER TABLE products ADD COLUMN category VARCHAR DEFAULT 'Computing & Displays';"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE products ADD COLUMN image_url VARCHAR;"))
                conn.commit()
            except Exception:
                pass

def seed_database(db: Session):
    # Ensure tables and new columns are created safely
    Base.metadata.create_all(bind=engine)
    ensure_schema_columns(engine)

    # 1. Seed Users (Admin and Warehouse Staff) - Force update if hash mismatched or missing
    try:
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            admin_user = models.User(
                username="admin",
                hashed_password=auth.get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
        else:
            admin_user.hashed_password = auth.get_password_hash("admin123")
            admin_user.role = "admin"
        
        warehouse_user = db.query(models.User).filter(models.User.username == "warehouse").first()
        if not warehouse_user:
            warehouse_user = models.User(
                username="warehouse",
                hashed_password=auth.get_password_hash("stock2026"),
                role="warehouse"
            )
            db.add(warehouse_user)
        else:
            warehouse_user.hashed_password = auth.get_password_hash("stock2026")
            warehouse_user.role = "warehouse"
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"User seed error: {e}")

    # 2. Seed 55+ Curated Products across 5 Categories if catalog is sparse
    try:
        existing_products_count = db.query(models.Product).count()
        if existing_products_count < 50:
            catalog = [
                # Category 1: High-Performance Computing & Displays (12 items)
                ("Pro Display XDR 32\" 6K Retina", "SKU-MON-6K01", "Computing & Displays", 1899.99, 14),
                ("UltraWide 34\" Curved 165Hz Monitor", "SKU-MON-3402", "Computing & Displays", 649.50, 28),
                ("Ergonomic 4K 27\" IPS Studio Display", "SKU-MON-2703", "Computing & Displays", 429.00, 45),
                ("Portable 15.6\" OLED Dual Screen USB-C", "SKU-MON-1504", "Computing & Displays", 289.99, 8), # Low stock
                ("Thunderbolt 4 Quad Display Docking Station", "SKU-DOCK-TB01", "Computing & Displays", 299.00, 32),
                ("USB-C 10-in-1 Aluminum Multi-Port Hub", "SKU-DOCK-HB02", "Computing & Displays", 69.99, 110),
                ("Mechanical Wireless Gaming Keyboard (Hot-Swap)", "SKU-PER-KB01", "Computing & Displays", 149.99, 64),
                ("Low-Profile Tactile Bluetooth Keyboard", "SKU-PER-KB02", "Computing & Displays", 119.50, 42),
                ("Ergonomic Vertical Master Wireless Mouse", "SKU-PER-MS01", "Computing & Displays", 99.99, 85),
                ("Ultra-Lightweight Honeycomb Gaming Mouse", "SKU-PER-MS02", "Computing & Displays", 79.99, 0), # Out of stock
                ("Professional 4K AI Auto-Framing Webcam", "SKU-PER-CAM01", "Computing & Displays", 199.99, 19),
                ("Studio Condenser USB Microphone with Arm", "SKU-PER-MIC01", "Computing & Displays", 159.00, 23),

                # Category 2: Workplace & Ergonomics (11 items)
                ("Aeron Executive Ergonomic Mesh Chair", "SKU-ERG-CHR01", "Workplace & Ergonomics", 1150.00, 12),
                ("PosturePlus Lumbar Support Office Chair", "SKU-ERG-CHR02", "Workplace & Ergonomics", 389.99, 5), # Low stock
                ("Electric Dual-Motor Standing Desk (60x30)", "SKU-ERG-DSK01", "Workplace & Ergonomics", 749.00, 18),
                ("Compact Pneumatic Height-Adjustable Desk", "SKU-ERG-DSK02", "Workplace & Ergonomics", 329.50, 26),
                ("Anti-Fatigue Standing Desk Balance Board", "SKU-ERG-ACC01", "Workplace & Ergonomics", 89.99, 40),
                ("Heavy-Duty Dual Monitor Spring Arm Mount", "SKU-ERG-ARM01", "Workplace & Ergonomics", 129.99, 58),
                ("Sleek Aluminum Under-Desk Cable Management Drawer", "SKU-ERG-CAB01", "Workplace & Ergonomics", 45.00, 130),
                ("LED Architect Desk Lamp with Auto-Dimming", "SKU-ERG-LMP01", "Workplace & Ergonomics", 79.99, 4), # Low stock
                ("Acoustic Felt Privacy Desk Divider (48\")", "SKU-ERG-DIV01", "Workplace & Ergonomics", 115.00, 31),
                ("Magnetic Under-Desk Headphone Hanger", "SKU-ERG-ACC02", "Workplace & Ergonomics", 19.99, 210),
                ("Premium Wool Felt Extended Desk Mat", "SKU-ERG-MAT01", "Workplace & Ergonomics", 39.99, 95),

                # Category 3: Enterprise Networking & Infrastructure (11 items)
                ("Wi-Fi 6E Tri-Band Enterprise Access Point", "SKU-NET-AP01", "Enterprise Networking", 289.00, 34),
                ("24-Port Gigabit Managed PoE+ Switch (370W)", "SKU-NET-SW01", "Enterprise Networking", 549.99, 15),
                ("48-Port 10G SFP+ Core Fiber Switch", "SKU-NET-SW02", "Enterprise Networking", 1899.00, 6), # Low stock
                ("Rackmount Smart PDU (8-Outlet, Remote Monitoring)", "SKU-NET-PDU01", "Enterprise Networking", 229.50, 22),
                ("Enterprise Dual-WAN Multi-Gigabit VPN Router", "SKU-NET-RTR01", "Enterprise Networking", 399.00, 11),
                ("1U Wall-Mount Server Network Rack Cabinet (12U)", "SKU-NET-RCK01", "Enterprise Networking", 189.99, 9), # Low stock
                ("Shielded Cat6A Snagless Patch Cable (10ft Pack of 5)", "SKU-NET-CBL01", "Enterprise Networking", 34.99, 250),
                ("10G SFP+ SR Optical Transceiver Module", "SKU-NET-OPT01", "Enterprise Networking", 59.00, 78),
                ("Uninterruptible Power Supply (UPS) 1500VA / 900W", "SKU-NET-UPS01", "Enterprise Networking", 269.99, 14),
                ("Cat6 24-Port Patch Panel 1U Rackmount", "SKU-NET-PNL01", "Enterprise Networking", 48.50, 65),
                ("Heavy-Duty Cable Tray System (6ft Section)", "SKU-NET-TRY01", "Enterprise Networking", 42.00, 88),

                # Category 4: Power & High-Speed Storage (11 items)
                ("2TB NVMe M.2 PCIe Gen4 Internal SSD", "SKU-STR-SSD01", "Power & Storage", 169.99, 72),
                ("4TB Rugged Waterproof External USB-C SSD", "SKU-STR-SSD02", "Power & Storage", 319.99, 39),
                ("16TB 7200RPM Enterprise NAS Hard Drive", "SKU-STR-HDD01", "Power & Storage", 289.50, 44),
                ("4-Bay Thunderbolt 3 RAID Storage Enclosure", "SKU-STR-ENC01", "Power & Storage", 449.00, 16),
                ("100W GaN 4-Port Compact USB-C Wall Charger", "SKU-PWR-CHG01", "Power & Storage", 64.99, 115),
                ("26,800mAh 65W Laptop PD Power Bank", "SKU-PWR-BNK01", "Power & Storage", 89.99, 0), # Out of stock
                ("Braided USB-C to USB-C 100W Cable (6ft, Pack of 2)", "SKU-PWR-CBL01", "Power & Storage", 24.99, 320),
                ("12-Outlet Surge Protector with USB Ports (4000 Joules)", "SKU-PWR-SRG01", "Power & Storage", 39.99, 140),
                ("Qi 3-in-1 Magnetic Wireless Charging Stand", "SKU-PWR-WRL01", "Power & Storage", 59.99, 52),
                ("Biometric Fingerprint Hardware Security Key", "SKU-SEC-KEY01", "Power & Storage", 55.00, 84),
                ("128GB High-Speed UHS-II SDXC Memory Card", "SKU-STR-SD01", "Power & Storage", 49.99, 160),

                # Category 5: Smart Warehouse & Logistics Automation (11 items)
                ("Industrial Thermal Barcode & Shipping Label Printer", "SKU-LOG-PRN01", "Warehouse Logistics", 349.99, 24),
                ("4x6 Direct Thermal Shipping Labels (Pack of 4 Rolls)", "SKU-LOG-LBL01", "Warehouse Logistics", 38.00, 190),
                ("Handheld 2D/1D Wireless Bluetooth Barcode Scanner", "SKU-LOG-SCN01", "Warehouse Logistics", 129.99, 37),
                ("Heavy-Duty Digital Platform Shipping Scale (400 lbs)", "SKU-LOG-SCL01", "Warehouse Logistics", 159.00, 19),
                ("Ergonomic Industrial Tape Gun Dispenser (2-Inch)", "SKU-LOG-TPE01", "Warehouse Logistics", 18.50, 145),
                ("Industrial Reinforced Packing Tape (Case of 36 Rolls)", "SKU-LOG-TPE02", "Warehouse Logistics", 89.99, 48),
                ("RFID Long-Range Inventory Reader Terminal", "SKU-LOG-RFD01", "Warehouse Logistics", 849.00, 3), # Low stock
                ("Heavy-Duty 3-Tier Rolling Wire Cart with Wheels", "SKU-LOG-CRT01", "Warehouse Logistics", 149.99, 21),
                ("Collapsible Industrial Plastic Storage Crates (Pack of 5)", "SKU-LOG-BIN01", "Warehouse Logistics", 110.00, 55),
                ("Safety High-Visibility Warehouse Vest & Glove Kit", "SKU-LOG-SFT01", "Warehouse Logistics", 32.99, 120),
                ("Digital Temperature & Humidity IoT Sensor Beacon", "SKU-LOG-IOT01", "Warehouse Logistics", 44.99, 82)
            ]

            for name, sku, category, price, qty in catalog:
                if not db.query(models.Product).filter(models.Product.sku == sku).first():
                    prod = models.Product(name=name, sku=sku, category=category, price=price, quantity=qty)
                    db.add(prod)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Product seed error: {e}")

    # 3. Seed 15 Customers if sparse
    try:
        existing_customers_count = db.query(models.Customer).count()
        if existing_customers_count < 15:
            sample_customers = [
                ("Alex Mercer", "alex.mercer@cyberlogistics.com", "+1 (555) 019-2831"),
                ("Sophia Vance", "vance.s@quantumdynamics.io", "+1 (555) 019-4412"),
                ("Marcus Sterling", "msterling@nexustechnologies.net", "+1 (555) 019-8833"),
                ("Elena Rostova", "elena.r@aurorasystems.org", "+1 (555) 019-9102"),
                ("David Thorne", "dthorne@innovativeworks.co", "+1 (555) 019-7321"),
                ("Chloe Bennett", "chloe@apexenterprises.com", "+1 (555) 019-6129"),
                ("Lucas Vance", "lucas.vance@solardatacenter.io", "+1 (555) 019-3382"),
                ("Maya Lin", "mlin@cloudscalesystems.com", "+1 (555) 019-5091"),
                ("Victor Vance", "victor@titanlogistics.org", "+1 (555) 019-1144"),
                ("Samantha Brooks", "s.brooks@horizonmedia.net", "+1 (555) 019-8201"),
                ("Julian Hayes", "jhayes@pinnaclehardware.co", "+1 (555) 019-2938"),
                ("Isabella Ramirez", "iramirez@zenithworkplace.com", "+1 (555) 019-7711"),
                ("Nathaniel Drake", "ndrake@globalsupply.org", "+1 (555) 019-4820"),
                ("Aria Montgomery", "aria@frontiernetworks.io", "+1 (555) 019-9034"),
                ("Gabriel Vance", "gvance@cybersecuritylab.com", "+1 (555) 019-6543")
            ]
            for full_name, email, phone in sample_customers:
                if not db.query(models.Customer).filter(models.Customer.email == email).first():
                    cust = models.Customer(full_name=full_name, email=email, phone_number=phone)
                    db.add(cust)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Customer seed error: {e}")

    # 4. Seed 32+ Historical Orders across past 30 days if sparse
    try:
        existing_orders_count = db.query(models.Order).count()
        if existing_orders_count < 25:
            all_customers = db.query(models.Customer).all()
            all_products = db.query(models.Product).filter(models.Product.quantity > 0).all()
            
            if all_customers and len(all_products) >= 5:
                for i in range(32):
                    cust = random.choice(all_customers)
                    days_ago = random.randint(0, 29)
                    order_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(1, 23))
                    
                    num_items = random.randint(1, 4)
                    chosen_products = random.sample(all_products, min(num_items, len(all_products)))
                    
                    total = 0.0
                    order_items = []
                    for p in chosen_products:
                        qty = random.randint(1, 3)
                        item_total = p.price * qty
                        total += item_total
                        order_items.append(models.OrderItem(product_id=p.id, quantity=qty))
                    
                    new_order = models.Order(
                        customer_id=cust.id,
                        total_amount=round(total, 2),
                        created_at=order_date,
                        items=order_items
                    )
                    db.add(new_order)
                db.commit()
    except Exception as e:
        db.rollback()
        print(f"Order seed error: {e}")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Seeding database with 55+ products, 15 customers, 32+ orders, and RBAC users...")
        seed_database(db)
        print("Successfully seeded all data!")
    finally:
        db.close()
