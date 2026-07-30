import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <section className="container py-5 auth-layout">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="glass-panel p-4 p-md-5 h-100">
                <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3">
                  Phase 2 Authentication
                </span>
                <h1 className="display-6 fw-semibold mb-3">Secure access for users and admins</h1>
                <p className="text-muted mb-4">
                  Register user accounts, sign in securely with JWT, and protect routes
                  based on role using the same beginner-friendly project structure.
                </p>
                <div className="auth-feature-list d-grid gap-3">
                  <div className="auth-feature-item">
                    <i className="bi bi-person-check"></i>
                    <span>User registration and login</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-shield-lock"></i>
                    <span>JWT authentication and protected routes</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-person-gear"></i>
                    <span>Admin login with role-based authorization</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top border-subtle">
                  <Link className="text-primary fw-semibold" to="/">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to home
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthLayout;
