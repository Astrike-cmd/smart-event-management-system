import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import brandMark from '../assets/brand-mark.svg';
import useAuth from '../hooks/useAuth';

function MainLayout() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <header className="border-bottom border-subtle sticky-top app-header">
        <nav className="navbar navbar-expand-lg">
          <div className="container py-2 flex-wrap gap-3">
            <NavLink className="navbar-brand d-flex align-items-center gap-3" to="/">
              <img src={brandMark} alt="Smart Event Management" width="42" height="42" />
              <div>
                <span className="brand-title d-block">Smart Event Management</span>
                <small className="brand-subtitle">Phase 2 Authentication</small>
              </div>
            </NavLink>

            <div className="d-flex align-items-center flex-wrap gap-2 ms-lg-auto">
              <NavLink className="btn btn-nav-link" to="/">
                Home
              </NavLink>

              {!isAuthenticated ? (
                <>
                  <NavLink className="btn btn-nav-link" to="/login">
                    User Login
                  </NavLink>
                  <NavLink className="btn btn-nav-link" to="/register">
                    Register
                  </NavLink>
                  <NavLink className="btn btn-nav-link" to="/admin/login">
                    Admin Login
                  </NavLink>
                </>
              ) : (
                <>
                  <span className="d-none d-md-inline-block text-muted small nav-user-pill">
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.name} ({user?.role})
                  </span>
                  <NavLink
                    className="btn btn-nav-link"
                    to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                  >
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </NavLink>
                  <button type="button" className="btn btn-nav-link" onClick={logout}>
                    Logout
                  </button>
                </>
              )}

              <div className="d-none d-xl-flex align-items-center gap-2 text-muted small">
                <i className="bi bi-shield-check"></i>
                <span>JWT, bcrypt, role-based auth</span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="border-top border-subtle py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2 text-muted small">
          <span>TYBSc IT Final Year Project Authentication Module</span>
          <span>JWT secured frontend and backend foundation</span>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
