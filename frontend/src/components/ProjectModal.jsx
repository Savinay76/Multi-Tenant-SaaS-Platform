import { useState } from "react";
import api from "../services/api";
import "../styles/projectModal.css";

export default function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "active",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    if (project) {
      await api.put(`/projects/${project.id}`, form);
    } else {
      await api.post("/projects", form);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{project ? "Edit Project" : "Create Project"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Short project description"
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
