import { useState } from "react";
import api from "../services/api";
import "../styles/taskModal.css"; 
export default function TaskModal({ projectId, task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    status: task?.status || "todo",
    assignedTo: task?.assignedTo?.id || "",
    dueDate: task?.dueDate || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (task) {
      await api.put(`/tasks/${task.id}`, form);
    } else {
      await api.post(`/projects/${projectId}/tasks`, form);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* HEADER */}
        <div className="modal-header">
          <h2>{task ? "Edit Task" : "Create Task"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="task-form">
          {/* TITLE */}
          <div className="form-group">
            <label>Task Title</label>
            <input
              placeholder="Enter task title"
              required
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Optional task description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* GRID */}
          <div className="form-grid">
            <div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-btn" type="submit">
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
