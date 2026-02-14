import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProjectModal from "../components/ProjectModal";
import "../styles/projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const navigate = useNavigate();

  const loadProjects = async () => {
    setLoading(true);
    const res = await api.get("/projects", {
      params: status ? { status } : {},
    });
    const list = res.data.data.projects || [];
    setProjects(list);
    setFiltered(list);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [status]);

  useEffect(() => {
    const result = projects.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, projects]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    loadProjects();
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Projects</h1>
          <button className="primary-btn" onClick={() => setModalOpen(true)}>
            + New Project
          </button>
        </div>

        {/* FILTERS */}
        <div className="filters">
          <input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="page-loading">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No projects found</div>
        ) : (
          <div className="project-grid">
            {filtered.map((p) => (
              <div key={p.id} className="project-card">
                <h3>{p.name}</h3>
                <p>{p.description || "No description"}</p>

                <div className="meta">
                  <span className={`status ${p.status}`}>{p.status}</span>
                  <span>{p.taskCount || 0} Tasks</span>
                </div>

                <div className="footer">
                  <small>Created by {p.createdBy?.fullName || "—"}</small>
                  <small>{new Date(p.createdAt).toLocaleDateString()}</small>
                </div>

                <div className="actions">
                  <button onClick={() => navigate(`/projects/${p.id}`)}>
                    View
                  </button>
                  <button
                    onClick={() => {
                      setEditProject(p);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="danger" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {modalOpen && (
          <ProjectModal
            project={editProject}
            onClose={() => setModalOpen(false)}
            onSaved={loadProjects}
          />
        )}
      </div>
    </>
  );
}
