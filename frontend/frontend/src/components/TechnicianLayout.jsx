import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import {
  LayoutDashboard,
  Wrench,
  History,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function TechnicianLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dropdownRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const username = loggedInUser?.username || "Technician";
  const avatarLetter = username.charAt(0).toUpperCase();

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
    { to: "/technician/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/technician/equipment", label: "Equipment Status", icon: Wrench },
    { to: "/technician/maintenance", label: "Maintenance", icon: History },
    { to: "/technician/activity-log", label: "My Activity", icon: ClipboardList },
  ];

  const titleMap = {
    "/technician/dashboard": "Technician Dashboard",
    "/technician/equipment": "Equipment Status",
    "/technician/maintenance": "Maintenance",
    "/technician/activity-log": "My Activity",
    "/technician/profile": "Profile",
  };

  const currentTitle = titleMap[location.pathname] || "Technician";

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
    navigate("/technician/profile");
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
                  Technician Panel
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
          style={{ backgroundColor: "#E89B00", left: sidebarOpen ? "14rem" : "5rem" }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white truncate">{currentTitle}</h2>
            <p className="text-sm text-gray-100 mt-1">Welcome back, Technician!</p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
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
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <button
                    onClick={goProfile}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 border-b border-gray-100 hover:bg-orange-50"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-600 hover:bg-red-50"
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