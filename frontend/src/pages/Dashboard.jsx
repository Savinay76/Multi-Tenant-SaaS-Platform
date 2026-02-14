import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Load projects
        const projectRes = await api.get("/projects");
        const projectList = projectRes.data.data.projects || [];
        setProjects(projectList);

        // Load tasks from ALL projects
        const taskRequests = projectList.map((p) =>
          api.get(`/projects/${p.id}/tasks`)
        );

        const taskResponses = await Promise.all(taskRequests);

        const tasksWithProject = taskResponses.flatMap((res, idx) =>
          (res.data.data.tasks || []).map((task) => ({
            ...task,
            projectName: projectList[idx].name,
            projectId: projectList[idx].id,
          }))
        );

        setAllTasks(tasksWithProject);

        // My Tasks
        setMyTasks(
          tasksWithProject.filter(
            (task) => task.assignedTo?.id === user.id
          )
        );
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) loadDashboard();
  }, [user]);

  if (loading) {
    return <div className="page-loading">Loading dashboard…</div>;
  }

  const completedTasks = allTasks.filter(
    (t) => t.status === "completed"
  ).length;

  const pendingTasks = allTasks.filter(
    (t) => t.status !== "completed"
  ).length;

  return (
    <>

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          {/* HEADER */}
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Welcome back, {user.fullName}</p>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            <StatCard title="Total Projects" value={projects.length} />
            <StatCard title="Total Tasks" value={allTasks.length} />
            <StatCard
              title="Completed Tasks"
              value={completedTasks}
              type="success"
            />
            <StatCard
              title="Pending Tasks"
              value={pendingTasks}
              type="warning"
            />
          </div>

          {/* RECENT PROJECTS */}
          <Section title="Recent Projects">
            <div className="project-grid">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() =>
                    navigate(`/projects/${project.id}`)
                  }
                >
                  <h3>{project.name}</h3>
                  <span className={`status ${project.status}`}>
                    {project.status}
                  </span>
                  <p>{project.taskCount || 0} Tasks</p>
                </div>
              ))}
            </div>
          </Section>

          {/* MY TASKS */}
          <Section title="My Tasks">
            {myTasks.length === 0 ? (
              <div className="empty-state">
                No tasks assigned to you
              </div>
            ) : (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{task.projectName}</td>
                      <td className={`priority ${task.priority}`}>
                        {task.priority}
                      </td>
                      <td>
                        <span className={`badge ${task.status}`}>
                          {task.status}
                        </span>
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
          </Section>
        </div>
      </div>
    </>
  );
}

/* ---------- Reusable Components ---------- */

function StatCard({ title, value, type }) {
  return (
    <div className={`stat-card ${type || ""}`}>
      <h3>{value}</h3>
      <span>{title}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
