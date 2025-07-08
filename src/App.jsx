import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App
