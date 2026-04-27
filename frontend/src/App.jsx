import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Timeline from './pages/Timeline';
import CheckTrust from './pages/CheckTrust';
import Login from './pages/Login';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          {token && <Navbar />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify"
              element={
                <ProtectedRoute>
                  <Verify />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timeline/:id"
              element={
                <ProtectedRoute>
                  <Timeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-trust"
              element={
                <ProtectedRoute>
                  <CheckTrust />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;