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
import AdminEquipment from "./Pages/AdminEquipment";
import AdminRoute from "./routes/AdminRoute";

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
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname) && !location.pathname.startsWith('/admin');

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
          <Route 
          path='/admin/dashboard' 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path='/admin/equipment' 
          element={
            <AdminRoute>
              <AdminEquipment />
            </AdminRoute>
          } 
        />
        </Routes>
      </main>

      {/* Show Footer only on allowed pages */}
      {shouldShowNavbar && <Footer />}

    </div>
  );
}

// Export the wrapper so Router context is available
export default AppWrapper;
