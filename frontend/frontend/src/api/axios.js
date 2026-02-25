// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false, // ✅ JWT doesn't use cookies
});

// ✅ Interceptor: Add JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ✅ Get JWT from localStorage
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ Add to Authorization header
    } else {
      console.warn(
        "⚠️  No JWT token found. Request may fail with 401/403."
      );
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - Token invalid or expired");
      // Optional: Redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("❌ 403 Forbidden - Insufficient permissions");
      console.error("Your role doesn't have permission for this action");
    }
    return Promise.reject(error);
  }
);

export default api;