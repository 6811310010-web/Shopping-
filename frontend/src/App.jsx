import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "../pages/home";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import MyOrders from "../pages/MyOrders";
import Login from "../pages/Login";
import Map from "../pages/Map";

import Navbar from "../components/Navbar";

import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  return (
    <BrowserRouter>

      {loggedIn && <Navbar />}

      <Routes>

        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate to="/" />
            ) : (
              <Login setLoggedIn={setLoggedIn} />
            )
          }
        />

        <Route
          path="/"
          element={
            loggedIn ? <Home /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/cart"
          element={
            loggedIn ? <Cart /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/checkout"
          element={
            loggedIn ? <Checkout /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/order-success"
          element={
            loggedIn ? <OrderSuccess /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/orders"
          element={
            loggedIn ? <MyOrders /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/map"
          element={
            loggedIn ? <Map /> : <Navigate to="/login" />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;