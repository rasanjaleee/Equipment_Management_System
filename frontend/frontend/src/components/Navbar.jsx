import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Bell, LogOut, User, Check, CheckCheck, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useNotificationSocket from '../services/useNotificationSocket';
import {
  getNotifications,
  getUnreadCount,
  markAsRead
} from '../services/notificationService';

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { to: '/home', label: 'HOME' },
  { to: '/equipment', label: 'EQUIPMENT' },
  { to: '/about', label: 'ABOUT' }
];

const NAME_STORAGE_KEYS = ['username', 'name', 'fullName'];
const MAX_BADGE_COUNT = 99;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Safe localStorage read (SSR / privacy-mode / quota safe). */
const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Safe JSON read from localStorage. */
const readJSON = (key) => {
  try {
    const raw = readStorage(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Decode a base64url JWT payload (UTF-8 safe). Returns null on failure. */
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/** Resolve display name: storage first, then JWT fallback. */
const resolveUsername = () => {
  for (const key of NAME_STORAGE_KEYS) {
    const value = readStorage(key);
    if (value) return value;
  }

  const token = readStorage('token');
  if (!token) return '';

  const payload = decodeJwtPayload(token);
  return payload?.name || payload?.username || payload?.sub || payload?.email || '';
};

/** Build up-to-two-letter initials from a display name. */
const getInitials = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) return '?';

  const parts = trimmed.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : trimmed.slice(0, 2);

  return initials.toUpperCase();
};

/** Relative time formatter. */
const timeAgo = (dateStr) => {
  if (!dateStr) return '';

  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return '';

  const mins = Math.floor((Date.now() - time) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
};

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

/** Calls `onDismiss` on outside mousedown/touch or Escape key while `active`. */
const useDismiss = (ref, active, onDismiss) => {
  useEffect(() => {
    if (!active) return undefined;

    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true });
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, active, onDismiss]);
};

/** Notification state, loading, realtime updates and read actions. */
const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!userId) return;

    // Guard against out-of-order responses overwriting newer state.
    const requestId = ++requestIdRef.current;

    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId)
      ]);

      if (requestId !== requestIdRef.current) return;

      setNotifications(listRes?.data || []);
      setUnreadCount(countRes?.data || 0);
    } catch (error) {
      console.error('Notification load error:', error);
    }
  }, [userId]);

  useEffect(() => {
    load();
    return () => {
      // Invalidate in-flight requests on unmount / user change.
      requestIdRef.current += 1;
    };
  }, [load]);

  const handleRealtime = useCallback((incoming) => {
    if (!incoming) return;

    setNotifications((prev) => {
      // De-duplicate in case the socket re-delivers an event.
      if (incoming.id != null && prev.some((n) => n.id === incoming.id)) {
        return prev;
      }
      setUnreadCount((count) => count + 1);
      return [incoming, ...prev];
    });
  }, []);

  useNotificationSocket(userId, handleRealtime);

  const markOneAsRead = useCallback(
    async (id) => {
      try {
        await markAsRead(id);
        await load();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [load]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => markAsRead(n.id)));
      await load();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [notifications, load]);

  return { notifications, unreadCount, markOneAsRead, markAllAsRead };
};

/* -------------------------------------------------------------------------- */
/*                               Sub-components                               */
/* -------------------------------------------------------------------------- */

const DesktopLinks = memo(() => (
  <div className="hidden md:flex items-center gap-5 lg:gap-8 shrink-0">
    {NAV_LINKS.map(({ to, label }) => (
      <Link
        key={to}
        to={to}
        className="text-white font-semibold text-sm lg:text-base hover:text-yellow-100 transition-colors"
      >
        {label}
      </Link>
    ))}
  </div>
));
DesktopLinks.displayName = 'DesktopLinks';

