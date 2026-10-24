import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError('');
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      setNotificationsError(error.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const toggleNotifications = () => {
    if (isNotificationsOpen) {
      setIsNotificationsOpen(false);
      return;
    }
    setIsNotificationsOpen(true);
    loadNotifications();
  };

  const markNotificationAsRead = async (notification) => {
    if (notification.read) {
      return;
    }
    try {
      const response = await api.patch(`/api/notifications/${notification.id}/read`);
      setNotifications((current) =>
        current.map((item) => item.id === notification.id ? response.data : item)
      );
    } catch (error) {
      setNotificationsError(error.response?.data?.message || 'Unable to update notification.');
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleLogout = () => {
    // Add your logout logic here
    // For example: clear localStorage, clear tokens, etc.
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-yellow-500 to-orange-400 px-6 py-1 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center justify-center gap-0">
          {/* Logo */}
          <img 
            src="/images/home_logo.png" 
            alt="University Logo" 
            className="w-24 h-20 object-contain mt-1"
          />
          
          {/* Title */}
          <div className="flex flex-col leading-tight -ml-4">
            <h1 className="text-white font-bold text-xl tracking-wide">
              FACULTY OF ENGINEERING
            </h1>
            <p className="text-white text-base font-medium">
              UNIVERSITY OF RUHUNA
            </p>
          </div>
        </div>

        {/* Center Section - Navigation Links */}
        <div className="flex items-center gap-8">
          <Link 
            to="/home" 
            className="text-white font-semibold text-base hover:text-gray-100 transition-colors duration-200"
          >
            HOME
          </Link>
          <Link 
            to="/equipment" 
            className="text-white font-semibold text-base hover:text-gray-100 transition-colors duration-200"
          >
            EQUIPMENT
          </Link>
          <Link 
            to="/about" 
            className="text-white font-semibold text-base hover:text-gray-100 transition-colors duration-200"
          >
            ABOUT
          </Link>
        </div>

        {/* Right Section - Icons and Profile */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              className="relative text-white hover:text-gray-100 transition-colors duration-200"
            >
              <Bell size={26} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-lg bg-white text-gray-800 shadow-xl sm:w-96">
                <div className="border-b px-4 py-3 font-semibold">Notifications</div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading && (
                    <p className="px-4 py-5 text-sm text-gray-500">Loading notifications...</p>
                  )}
                  {!notificationsLoading && notificationsError && (
                    <p role="alert" className="px-4 py-5 text-sm text-red-600">{notificationsError}</p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                    <p className="px-4 py-5 text-sm text-gray-500">No notifications yet.</p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationAsRead(notification)}
                      className={`block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 ${
                        notification.read ? 'bg-white' : 'bg-amber-50'
                      }`}
                    >
                      <span className="block text-sm font-medium">{notification.message}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Request #{notification.requestId} · {notification.decision.toLowerCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Icon */}
          <button className="text-white hover:text-gray-100 transition-colors duration-200 border-2 border-white rounded p-1.5">
            <MessageSquare size={22} />
          </button>

          {/* Profile Circle with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-amber-900 rounded-full w-11 h-11 flex items-center justify-center text-white font-bold text-xl hover:bg-amber-800 transition-colors duration-200 cursor-pointer"
            >
              H
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
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