import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "https://shopping-backend-6gpx.onrender.com";

const getImageUrl = (image) => {
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
    .map(encodeURIComponent)
    .join("/")}`;
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/orders`
        );

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Could not load orders."
          );
        }

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );
      } catch (err) {
        console.error("Orders error:", err);

        setError(
          "Could not load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="premium-orders-page">
        <div className="orders-loading">
          <div className="orders-spinner"></div>

          <h2>Loading your orders...</h2>

          <p>
            Please wait while we get your orders.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="premium-orders-page">
        <div className="orders-empty">
          <span>ERROR / 01</span>

          <h2>Unable to load orders</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="premium-orders-page">
      <div className="orders-page-container">

        {/* HEADER */}

        <header className="orders-page-header">
          <div>
            <span className="page-kicker">
              ACCOUNT / ORDERS
            </span>

            <h1>My Orders</h1>

            <p>
              View your recent purchases and order
              details.
            </p>
          </div>

          <div className="orders-header-stat">
            <span>TOTAL ORDERS</span>

            <strong>{orders.length}</strong>
          </div>
        </header>

        {/* NO ORDERS */}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <span>ORDERS / 00</span>

            <h2>No orders yet</h2>

            <p>
              Your completed orders will appear here.
            </p>

            <Link to="/">
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => {
              const items = Array.isArray(
                order.items
              )
                ? order.items
                : [];

              const total =
                Number(order.total) || 0;

              return (
                <article
                  className="premium-order-card"
                  key={
                    order.id ||
                    order._id ||
                    index
                  }
                >
                  {/* ORDER TOP */}

                  <div className="order-card-top">
                    <div className="order-reference">
                      <span>ORDER</span>

                      <strong>
                        #
                        {String(
                          order.id ||
                            order._id ||
                            "UNKNOWN"
                        ).slice(-8)}
                      </strong>
                    </div>

                    <div className="order-status">
                      COMPLETED
                    </div>
                  </div>

                  {/* PRODUCTS */}

                  <div className="order-products">
                    {items.map(
                      (item, itemIndex) => {
                        const quantity =
                          Number(
                            item.quantity
                          ) || 1;

                        const price =
                          Number(item.price) || 0;

                        return (
                          <div
                            className="order-product"
                            key={
                              item.id ||
                              item._id ||
                              itemIndex
                            }
                          >
                            <div className="order-product-image">
                              {item.image && (
                                <img
                                  src={getImageUrl(
                                    item.image
                                  )}
                                  alt={
                                    item.name ||
                                    "Product"
                                  }
                                />
                              )}
                            </div>

                            <div className="order-product-info">
                              <strong>
                                {item.name ||
                                  "Product"}
                              </strong>

                              <span>
                                QTY {quantity}
                              </span>
                            </div>

                            <strong className="order-product-price">
                              ฿
                              {(
                                price *
                                quantity
                              ).toLocaleString()}
                            </strong>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* BOTTOM */}

                  <div className="premium-order-bottom">
                    <div className="order-customer">
                      <span>CUSTOMER</span>

                      <strong>
                        {order.customer?.name ||
                          "Customer"}
                      </strong>
                    </div>

                    <div className="order-items-count">
                      <span>ITEMS</span>

                      <strong>
                        {items.length}
                      </strong>
                    </div>

                    <div className="order-grand-total">
                      <span>TOTAL</span>

                      <strong>
                        ฿{total.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}