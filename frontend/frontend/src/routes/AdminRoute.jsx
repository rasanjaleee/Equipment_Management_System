import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}