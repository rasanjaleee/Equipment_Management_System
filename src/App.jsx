import './App.css'
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

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();

  // pages where navbar should NOT appear
  const hideNavbarOn = ['/', '/login', '/register'];

  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* show navbar only on allowed pages */}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/home' element={<Home />} />
        <Route path='/equipment' element={<Equipment />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
