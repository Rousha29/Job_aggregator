import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const role = localStorage.getItem('role');

  if (!role) return <Navigate to="/login" />;
  if (role !== 'admin') return <Navigate to="/home" />;

  return <>{children}</>;
}
