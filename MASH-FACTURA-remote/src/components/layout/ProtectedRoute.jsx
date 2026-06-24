import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { canAccessPath, defaultPathForRole } from '../../constants/permissions';

export function ProtectedRoute({ children }) {
  const { session, loading, profileLoading, role } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mash-bg">
        <Loader2 className="h-6 w-6 animate-spin text-mash-text3" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to={defaultPathForRole(role)} replace />;
  }

  return children;
}
