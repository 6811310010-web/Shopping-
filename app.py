from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from flask_cors import CORS
from bson.objectid import ObjectId
from database import get_db

app = Flask(__name__)
app.secret_key = "shopping-store-secret-key"

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "https://cs-tech-store.onrender.com"
    ]
)

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
        flash(
            "Sorry, this product is out of stock.",
            "error"
        )
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

    flash(
        f"{product['name']} added to your cart!",
        "success"
    )

    return redirect(
        request.referrer or url_for("index")
    )


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

            item["stock"] = product.get(
                "stock",
                0
            )

            item["subtotal"] = (
                item["price"] *
                item["quantity"]
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

@app.route(
    "/increase_quantity/<item_id>",
    methods=["POST"]
)
def increase_quantity(item_id):

    try:

        item = db.cart.find_one(
            {"_id": ObjectId(item_id)}
        )

    except Exception:

        flash(
            "Invalid cart item.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

    if not item:

        flash(
            "Cart item not found.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

    # Check product stock
    product = db.products.find_one(
        {"_id": item["product_id"]}
    )

    if not product:

        flash(
            "Product no longer exists.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

    if product.get("stock", 0) <= 0:

        flash(
            "No more stock available.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

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

    return redirect(
        url_for("view_cart")
    )


# ============================================================
# DECREASE QUANTITY
# ============================================================

@app.route(
    "/decrease_quantity/<item_id>",
    methods=["POST"]
)
def decrease_quantity(item_id):

    try:

        item = db.cart.find_one(
            {"_id": ObjectId(item_id)}
        )

    except Exception:

        flash(
            "Invalid cart item.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

    if not item:
        return redirect(
            url_for("view_cart")
        )

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

    return redirect(
        url_for("view_cart")
    )


# ============================================================
# REMOVE ITEM COMPLETELY
# ============================================================

@app.route(
    "/remove_item/<item_id>",
    methods=["POST"]
)
def remove_item(item_id):

    try:

        item = db.cart.find_one(
            {"_id": ObjectId(item_id)}
        )

    except Exception:

        flash(
            "Invalid cart item.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

    if not item:

        return redirect(
            url_for("view_cart")
        )

    # Return quantity to stock
    db.products.update_one(
        {"_id": item["product_id"]},
        {"$inc": {"stock": item["quantity"]}}
    )

    # Remove item
    db.cart.delete_one(
        {"_id": item["_id"]}
    )

    flash(
        "Item removed from cart.",
        "success"
    )

    return redirect(
        url_for("view_cart")
    )


# ============================================================
# CLEAR CART
# ============================================================

@app.route(
    "/clear_cart",
    methods=["POST"]
)
def clear_cart():

    cart_items = list(
        db.cart.find()
    )

    # Return everything to stock
    for item in cart_items:

        db.products.update_one(
            {"_id": item["product_id"]},
            {
                "$inc": {
                    "stock": item["quantity"]
                }
            }
        )

    # Empty cart
    db.cart.delete_many({})

    flash(
        "Your cart has been cleared.",
        "success"
    )

    return redirect(
        url_for("view_cart")
    )


# ============================================================
# CHECKOUT
# ============================================================

@app.route(
    "/checkout",
    methods=["GET", "POST"]
)
def checkout():

    # Get cart items
    cart_items = []

    for item in db.cart.find().sort("name", 1):

        product = db.products.find_one(
            {"_id": item["product_id"]}
        )

        if product:

            cart_items.append({
                "product_id": str(
                    item["product_id"]
                ),
                "name": item["name"],
                "price": item["price"],
                "image": item.get(
                    "image",
                    ""
                ),
                "quantity": item["quantity"],
                "subtotal": (
                    item["price"] *
                    item["quantity"]
                )
            })

    # Calculate total
    total = sum(
        item["subtotal"]
        for item in cart_items
    )

    # Empty cart
    if not cart_items:

        flash(
            "Your cart is empty.",
            "error"
        )

        return redirect(
            url_for("view_cart")
        )

    # ========================================================
    # PLACE ORDER
    # ========================================================

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        address = request.form.get(
            "address",
            ""
        ).strip()

        # Check required information
        if (
            not name
            or not email
            or not phone
            or not address
        ):

            flash(
                "Please fill in all information.",
                "error"
            )

            return render_template(
                "checkout.html",
                cart_items=cart_items,
                total=total,
                name=name,
                email=email,
                phone=phone,
                address=address
            )

        # Create order
        order = {

            "customer": {

                "name": name,
                "email": email,
                "phone": phone,
                "address": address

            },

            "items": cart_items,

            "total": total
        }

        try:

            # Save order to MongoDB
            result = db.orders.insert_one(
                order
            )

            # Clear cart
            db.cart.delete_many({})

            flash(
                "Order placed successfully!",
                "success"
            )

            return render_template(
                "order_success.html",
                order_id=str(
                    result.inserted_id
                ),
                total=total,
                name=name
            )

        except Exception as e:

            print(
                "Checkout error:",
                e
            )

            flash(
                "Could not place your order.",
                "error"
            )

            return render_template(
                "checkout.html",
                cart_items=cart_items,
                total=total,
                name=name,
                email=email,
                phone=phone,
                address=address
            )

    # GET request
    return render_template(
        "checkout.html",
        cart_items=cart_items,
        total=total,
        name="",
        email="",
        phone="",
        address=""
    )


# ============================================================
# STORE MAP
# ============================================================

@app.route("/store-map")
def store_map():

    return render_template(
        "store_map.html"
    )


# ============================================================
# REACT API - PRODUCTS
# ============================================================

@app.route(
    "/api/products",
    methods=["GET"]
)
def api_products():

    search = request.args.get(
        "search",
        ""
    ).strip()

    category = request.args.get(
        "category",
        ""
    ).strip()

    query = {}

    if search:

        query["$or"] = [

            {
                "name": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "description": {
                    "$regex": search,
                    "$options": "i"
                }
            }

        ]

    if (
        category
        and category != "All"
    ):

        query["category"] = category

    products = list(
        db.products.find(
            query
        ).sort(
            "name",
            1
        )
    )

    result = []

    for product in products:

        result.append({

            "id": str(
                product["_id"]
            ),

            "name": product.get(
                "name",
                ""
            ),

            "description": product.get(
                "description",
                ""
            ),

            "price": product.get(
                "price",
                0
            ),

            "stock": product.get(
                "stock",
                0
            ),

            "category": product.get(
                "category",
                ""
            ),

            "image": product.get(
                "image",
                ""
            )

        })

    categories = sorted(
        db.products.distinct(
            "category"
        )
    )

    return jsonify({

        "products": result,

        "categories": categories

    })


# ============================================================
# REACT API - ADD TO CART
# ============================================================

@app.route(
    "/api/cart/add/<product_id>",
    methods=["POST"]
)
def api_add_to_cart(product_id):

    try:

        product = db.products.find_one({

            "_id": ObjectId(
                product_id
            )

        })

        if not product:

            return jsonify({

                "success": False,

                "message":
                    "Product not found"

            }), 404

        if product.get(
            "stock",
            0
        ) <= 0:

            return jsonify({

                "success": False,

                "message":
                    "Product is out of stock"

            }), 400

        db.products.update_one(

            {
                "_id": ObjectId(
                    product_id
                )
            },

            {
                "$inc": {
                    "stock": -1
                }
            }

        )

        return jsonify({

            "success": True,

            "message":
                "Product added to cart",

            "product":
                product.get(
                    "name",
                    ""
                )

        })

    except Exception as e:

        print(
            "Cart error:",
            e
        )

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ============================================================
# REACT API - DECREASE STOCK
# ============================================================

@app.route(
    "/api/products/<product_id>/decrease-stock",
    methods=["POST"]
)
def decrease_stock(product_id):

    try:

        result = db.products.update_one(

            {
                "_id": ObjectId(
                    product_id
                ),

                "stock": {
                    "$gt": 0
                }
            },

            {
                "$inc": {
                    "stock": -1
                }
            }

        )

        if result.modified_count == 0:

            return jsonify({

                "success": False,

                "message":
                    "Product is out of stock."

            }), 400

        product = db.products.find_one({

            "_id": ObjectId(
                product_id
            )

        })

        return jsonify({

            "success": True,

            "stock": product.get(
                "stock",
                0
            )

        })

    except Exception as e:

        print(
            "Stock error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                "Could not update stock."

        }), 500


# ============================================================
# REACT API - CREATE ORDER
# ============================================================

@app.route(
    "/api/orders",
    methods=["POST"]
)
def create_order():

    try:

        data = request.get_json()

        customer = data.get(
            "customer",
            {}
        )

        items = data.get(
            "items",
            []
        )

        total = data.get(
            "total",
            0
        )

        if not customer.get(
            "name"
        ):

            return jsonify({

                "success": False,

                "message":
                    "Name is required"

            }), 400

        if not customer.get(
            "email"
        ):

            return jsonify({

                "success": False,

                "message":
                    "Email is required"

            }), 400

        if not items:

            return jsonify({

                "success": False,

                "message":
                    "Cart is empty"

            }), 400

        order = {

            "customer": customer,

            "items": items,

            "total": total

        }

        result = db.orders.insert_one(
            order
        )

        return jsonify({

            "success": True,

            "message":
                "Order created successfully",

            "order_id":
                str(
                    result.inserted_id
                )

        }), 201

    except Exception as e:

        print(
            "Order error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                "Could not create order"

        }), 500


# ============================================================
# REACT API - GET ORDERS
# ============================================================

@app.route(
    "/api/orders",
    methods=["GET"]
)
def get_orders():

    try:

        orders = list(

            db.orders.find().sort(
                "_id",
                -1
            )

        )

        result = []

        for order in orders:

            result.append({

                "id": str(
                    order["_id"]
                ),

                "customer":
                    order.get(
                        "customer",
                        {}
                    ),

                "items":
                    order.get(
                        "items",
                        []
                    ),

                "total":
                    order.get(
                        "total",
                        0
                    )

            })

        return jsonify({

            "success": True,

            "orders": result

        })

    except Exception as e:

        print(
            "Get orders error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                "Could not get orders"

        }), 500


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(

        debug=False,

        host="127.0.0.1",

        port=5000

    )