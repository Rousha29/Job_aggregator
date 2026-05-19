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

function App() {
  const [accessibilityEnabled, setAccessibilityEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ja_accessibility_enabled') === 'true';
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
        <Route
          path="/profile"
          element={
            <Profile
              accessibilityEnabled={accessibilityEnabled}
              setAccessibilityEnabled={setAccessibilityEnabled}
            />
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/comparateur" element={<Comparateur />} />
      </Routes>
      <AccessibilityWidget enabled={accessibilityEnabled} />
    </>
  );
}

export default App;