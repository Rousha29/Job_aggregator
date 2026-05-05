import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;