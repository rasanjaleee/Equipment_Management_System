import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {/* Notification Bell */}
          <button className="text-white hover:text-gray-100 transition-colors duration-200">
            <Bell size={26} />
          </button>

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