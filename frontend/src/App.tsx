import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Home from './pages/Home/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOffers from './pages/admin/AdminOffers';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/offers" element={<AdminOffers />} />
      <Route path="/admin/users" element={<AdminUsers />} />
    </Routes>
  );
}

export default App;