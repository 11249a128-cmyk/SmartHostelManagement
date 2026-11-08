
import { useState } from "react";
import "./LoginPage.css";

const API_URL = "http://localhost:8080";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed. Check your details.");
        return;
      }

      onLogin({
        username: data.username,
        role: data.role,
      });
    } catch {
      setError("Cannot connect to the server. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-icon">🏠</div>
        <p className="login-eyebrow">SMART HOSTEL MANAGEMENT</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">
          Sign in to access your hostel dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your username"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-footer">
          Secure access for authorized hostel users
        </p>
      </section>
    </main>
  );
}