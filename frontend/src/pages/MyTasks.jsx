import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/tasks.css";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);

        //  get projects
        const projectsRes = await api.get("/projects");
        const projects = projectsRes.data.data.projects || [];

        // get tasks per project
        const taskRequests = projects.map(p =>
          api.get(`/projects/${p.id}/tasks`)
            .then(res =>
              res.data.data.tasks.map(t => ({
                ...t,
                projectName: p.name
              }))
            )
        );

        const results = await Promise.all(taskRequests);
        const allTasks = results.flat();

        setTasks(allTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const filtered = status
    ? tasks.filter(t => t.status === status)
    : tasks;

  if (loading) return <div className="page-loading">Loading tasks...</div>;

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1>My Tasks</h1>

        <div className="filters">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No tasks assigned to you</div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.projectName}</td>
                  <td>
                    <span className={`badge ${task.status}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className={`priority ${task.priority}`}>
                    {task.priority}
                  </td>
                  <td>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
