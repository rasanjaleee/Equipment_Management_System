// frontend/frontend/src/App.jsx

import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Login from './Pages/Login';
import Register from './Pages/Register';
import Landing from './Pages/Landing';
import Home from './Pages/Home';
import Equipment from './Pages/Equipment';
import About from './Pages/About';
import EquipmentDetails from './Pages/EquipmentDetails';
import ProfilePage from './Pages/Profile';
import LaboratoryPage from './Pages/Laboratory';
import ChangePassword from './Pages/ChangePassword';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import TechnicianLayout from './components/TechnicianLayout';

import AdminRoute from './routes/AdminRoute';
import TechnicianRoute from './routes/TechnicianRoute';
import SuperAdminRoute from './routes/SuperAdminRoute';

import AdminDashboard from './Pages/admin/AdminDashboard';
import AdminEquipment from './Pages/admin/AdminEquipment';
import BulkUploadEquipment from './Pages/admin/BulkUploadEquipment';
import MaintenancePage from './Pages/admin/MaintenancePage';
import Issuance from './Pages/admin/Issuance';
import UserManagement from './Pages/admin/UserManagement';
import ActivityLog from './Pages/admin/ActivityLog';
import ReportsPage from './Pages/admin/ReportsPage';
import AdminSettings from './Pages/admin/AdminSettings';
import NotificationPage from './Pages/admin/NotificationPage';

import TechnicianDashboard from './Pages/technician/TechnicianDashboard';
import TechnicianEquipment from './Pages/technician/TechnicianEquipment';
import TechnicianActivityLog from './Pages/technician/TechnicianActivityLog';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();

  const hideNavbarOn = ['/', '/login', '/register'];

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTechnicianRoute = location.pathname.startsWith('/technician');

  const shouldShowNavbar =
    !hideNavbarOn.includes(location.pathname) &&
    !isAdminRoute &&
    !isTechnicianRoute;

  const shouldShowFooter =
    !hideNavbarOn.includes(location.pathname) &&
    !isAdminRoute &&
    !isTechnicianRoute;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {shouldShowNavbar && <Navbar />}

      <main className={`flex-grow ${shouldShowNavbar ? 'pt-24' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/details/:equipmentName/:laboratory" element={<EquipmentDetails />} />
          <Route path="/equipment/item/:id" element={<EquipmentDetails />} />
          <Route path="/issuance" element={<Navigate to="/admin/issuance" replace state={location.state} />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="equipment" element={<AdminEquipment />} />
            <Route path="equipment/bulk-upload" element={<BulkUploadEquipment />} />
            <Route path="laboratories" element={<LaboratoryPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="issuance" element={<Issuance />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<NotificationPage />} />
            
            <Route
              path="users"
              element={
                <SuperAdminRoute>
                  <UserManagement />
                </SuperAdminRoute>
              }
            />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>

          {/* Technician routes */}
          <Route
            path="/technician"
            element={
              <TechnicianRoute>
                <TechnicianLayout />
              </TechnicianRoute>
            }
          >
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="equipment" element={<TechnicianEquipment />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="activity-log" element={<TechnicianActivityLog />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </main>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default AppWrapper;