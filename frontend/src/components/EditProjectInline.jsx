import { useState } from "react";
import api from "../services/api";

export default function EditProjectInline({ project, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveChanges = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/projects/${project.id}`, {
        name,
        description,
      });
      setEditing(false);
      onUpdated(); // reload project details
    } catch (err) {
      setError("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="inline-project-view">
        <h1>{project.name}</h1>
        <p className="desc">{project.description || "No description"}</p>
        <button
          className="link-btn"
          onClick={() => setEditing(true)}
        >
          ✏️ Edit
        </button>
      </div>
    );
  }

  return (
    <div className="inline-project-edit">
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        value={name}
        placeholder="Project name"
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        value={description}
        placeholder="Project description"
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="inline-actions">
        <button
          type="button"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>

        <button
          className="primary-btn"
          onClick={saveChanges}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
