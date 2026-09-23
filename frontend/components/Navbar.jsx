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
  };

  if (name === "home") {
    return (
      <svg {...props}>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...props}>
        <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg {...props}>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg {...props}>
        <path d="M4 5h2l2 11h9l3-8H7" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </svg>
    );
  }

  return null;
}

function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") !== "light"
  );

  const location = useLocation();

  // ==========================================
  // CART COUNT
  // ==========================================

  const updateCartCount = () => {
    const cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const count = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );

    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );
    };
  }, []);

  // ==========================================
  // LOAD SAVED THEME
  // ==========================================

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      setDarkMode(false);
      document.body.classList.add("light-mode");
    } else {
      setDarkMode(true);
      document.body.classList.remove("light-mode");
    }
  }, []);

  // ==========================================
  // SWITCH DARK / LIGHT MODE
  // ==========================================

  const toggleTheme = () => {
    const newTheme = !darkMode;

    setDarkMode(newTheme);

    if (newTheme) {
      // DARK MODE
      localStorage.setItem("theme", "dark");
      document.body.classList.remove("light-mode");
    } else {
      // LIGHT MODE
      localStorage.setItem("theme", "light");
      document.body.classList.add("light-mode");
    }
  };

  // ==========================================
  // ACTIVE NAVIGATION
  // ==========================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ==========================================
  // NAVBAR
  // ==========================================

  return (
    <nav className="premium-navbar">

      {/* LOGO */}
      <Link to="/" className="premium-logo">

        <div className="logo-symbol">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="logo-text">
          <strong>CS TECH</strong>
          <small>STORE / 2026</small>
        </div>

      </Link>


      {/* NAVIGATION */}
      <div className="premium-nav-links">

        {/* HOME */}
        <Link
          to="/"
          className={
            isActive("/")
              ? "premium-nav-link active"
              : "premium-nav-link"
          }
        >
          <Icon name="home" />
          <span>Home</span>

          {isActive("/") && <i></i>}
        </Link>


        {/* MAP */}
        <Link
          to="/map"
          className={
            isActive("/map")
              ? "premium-nav-link active"
              : "premium-nav-link"
          }
        >
          <Icon name="map" />
          <span>Map</span>

          {isActive("/map") && <i></i>}
        </Link>


        {/* ORDERS */}
        <Link
          to="/orders"
          className={
            isActive("/orders")
              ? "premium-nav-link active"
              : "premium-nav-link"
          }
        >
          <Icon name="orders" />
          <span>Orders</span>

          {isActive("/orders") && <i></i>}
        </Link>


        {/* CART */}
        <Link
          to="/cart"
          className={
            isActive("/cart")
              ? "premium-nav-link cart-link active"
              : "premium-nav-link cart-link"
          }
        >
          <Icon name="cart" />

          <span>Cart</span>

          {cartCount > 0 && (
            <b className="premium-cart-badge">
              {cartCount}
            </b>
          )}

          {isActive("/cart") && <i></i>}
        </Link>

      </div>


      {/* RIGHT SIDE */}
      <div className="premium-nav-right">

        {/* DARK / LIGHT SWITCH */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark and light mode"
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? "☀" : "☾"}
        </button>


        {/* ONLINE STATUS */}
        <div className="premium-nav-status">
          <span className="online-dot"></span>
          <span>ONLINE</span>
        </div>

      </div>

    </nav>
  );
}

export default Navbar;