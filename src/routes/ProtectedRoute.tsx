import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const role = useAppStore((state) => state.role);
  const addToast = useAppStore((state) => state.addToast);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the original location they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Role is not allowed, redirect to home/products page
    // Trigger toast notification of permission error
    setTimeout(() => {
      addToast('Unauthorized access: You do not have permission to view this page.', 'error');
    }, 100);
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};
