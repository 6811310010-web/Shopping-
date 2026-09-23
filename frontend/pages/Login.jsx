import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setLoggedIn }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", email);

    setLoggedIn(true);

    navigate("/");
  };

  return (
    <main className="login-page">
      <div className="login-box">
        <div className="login-logo">🛒</div>

        <h1>CS Tech Store</h1>

        <p>Login to continue shopping</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;