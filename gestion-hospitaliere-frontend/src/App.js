import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MedecinDashboard from './pages/MedecinDashboard';
import PatientDashboard from './pages/PatientDashboard';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Composant pour rediriger selon le rôle
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'Médecin') {
    return <MedecinDashboard />;
  }
  
  if (user?.role === 'Patient') {
    return <PatientDashboard />;
  }
  
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            {/* Add more protected routes here */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
