import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../src/Checkout.css";

const API_BASE = "https://shopping-backend-6gpx.onrender.com";

const imageUrl = (image) => {
  if (!image) return "";

  let path = String(image)
    .trim()
    .replace(/\\/g, "/");

  path = path.replace(/^https?:\/\/[^/]+/i, "");
  path = path.replace(/^\/+/, "");
  path = path.replace(/^static\//i, "");

  if (!/^images\//i.test(path)) {
    path = `images/${path}`;
  }

  return `${API_BASE}/static/${path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
};

const readCart = () => {
  try {
    const cart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

export default function Checkout() {
  const navigate = useNavigate();

  const [cart] = useState(readCart);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    payment: "Cash on Delivery",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // CALCULATE TOTAL
  // ============================

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      return sum + price * quantity;
    }, 0);
  }, [cart]);

  const shipping = 0;
  const total = subtotal + shipping;

  // ============================
  // FORM UPDATE
  // ============================

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================
  // PLACE ORDER
  // ============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const customer = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        payment: form.payment,
      };

      const response = await fetch(
        `${API_BASE}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer,
            items: cart,
            total,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not create order."
        );
      }

      const order = {
        order_id: data.order_id,
        customer,
        items: cart,
        total,
      };

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(order)
      );

      localStorage.removeItem("cart");

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      navigate("/order-success", {
        state: {
          order,
        },
      });
    } catch (error) {
      console.error("Order error:", error);

      setError(
        error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // EMPTY CART
  // ============================

  if (!cart.length) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span className="checkout-kicker">
            CHECKOUT / 01
          </span>

          <h1>Your cart is empty.</h1>

          <p>
            Add a product before continuing to checkout.
          </p>

          <Link
            to="/"
            className="checkout-primary-button"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // ============================
  // CHECKOUT
  // ============================

  return (
    <main className="checkout-page">
      <div className="checkout-shell">

        {/* HEADER */}

        <header className="checkout-header">
          <div>
            <span className="checkout-kicker">
              CHECKOUT / 01
            </span>

            <h1>Complete your order</h1>

            <p>
              Enter your information and review your
              order before placing it.
            </p>
          </div>

          <Link
            to="/cart"
            className="checkout-back-link"
          >
            ← Back to cart
          </Link>
        </header>

        {/* ERROR */}

        {error && (
          <div
            className="checkout-alert"
            role="alert"
          >
            <span className="checkout-alert-icon">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* FORM */}

        <form
          className="checkout-layout"
          onSubmit={handleSubmit}
        >

          {/* ============================
              LEFT SIDE
          ============================ */}

          <section className="checkout-card checkout-form-card">

            {/* CUSTOMER INFORMATION */}

            <div className="checkout-section-heading">
              <div className="checkout-number">
                01
              </div>

              <div>
                <h2>Customer information</h2>

                <p>
                  We use these details to process
                  your order.
                </p>
              </div>
            </div>

            <div className="checkout-form-grid">

              {/* NAME */}

              <div className="checkout-field">
                <label htmlFor="checkout-name">
                  Full name <span>*</span>
                </label>

                <input
                  id="checkout-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

              {/* EMAIL */}

              <div className="checkout-field">
                <label htmlFor="checkout-email">
                  Email address <span>*</span>
                </label>

                <input
                  id="checkout-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {/* PHONE */}

              <div className="checkout-field">
                <label htmlFor="checkout-phone">
                  Phone number
                </label>

                <input
                  id="checkout-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateForm}
                  placeholder="08X XXX XXXX"
                  autoComplete="tel"
                />
              </div>

              {/* ADDRESS */}

              <div className="checkout-field checkout-field-full">
                <label htmlFor="checkout-address">
                  Delivery address
                </label>

                <textarea
                  id="checkout-address"
                  name="address"
                  value={form.address}
                  onChange={updateForm}
                  placeholder="Enter your delivery address"
                  autoComplete="street-address"
                  rows="4"
                />
              </div>

            </div>

            {/* PAYMENT */}

            <div className="checkout-section-heading payment-heading">
              <div className="checkout-number">
                02
              </div>

              <div>
                <h2>Payment</h2>

                <p>
                  Select your preferred payment method.
                </p>
              </div>
            </div>

            <div className="payment-options">

              {/* CASH */}

              <label
                className={`payment-option ${
                  form.payment ===
                  "Cash on Delivery"
                    ? "active"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={
                    form.payment ===
                    "Cash on Delivery"
                  }
                  onChange={updateForm}
                />

                <span className="payment-radio"></span>

                <span className="payment-content">
                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your order arrives.
                  </small>
                </span>
              </label>

              {/* BANK */}

              <label
                className={`payment-option ${
                  form.payment ===
                  "Bank Transfer"
                    ? "active"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Bank Transfer"
                  checked={
                    form.payment ===
                    "Bank Transfer"
                  }
                  onChange={updateForm}
                />

                <span className="payment-radio"></span>

                <span className="payment-content">
                  <strong>
                    Bank Transfer
                  </strong>

                  <small>
                    Transfer payment after placing
                    the order.
                  </small>
                </span>
              </label>

            </div>
          </section>

          {/* ============================
              RIGHT SIDE
          ============================ */}

          <aside className="checkout-card checkout-summary-card">

            <div className="checkout-section-heading">
              <div className="checkout-number">
                03
              </div>

              <div>
                <h2>Order summary</h2>

                <p>
                  {cart.length} product
                  {cart.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* PRODUCTS */}

            <div className="checkout-items">

              {cart.map((item, index) => {
                const quantity =
                  Number(item.quantity) || 1;

                const price =
                  Number(item.price) || 0;

                return (
                  <div
                    className="checkout-product"
                    key={
                      item.id ||
                      item._id ||
                      index
                    }
                  >

                    <div className="checkout-product-image">
                      {item.image && (
                        <img
                          src={imageUrl(item.image)}
                          alt={
                            item.name ||
                            "Product"
                          }
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      )}
                    </div>

                    <div className="checkout-product-info">
                      <strong>
                        {item.name ||
                          "Product"}
                      </strong>

                      <span>
                        Qty {quantity}
                      </span>
                    </div>

                    <strong className="checkout-product-price">
                      ฿
                      {(
                        price * quantity
                      ).toLocaleString()}
                    </strong>

                  </div>
                );
              })}

            </div>

            {/* TOTALS */}

            <div className="checkout-summary-lines">

              <div>
                <span>Subtotal</span>

                <strong>
                  ฿{subtotal.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Shipping</span>

                <strong className="free-shipping">
                  FREE
                </strong>
              </div>

            </div>

            <div className="checkout-total">
              <span>Total</span>

              <strong>
                ฿{total.toLocaleString()}
              </strong>
            </div>

            {/* PLACE ORDER */}

            <button
              type="submit"
              className="checkout-primary-button checkout-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Placing order..."
                  : "Place order"}
              </span>

              {!loading && (
                <span className="checkout-arrow">
                  →
                </span>
              )}
            </button>

            <p className="checkout-secure-note">
              Your order information is sent
              securely to the store.
            </p>

          </aside>

        </form>
      </div>
    </main>
  );
}