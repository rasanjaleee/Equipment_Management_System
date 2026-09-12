import axios from 'axios';

// Automatically uses live Choreo backend in production/cloud, or localhost in local development
const CHOREO_BACKEND_URL = 'https://8c0a7554-4281-4356-8b7f-522782a0f64a-dev.e1-us-east-azure.choreoapis.dev/equipment-management-syst/backend-service/v1.0';

export const API_BASE_URL = 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : CHOREO_BACKEND_URL)
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');

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
