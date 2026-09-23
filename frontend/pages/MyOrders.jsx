import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/orders"
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item) => {
    if (!item?.image) return "";

    return `http://127.0.0.1:5000/static/${item.image}`;
  };

  return (
    <main className="premium-orders-page">

      <div className="orders-container">

        {/* HEADER */}
        <header className="orders-page-header">

          <div className="orders-header-icon">
            📦
          </div>

          <div>
            <span className="page-kicker">
              ORDER HISTORY
            </span>

            <h1>My Orders</h1>

            <p>
              View and manage your previous orders.
            </p>
          </div>

        </header>


        {/* LOADING */}
        {loading && (
          <div className="orders-loading">
            <div className="orders-spinner"></div>

            <p>
              Loading your orders...
            </p>
          </div>
        )}


        {/* EMPTY */}
        {!loading && orders.length === 0 && (
          <section className="orders-empty">

            <span>
              🛍️
            </span>

            <h2>
              No orders yet
            </h2>

            <p>
              Your completed orders will appear here.
            </p>

            <Link
              to="/"
              className="shop-now-button"
            >
              Start Shopping →
            </Link>

          </section>
        )}


        {/* ORDERS */}
        {!loading && orders.length > 0 && (

          <div className="orders-list-premium">

            {orders.map((order, index) => (

              <article
                className="premium-order-card"
                key={order.id || index}
              >

                {/* ORDER HEADER */}
                <div className="premium-order-top">

                  <div className="order-reference">

                    <span>
                      ORDER
                    </span>

                    <strong>
                      #{orders.length - index}
                    </strong>

                    <small>
                      ID: {order.id}
                    </small>

                  </div>


                  <div className="order-grand-total">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      ฿{Number(order.total).toFixed(2)}
                    </strong>

                  </div>

                </div>


                {/* STATUS */}
                <div className="premium-order-status">

                  <span className="order-status">
                    ✓ CONFIRMED
                  </span>

                  <span>
                    Order placed successfully
                  </span>

                </div>


                {/* CUSTOMER */}
                <div className="order-customer-box">

                  <div className="order-section-title">
                    <span>♟</span>
                    Customer Information
                  </div>

                  <div className="customer-grid">

                    <div>
                      <span>NAME</span>

                      <strong>
                        {order.customer?.name || "-"}
                      </strong>
                    </div>


                    <div>
                      <span>EMAIL</span>

                      <strong>
                        {order.customer?.email || "-"}
                      </strong>
                    </div>


                    <div>
                      <span>PHONE</span>

                      <strong>
                        {order.customer?.phone || "-"}
                      </strong>
                    </div>


                    <div>
                      <span>ADDRESS</span>

                      <strong>
                        {order.customer?.address || "-"}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* PRODUCTS */}
                <div className="premium-order-products">

                  <div className="order-section-title">
                    🛒 Products
                  </div>


                  {order.items?.map((item, itemIndex) => (

                    <div
                      className="premium-order-product"
                      key={item._id || item.id || itemIndex}
                    >

                      {/* IMAGE */}
                      <div className="order-product-image">

                        {getImageUrl(item) ? (

                          <img
                            src={getImageUrl(item)}
                            alt={item.name || "Product"}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />

                        ) : (

                          <span>
                            🛍️
                          </span>

                        )}

                      </div>


                      {/* PRODUCT INFO */}
                      <div className="order-product-info">

                        <strong>
                          {item.name || "Product"}
                        </strong>

                        <span>
                          Quantity: {item.quantity || 0}
                        </span>

                      </div>


                      {/* PRICE */}
                      <div className="order-product-price">

                        ฿
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toFixed(2)}

                      </div>

                    </div>

                  ))}

                </div>


                {/* FOOTER */}
                <div className="premium-order-bottom">

                  <div className="order-items-count">

                    <span>
                      ITEMS
                    </span>

                    <strong>
                      {order.items?.length || 0}
                    </strong>

                  </div>


                  <div className="order-grand-total">

                    <span>
                      GRAND TOTAL
                    </span>

                    <strong>
                      ฿{Number(order.total).toFixed(2)}
                    </strong>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}

export default MyOrders;