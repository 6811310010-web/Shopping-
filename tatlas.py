from pymongo import MongoClient

# Make sure to replace YOUR_PASSWORD with the password you set for user 'shopping'
uri = "mongodb+srv://kaungthihakyaw256_db_user:kaung12345@cluster0.1ruan70.mongodb.net/?appName=Cluster0"

try:
    print("🔄 Connecting to MongoDB Atlas...")
    client = MongoClient(uri)

    # Ping forces an immediate round-trip check
    client.admin.command("ping")

    print("🟢 Successfully connected to MongoDB Atlas Cloud Cluster!")

except Exception as e:
    print(f"❌ Connection error: {e}")