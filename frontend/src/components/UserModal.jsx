import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/usermodal.css";
import "../styles/users.css";

export default function UserModal({ user, onClose, onSaved }) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "tenant_admin";
  const [form, setForm] = useState({
    email: user?.email || "",
    fullName: user?.fullName || "",
    password: "",
    role: user?.role || "user",
    isActive: user?.isActive ?? true,
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      email: form.email,
      fullName: form.fullName,
      role: form.role,
      isActive: form.isActive,
    };

    if (!user) {
      payload.password = form.password;
    }

    if (user) {
      await api.put(`/users/${user.id}`, payload);
    } else {
      await api.post(`/tenants/${currentUser.tenant.id}/users`, payload);
    }


    onSaved();
    onClose();
  } catch (err) {
    console.error("User save failed:", err);
    alert(
      err.response?.data?.message ||
      "Failed to save user"
    );
  }

};


  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>{user ? "Edit User" : "Add User"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {!user && (
            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          <div className="modal-checkbox">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Active</label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-btn" type="submit" disabled={!isAdmin}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
