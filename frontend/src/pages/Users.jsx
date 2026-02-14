import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import UserModal from "../components/UserModal";
import { useAuth } from "../context/AuthContext";
import "../styles/users.css";
import "../styles/usermodal.css";

export default function Users() {
  const { user } = useAuth();
  const isAdmin = user?.role === "tenant_admin";

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  /* =========================
     LOAD USERS
  ========================= */
  const loadUsers = async () => {
    try {
      setLoading(true);

      const tenantId = user?.tenant?.id;
      if (!tenantId) return;

      const res = await api.get(`/tenants/${tenantId}/users`);
      const list = res.data.data.users || [];

      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenant?.id) {
      loadUsers();
    }
  }, [user]);

  /* =========================
     FILTER USERS
  ========================= */
  useEffect(() => {
    let data = [...users];

    if (search) {
      data = data.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter) {
      data = data.filter((u) => u.role === roleFilter);
    }

    setFiltered(data);
  }, [search, roleFilter, users]);

  /* =========================
     DELETE USER
  ========================= */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert("Not authorized to delete user");
    }
  };

  if (loading) {
    return <div className="page-loading">Loading users…</div>;
  }

  return (
    <>
      <Navbar />

      <div className="users-wrapper">
        {/* HEADER */}
        <div className="users-header">
          <h1>Users</h1>

          {isAdmin && (
            <button
              className="primary-btn"
              onClick={() => {
                console.log("Add User clicked");
                setEditingUser(null);
                setModalOpen(true);
              }}
            >
              + Add User
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="user-filters">
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="tenant_admin">Tenant Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* TABLE */}
        {filtered.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>

                  <td>
                    <span className={`role ${u.role}`}>{u.role}</span>
                  </td>

                  <td>
                    <span
                      className={`status ${u.isActive ? "active" : "inactive"}`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>

                  <td className="actions">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            console.log("Edit user", u);
                            setEditingUser(u);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="danger"
                          onClick={() => deleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSaved={loadUsers}
        />
      )}
    </>
  );
}
