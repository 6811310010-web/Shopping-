import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


function Checkout() {
  const navigate = useNavigate();

  const cart =
    JSON.parse(localStorage.getItem("cart")) || [];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/cart");
      return;
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      alert("Please fill in all information.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://https://shopping-backend-6gpx.onrender.com/api/orders",
        {
          customer: form,
          items: cart,
          total: total,
        }
      );

      if (response.data.success) {
        localStorage.setItem(
          "orderId",
          response.data.order_id
        );

       localStorage.setItem("lastOrderItems", JSON.stringify(cart));
        localStorage.removeItem("cart");
        window.dispatchEvent(
          new Event("cartUpdated")
        );

        navigate("/order-success");
      }
    } catch (error) {
      console.error("Order error:", error);

      alert(
        "Could not place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">

        <div className="empty-checkout">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            Please add some products before
            checking out.
          </p>

          <button
            onClick={() => navigate("/")}
            className="checkout-back-button"
          >
            ← Continue Shopping
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="checkout-page">

      {/* HEADER */}
      <div className="checkout-header">

        <span>
          CHECKOUT
        </span>

        <h1>
          Complete your order
        </h1>

        <p>
          Enter your information and review
          your order before placing it.
        </p>

      </div>


      {/* MAIN CONTENT */}
      <div className="checkout-layout">

        {/* CUSTOMER INFORMATION */}
        <section className="checkout-form-card">

          <div className="checkout-card-title">

            <span className="checkout-number">
              1
            </span>

            <div>
              <h2>
                Customer Information
              </h2>

              <p>
                Please enter your contact details.
              </p>
            </div>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />

            </div>


            <div className="form-row">

              <div className="form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={form.phone}
                  onChange={handleChange}
                />

              </div>

            </div>


            <div className="form-group">

              <label htmlFor="address">
                Delivery Address
              </label>

              <textarea
                id="address"
                name="address"
                rows="4"
                placeholder="Enter your delivery address"
                value={form.address}
                onChange={handleChange}
              />

            </div>


            <button
              type="submit"
              className="place-order-button"
              disabled={loading}
            >

              {loading
                ? "Placing Order..."
                : "Place Order →"}

            </button>

          </form>

        </section>


        {/* ORDER SUMMARY */}
        <aside className="checkout-summary">

          <div className="checkout-card-title">

            <span className="checkout-number">
              2
            </span>

            <div>
              <h2>
                Your Order
              </h2>

              <p>
                {itemCount} item
                {itemCount !== 1 ? "s" : ""}
              </p>
            </div>

          </div>


          <div className="checkout-products">

            {cart.map((item) => (

              <div
                className="checkout-product"
                key={item.id}
              >

                <div className="checkout-product-image">

                  {item.image ? (
                    <img
                      src={`http://https://shopping-backend-6gpx.onrender.com/static/${item.image}`}
                      alt={item.name}
                    />
                  ) : (
                    <span>
                      🛍️
                    </span>
                  )}

                </div>


                <div className="checkout-product-info">

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Qty: {item.quantity}
                  </p>

                </div>


                <strong>
                  $
                  {(
                    Number(item.price) *
                    item.quantity
                  ).toFixed(2)}
                </strong>

              </div>

            ))}

          </div>


          <div className="checkout-total">

            <div>
              <span>
                Subtotal
              </span>

              <span>
                ${total.toFixed(2)}
              </span>
            </div>

            <div>
              <span>
                Shipping
              </span>

              <span>
                Free
              </span>
            </div>

            <div className="checkout-final-total">

              <strong>
                Total
              </strong>

              <strong>
                ${total.toFixed(2)}
              </strong>

            </div>

          </div>


          <Link
            to="/cart"
            className="back-to-cart"
          >
            ← Back to Cart
          </Link>

        </aside>

      </div>

    </main>
  );
}

export default Checkout;