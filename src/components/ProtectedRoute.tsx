import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setForceReady(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Still loading and not timed out — show spinner
  if (isLoading && !forceReady) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F5F3EE' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Confirmed no user — redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // User confirmed — render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
