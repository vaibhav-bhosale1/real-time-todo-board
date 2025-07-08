import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService'; // Import getCurrentUser

const PrivateRoute = ({ children }) => {
  const isAuthenticated = getCurrentUser(); // Check if user is authenticated
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;