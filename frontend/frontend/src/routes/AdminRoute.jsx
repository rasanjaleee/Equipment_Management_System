import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const rawUser = localStorage.getItem("user");
  const normalizeRole = (value) => String(value || "").replace(/^ROLE_/i, "").toUpperCase();
  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  const role = normalizeRole(user?.role);

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}