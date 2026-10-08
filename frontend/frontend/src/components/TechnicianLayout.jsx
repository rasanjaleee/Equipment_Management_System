import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Footer from "../components/Footer";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  LayoutDashboard,
  Wrench,
  History,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  PanelLeft,
  X,
  Bell,
  CalendarDays,
} from "lucide-react";
import {
  getNotifications,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
} from "../services/notificationService";
import { API_BASE_URL } from "../services/api";

export default function TechnicianLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const username = loggedInUser?.username || "Technician";
  const userId = loggedInUser?.id;
  const avatarLetter = username ? username.charAt(0).toUpperCase() : "T";

  // Initial Fetch of Notifications
  useEffect(() => {
    if (!userId) return;

    getNotifications(userId)
      .then((response) => {
        console.log("Technician notifications loaded:", response.data);
        setNotifications(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load technician notifications:", error);
      });
  }, [userId]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message) => {
    try {
      const newNotification = JSON.parse(message.body);
      console.log("Received technician real-time notification:", newNotification);

      setNotifications((prev) => [newNotification, ...prev]);
    } catch (error) {
      console.error("Error parsing WebSocket notification:", error);
    }
  }, []);

  // WebSocket Subscription
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("Connected to WebSocket (Technician Panel)");
        client.subscribe(
          `/topic/notifications/${userId}`,
          handleWebSocketMessage
        );
      },

      onStompError: (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId, handleWebSocketMessage]);

  // Helper to safely calculate unread status
  const isNotificationRead = (n) => {
    if (n.read !== undefined) return n.read;
    if (n.isRead !== undefined) return n.isRead;
    return n.status === "READ";
  };

  // Calculate total unread count
  const unreadCount = notifications.filter(
    (n) => !isNotificationRead(n)
  ).length;

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true, isRead: true, status: "READ" } : n
      )
    );

    markAsReadApi(id).catch((err) => {
      console.error("Failed to mark single notification as read:", err);
    });
  };

  const handleMarkAllAsRead = () => {
    if (!userId || unreadCount === 0) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true, status: "READ" }))
    );

    markAllAsReadApi(userId).catch((error) => {
      console.error("Failed to mark all as read:", error);
    });
  };

  const menu = [
    { to: "/technician/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/technician/equipment", label: "Equipment Status", icon: Wrench },
    { to: "/technician/maintenance", label: "Maintenance", icon: History },
    { to: "/technician/calendar", label: "Equipment Calendar", icon: CalendarDays },
    { to: "/technician/activity-log", label: "My Activity", icon: ClipboardList },
  ];

  const bottomMenu = [
    {
      to: "/technician/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount,
    },
  ];

  const titleMap = {
    "/technician/dashboard": "Technician Dashboard",
    "/technician/equipment": "Equipment Status",
    "/technician/maintenance": "Maintenance",
    "/technician/calendar": "Equipment Calendar",
    "/technician/activity-log": "My Activity",
    "/technician/notifications": "Notifications",
    "/technician/profile": "Profile",
  };

  const currentTitle = titleMap[location.pathname] || "Technician";

  const linkClass = ({ isActive }) =>
    `flex items-center ${
      sidebarOpen ? "gap-3 px-3 py-2" : "justify-center p-2"
    } rounded-lg cursor-pointer transition-all text-sm font-medium ${
      isActive
        ? "bg-yellow-500 text-white shadow-md"
        : "text-gray-700 hover:bg-orange-100"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/login");
  };

  const goProfile = () => {
    setDropdownOpen(false);
    navigate("/technician/profile");
  };

  const goNotifications = () => {
    setNotificationOpen(false);
    navigate("/technician/notifications");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
{mobileSidebarOpen && (
  <div
    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
    onClick={() => setMobileSidebarOpen(false)}
  />
)}
      {/* Sidebar */}
      <aside
  className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm z-50
    w-64
    ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    ${sidebarOpen ? "lg:w-56" : "lg:w-20"}
  `}
