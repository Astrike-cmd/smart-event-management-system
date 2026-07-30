import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="glass-panel p-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="mb-0 text-muted">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
