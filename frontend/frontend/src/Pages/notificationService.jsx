import axios from "axios";
import { API_BASE_URL } from "../services/api";

const BASE_URL = `${API_BASE_URL}/api/notifications`;

export const getNotifications = (userId) => {
    return axios.get(`${BASE_URL}/${userId}`);
};

export const getUnreadCount = (userId) => {
    return axios.get(`${BASE_URL}/unread-count/${userId}`);
};

export const markAsRead = (id) => {
    return axios.put(`${BASE_URL}/mark-as-read/${id}`);
};