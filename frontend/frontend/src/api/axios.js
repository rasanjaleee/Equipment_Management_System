// src/api/axios.js
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // ✅ JWT doesn't use cookies
});

// ✅ Interceptor: Add JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ✅ Get JWT from localStorage
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ Add to Authorization header
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
      // Do not redirect on failed login attempts at /auth/login
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest) {
        console.error("❌ 401 Unauthorized - Token invalid or expired");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sessionTimeoutMinutes");
        delete axios.defaults.headers.common["Authorization"];
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login?reason=timeout";
        }
      }
    } else if (error.response?.status === 403) {
      console.error("❌ 403 Forbidden - Insufficient permissions");
    }
    return Promise.reject(error);
  }
);

export default api;
