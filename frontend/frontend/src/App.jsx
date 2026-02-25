// frontend/frontend/src/App.jsx

import './App.css';

import Login from './Pages/Login';    
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Register from './Pages/Register';
import Landing from './Pages/Landing';
import Home from './Pages/Home';
import Equipment from './Pages/Equipment';
import About from './Pages/About';
import Navbar from './components/Navbar';
import EquipmentDetails from './Pages/EquipmentDetails';
import Footer from './components/Footer';
import AdminDashboard from "./Pages/AdminDashboard";
import AdminEquipment from "./Pages/admin/AdminEquipment";
import AdminRoute from "./routes/AdminRoute";
import MaintenancePage from "./Pages/admin/MaintenancePage";
import AdminLayout from "./Pages/AdminLayout";
import Profile from "./Pages/Profile";


// Wrapper to provide Router context
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

  const hideNavbarOn = ['/', '/login', '/register'];
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname) && !location.pathname.startsWith('/admin');

function App() {
  const location = useLocation();

  // Pages where Navbar should NOT appear
  const hideNavbarOn = ['/', '/login', '/register'];

  const isAdminRoute = location.pathname.startsWith('/admin');

  // ✅ Navbar hidden for admin
const shouldShowNavbar =
  !hideNavbarOn.includes(location.pathname) && !isAdminRoute;

// ✅ Footer always shown except login/landing pages
const shouldShowFooter =
  !hideNavbarOn.includes(location.pathname);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Show Navbar only on allowed pages */}
      {shouldShowNavbar && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/home' element={<Home />} />
          <Route path='/equipment' element={<Equipment />} />
          <Route path='/equipment/:id' element={<EquipmentDetails />} />
          <Route path='/about' element={<About />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={ <AdminRoute>   <AdminLayout /> </AdminRoute> }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="equipment" element={<AdminEquipment />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="/admin/profile" element={<Profile />} />
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
