from flask import Flask, render_template, redirect, url_for, request, flash
from bson.objectid import ObjectId
from database import get_db

app = Flask(__name__)
app.secret_key = "shopping-store-secret-key"

db = get_db()


# ============================================================
# HOME / PRODUCTS
# ============================================================

@app.route("/")
def index():
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()

    query = {}

    # Search by product name or description
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    # Filter by category
    if category and category != "All":
        query["category"] = category

    products = list(
        db.products.find(query).sort("name", 1)
    )

    # Get categories
    categories = sorted(
        db.products.distinct("category")
    )

    # Count items in cart
    cart_count = sum(
        item.get("quantity", 0)
        for item in db.cart.find()
    )

    return render_template(
        "index.html",
        products=products,
        categories=categories,
        cart_count=cart_count,
        search=search,
        selected_category=category
    )


# ============================================================
# ADD TO CART
# ============================================================

@app.route("/add_to_cart/<product_id>", methods=["POST"])
def add_to_cart(product_id):

    try:
        product = db.products.find_one(
            {"_id": ObjectId(product_id)}
        )
    except Exception:
        flash("Invalid product.", "error")
        return redirect(url_for("index"))

    if not product:
        flash("Product not found.", "error")
        return redirect(url_for("index"))

    # Check stock
    if product.get("stock", 0) <= 0:
        flash("Sorry, this product is out of stock.", "error")
        return redirect(url_for("index"))

    # Check if item already exists in cart
    cart_item = db.cart.find_one(
        {"product_id": product["_id"]}
    )

    if cart_item:
        # Increase cart quantity
        db.cart.update_one(
            {"_id": cart_item["_id"]},
            {"$inc": {"quantity": 1}}
        )
    else:
        # Create new cart item
        db.cart.insert_one({
            "product_id": product["_id"],
            "name": product["name"],
            "price": product["price"],
            "image": product.get("image", ""),
            "quantity": 1
        })

    # Reduce stock
    db.products.update_one(
        {"_id": product["_id"]},
        {"$inc": {"stock": -1}}
    )

    flash(f"{product['name']} added to your cart!", "success")

    return redirect(request.referrer or url_for("index"))


# ============================================================
# CART
# ============================================================

@app.route("/cart")
def view_cart():

    cart_items = []

    for item in db.cart.find().sort("name", 1):

        product = db.products.find_one(
            {"_id": item["product_id"]}
        )

        if product:
            item["stock"] = product.get("stock", 0)
            item["subtotal"] = (
                item["price"] * item["quantity"]
            )

            cart_items.append(item)

    total = sum(
        item["subtotal"]
        for item in cart_items
    )

    cart_count = sum(
        item["quantity"]
        for item in cart_items
    )

    return render_template(
        "cart.html",
        cart_items=cart_items,
        total=total,
        cart_count=cart_count
    )


# ============================================================
# INCREASE QUANTITY
# ============================================================

@app.route("/increase_quantity/<item_id>", methods=["POST"])
def increase_quantity(item_id):

    try:
        item = db.cart.find_one(
            {"_id": ObjectId(item_id)}
        )
    except Exception:
        flash("Invalid cart item.", "error")
        return redirect(url_for("view_cart"))

    if not item:
        flash("Cart item not found.", "error")
        return redirect(url_for("view_cart"))

    # Check product stock
    product = db.products.find_one(
        {"_id": item["product_id"]}
    )

    if not product:
        flash("Product no longer exists.", "error")
        return redirect(url_for("view_cart"))

    if product.get("stock", 0) <= 0:
        flash("No more stock available.", "error")
        return redirect(url_for("view_cart"))

    # Increase cart quantity
    db.cart.update_one(
        {"_id": item["_id"]},
        {"$inc": {"quantity": 1}}
    )

    # Reduce stock
    db.products.update_one(
        {"_id": product["_id"]},
        {"$inc": {"stock": -1}}
    )

    return redirect(url_for("view_cart"))


# ============================================================
# DECREASE QUANTITY
# ============================================================

@app.route("/decrease_quantity/<item_id>", methods=["POST"])
def decrease_quantity(item_id):

    try:
        item = db.cart.find_one(
            {"_id": ObjectId(item_id)}
        )
    except Exception:
        flash("Invalid cart item.", "error")
        return redirect(url_for("view_cart"))

    if not item:
        return redirect(url_for("view_cart"))

    # Return one item to stock
    db.products.update_one(
        {"_id": item["product_id"]},
        {"$inc": {"stock": 1}}
    )

    if item["quantity"] > 1:

        db.cart.update_one(
            {"_id": item["_id"]},
            {"$inc": {"quantity": -1}}
        )

    else:

        db.cart.delete_one(
            {"_id": item["_id"]}
        )

    return redirect(url_for("view_cart"))


# ============================================================
# REMOVE ITEM COMPLETELY
# ============================================================

@app.route("/remove_item/<item_id>", methods=["POST"])
def remove_item(item_id):

    try:
        item = db.cart.find_one(
            {"_id": ObjectId(item_id)}
        )
    except Exception:
        flash("Invalid cart item.", "error")
        return redirect(url_for("view_cart"))

    if not item:
        return redirect(url_for("view_cart"))

    # Return quantity to stock
    db.products.update_one(
        {"_id": item["product_id"]},
        {"$inc": {"stock": item["quantity"]}}
    )

    # Remove item
    db.cart.delete_one(
        {"_id": item["_id"]}
    )

    flash("Item removed from cart.", "success")

    return redirect(url_for("view_cart"))


# ============================================================
# CLEAR CART
# ============================================================

@app.route("/clear_cart", methods=["POST"])
def clear_cart():

    cart_items = list(db.cart.find())

    # Return everything to stock
    for item in cart_items:

        db.products.update_one(
            {"_id": item["product_id"]},
            {"$inc": {"stock": item["quantity"]}}
        )

    # Empty cart
    db.cart.delete_many({})

    flash("Your cart has been cleared.", "success")

    return redirect(url_for("view_cart"))


# ============================================================
# STORE MAP
# ============================================================

@app.route("/store-map")
def store_map():
    return render_template("store_map.html")


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )