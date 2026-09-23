import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Icon({ name, size = 20 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "cart") {
    return (
      <svg {...props}>
        <path d="M4 5h2l2 11h9l3-8H7" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </svg>
    );
  }

  if (name === "minus") {
    return (
      <svg {...props}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...props}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 7V4h6v3" />
        <path d="M6 7l1 14h10l1-14" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...props}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "back") {
    return (
      <svg {...props}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    );
  }

  return null;
}

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    setCart(savedCart);
  }, []);

  const updateQuantity = (id, change) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + change,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const getImageUrl = (item) => {
    if (!item.image) return "";

    return `http://https://shopping-backend-6gpx.onrender.com/static/${item.image}`;
  };

  return (
    <main className="premium-cart-page">

      {/* HEADER */}

      <section className="cart-page-header">

        <div>

          <span className="page-kicker">
            04 / CART
          </span>

          <h1>
            Your
            <br />
            <strong>collection.</strong>
          </h1>

          <p>
            Review your selected products
            before checkout.
          </p>

        </div>

        <div className="cart-header-number">
          {String(itemCount).padStart(2, "0")}
          <span>ITEMS</span>
        </div>

      </section>


      {/* EMPTY CART */}

      {cart.length === 0 ? (

        <section className="empty-cart-premium">

          <div className="empty-cart-icon">
            <Icon name="cart" size={42} />
          </div>

          <span>
            CART / EMPTY
          </span>

          <h2>
            Nothing here yet.
          </h2>

          <p>
            Explore our collection and
            add something you like.
          </p>

          <button
            onClick={() => navigate("/")}
          >
            Explore products

            <Icon
              name="arrow"
              size={17}
            />
          </button>

        </section>

      ) : (

        <section className="cart-content-premium">

          {/* ITEMS */}

          <div className="cart-items-premium">

            <div className="cart-list-heading">

              <span>
                PRODUCT
              </span>

              <span>
                QUANTITY
              </span>

              <span>
                TOTAL
              </span>

            </div>


            {cart.map((item, index) => {

              const subtotal =
                Number(item.price) *
                item.quantity;

              return (
                <article
                  className="premium-cart-item"
                  key={item.id}
                >

                  <div className="cart-item-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>


                  <div className="cart-item-image">

                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>


                  <div className="cart-item-info">

                    <span>
                      {item.category ||
                        "PRODUCT"}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      ${Number(item.price).toFixed(2)}
                      {" "} / unit
                    </p>

                  </div>


                  <div className="premium-quantity">

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      <Icon
                        name="minus"
                        size={14}
                      />
                    </button>

                    <strong>
                      {item.quantity}
                    </strong>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                    >
                      <Icon
                        name="plus"
                        size={14}
                      />
                    </button>

                  </div>


                  <div className="cart-item-total">

                    <strong>
                      $
                      {subtotal.toFixed(2)}
                    </strong>

                    <button
                      className="cart-remove"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      <Icon
                        name="trash"
                        size={15}
                      />

                      Remove
                    </button>

                  </div>

                </article>
              );
            })}


            <button
              className="continue-shopping"
              onClick={() => navigate("/")}
            >
              <Icon
                name="back"
                size={16}
              />

              Continue shopping
            </button>

          </div>


          {/* SUMMARY */}

          <aside className="premium-cart-summary">

            <span className="summary-kicker">
              ORDER SUMMARY
            </span>

            <h2>
              Ready to
              <br />
              checkout?
            </h2>


            <div className="summary-line">
              <span>
                Products
              </span>

              <strong>
                {itemCount}
              </strong>
            </div>


            <div className="summary-line">
              <span>
                Subtotal
              </span>

              <strong>
                ${total.toFixed(2)}
              </strong>
            </div>


            <div className="summary-line">
              <span>
                Delivery
              </span>

              <strong>
                FREE
              </strong>
            </div>


            <div className="summary-divider"></div>


            <div className="summary-total">

              <span>
                TOTAL
              </span>

              <strong>
                ${total.toFixed(2)}
              </strong>

            </div>


            <button
              className="premium-checkout-button"
              onClick={() =>
                navigate("/checkout")
              }
            >
              Checkout

              <Icon
                name="arrow"
                size={17}
              />
            </button>


            <div className="secure-note">

              <span></span>

              Secure checkout

            </div>

          </aside>

        </section>
      )}

    </main>
  );
}

export default Cart;