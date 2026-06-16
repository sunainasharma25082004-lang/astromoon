import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/Auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'user' | 'astrologer' | 'admin'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, user, token } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (!token || !isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const role = user.role || 'user';

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'astrologer') return <Navigate to="/" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}