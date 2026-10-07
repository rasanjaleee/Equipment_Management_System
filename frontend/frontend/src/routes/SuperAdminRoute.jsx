import { Navigate } from "react-router-dom";

export default function SuperAdminRoute({ children }) {
  const normalizeRole = (value) => String(value || "").replace(/^ROLE_/i, "").toUpperCase();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = normalizeRole(user?.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "SUPER_ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}