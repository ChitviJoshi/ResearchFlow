import { createContext, useState, useEffect } from "react";
import * as authApi from "./services/auth.api";

export const AuthContext = createContext(null);

// login/signup return `id` but /auth/me returns `_id`; keep one shape across the app
const normalizeUser = (u) => (u ? { ...u, _id: u._id || u.id } : u);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        setUser(normalizeUser(res.data.user));
        setToken(savedToken);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signup = async (data) => {
    const res = await authApi.signup(data);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(normalizeUser(res.data.user));
  };

  const login = async (data) => {
    const res = await authApi.login(data);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(normalizeUser(res.data.user));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};