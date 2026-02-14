import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = async (data) => {
    const res = await api.post("/auth/login", data);
    localStorage.setItem("token", res.data.data.token);
    // Ensure we are setting the user object correctly
    setUser(res.data.data.user);
  };

  // LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      // Use navigate or window.location - window is safer for full clear
      window.location.href = "/login";
    }
  };

  // VERIFY TOKEN ON LOAD
  const loadUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get("/auth/me");
      
      // ⚠️ SAFETY CHECK: 
      // Sometimes APIs return { data: { user: {...} } } vs { data: { ... } }
      // We check if the response data has a nested 'user' property or is the user itself.
      const userData = res.data.data.user ? res.data.data.user : res.data.data;
      
      console.log("Current User Role:", userData?.role); // Debugging
      setUser(userData);
    } catch (error) {
      console.error("Load user failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);