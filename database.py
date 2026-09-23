import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI environment variable is not set.")


# ============================================================
# MONGODB ATLAS CONNECTION
# ============================================================

client = MongoClient(
    MONGO_URI,
    server_api=ServerApi("1"),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000
)

try:
    client.admin.command("ping")
    print("✅ Successfully connected to MongoDB Atlas!")

except Exception as e:
    print("❌ MongoDB connection error:")
    print(e)
    raise


# ============================================================
# DATABASE
# ============================================================

db = client["shop_db"]


# ============================================================
# CREATE / UPDATE PRODUCTS
# ============================================================

def seed_products():

    products_collection = db.products

    products = [
        {
            "name": "Electronic Keyboard",
            "description": "Comfortable electronic keyboard for everyday typing.",
            "price": 39.99,
            "stock": 50,
            "category": "Electronics",
            "image": "images/Electronic Keyboard.jpg"
        },
        {
            "name": "Mechanical Keyboard",
            "description": "Mechanical keyboard with responsive keys.",
            "price": 89.99,
            "stock": 15,
            "category": "Electronics",
            "image": "images/Mechanical Keyboard.jpg"
        },
        {
            "name": "Electronic Mouse",
            "description": "Reliable wired mouse for everyday computer use.",
            "price": 19.99,
            "stock": 60,
            "category": "Electronics",
            "image": "images/Electronic Mouse.jpg"
        },
        {
            "name": "Wireless Mouse",
            "description": "Wireless mouse with comfortable ergonomic design.",
            "price": 25.00,
            "stock": 120,
            "category": "Electronics",
            "image": "images/Wireless Mouse.jpg"
        },
        {
            "name": "UltraWide Monitor",
            "description": "Large ultrawide monitor for work, study and entertainment.",
            "price": 299.99,
            "stock": 5,
            "category": "Electronics",
            "image": "images/UltraWide Monitor.jpg"
        },
        {
            "name": "Yoga Mat",
            "description": "Comfortable non-slip yoga mat for exercise and stretching.",
            "price": 20.00,
            "stock": 200,
            "category": "Fitness",
            "image": "images/Yoga Mat.jpg"
        },
        {
            "name": "Dumbbell Set",
            "description": "Durable dumbbell set for home workouts.",
            "price": 150.00,
            "stock": 40,
            "category": "Fitness",
            "image": "images/Dumbbell Set.jpg"
        },
        {
            "name": "Coffee Maker",
            "description": "Easy-to-use coffee maker for fresh coffee at home.",
            "price": 60.00,
            "stock": 75,
            "category": "Home",
            "image": "images/Coffee Maker.jpg"
        },
        {
            "name": "Blender",
            "description": "Powerful blender for smoothies and food preparation.",
            "price": 45.00,
            "stock": 90,
            "category": "Home",
            "image": "images/Blender.jpg"
        }
    ]

    # ========================================================
    # INSERT OR UPDATE PRODUCTS
    # ========================================================

    for product in products:

        existing = products_collection.find_one({
            "name": product["name"]
        })

        if existing:

            products_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "description": product["description"],
                        "price": product["price"],
                        "category": product["category"],
                        "image": product["image"]
                    }
                }
            )

        else:

            products_collection.insert_one(product)

    print("✅ Products checked and image paths updated.")


# ============================================================
# DATABASE FUNCTION
# ============================================================

def get_db():

    seed_products()

    return db