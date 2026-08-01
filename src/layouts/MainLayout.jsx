import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import useAuth from '../hooks/useAuth';

function MainLayout() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <header className="border-bottom border-subtle sticky-top app-header">
        <nav className="navbar navbar-expand-lg">
          <div className="container py-2 gap-3">
            <div className="d-flex align-items-center justify-content-between gap-3 app-header-brand-row">
              <NavLink className="navbar-brand d-flex align-items-center" to="/">
                <div>
                  <span className="brand-title d-block">EVENTIFY</span>
                  <small className="brand-subtitle">Event booking platform</small>
                </div>
              </NavLink>

              <div className="d-flex align-items-center gap-2 app-header-controls">
                <ThemeToggle />
                <button
                  className="navbar-toggler app-navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#primaryNavigation"
                  aria-controls="primaryNavigation"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <i className="bi bi-list" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <div className="collapse navbar-collapse app-navbar-collapse" id="primaryNavigation">
              <div className="d-flex align-items-lg-center gap-2 ms-lg-auto flex-column flex-lg-row w-100 justify-content-lg-end">
                {isAuthenticated ? (
                  <span className="d-inline-flex text-muted small nav-user-pill align-self-start align-self-lg-center">
                    {user?.name} ({user?.role})
                  </span>
                ) : null}

                <div className="app-nav-scroll">
                  <NavLink className="btn btn-nav-link" to="/">
                    Home
                  </NavLink>
                  <NavLink className="btn btn-nav-link" to="/events">
                    Events
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
                      {!isAdmin ? (
                        <>
                          <NavLink className="btn btn-nav-link" to="/my-events">
                            My Events
                          </NavLink>
                          <NavLink className="btn btn-nav-link" to="/bookings">
                            My Bookings
                          </NavLink>
                        </>
                      ) : (
                        <NavLink className="btn btn-nav-link" to="/admin/bookings">
                          Admin Bookings
                        </NavLink>
                      )}
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
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="border-top border-subtle py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2 text-muted small">
          <span>EVENTIFY keeps event publishing, ticket booking, and account access in one workspace</span>
          <span>Admins manage platform quality while users manage their own events and bookings</span>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
