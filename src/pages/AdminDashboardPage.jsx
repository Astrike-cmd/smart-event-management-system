import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <span className="badge rounded-pill text-bg-warning px-3 py-2 mb-3">
          Protected Admin Route
        </span>
        <h1 className="display-6 fw-semibold mb-3">Admin access granted</h1>
        <p className="text-muted mb-0">
          Signed in as <strong>{user?.email}</strong>. This role-restricted page confirms that
          admin authentication and authorization are working correctly before the full admin
          dashboard is built in Phase 9.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="feature-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-people"></i>
            </div>
            <h2 className="h5 mb-2">Role Based Access</h2>
            <p className="text-muted mb-0">Only accounts with the admin role can reach this page.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="feature-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-key"></i>
            </div>
            <h2 className="h5 mb-2">JWT Verified</h2>
            <p className="text-muted mb-0">The backend validates the token before returning session data.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="feature-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-house-door"></i>
            </div>
            <h2 className="h5 mb-2">Project Home</h2>
            <p className="text-muted mb-3">Return to the main setup page whenever needed.</p>
            <Link className="btn btn-outline-primary" to="/">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
