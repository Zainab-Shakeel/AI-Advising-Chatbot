import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { seedStaffAccounts } from './services/userService';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import StudentPortal from './pages/StudentPortal';
import SystemAdminPortal from './pages/SystemAdminPortal';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  useEffect(() => {
    seedStaffAccounts();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/student" element={<ProtectedRoute><StudentPortal /></ProtectedRoute>} />
          <Route path="/system-admin" element={<ProtectedRoute><SystemAdminPortal /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
