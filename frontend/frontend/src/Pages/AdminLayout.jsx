// ✅ AdminLayout.jsx - Complete Updated Design with Golden Color Scheme
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Wrench,
  FlaskConical,
  ClipboardList,
  History,
  FileBarChart,
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

  // ✅ dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dropdownRef = useRef(null);

  // ✅ close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menu = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/equipment", label: "Equipment", icon: Wrench },
    { to: "/admin/laboratories", label: "Laboratories", icon: FlaskConical },
    { to: "/admin/issuance", label: "Issuance", icon: ClipboardList },
    { to: "/admin/maintenance", label: "Maintenance", icon: History },
    { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  ];

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
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* ✅ Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 h-24 flex items-center overflow-hidden" style={{ backgroundColor: '#E89B00' }}>
          <div className="flex items-center gap-0">
            <img 
              src="/images/home_logo.png" 
              alt="University Logo" 
              className="w-28 h-28 object-contain flex-shrink-0"
            />
            {sidebarOpen && (
              <div className="leading-tight -ml-6">
                <h1 className="text-xs font-bold text-white whitespace-nowrap">Faculty of Engineering</h1>
                <p className="text-xs text-orange-100 whitespace-nowrap">Equipment</p>
                <p className="text-xs text-orange-100 whitespace-nowrap">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 px-3 py-6 space-y-2">
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

        {/* Bottom Menu */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-2">
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

        {/* Toggle Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* ✅ Right Side */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Topbar */}
        <header className="px-6 py-4 flex justify-between items-center shadow-md" style={{ backgroundColor: '#E89B00' }}>
          {/* Left Section */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{currentTitle}</h2>
            <p className="text-sm text-gray-100 mt-1">Welcome back, Admin!</p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Notification Button */}
            <button className="relative p-2 text-white rounded-lg transition-colors" style={{ backgroundColor: 'rgba(232, 155, 0, 0.7)' }}>
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 opacity-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}></div>

            {/* ✅ Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(232, 155, 0, 0.7)' }}
              >
                {/* Avatar */}
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-bold shadow-md" style={{ color: '#E89B00' }}>
                  A
                </div>

                {/* User Info */}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-gray-100">Administrator</p>
                </div>

                {/* Chevron */}
                <ChevronDown
                  size={18}
                  className={`text-white transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Profile Option */}
                  <button
                    onClick={goProfile}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 transition-colors font-medium border-b border-gray-100" 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF5E6'; e.currentTarget.style.color = '#E89B00'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#333'; }}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  {/* Logout Option */}
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

        {/* ✅ Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}