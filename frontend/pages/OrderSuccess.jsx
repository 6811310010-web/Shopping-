import React from "react";
import { Link, useLocation } from "react-router-dom";

const BACKEND_URL = "https://shopping-backend-6gpx.onrender.com";

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  let imagePath = String(image).trim();

  // Convert Windows path to web path
  imagePath = imagePath.replace(/\\/g, "/");

  // Remove unnecessary beginning parts
  imagePath = imagePath.replace(/^https?:\/\/[^/]+/i, "");
  imagePath = imagePath.replace(/^\/+/, "");

  // If the image already contains /static/, remove it
  imagePath = imagePath.replace(/^static\//i, "");

  // Make sure it starts with images/
  if (!imagePath.toLowerCase().startsWith("images/")) {
    imagePath = `images/${imagePath}`;
  }

  // Encode spaces and special characters but keep /
  imagePath = imagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${BACKEND_URL}/static/${imagePath}`;
}

export default function OrderSuccess() {
  const location = useLocation();

  /*
    Order information can come from:
    1. React Router state
    2. localStorage
  */

  const orderFromState = location.state?.order;

  let savedOrder = null;

  try {
    const stored = localStorage.getItem("lastOrder");

    if (stored) {
      savedOrder = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading last order:", error);
  }

  const order = orderFromState || savedOrder;

  if (!order) {
    return (
      <div className="order-success-page">
        <div className="order-success-container">
          <div className="success-icon">⚠️</div>

          <h1>Order Information Not Found</h1>

          <p>
            We could not find your recent order information.
          </p>

          <Link to="/" className="continue-shopping-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];

  const orderId =
    order.order_id ||
    order.orderId ||
    order._id ||
    "N/A";

  const customerName =
    order.customer_name ||
    order.customerName ||
    order.name ||
    "Customer";

  const customerEmail =
    order.customer_email ||
    order.customerEmail ||
    order.email ||
    "";

  const total =
    order.total ||
    order.total_amount ||
    order.totalAmount ||
    items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      return sum + price * quantity;
    }, 0);

  return (
    <div className="order-success-page">

      <div className="order-success-container">

        {/* SUCCESS HEADER */}
        <div className="success-header">

          <div className="success-icon">
            ✓
          </div>

          <h1>Order Successful!</h1>

          <p>
            Thank you, {customerName}! Your order has been placed successfully.
          </p>

          {orderId !== "N/A" && (
            <p className="order-number">
              Order ID: <strong>{orderId}</strong>
            </p>
          )}

        </div>


        {/* CUSTOMER INFORMATION */}
        <div className="order-info-card">

          <h2>Order Information</h2>

          <div className="customer-info">

            <div>
              <span>Name</span>
              <strong>{customerName}</strong>
            </div>

            {customerEmail && (
              <div>
                <span>Email</span>
                <strong>{customerEmail}</strong>
              </div>
            )}

            <div>
              <span>Status</span>
              <strong className="status">
                Confirmed
              </strong>
            </div>

          </div>

        </div>


        {/* ORDER ITEMS */}
        <div className="order-items-card">

          <h2>Your Order</h2>

          {items.length === 0 ? (
            <p>No products found in this order.</p>
          ) : (
            <div className="order-items">

              {items.map((item, index) => {

                const image =
                  item.image ||
                  item.image_url ||
                  item.imageUrl ||
                  "";

                const name =
                  item.name ||
                  item.product_name ||
                  item.productName ||
                  "Product";

                const price =
                  Number(item.price) || 0;

                const quantity =
                  Number(item.quantity) || 1;

                return (
                  <div
                    className="order-item"
                    key={item.id || item.product_id || index}
                  >

                    {/* PRODUCT IMAGE */}
                    <div className="order-item-image">

                      {image ? (
                        <img
                          src={getImageUrl(image)}
                          alt={name}
                          onError={(e) => {
                            console.error(
                              "Image failed:",
                              image,
                              getImageUrl(image)
                            );

                            e.currentTarget.style.display = "none";

                            const fallback =
                              e.currentTarget.parentElement.querySelector(
                                ".image-fallback"
                              );

                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className="image-fallback"
                        style={{
                          display: image ? "none" : "flex"
                        }}
                      >
                        🛍️
                      </div>

                    </div>


                    {/* PRODUCT DETAILS */}
                    <div className="order-item-details">

                      <h3>{name}</h3>

                      <p>
                        Quantity: {quantity}
                      </p>

                      <p>
                        Price: ฿{price.toLocaleString()}
                      </p>

                    </div>


                    {/* ITEM TOTAL */}
                    <div className="order-item-total">

                      <strong>
                        ฿{(price * quantity).toLocaleString()}
                      </strong>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>


        {/* TOTAL */}
        <div className="order-total-card">

          <div className="total-row">

            <span>Total</span>

            <strong>
              ฿{Number(total).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* BUTTONS */}
        <div className="order-actions">

          <Link
            to="/"
            className="continue-shopping-btn"
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="view-orders-btn"
          >
            My Orders
          </Link>

        </div>

      </div>


      {/* PAGE CSS */}
      <style>{`

        .order-success-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 50px 20px;
          box-sizing: border-box;
        }

        .order-success-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        .success-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .success-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #22c55e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: bold;
          margin: 0 auto 20px;
        }

        .success-header h1 {
          margin: 0 0 10px;
          font-size: 34px;
          color: #111827;
        }

        .success-header p {
          margin: 6px 0;
          color: #6b7280;
          font-size: 16px;
        }

        .order-number {
          margin-top: 15px !important;
          color: #111827 !important;
        }

        .order-info-card,
        .order-items-card,
        .order-total-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
        }

        .order-info-card h2,
        .order-items-card h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #111827;
        }

        .customer-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .customer-info div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .customer-info span {
          color: #6b7280;
          font-size: 14px;
        }

        .customer-info strong {
          color: #111827;
        }

        .status {
          color: #16a34a !important;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item-image {
          width: 90px;
          height: 90px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #f3f4f6;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .order-item-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .image-fallback {
          position: absolute;
          inset: 0;
          align-items: center;
          justify-content: center;
          font-size: 35px;
          background: #f3f4f6;
        }

        .order-item-details {
          flex: 1;
        }

        .order-item-details h3 {
          margin: 0 0 8px;
          color: #111827;
          font-size: 18px;
        }

        .order-item-details p {
          margin: 4px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .order-item-total {
          font-size: 18px;
          color: #111827;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 22px;
        }

        .total-row strong {
          color: #111827;
          font-size: 26px;
        }

        .order-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 25px;
        }

        .continue-shopping-btn,
        .view-orders-btn {
          text-decoration: none;
          padding: 13px 25px;
          border-radius: 10px;
          font-weight: 600;
          transition: 0.2s;
        }

        .continue-shopping-btn {
          background: #111827;
          color: white;
        }

        .view-orders-btn {
          background: white;
          color: #111827;
          border: 1px solid #d1d5db;
        }

        .continue-shopping-btn:hover,
        .view-orders-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 700px) {

          .customer-info {
            grid-template-columns: 1fr;
          }

          .order-item {
            gap: 12px;
          }

          .order-item-image {
            width: 70px;
            height: 70px;
          }

          .order-item-total {
            font-size: 15px;
          }

          .order-actions {
            flex-direction: column;
          }

          .continue-shopping-btn,
          .view-orders-btn {
            text-align: center;
          }

        }

      `}</style>

    </div>
  );
}