import axios from 'axios';

// Automatically uses environment variable or defaults to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Universal helper for rendering images and QR codes (supports both Cloudinary HTTPS URLs and local paths)
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}/${path}`;
};

// Pre-configured Axios instance with Base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token to every outgoing request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
