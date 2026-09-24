import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="m3 11 9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "map":
      return (
        <svg {...props}>
          <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
          <path d="M9 3v15" />
          <path d="M15 6v15" />
        </svg>
      );

    case "orders":
      return (
        <svg {...props}>
          <path d="M4 5h16v14H4z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
      );

    case "cart":
      return (
        <svg {...props}>
          <path d="M4 5h2l2 11h9l3-8H7" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="17" cy="20" r="1" />
        </svg>
      );

    default:
      return null;
  }
}

function Navbar() {
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  // ==========================================
  // CART COUNT
  // ==========================================

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (!Array.isArray(cart)) {
        setCartCount(0);
        return;
      }

      const count = cart.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      );

      setCartCount(count);
    } catch (error) {
      console.error("Could not read cart:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    window.addEventListener(
      "storage",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  // ==========================================
  // APPLY THEME
  // ==========================================

  useEffect(() => {
    document.body.classList.toggle(
      "light-mode",
      !darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // ==========================================
  // THEME SWITCH
  // ==========================================

  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };

  // ==========================================
  // ACTIVE PAGE
  // ==========================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ==========================================
  // NAVBAR
  // ==========================================

  return (
    <nav
      className="premium-navbar"
      aria-label="Main navigation"
    >
      {/* ==============================
          LOGO
      ============================== */}

      <Link
        to="/"
        className="premium-logo"
        aria-label="CS Tech Store home"
      >
        <div
          className="logo-symbol"
          aria-hidden="true"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="logo-text">
          <strong>CS TECH</strong>
          <small>STORE / 2026</small>
        </div>
      </Link>

      {/* ==============================
          NAVIGATION
      ============================== */}

      <div className="premium-nav-links">
        {/* HOME */}

        <Link
          to="/"
          className={`premium-nav-link ${
            isActive("/") ? "active" : ""
          }`}
          aria-current={
            isActive("/") ? "page" : undefined
          }
        >
          <Icon name="home" />

          <span>Home</span>

          {isActive("/") && <i aria-hidden="true"></i>}
        </Link>

        {/* MAP */}

        <Link
          to="/map"
          className={`premium-nav-link ${
            isActive("/map") ? "active" : ""
          }`}
          aria-current={
            isActive("/map") ? "page" : undefined
          }
        >
          <Icon name="map" />

          <span>Map</span>

          {isActive("/map") && (
            <i aria-hidden="true"></i>
          )}
        </Link>

        {/* ORDERS */}

        <Link
          to="/orders"
          className={`premium-nav-link ${
            isActive("/orders") ? "active" : ""
          }`}
          aria-current={
            isActive("/orders") ? "page" : undefined
          }
        >
          <Icon name="orders" />

          <span>Orders</span>

          {isActive("/orders") && (
            <i aria-hidden="true"></i>
          )}
        </Link>

        {/* CART */}

        <Link
          to="/cart"
          className={`premium-nav-link cart-link ${
            isActive("/cart") ? "active" : ""
          }`}
          aria-current={
            isActive("/cart") ? "page" : undefined
          }
        >
          <Icon name="cart" />

          <span>Cart</span>

          {cartCount > 0 && (
            <b
              className="premium-cart-badge"
              aria-label={`${cartCount} items in cart`}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </b>
          )}

          {isActive("/cart") && (
            <i aria-hidden="true"></i>
          )}
        </Link>
      </div>

      {/* ==============================
          RIGHT SIDE
      ============================== */}

      <div className="premium-nav-right">
        {/* THEME */}

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          <span aria-hidden="true">
            {darkMode ? "☀" : "☾"}
          </span>
        </button>

        {/* ONLINE STATUS */}

        <div
          className="premium-nav-status"
          aria-label="Store online"
        >
          <span
            className="online-dot"
            aria-hidden="true"
          ></span>

          <span>ONLINE</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;