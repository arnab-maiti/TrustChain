import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Verify from './pages/Verify';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent"></div>
          <p className="mt-4 text-light-text dark:text-dark-text">Loading...</p>
        </div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

// Main App Layout with Routes
const AppRoutes = () => {
  const { token } = useUser();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline/:productId"
          element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          }
        />
        <Route path="/verify/:productId" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Root App Component
function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </ToastProvider>
  );
}

export default App;