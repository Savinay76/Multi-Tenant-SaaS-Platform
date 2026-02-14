import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProtectedLayout from "./layouts/ProtectedLayout";
import ProjectDetails from "./pages/ProjectDetails";
import MyTasks from "./pages/MyTasks";
import Users from "./pages/Users";
import Tenants from "./pages/Tenants";
import "./styles/layout.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedLayout>
                <Projects />
              </ProtectedLayout>
            }
          />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/tasks" element={<MyTasks />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenants"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <Tenants />
              </ProtectedRoute>
            }
          />

          {/* <Route path="/tenants" element={<Tenants />} />
          <Route path="*" element={<p>NO MATCH</p>} /> */}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
