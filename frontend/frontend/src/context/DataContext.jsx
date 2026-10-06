import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const [laboratories, setLaboratories] = useState([]);
  const [loadingLaboratories, setLoadingLaboratories] = useState(false);

  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);

  const [borrowRequests, setBorrowRequests] = useState([]);
  const [issuances, setIssuances] = useState([]);
  const [loadingIssuance, setLoadingIssuance] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [settings, setSettings] = useState(null);

  // Helper for auth headers
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch Equipment
  const refreshEquipment = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingEquipment(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/equipment/all`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setEquipmentList(data);
      return data;
    } catch (err) {
      console.error('Failed to load equipment list:', err);
      return [];
    } finally {
      setLoadingEquipment(false);
    }
  }, []);

  // 2. Fetch Laboratories
  const refreshLaboratories = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingLaboratories(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/lab`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setLaboratories(data);
      return data;
    } catch (err) {
      try {
        const fallbackRes = await axios.get(`${API_BASE_URL}/api/laboratories`, {
          headers: getHeaders(),
        });
        const data = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
        setLaboratories(data);
        return data;
      } catch (e) {
        console.error('Failed to load laboratories:', err);
        return [];
      }
    } finally {
      setLoadingLaboratories(false);
    }
  }, []);

  // 3. Fetch Maintenance
  const refreshMaintenance = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingMaintenance(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/maintenance`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setMaintenanceList(data);
      return data;
    } catch (err) {
      console.error('Failed to load maintenance:', err);
      return [];
    } finally {
      setLoadingMaintenance(false);
    }
  }, []);

  // 4. Fetch Activity Logs
  const refreshActivityLogs = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingActivityLogs(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/activity-logs`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setActivityLogs(data);
      return data;
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      return [];
    } finally {
      setLoadingActivityLogs(false);
    }
  }, []);

  // 5. Fetch Borrow Requests & Issuances
  const refreshBorrowRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/borrow-requests`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setBorrowRequests(data);
      return data;
    } catch (err) {
      console.error('Failed to load borrow requests:', err);
      return [];
    }
  }, []);

  const refreshIssuances = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingIssuance(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/issuances`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setIssuances(data);
      return data;
    } catch (err) {
      console.error('Failed to load issuances:', err);
      return [];
    } finally {
      setLoadingIssuance(false);
    }
  }, []);

  // 6. Fetch Admin Users
  const refreshUsers = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
      return data;
    } catch (err) {
      console.error('Failed to load users:', err);
      return [];
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // 7. Fetch Notifications
  const refreshNotifications = useCallback(async (userId, showLoading = false) => {
    if (!userId) return [];
    if (showLoading) setLoadingNotifications(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications/${userId}`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.notifications && Array.isArray(res.data.notifications)
        ? res.data.notifications
        : [];
      setNotifications(data);
      return data;
    } catch (err) {
      console.error('Failed to load notifications:', err);
      return [];
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // 8. Fetch Admin Settings
  const refreshSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/settings`, {
        headers: getHeaders(),
      });
      if (res?.data) {
        setSettings(res.data);
        return res.data;
      }
      return null;
    } catch (err) {
      console.warn('Could not load settings:', err);
      return null;
    }
  }, []);

  // 9. Fetch GRN Report
  const [grnData, setGrnData] = useState([]);
  const [loadingGrn, setLoadingGrn] = useState(false);

  const refreshGrn = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingGrn(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reports/grn`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setGrnData(data);
      return data;
    } catch (err) {
      console.error('Failed to load GRN report:', err);
      return [];
    } finally {
      setLoadingGrn(false);
    }
  }, []);

  // Initial load when provider mounts
  useEffect(() => {
    refreshEquipment(true);
    refreshLaboratories(false);
    const token = localStorage.getItem('token');
    if (token) {
      refreshMaintenance(false);
      refreshBorrowRequests();
      refreshIssuances(false);
    }
  }, [refreshEquipment, refreshLaboratories, refreshMaintenance, refreshBorrowRequests, refreshIssuances]);

  const value = {
    equipmentList,
    setEquipmentList,
    loadingEquipment,
    refreshEquipment,

    laboratories,
    setLaboratories,
    loadingLaboratories,
    refreshLaboratories,

    maintenanceList,
    setMaintenanceList,
    loadingMaintenance,
    refreshMaintenance,

    activityLogs,
    setActivityLogs,
    loadingActivityLogs,
    refreshActivityLogs,

    borrowRequests,
    setBorrowRequests,
    issuances,
    setIssuances,
    loadingIssuance,
    refreshBorrowRequests,
    refreshIssuances,

    users,
    setUsers,
    loadingUsers,
    refreshUsers,

    notifications,
    setNotifications,
    loadingNotifications,
    refreshNotifications,

    settings,
    setSettings,
    refreshSettings,

    grnData,
    setGrnData,
    loadingGrn,
    refreshGrn,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    return {
      equipmentList: [],
      loadingEquipment: false,
      refreshEquipment: async () => [],
      laboratories: [],
      loadingLaboratories: false,
      refreshLaboratories: async () => [],
      maintenanceList: [],
      loadingMaintenance: false,
      refreshMaintenance: async () => [],
      activityLogs: [],
      loadingActivityLogs: false,
      refreshActivityLogs: async () => [],
      borrowRequests: [],
      issuances: [],
      loadingIssuance: false,
      refreshBorrowRequests: async () => [],
      refreshIssuances: async () => [],
      users: [],
      loadingUsers: false,
      refreshUsers: async () => [],
      notifications: [],
      loadingNotifications: false,
      refreshNotifications: async () => [],
      settings: null,
      refreshSettings: async () => null,
      grnData: [],
      loadingGrn: false,
      refreshGrn: async () => [],
    };
  }
  return context;
};

export default DataContext;