const MobileMenu = memo(({ onNavigate }) => (
  <div
    id="mobile-navigation"
    className="md:hidden bg-white border-t border-gray-200 shadow-lg -mx-2"
  >
    <div className="flex flex-col px-4 sm:px-6 py-2">
      {NAV_LINKS.map(({ to, label }, index) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={`py-3 text-gray-700 font-semibold hover:text-yellow-600 transition-colors ${
            index < NAV_LINKS.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  </div>
));
MobileMenu.displayName = 'MobileMenu';

const NotificationItem = memo(({ notification, onRead }) => {
  const { id, title, message, createdAt, read } = notification;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onRead(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onRead(id);
        }
      }}
      className={`flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-yellow-50 focus:outline-none focus-visible:bg-yellow-50 ${
        read ? 'bg-white' : 'bg-yellow-50/60'
      }`}
    >
      {/* Dot */}
      <div className="mt-1.5 shrink-0">
        <span
          className={`w-2 h-2 rounded-full block ${
            read ? 'bg-gray-200' : 'bg-yellow-500'
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug break-words ${
            read ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 break-words">
          {message}
        </p>

        {createdAt && (
          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(createdAt)}</p>
        )}
      </div>

      {/* Unread indicator */}
      {!read && <Check size={14} className="text-yellow-500 shrink-0 mt-1" />}
    </div>
  );
});
NotificationItem.displayName = 'NotificationItem';

const NotificationMenu = memo(
  ({ open, onToggle, onDismiss, notifications, unreadCount, onRead, onReadAll }) => {
    const containerRef = useRef(null);
    useDismiss(containerRef, open, onDismiss);

    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={onToggle}
          className="text-white hover:text-gray-100 relative p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Bell size={22} className="sm:w-6 sm:h-6" />

          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold rounded-full min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center px-1 border-2 border-orange-400"
            >
              {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 sm:mt-3 w-[calc(100vw-16px)] sm:w-[360px] md:w-96 max-w-[384px] bg-white rounded-xl shadow-xl z-[60] overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 min-w-0">
                <Bell size={16} className="text-yellow-500 shrink-0" />

                <span className="font-semibold text-gray-900 text-sm">
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onReadAll}
                  className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors whitespace-nowrap"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Read all</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[65vh] sm:max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Bell size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={onRead}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                <button
                  type="button"
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
NotificationMenu.displayName = 'NotificationMenu';

const ProfileMenu = memo(
  ({ open, onToggle, onDismiss, username, email, initials, onLogout }) => {
    const containerRef = useRef(null);
    useDismiss(containerRef, open, onDismiss);

    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={onToggle}
          className="bg-amber-900 hover:bg-amber-800 transition-colors rounded-full w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-white font-bold text-xs sm:text-base shrink-0"
          title={username || 'Profile'}
          aria-label="Profile menu"
          aria-haspopup="true"
          aria-expanded={open}
        >
          {initials}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-[220px] max-w-[calc(100vw-16px)] bg-white rounded-xl shadow-xl py-1 z-[60] border border-gray-100">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {email || 'Logged in'}
              </p>
            </div>

            {/* Profile */}
            <Link
              to="/profile"
              onClick={onDismiss}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <User size={16} className="text-gray-400" />
              Profile
            </Link>

            <div className="border-t border-gray-100 my-1" />

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }
);
ProfileMenu.displayName = 'ProfileMenu';

/* -------------------------------------------------------------------------- */
/*                                   Navbar                                   */
/* -------------------------------------------------------------------------- */

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read once per mount; storage is not reactive.
  const { userId, username, email, initials } = useMemo(() => {
    const user = readJSON('user');
    const name = resolveUsername();

    return {
      userId: user?.id,
      username: name,
      email: readStorage('email'),
      initials: getInitials(name)
    };
  }, []);

  const { notifications, unreadCount, markOneAsRead, markAllAsRead } =
    useNotifications(userId);

  // Close everything when the route changes.
  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const closeNotif = useCallback(() => setNotifOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const toggleNotif = useCallback(() => {
    setNotifOpen((prev) => !prev);
    setProfileOpen(false);
  }, []);

  const toggleProfile = useCallback(() => {
    setProfileOpen((prev) => !prev);
    setNotifOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
    setNotifOpen(false);
    setProfileOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
    navigate('/login');
  }, [navigate]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-yellow-500 to-orange-400 shadow-md overflow-visible"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="min-h-[64px] sm:min-h-[76px] flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            to="/home"
            onClick={closeMobileMenu}
            className="flex items-center min-w-0 flex-1"
          >
            <img
              src="/images/home_logo.png"
              alt="University Logo"
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-16 lg:w-24 lg:h-20 object-contain shrink-0"
            />

            <div className="flex flex-col leading-tight min-w-0 ml-1 sm:ml-2 lg:-ml-1">
              <span className="text-white font-bold text-[9px] xs:text-[10px] sm:text-lg lg:text-xl tracking-wide truncate">
                FACULTY OF ENGINEERING
              </span>
              <span className="text-white text-[8px] xs:text-[9px] sm:text-sm lg:text-base font-medium truncate">
                UNIVERSITY OF RUHUNA
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <DesktopLinks />

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden text-white hover:text-gray-100 p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <NotificationMenu
              open={notifOpen}
              onToggle={toggleNotif}
              onDismiss={closeNotif}
              notifications={notifications}
              unreadCount={unreadCount}
              onRead={markOneAsRead}
              onReadAll={markAllAsRead}
            />

            <ProfileMenu
              open={profileOpen}
              onToggle={toggleProfile}
              onDismiss={closeProfile}
              username={username}
              email={email}
              initials={initials}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && <MobileMenu onNavigate={closeMobileMenu} />}
      </div>
    </nav>
  );
};

export default memo(Navbar);