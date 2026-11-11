import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  const isAdmin = user?.role === 'admin';
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!adminOnly && isAdmin) return <Navigate to="/admin" replace />;

  return children || <Outlet />;
}
