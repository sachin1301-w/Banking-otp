import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/403" replace />;
  return <Outlet />;
}

export function UserRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "USER") return <Navigate to="/403" replace />;
  return <Outlet />;
}

// Sends a logged-in user to the portal that matches their role, and
// keeps a logged-out visitor at login. Used at "/".
export function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />;
}