>
        <div
          className="px-3 border-b border-gray-200 h-20 flex items-center"
          style={{ backgroundColor: "#E89B00" }}
        >
          <div className="flex items-center gap-2 min-w-0 w-full">
            <img
              src="/images/home_logo.png"
              alt="University Logo"
              className="w-14 h-14 object-contain flex-shrink-0"
            />
            {sidebarOpen && (
              <div className="leading-tight min-w-0">
                <h1 className="text-[11px] font-bold text-white break-words">
                  Faculty of Engineering
                </h1>
                <p className="text-[11px] text-orange-100 break-words">
                  Technician Panel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Toggle Bar at the top of the sidebar */}
        <div
          className={`px-2 py-1.5 border-b border-gray-100 flex items-center ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          {sidebarOpen && (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              Menu
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-orange-100 rounded-lg transition flex items-center justify-center"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelLeft size={19} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={linkClass}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Menu (Notifications) */}
        <div className="px-2 py-2 border-t border-gray-200 space-y-1 flex-shrink-0">
          {bottomMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={linkClass}
                title={!sidebarOpen ? item.label : ""}
              >
                <div className="relative flex-shrink-0">
                  <Icon size={20} />
                  {!sidebarOpen && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
                </div>
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>

      {/* Main Container */}
      <div
      className={`min-h-screen flex flex-col transition-all duration-300 ml-0 ${
        sidebarOpen ? "lg:ml-56" : "lg:ml-20"
      }`}
    >
        {/* Header - Ensure overflow is visible for dropdowns */}
       <header
        className={`fixed top-0 right-0 left-0 ${
          sidebarOpen ? "lg:left-56" : "lg:left-20"
        } px-3 sm:px-4 lg:px-5 h-20 flex justify-between items-center shadow-md gap-2 sm:gap-4 z-30`}
        style={{ backgroundColor: "#E89B00" }}
      >
        {/* Mobile Menu Button */}
<button
  type="button"
  onClick={() => setMobileSidebarOpen(true)}
  className="lg:hidden flex items-center justify-center text-white shrink-0 p-2 hover:bg-white/10 rounded-lg transition"
  aria-label="Open menu"
  title="Open menu"
>
  <PanelLeft size={28} />
</button>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white truncate">
              {currentTitle}
            </h2>
            <p className="text-sm text-gray-100 mt-1">
              Welcome back, Technician!
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="relative p-2 text-white rounded-lg transition-colors hover:bg-orange-600/30"
                style={{ backgroundColor: "rgba(232, 155, 0, 0.7)" }}
                title="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border border-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[420px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden"
                  style={{ top: "100%" }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Notifications
                      </h3>
                      <p className="text-xs text-gray-500">
                        {unreadCount} unread notification
                        {unreadCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-orange-600 hover:text-orange-700 font-medium transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => {
                        const read = isNotificationRead(notification);
                        return (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition ${
                              !read ? "bg-orange-50/60" : "bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {notification.title || "Notification"}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 break-words">
                                  {notification.message || "No message content"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {notification.createdAt
                                    ? new Date(notification.createdAt).toLocaleString()
                                    : notification.receivedAt || ""}
                                </p>
                              </div>

                              {!read && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  className="text-[11px] text-orange-600 hover:underline flex-shrink-0 font-medium"
                                  title="Mark as read"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                    <button
                      type="button"
                      onClick={goNotifications}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 w-full py-1.5 transition"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="w-px h-6 opacity-50"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            ></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "rgba(232, 155, 0, 0.7)" }}
              >
                <div
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-bold shadow-md"
                  style={{ color: "#E89B00" }}
                >
                  {avatarLetter}
                </div>

                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-white">{username}</p>
                  <p className="text-xs text-gray-100">Technician</p>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-white transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                  <button
                    type="button"
                    onClick={goProfile}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 border-b border-gray-100 hover:bg-orange-50 transition"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-20">
          <main className="flex-1 p-4 lg:p-5">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}