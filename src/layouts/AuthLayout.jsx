import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <section className="container py-5 auth-layout">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="glass-panel p-4 p-md-5 h-100">
                <span className="section-pill mb-3">
                  Secure Access
                </span>
                <h1 className="display-6 fw-semibold mb-3">Secure access for users and admins</h1>
                <p className="text-muted mb-4">
                  Register accounts, sign in, and move into the right workspace from one
                  clean authentication flow.
                </p>
                <div className="auth-feature-list d-grid gap-3">
                  <div className="auth-feature-item">
                    <i className="bi bi-person-check"></i>
                    <span>User registration and sign-in</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-shield-lock"></i>
                    <span>Protected sessions and route access</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-person-gear"></i>
                    <span>Dedicated admin access</span>
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
