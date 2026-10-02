import axios from "axios";

const BASE_URL = "http://localhost:8080/api/notifications";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all notifications
export const getNotifications = (userId) => {
  return axios.get(`${BASE_URL}/${userId}`, {
    headers: getAuthHeaders(),
  });
};

// Get unread count
export const getUnreadCount = (userId) => {
  return axios.get(`${BASE_URL}/unread-count/${userId}`, {
    headers: getAuthHeaders(),
  });
};

// Mark one as read
export const markAsRead = (id) => {
  return axios.put(
    `${BASE_URL}/mark-as-read/${id}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

// Mark one as unread
export const markAsUnread = (id) => {
  return axios.put(
    `${BASE_URL}/mark-as-unread/${id}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

// Mark all as read
export const markAllAsRead = (userId) => {
  return axios.put(
    `${BASE_URL}/mark-as-read/all/${userId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

// Mark all as unread
export const markAllAsUnread = (userId) => {
  return axios.put(
    `${BASE_URL}/mark-as-unread/all/${userId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

// Delete one
export const deleteNotification = (id) => {
  return axios.delete(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Delete all
export const clearAllNotifications = (userId) => {
  return axios.delete(`${BASE_URL}/clear-all/${userId}`, {
    headers: getAuthHeaders(),
  });
};