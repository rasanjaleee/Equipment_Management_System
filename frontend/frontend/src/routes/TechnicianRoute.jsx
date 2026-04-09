import { Navigate } from "react-router-dom";

export default function TechnicianRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "TECHNICIAN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}