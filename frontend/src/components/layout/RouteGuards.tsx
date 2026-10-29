import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '../../hooks/use-auth';
import { LoadingDots } from './LoadingDots';

function AuthGateLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingDots label="Memeriksa sesi" />
    </div>
  );
}

export const RequireAuth: React.FC = () => {
  const { token, user, authStatus, isBootstrapping } = useAuthSession();
  const location = useLocation();
  const redirectTarget = `${location.pathname}${location.search}`;

  if (!token) {
    return <Navigate to={`/login?next=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  if (isBootstrapping || authStatus === 'loading' || !user) {
    return <AuthGateLoader />;
  }

  return <Outlet />;
};

export const RequireAdmin: React.FC = () => {
  const { token, user, authStatus, isBootstrapping } = useAuthSession();
  const location = useLocation();
  const redirectTarget = `${location.pathname}${location.search}`;

  if (!token) {
    return <Navigate to={`/login?next=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  if (isBootstrapping || authStatus === 'loading' || !user) {
    return <AuthGateLoader />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
