import { createContext, useContext, useEffect, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

// Backend may return "ROLE_ADMIN" or "ADMIN" (and same for USER) — normalize once, here.
function normalizeRole(rawRole) {
  if (!rawRole) return null;
  const clean = rawRole.replace(/^ROLE_/, "").toUpperCase();
  if (clean === "ADMIN") return "ADMIN";
  if (clean === "USER") return "USER";
  return clean;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ledger_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("ledger_token");
    if (!token && user) {
      // Token was cleared elsewhere (e.g. 401 interceptor) — keep state in sync.
      setUser(null);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.post("/auth/login", { email, password });
      const role = normalizeRole(data.role);
      const sessionUser = { email: data.email, role, id: data.userId, fullName: data.fullName };

      localStorage.setItem("ledger_token", data.token);
      localStorage.setItem("ledger_user", JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
