import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import EditProjectInline from "../components/EditProjectInline";
import "../styles/projectDetails.css";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  });

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  /* =========================
     LOAD PROJECT + TASKS
  ========================= */
  const loadData = async () => {
  try {
    setLoading(true);

    // Get all projects (backend-supported)
    const projectsRes = await api.get("/projects");
    const projects = projectsRes.data.data.projects || [];

    const foundProject = projects.find(p => p.id === projectId);

    if (!foundProject) {
      setProject(null);
      return;
    }

    setProject(foundProject);

    // Get tasks for this project
    const taskRes = await api.get(`/projects/${projectId}/tasks`);
    setTasks(taskRes.data.data.tasks || []);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadData();
  }, [projectId]);

  /* =========================
     DELETE PROJECT
  ========================= */
  const deleteProject = async () => {
    if (!window.confirm("Delete this project permanently?")) return;
    await api.delete(`/projects/${projectId}`);
    navigate("/projects");
  };

  /* =========================
     DELETE TASK
  ========================= */
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${taskId}`);
    loadData();
  };

  /* =========================
     UPDATE TASK STATUS
  ========================= */
  const updateTaskStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    loadData();
  };

  /* =========================
     FILTER TASKS
  ========================= */
  const filteredTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.assignedTo && t.assignedTo?.id !== filters.assignedTo) return false;
    return true;
  });

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!project) return <div className="page-loading">Project not found</div>;

  return (
    <>
      <Navbar />
      <div className="app-container">
        <div className="project-wrapper">
          {/* ================= PROJECT HEADER ================= */}
          <div className="project-header">
            <div>
              <EditProjectInline project={project} onUpdated={loadData} />
              <p className="project-desc">
                {project.description || "No description"}
              </p>
            </div>

            <div className="project-actions">
              <span className={`status ${project.status}`}>
                {project.status}
              </span>
              <button className="danger-btn" onClick={deleteProject}>
                Delete Project
              </button>
            </div>
          </div>

          {/* ================= TASKS ================= */}
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Tasks</h2>
              <button
                className="primary-btn"
                onClick={() => {
                  setEditingTask(null);
                  setTaskModalOpen(true);
                }}
              >
                + Add Task
              </button>
            </div>

            {/* ================= FILTERS ================= */}
            <div className="task-filters">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select
                value={filters.assignedTo}
                onChange={(e) =>
                  setFilters({ ...filters, assignedTo: e.target.value })
                }
              >
                <option value="">All Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= TASK TABLE ================= */}
            {filteredTasks.length === 0 ? (
              <div className="empty-state">No tasks found</div>
            ) : (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned</th>
                    <th>Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td data-label="Title">{task.title}</td>

                      <td data-label="Status">
                        <span className={`badge ${task.status}`}>
                          {task.status}
                        </span>
                      </td>

                      <td data-label="Priority">
                        <span className={`priority ${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>

                      <td data-label="Assigned">
                        {task.assignedTo?.fullName || "—"}
                      </td>

                      <td data-label="Due">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "—"}
                      </td>

                      <td data-label="Actions" className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatus(task.id, e.target.value)
                          }
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setTaskModalOpen(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() => deleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ================= MODAL ================= */}
          {taskModalOpen && (
            <TaskModal
              projectId={projectId}
              task={editingTask}
              onClose={() => setTaskModalOpen(false)}
              onSaved={loadData}
            />
          )}
        </div>
      </div>
    </>
  );
}
