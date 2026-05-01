import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  LayoutDashboard,
  Wrench,
  FlaskConical,
  ClipboardList,
  History,
  FileBarChart,
  Users,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const role = loggedInUser?.role || "";
  const username = loggedInUser?.username || "User";
  const userId = loggedInUser?.id;

  const displayRole =
    role === "SUPER_ADMIN"
      ? "Super Admin"
      : role === "ADMIN"
      ? "Administrator"
      : role === "TECHNICIAN"
      ? "Technician"
      : "User";

  const welcomeText =
    role === "SUPER_ADMIN"
      ? "Welcome back, Super Admin!"
      : role === "ADMIN"
      ? "Welcome back, Admin!"
      : role === "TECHNICIAN"
      ? "Welcome back, Technician!"
      : "Welcome back!";

  const displayName = username;
  const avatarLetter = username ? username.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("Connected to WebSocket");

        // Global topic (matches your current backend)
        client.subscribe("/topic/notifications", (message) => {
          try {
            const newNotification = JSON.parse(message.body);
            console.log("Received notification:", newNotification);

            setNotifications((prev) => [
              {
                ...newNotification,
                id: Date.now() + Math.random(),
                read: false,
                receivedAt: new Date().toLocaleString(),
              },
              ...prev,
            ]);
          } catch (error) {
            console.error("Error parsing notification:", error);
          }
        });

        // Optional user-specific topic
        if (userId) {
          client.subscribe(`/topic/notifications/${userId}`, (message) => {
            try {
              const newNotification = JSON.parse(message.body);
              console.log("Received user notification:", newNotification);

              setNotifications((prev) => [
                {
                  ...newNotification,
                  id: Date.now() + Math.random(),
                  read: false,
                  receivedAt: new Date().toLocaleString(),
                },
                ...prev,
              ]);
            } catch (error) {
              console.error("Error parsing user notification:", error);
            }
          });
        }
      },

      onStompError: (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const handleNotificationClick = () => {
    setNotificationOpen((prev) => !prev);

    if (!notificationOpen) {
      markAllAsRead();
    }
  };

  const baseMenu = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/equipment", label: "Equipment", icon: Wrench },
    { to: "/admin/laboratories", label: "Laboratories", icon: FlaskConical },
    { to: "/admin/issuance", label: "Issuance", icon: ClipboardList },
    { to: "/admin/maintenance", label: "Maintenance", icon: History },
    { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    { to: "/admin/activity-log", label: "Activity Log", icon: ClipboardList },
  ];

  const superAdminOnlyMenu = [
    { to: "/admin/users", label: "User Management", icon: Users },
  ];

  const menu =
    role === "SUPER_ADMIN"
      ? [...baseMenu, ...superAdminOnlyMenu]
      : baseMenu;

  const bottomMenu = [
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const titleMap = {
    "/admin/dashboard": "Dashboard",
    "/admin/equipment": "Equipment",
    "/admin/laboratories": "Laboratories",
    "/admin/issuance": "Issuance",
    "/admin/maintenance": "Maintenance",
    "/admin/reports": "Reports",
    "/admin/users": "User Management",
    "/admin/activity-log": "Activity Log",
    "/admin/notifications": "Notifications",
    "/admin/settings": "Settings",
    "/admin/profile": "Profile",
  };

  const currentTitle = titleMap[location.pathname] || "Admin";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all text-sm font-medium ${
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
    navigate("/admin/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <aside
        className={`fixed top-0 left-0 h-screen ${
          sidebarOpen ? "w-56" : "w-20"
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm z-40`}
      >
        <div
          className="px-3 border-b border-gray-200 h-20 flex items-center"
          style={{ backgroundColor: "#E89B00" }}
        >
          <div className="flex items-center gap-1 min-w-0 w-full">
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
                  Equipment Management System
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-200 space-y-2">
          {bottomMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <div
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "14rem" : "5rem" }}
      >
        <header
          className="fixed top-0 right-0 px-5 h-20 flex justify-between items-center shadow-md gap-4 z-30"
          style={{
            backgroundColor: "#E89B00",
            left: sidebarOpen ? "14rem" : "5rem",
          }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white truncate">
              {currentTitle}
            </h2>
            <p className="text-sm text-gray-100 mt-1">{welcomeText}</p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-white rounded-lg transition-colors"
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
                <div className="absolute right-0 mt-3 w-96 max-h-[420px] overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Notifications
                    </h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                            !notification.read ? "bg-orange-50" : "bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">
                                {notification.title || "Notification"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 break-words">
                                {notification.message || "No message"}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.receivedAt}
                              </p>
                            </div>

                            {!notification.read && (
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className="w-px h-6 opacity-50"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            ></div>

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
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs text-gray-100">{displayRole}</p>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-white transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={goProfile}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 transition-colors font-medium border-b border-gray-100"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEF5E6";
                      e.currentTarget.style.color = "#E89B00";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.color = "#333";
                    }}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto pt-24">
          <main className="flex-1 p-4 lg:p-5">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}