import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Trash2, CheckCircle, Clock, AlertCircle, Info } from "lucide-react";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [sorting, setSorting] = useState("newest");

  const loggedInUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();
  const userId = loggedInUser?.id;

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchNotifications = async () => {
    if (!userId) {
      setLoading(false);
      setError("User not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`/api/notifications/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else if (res.data?.notifications && Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle single notification read/unread
  const handleToggleRead = async (notificationId, currentReadState) => {
    try {
      const endpoint = currentReadState
        ? `/api/notifications/mark-as-unread/${notificationId}`
        : `/api/notifications/mark-as-read/${notificationId}`;

      await axios.put(endpoint, {}, { headers: getAuthHeaders() });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read: !currentReadState }
            : notif
        )
      );
    } catch (err) {
      console.error("Failed to toggle read state:", err);
      setError("Failed to update notification. Please try again.");
    }
  };

  // Mark ALL as read
  const handleMarkAllAsRead = async () => {
    try {
      // Use bulk endpoint if available, otherwise loop
      try {
        await axios.put(
          `/api/notifications/mark-as-read/all/${userId}`,
          {},
          { headers: getAuthHeaders() }
        );
      } catch {
        const unread = notifications.filter((n) => !n.read);
        await Promise.all(
          unread.map((notif) =>
            axios.put(
              `/api/notifications/mark-as-read/${notif.id}`,
              {},
              { headers: getAuthHeaders() }
            )
          )
        );
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setError("Failed to mark all as read. Please try again.");
    }
  };

  // Mark ALL as unread
  const handleMarkAllAsUnread = async () => {
    try {
      // Use bulk endpoint if available, otherwise loop
      try {
        await axios.put(
          `/api/notifications/mark-as-unread/all/${userId}`,
          {},
          { headers: getAuthHeaders() }
        );
      } catch {
        const read = notifications.filter((n) => n.read);
        await Promise.all(
          read.map((notif) =>
            axios.put(
              `/api/notifications/mark-as-unread/${notif.id}`,
              {},
              { headers: getAuthHeaders() }
            )
          )
        );
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: false }))
      );
    } catch (err) {
      console.error("Failed to mark all as unread:", err);
      setError("Failed to mark all as unread. Please try again.");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: getAuthHeaders(),
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError("Failed to delete notification. Please try again.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;

    try {
      // Use bulk endpoint if available, otherwise loop
      try {
        await axios.delete(`/api/notifications/clear-all/${userId}`, {
          headers: getAuthHeaders(),
        });
      } catch {
        await Promise.all(
          notifications.map((notif) =>
            axios.delete(`/api/notifications/${notif.id}`, {
              headers: getAuthHeaders(),
            })
          )
        );
      }

      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      setError("Failed to clear notifications. Please try again.");
    }
  };

  // Filter
  let filteredNotifications = notifications;
  if (filter === "unread") {
    filteredNotifications = notifications.filter((n) => !n.read);
  } else if (filter === "read") {
    filteredNotifications = notifications.filter((n) => n.read);
  }

  // Sort
  if (sorting === "newest") {
    filteredNotifications = [...filteredNotifications].sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp).getTime() -
        new Date(a.createdAt || a.timestamp).getTime()
    );
  } else if (sorting === "oldest") {
    filteredNotifications = [...filteredNotifications].sort(
      (a, b) =>
        new Date(a.createdAt || a.timestamp).getTime() -
        new Date(b.createdAt || b.timestamp).getTime()
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.length - unreadCount;

  const getNotificationIcon = (type) => {
    const baseClass = "w-5 h-5";
    switch (type?.toLowerCase()) {
      case "maintenance":
        return <Clock className={`${baseClass} text-blue-600`} />;
      case "equipment":
        return <AlertCircle className={`${baseClass} text-orange-600`} />;
      case "issuance":
        return <Info className={`${baseClass} text-purple-600`} />;
      case "alert":
        return <AlertCircle className={`${baseClass} text-red-600`} />;
      default:
        return <Bell className={`${baseClass} text-gray-600`} />;
    }
  };

  const getNotificationColor = (type, read) => {
    if (read) return "bg-white border-l-4 border-gray-200";
    switch (type?.toLowerCase()) {
      case "maintenance": return "bg-blue-50 border-l-4 border-blue-500";
      case "equipment":   return "bg-orange-50 border-l-4 border-orange-500";
      case "issuance":    return "bg-purple-50 border-l-4 border-purple-500";
      case "alert":       return "bg-red-50 border-l-4 border-red-500";
      default:            return "bg-gray-50 border-l-4 border-gray-300";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8 text-gray-600 text-center">
            Loading notifications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={32} className="text-yellow-500" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? (
              <>
                You have <span className="font-semibold">{unreadCount}</span>{" "}
                unread notification{unreadCount !== 1 ? "s" : ""}
              </>
            ) : (
              "All notifications are read"
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {["all", "unread", "read"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    filter === f
                      ? "bg-yellow-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 bg-white text-yellow-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort + bulk actions */}
            <div className="flex flex-wrap gap-2">
              <select
                value={sorting}
                onChange={(e) => setSorting(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* Mark All Read — only when there are unread */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm transition"
                >
                  Mark All Read
                </button>
              )}

              {/* Mark All Unread — only when there are read ones */}
              {readCount > 0 && (
                <button
                  onClick={handleMarkAllAsUnread}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm transition"
                >
                  Mark All Unread
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium text-sm transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 text-center">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {filter === "all"
                  ? "No notifications yet"
                  : filter === "unread"
                  ? "No unread notifications"
                  : "No read notifications"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationColor(
                  notification.type,
                  notification.read
                )} rounded-2xl shadow border p-4 transition hover:shadow-md`}
              >
                <div className="flex gap-4">

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold ${notification.read ? "text-gray-500" : "text-gray-900"}`}>
                          {notification.title || "Notification"}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message || notification.description || "-"}
                        </p>
                        {notification.details && (
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.details}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(notification.createdAt || notification.timestamp)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {!notification.read && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    {/* Toggle read/unread */}
                    <button
                      onClick={() => handleToggleRead(notification.id, notification.read)}
                      className={`p-2 rounded-lg transition ${
                        notification.read
                          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      title={notification.read ? "Mark as unread" : "Mark as read"}
                    >
                      <CheckCircle
                        size={18}
                        className={notification.read ? "text-blue-400" : ""}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}