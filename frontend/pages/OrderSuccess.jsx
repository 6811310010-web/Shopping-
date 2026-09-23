import { Link } from "react-router-dom";

function OrderSuccess() {
  const orderId = localStorage.getItem("orderId");

  const cart = JSON.parse(localStorage.getItem("lastOrderItems")) || [];

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const getImageUrl = (item) => {
    if (!item.image) return "";

    return `http://https://shopping-backend-6gpx.onrender.com/static/${item.image}`;
  };

  return (
    <main className="success-page">

      <section className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <span className="success-label">
          ORDER COMPLETE
        </span>

        <h1>
          Thank you for your order!
        </h1>

        <p className="success-message">
          Your order has been successfully placed.
          We will process it as soon as possible.
        </p>

        <div className="order-info-box">

          <div>
            <span>Order ID</span>

            <strong>
              #{orderId || "N/A"}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong className="order-status">
              Confirmed
            </strong>
          </div>

        </div>


        {/* PRODUCTS */}

        {cart.length > 0 && (
          <div className="success-products">

            <div className="success-products-title">
              ORDER ITEMS
            </div>

            {cart.map((item, index) => (

              <div
                className="success-product"
                key={item._id || item.id || index}
              >

                <div className="success-product-image">

                  {getImageUrl(item) ? (
                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                    />
                  ) : (
                    <span>No Image</span>
                  )}

                </div>

                <div className="success-product-info">

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    Qty: {item.quantity}
                  </span>

                </div>

                <div className="success-product-price">
                  ฿
                  {(
                    Number(item.price) *
                    Number(item.quantity)
                  ).toLocaleString()}
                </div>

              </div>

            ))}

            <div className="success-total">

              <span>
                TOTAL
              </span>

              <strong>
                ฿{total.toLocaleString()}
              </strong>

            </div>

          </div>
        )}


        <div className="success-actions">

          <Link
            to="/orders"
            className="view-orders-button"
          >
            📦 View My Orders
          </Link>

          <Link
            to="/"
            className="continue-shopping-button"
          >
            Continue Shopping
          </Link>

        </div>

      </section>

    </main>
  );
}

export default OrderSuccess;