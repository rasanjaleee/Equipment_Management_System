import axios from "axios";

const BASE_URL = "http://localhost:8080/api/notifications";

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = (userId) => {
  return axios.get(`${BASE_URL}/${userId}`, {
    headers: getAuthHeaders(),
  });
};

export const getUnreadCount = (userId) => {
  return axios.get(`${BASE_URL}/unread-count/${userId}`, {
    headers: getAuthHeaders(),
  });
};

export const markAsRead = (id) => {
  return axios.put(
    `${BASE_URL}/mark-as-read/${id}`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
};
