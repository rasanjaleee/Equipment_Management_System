import axios from "axios";

const BASE_URL = "http://localhost:8080/api/notifications";

export const getNotifications = (userId) => {
    return axios.get(`${BASE_URL}/${userId}`);
};

export const getUnreadCount = (userId) => {
    return axios.get(`${BASE_URL}/unread-count/${userId}`);
};

export const markAsRead = (id) => {
    return axios.put(`${BASE_URL}/mark-as-read/${id}`);
};