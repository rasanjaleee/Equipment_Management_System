import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useNotificationSocket from "../services/useNotificationSocket";

// 👉 Notification APIs
import {
  getNotifications,
  getUnreadCount,
  markAsRead
} from "../services/notificationService";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const userId = 1; // 👉 replace with logged-in user id later

  // ================= REAL-TIME NOTIFICATION HANDLER =================
  const handleRealtimeNotification = useCallback((newNotif) => {
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  useNotificationSocket(handleRealtimeNotification);

  // ================= LOAD NOTIFICATIONS =================
  const loadNotifications = async () => {
    try {
      const res1 = await getNotifications(userId);
      const res2 = await getUnreadCount(userId);

      setNotifications(res1.data);
      setUnreadCount(res2.data);
    } catch (error) {
      console.error("Notification load error", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ================= CLOSE OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  // ================= MARK AS READ =================
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    loadNotifications();
  };

  return (
    <nav className="bg-gradient-to-r from-yellow-500 to-orange-400 px-6 py-1 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* ================= LEFT LOGO ================= */}
        <div className="flex items-center gap-0">
          <img
            src="/images/home_logo.png"
            alt="University Logo"
            className="w-24 h-20 object-contain mt-1"
          />

          <div className="flex flex-col leading-tight -ml-4">
            <h1 className="text-white font-bold text-xl tracking-wide">
              FACULTY OF ENGINEERING
            </h1>
            <p className="text-white text-base font-medium">
              UNIVERSITY OF RUHUNA
            </p>
          </div>
        </div>

        {/* ================= CENTER LINKS ================= */}
        <div className="flex items-center gap-8">
          <Link to="/home" className="text-white font-semibold">HOME</Link>
          <Link to="/equipment" className="text-white font-semibold">EQUIPMENT</Link>
          <Link to="/about" className="text-white font-semibold">ABOUT</Link>
        </div>

        {/* ================= RIGHT ICONS ================= */}
        <div className="flex items-center gap-4">

          {/* ================= NOTIFICATION BELL ================= */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-white hover:text-gray-100 relative"
            >
              <Bell size={26} />

              {/* 🔴 BADGE */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* ================= DROPDOWN ================= */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2 border-b font-semibold">
                  Notifications
                </div>

                {notifications.length === 0 ? (
                  <p className="p-3 text-gray-500">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                        n.read ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-xs text-gray-600">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ================= MESSAGE ICON ================= */}
          <button className="text-white hover:text-gray-100 border-2 border-white rounded p-1.5">
            <MessageSquare size={22} />
          </button>

          {/* ================= PROFILE ================= */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-amber-900 rounded-full w-11 h-11 flex items-center justify-center text-white font-bold text-xl"
            >
              H
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={18} />
                  Profile
                </Link>

                <div className="border-t my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;