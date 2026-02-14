import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/tenants.css";
import Navbar from "../components/Navbar";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");

  // Edit modal
  const [editingTenant, setEditingTenant] = useState(null);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Log the response to debug (check your browser console)
      const res = await api.get("/tenants");
      console.log("API Response:", res.data); 

      // 2. Safely access the array
      const data = res.data?.data?.tenants || []; 

      setTenants(data);
      setFilteredTenants(data);
    } catch (err) {
      console.error("Load Error:", err);
      setError("Failed to load tenants. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Apply filters - CRASH PROOFED
  useEffect(() => {
    if (!tenants) return;
    
    let data = [...tenants];

    if (search) {
      data = data.filter((t) =>
        // Safely handle null names
        (t.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      data = data.filter(
        (t) => (t.status || "").toLowerCase() === status.toLowerCase()
      );
    }

    if (plan) {
      data = data.filter(
        (t) => (t.subscriptionPlan || "").toLowerCase() === plan.toLowerCase()
      );
    }

    setFilteredTenants(data);
  }, [search, status, plan, tenants]);

  if (loading) return <p className="page-loading">Loading tenants...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <>
      <Navbar />

      <div className="tenants-page">
        <h1 className="page-title">All Tenants</h1>

        {/* FILTER BAR */}
        <div className="tenant-filters">
          <input
            type="text"
            placeholder="Search tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
          </select>
        </div>

        {/* TENANT CARDS */}
        <div className="tenants-grid">
          {filteredTenants.length === 0 && (
            <p className="empty-text">No tenants match the current filters.</p>
          )}

          {filteredTenants.map((t) => (
            <div key={t.id} className="tenant-card">
              <div className="tenant-header">
                <h3>{t.name || "Unnamed Tenant"}</h3>
                {/* SAFE RENDER: prevent crash if status is null */}
                <span className={`status ${(t.status || "inactive").toLowerCase()}`}>
                  {(t.status || "UNKNOWN").toUpperCase()}
                </span>
              </div>

              <p className="subdomain">
                <strong>Subdomain:</strong> {t.subdomain}
              </p>

              <div className="badges">
                {/* SAFE RENDER: prevent crash if plan is null */}
                <span className={`plan ${(t.subscriptionPlan || "free").toLowerCase()}`}>
                  {t.subscriptionPlan || "FREE"} PLAN
                </span>
              </div>

              <div className="stats">
                <div>
                  <span className="stat-number">{t.totalUsers}</span>
                  <span className="stat-label">Users</span>
                </div>
                <div>
                  <span className="stat-number">{t.totalProjects}</span>
                  <span className="stat-label">Projects</span>
                </div>
              </div>

              <button
                className="edit-btn"
                onClick={() => setEditingTenant(t)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL - Pass handlers correctly */}
      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onUpdated={loadTenants}
        />
      )}
    </>
  );
}

// ... Keep your EditTenantModal code as is, it looked fine ...
function EditTenantModal({ tenant, onClose, onUpdated }) {
  // Initialize with fallback to avoid null warning
  const [plan, setPlan] = useState(tenant.subscriptionPlan || "FREE");
  const [status, setStatus] = useState(tenant.status || "active");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/tenants/${tenant.id}`, {
        subscription_plan: plan.toUpperCase(),
        status: status.toLowerCase(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      alert("Failed to update tenant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Tenant</h3>
        <label>Subscription Plan</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}