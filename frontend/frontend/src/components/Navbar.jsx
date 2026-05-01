import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, LogOut, User, Check, CheckCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useNotificationSocket from "../services/useNotificationSocket";
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
  const [username, setUsername] = useState('');
  const [userInitials, setUserInitials] = useState('?');

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const userId = 1; // replace with logged-in user id later

  // ================= FETCH USERNAME FROM LOCALSTORAGE / JWT =================
  useEffect(() => {
    // Try to get username from localStorage (set during login)
    const storedName = localStorage.getItem('username') ||
                       localStorage.getItem('name') ||
                       localStorage.getItem('fullName');

    if (storedName) {
      setUsername(storedName);
      // Build initials from name (e.g. "John Doe" → "JD", "Hasitha" → "H")
      const parts = storedName.trim().split(' ');
      const initials = parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : storedName.slice(0, 2).toUpperCase();
      setUserInitials(initials);
    } else {
      // Fallback: decode JWT token if username not stored directly
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Common JWT claim names for username
          const name = payload.name || payload.username || payload.sub || payload.email || '';
          if (name) {
            setUsername(name);
            const parts = name.trim().split(' ');
            const initials = parts.length >= 2
              ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
              : name.slice(0, 2).toUpperCase();
            setUserInitials(initials);
          }
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
    }
  }, []);

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setNotifOpen(false);
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

  // ================= MARK ONE AS READ =================
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    loadNotifications();
  };

  // ================= MARK ALL AS READ =================
  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
    loadNotifications();
  };

  // ================= TIME AGO HELPER =================
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-yellow-500 to-orange-400 px-6 py-1 shadow-md">
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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* ================= NOTIFICATION DROPDOWN ================= */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-yellow-500" />
                    <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell size={32} className="mb-2 opacity-30" />
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-yellow-50 ${
                          !n.read ? 'bg-yellow-50/60' : 'bg-white'
                        }`}
                      >
                        {/* Colored dot indicator */}
                        <div className="mt-1.5 shrink-0">
                          {!n.read ? (
                            <span className="w-2 h-2 rounded-full bg-yellow-500 block" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-200 block" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          {n.createdAt && (
                            <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                          )}
                        </div>

                        {/* Mark read icon */}
                        {!n.read && (
                          <Check size={14} className="text-yellow-500 shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= MESSAGE ICON ================= */}
          <button className="text-white hover:text-gray-100 border-2 border-white rounded p-1.5">
            <MessageSquare size={22} />
          </button>

          {/* ================= PROFILE ================= */}
          {/* ================= PROFILE ================= */}
<div className="relative" ref={dropdownRef}>
  <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="bg-amber-900 hover:bg-amber-800 transition-colors rounded-full w-11 h-11 flex items-center justify-center text-white font-bold text-base"
    title={username || 'Profile'}
  >
    {userInitials}
  </button>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100">

      {/* User info header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {username || 'User'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {localStorage.getItem('email') || 'Logged in'}
        </p>
      </div>

      <Link
        to="/profile"
        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
        onClick={() => setIsDropdownOpen(false)}
      >
        <User size={16} className="text-gray-400" />
        Profile
      </Link>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
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