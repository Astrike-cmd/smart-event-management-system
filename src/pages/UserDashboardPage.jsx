import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3">
          Protected User Route
        </span>
        <h1 className="display-6 fw-semibold mb-3">Welcome back, {user?.name}</h1>
        <p className="text-muted mb-0">
          Your authentication flow is active. In Phase 4, this page will evolve into the
          full user dashboard with profile insights, booking history, and event summaries.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="feature-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-person-badge"></i>
            </div>
            <h2 className="h5 mb-2">Authenticated Profile</h2>
            <p className="text-muted mb-0">Signed in as {user?.email}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="feature-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-shield-check"></i>
            </div>
            <h2 className="h5 mb-2">Protected Access</h2>
            <p className="text-muted mb-0">This page only opens when a valid JWT session exists.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="feature-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-arrow-right-circle"></i>
            </div>
            <h2 className="h5 mb-2">Next Module</h2>
            <p className="text-muted mb-3">Continue building the complete user experience phase by phase.</p>
            <Link className="btn btn-outline-primary" to="/">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserDashboardPage;
