import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  FlaskConical, 
  ClipboardList, 
  History, 
  FileBarChart, 
  Bell, 
  Settings,
  LogOut
} from 'lucide-react';

const AdminLayout = ({ children, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Wrench size={20} />, label: 'Equipment', path: '/admin/equipment' },
    { icon: <FlaskConical size={20} />, label: 'Laboratories', path: '/admin/laboratories' },
    { icon: <ClipboardList size={20} />, label: 'Issuance', path: '/admin/issuance' },
    { icon: <History size={20} />, label: 'Maintenance', path: '/admin/maintenance' },
    { icon: <FileBarChart size={20} />, label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-200 flex flex-col border-r border-gray-300">
        <div className="p-6">
          <h1 className="text-sm font-bold leading-tight">
            Faculty of Engineering <br />
            <span className="text-gray-600">Equipment Management System</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm ${
                location.pathname === item.path
                  ? 'bg-orange-400 text-black font-semibold'
                  : 'hover:bg-gray-300'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-300 space-y-2">
          <div className="flex items-center gap-3 p-3 hover:bg-gray-300 rounded-lg cursor-pointer text-sm">
            <Bell size={20} />
            <span>Notifications</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-300 rounded-lg cursor-pointer text-sm">
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-orange-400 p-4 flex justify-between items-center shadow-md">
          <div className="text-xs font-medium">
            <p>{pageTitle}</p>
            <p className="text-xs">Welcome Admin!</p>
          </div>
          
          <div className="font-semibold text-sm">Welcome Admin!</div>

          <div className="flex items-center gap-4">
            <Bell className="cursor-pointer" size={18} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">A</div>
              <div className="text-xs leading-tight">
                <p className="font-bold">Admin User</p>
                <p>Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-200 shadow-sm text-xs"
              title="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
