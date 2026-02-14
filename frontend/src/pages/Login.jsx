import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthNavbar from "../components/AuthNavbar";
import "../styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    subdomain: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // FRONTEND-ONLY FIX (BACKEND SAFE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // Transform payload to EXACT backend contract
      await login({
        email: form.email,
        password: form.password,
        tenantSubdomain: form.subdomain, // BACKEND EXPECTS THIS
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthNavbar />

      <div className="auth-content">
        {/* LEFT INFO */}
        <div className="auth-info">
          <h1>Manage projects with ease</h1>
          <p>
            A secure multi-tenant platform to manage projects, tasks, and teams
            efficiently.
          </p>
        </div>

        {/* RIGHT CARD */}
        <div className="auth-card">
          <h2>Login</h2>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              name="subdomain"
              placeholder="Tenant Subdomain"
              value={form.subdomain}
              onChange={handleChange}
              required
            />

            <div className="auth-options">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Don’t have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
