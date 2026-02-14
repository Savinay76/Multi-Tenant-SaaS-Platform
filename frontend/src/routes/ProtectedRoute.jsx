import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // 1. Not Logged In -> Go to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check (Case Insensitive Safety)
  if (roles && roles.length > 0) {
    const userRole = user.role ? user.role.toLowerCase() : "";
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access Denied: User role '${userRole}' is not in [${allowedRoles}]`);
      // Redirect unauthorized users to dashboard instead of crashing
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}