import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Verify from './pages/Verify';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { UserContext } from './context/UserContext';

function App() {
  const { token } = useContext(UserContext);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={token ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route 
          path="/verify" 
          element={<Verify />} 
        />
        <Route 
          path="/verify/:id" 
          element={<Verify />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;