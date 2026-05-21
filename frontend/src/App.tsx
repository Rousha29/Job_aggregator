import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Home from './pages/Home/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOffers from './pages/admin/AdminOffers';
import AdminUsers from './pages/admin/AdminUsers';
import Comparateur from './pages/Comparateur/Comparateur';
import AccessibilityWidget from './components/AccessibilityWidget/AccessibilityWidget';
import AdminRoute from './components/AdminRoute';

function App() {
  const [accessibilityEnabled, setAccessibilityEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ja_accessibility_enabled');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ja_accessibility_enabled', accessibilityEnabled ? 'true' : 'false');
  }, [accessibilityEnabled]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile accessibilityEnabled={accessibilityEnabled} setAccessibilityEnabled={setAccessibilityEnabled} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/offers" element={<AdminRoute><AdminOffers /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/comparateur" element={<Comparateur />} />
      </Routes>
    </>
  );
}

export default App;