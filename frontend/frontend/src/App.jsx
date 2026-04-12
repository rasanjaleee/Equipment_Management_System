// frontend/frontend/src/App.jsx

import './App.css';
import LaboratoryPage from './Pages/Laboratory'; // adjust path if needed
import ProfilePage from './Pages/Profile';
import Login from './Pages/Login';    
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BulkUploadEquipment from "./Pages/admin/BulkUploadEquipment";
import Register from './Pages/Register';
import Landing from './Pages/Landing';
import Home from './Pages/Home';
import Equipment from './Pages/Equipment';
import About from './Pages/About';
import Navbar from './components/Navbar';
import EquipmentDetails from './Pages/EquipmentDetails';
import Footer from './components/Footer';

import AdminDashboard from "./Pages/admin/AdminDashboard";
import AdminEquipment from "./Pages/admin/AdminEquipment";
import AdminRoute from "./routes/AdminRoute";
import MaintenancePage from "./Pages/admin/MaintenancePage";
import AdminLayout from "./components/AdminLayout";
import IssuancePage from './Pages/admin/Issuance';
import UserManagement from './Pages/admin/UserManagement';
import ActivityLog from './Pages/admin/ActivityLog';
import TechnicianRoute from "./routes/TechnicianRoute";
import TechnicianLayout from "./components/TechnicianLayout";
import TechnicianDashboard from "./Pages/technician/TechnicianDashboard";
import TechnicianEquipment from "./Pages/technician/TechnicianEquipment";
import TechnicianActivityLog from "./Pages/technician/TechnicianActivityLog";


// Wrapper to provide Router context
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();

  // Pages where Navbar should NOT appear
  const hideNavbarOn = ['/', '/login', '/register'];

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTechnicianRoute = location.pathname.startsWith('/technician');

  // ✅ Navbar hidden for admin
const shouldShowNavbar =
  !hideNavbarOn.includes(location.pathname) && !isAdminRoute && !isTechnicianRoute;

// ✅ Footer always shown except login/landing pages
const shouldShowFooter =
  !hideNavbarOn.includes(location.pathname) && !isAdminRoute && !isTechnicianRoute;


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Show Navbar only on allowed pages */}
      {shouldShowNavbar && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          
          <Route path='/home' element={<Home />} />
          <Route path='/equipment' element={<Equipment />} />
          <Route path='/equipment/details/:equipmentName/:laboratory' element={<EquipmentDetails />} />
          <Route path='/equipment/item/:id' element={<EquipmentDetails />} />
          <Route path='/about' element={<About />} />
          <Route path='/profile' element={<ProfilePage />} />



          {/* Admin routes */}
          <Route path="/admin" element={ <AdminRoute>   <AdminLayout /> </AdminRoute> }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="equipment" element={<AdminEquipment />} />
          <Route path="equipment/bulk-upload" element={<BulkUploadEquipment />} />
          <Route path="laboratories" element={<LaboratoryPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="issuance" element={<IssuancePage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="activity-log" element={<ActivityLog />} />

          </Route>
          

          <Route path='/profile' element={<ProfilePage />} />


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
         </Route>


        </Routes>
      </main>

      {/* Show Footer only on allowed pages */}
      {shouldShowFooter && <Footer />}
    </div>
  );
}

// Export the wrapper so Router context is available
export default AppWrapper;
