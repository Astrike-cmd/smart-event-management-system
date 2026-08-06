import { Link, Outlet } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

function AuthLayout() {
  return (
    <section className="container py-5 auth-layout auth-layout--simple">
      <div className="auth-simple-header">
        <Link className="auth-brand-link" to="/" aria-label="Eventify home">
          <BrandLogo />
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
