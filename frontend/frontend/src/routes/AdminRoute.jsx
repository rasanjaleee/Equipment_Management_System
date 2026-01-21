import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  console.log("AdminRoute - User:", user);
  console.log("AdminRoute - Role:", user?.role);

  if (!user || user.role !== "ADMIN") {
    console.log("AdminRoute - Access denied, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("AdminRoute - Access granted");
  return children;
}