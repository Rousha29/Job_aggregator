import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Comparateur from './pages/Comparateur/Comparateur'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOffers from './pages/admin/AdminOffers'
import AdminUsers from './pages/admin/AdminUsers'

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/comparateur" element={<Comparateur />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/offers" element={<AdminOffers />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
