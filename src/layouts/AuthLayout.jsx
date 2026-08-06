import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <section className="container py-5 auth-layout auth-layout--simple">
      <div className="auth-simple-header">
        <Link className="auth-brand-link" to="/">
          <span className="auth-brand-mark">E</span>
          <span>Eventify</span>
        </Link>
        <Link className="auth-back-link" to="/">
          <i className="bi bi-arrow-left" aria-hidden="true" /> Back to events
        </Link>
      </div>

      <div className="auth-simple-form">
        <Outlet />
      </div>
    </section>
  );
}

export default AuthLayout;
