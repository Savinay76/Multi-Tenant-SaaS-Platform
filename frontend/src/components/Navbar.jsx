import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <span className="logo" onClick={() => navigate("/dashboard")}>
          MultiTenant SaaS
        </span>
      </div>

      {/* HAMBURGER (MOBILE) */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* NAV LINKS */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>
            Projects
          </Link>
        </li>

        {/* REAL TASKS PAGE */}
        {(role === "tenant_admin" || role === "super_admin") && (
          <li>
            {/* <Link to="/tasks" onClick={() => setMenuOpen(false)}>
              Tasks
            </Link> */}
            <NavLink
              to="/tasks"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Tasks
            </NavLink>
          </li>
        )}

        {role === "tenant_admin" && (
          <li>
            <Link to="/users" onClick={() => setMenuOpen(false)}>
              Users
            </Link>
          </li>
        )}

        {role === "super_admin" && (
          <li>
            <Link to="/tenants" onClick={() => setMenuOpen(false)}>
              Tenants
            </Link>
          </li>
        )}
      </ul>

      {/* USER DROPDOWN */}
      <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
        <span className="user-name">
          {user?.fullName} <small>({role})</small>
        </span>

        {dropdownOpen && (
          <div className="dropdown">
            <button onClick={() => navigate("/profile")}>Profile</button>
            <button onClick={() => navigate("/settings")}>Settings</button>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
