import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdminUser } from '../utils/adminAccess';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || (requireAdmin && !isAdminUser(user))) {
    return <Navigate to="/" replace />;
  }

  return children;
};
