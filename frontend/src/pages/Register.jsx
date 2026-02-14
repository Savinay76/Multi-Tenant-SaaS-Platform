import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import api from "../services/api";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // CLIENT-SIDE VALIDATION
  const validate = () => {
    if (!form.organizationName) return "Organization name is required";
    if (!form.subdomain) return "Subdomain is required";
    if (!form.adminEmail) return "Admin email is required";
    if (!form.adminFullName) return "Admin full name is required";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";
    if (!form.terms)
      return "You must accept Terms & Conditions";
    return null;
  };

  // REGISTER SUBMIT (MATCHES BACKEND EXACTLY)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // PAYLOAD MATCHES STEP 3.1 API CONTRACT
      await api.post("/auth/register-tenant", {
        tenantName: form.organizationName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminPassword: form.password,
        adminFullName: form.adminFullName,
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
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
          <h1>Create your organization</h1>
          <p>
            Register your company and start managing projects, tasks,
            and teams securely with role-based access.
          </p>
        </div>

        {/* RIGHT CARD */}
        <div className="auth-card">
          <h2>Register Organization</h2>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <input
              name="organizationName"
              placeholder="Organization Name"
              value={form.organizationName}
              onChange={handleChange}
              required
            />

            {/* SUBDOMAIN */}
            <div className="subdomain-group">
              <input
                name="subdomain"
                placeholder="Subdomain"
                value={form.subdomain}
                onChange={handleChange}
                required
              />
              <span className="subdomain-suffix">.yourapp.com</span>
            </div>

            <input
              type="email"
              name="adminEmail"
              placeholder="Admin Email"
              value={form.adminEmail}
              onChange={handleChange}
              required
            />

            <input
              name="adminFullName"
              placeholder="Admin Full Name"
              value={form.adminFullName}
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
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {/* TERMS */}
            <div className="auth-options">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I accept Terms & Conditions
              </label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
