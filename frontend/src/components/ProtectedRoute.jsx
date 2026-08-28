import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = React.useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
