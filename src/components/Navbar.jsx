import { Bell, User, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';


const Navbar = () => {
  const userName = "John Doe"; // Replace with actual user data

  return (
    <nav className="bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="text-2xl font-bold text-white">
              YourLogo
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <a
              href="/"
              className="text-black bg-yellow-500 hover:bg-yellow-400 px-6 py-2 text-sm font-semibold uppercase transition-colors"
            >
              HOME
            </a>
            <a
              href="/equipment"
              className="text-black bg-yellow-500 hover:bg-yellow-400 px-6 py-2 text-sm font-semibold uppercase transition-colors"
            >
              EQUIPMENT
            </a>
            <a
              href="/about"
              className="text-black bg-yellow-500 hover:bg-yellow-400 px-6 py-2 text-sm font-semibold uppercase transition-colors"
            >
              ABOUT
            </a>
          </div>

          {/* Right side - User Info & Icons */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <a
              href="/notifications"
              className="p-2 text-white hover:text-yellow-400 transition-colors relative"
              title="Notifications"
            >
              <Bell size={22} />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </a>

            {/* Profile Icon */}
            <a
              href="/profile"
              className="p-2 text-white hover:text-yellow-400 transition-colors"
              title="Profile"
            >
              <User size={22} />
            </a>

            {/* User Name Circle */}
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg cursor-pointer hover:bg-yellow-400 transition-colors">
              H
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3 space-y-1">
          <a
            href="/"
            className="block text-black bg-yellow-500 hover:bg-yellow-400 px-3 py-2 text-sm font-semibold uppercase rounded"
          >
            HOME
          </a>
          <a
            href="/equipment"
            className="block text-black bg-yellow-500 hover:bg-yellow-400 px-3 py-2 text-sm font-semibold uppercase rounded"
          >
            EQUIPMENT
          </a>
          <a
            href="/about"
            className="block text-black bg-yellow-500 hover:bg-yellow-400 px-3 py-2 text-sm font-semibold uppercase rounded"
          >
            ABOUT
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;