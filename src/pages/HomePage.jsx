import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const featureCards = [
  {
    icon: 'bi-window-sidebar',
    title: 'Production-Shaped Frontend',
    description:
      'React, Vite, Bootstrap 5, React Router DOM, Axios, reusable folders, and auth-aware routing are configured.'
  },
  {
    icon: 'bi-key',
    title: 'Authentication APIs',
    description:
      'User registration, user login, admin login, current-user session lookup, and JWT issuance are working through REST APIs.'
  },
  {
    icon: 'bi-shield-lock',
    title: 'Security Baseline',
    description:
      'bcrypt password hashing, protected routes, role-based authorization, and admin bootstrap configuration are now ready.'
  }
];

const nextPhases = [
  'Phase 3: Landing Page',
  'Phase 4: User Dashboard',
  'Phase 5: Events Module',
  'Phase 6: Booking Module'
];

function HomePage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [health, setHealth] = useState({
    loading: true,
    status: 'Checking API connection...',
    variant: 'secondary'
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await api.get('/health');
        const databaseLabel =
          data.database.status === 'connected'
            ? 'MongoDB Atlas Connected'
            : 'MongoDB Atlas Not Connected Yet';

        setHealth({
          loading: false,
          status: `${data.message} | ${databaseLabel}`,
          variant: data.database.status === 'connected' ? 'success' : 'warning'
        });
      } catch (error) {
        setHealth({
          loading: false,
          status: 'Backend connection failed. Start the Express server on port 5000.',
          variant: 'danger'
        });
      }
    };

    checkHealth();
  }, []);

  const healthBadgeClass = useMemo(
    () => `badge rounded-pill text-bg-${health.variant} px-3 py-2`,
    [health.variant]
  );

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container py-5">
          <div className="row align-items-center g-4 py-lg-5">
            <div className="col-lg-7">
              <div className="glass-panel p-4 p-md-5">
                <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3">
                  Phase 2 Authentication Complete
                </span>
                <h1 className="display-5 fw-semibold mb-3">
                  Smart Event Management and Ticket Booking System
                </h1>
                <p className="lead text-muted mb-4">
                  The project now supports user registration, user login, admin login,
                  JWT-based session handling, protected routes, logout, and a MongoDB
                  Atlas-backed authentication flow.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                  <span className={healthBadgeClass}>
                    <i className="bi bi-activity me-2"></i>
                    {health.status}
                  </span>
                  <span className="text-muted small">
                    {health.loading ? 'Refreshing project status...' : 'Authentication module is ready.'}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  {!isAuthenticated ? (
                    <>
                      <Link className="btn btn-primary btn-lg px-4" to="/register">
                        Get Started
                      </Link>
                      <Link className="btn btn-outline-primary btn-lg px-4" to="/login">
                        User Login
                      </Link>
                      <Link className="btn btn-outline-dark btn-lg px-4" to="/admin/login">
                        Admin Login
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        className="btn btn-primary btn-lg px-4"
                        to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                      >
                        Open {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                      </Link>
                      <span className="auth-welcome-chip">
                        Signed in as {user?.name} ({user?.role})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="glass-panel p-4 h-100">
                <h2 className="h4 mb-4">Configured Stack</h2>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="setup-stat-card">
                      <span className="setup-stat-label">Frontend</span>
                      <strong>React + Vite</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="setup-stat-card">
                      <span className="setup-stat-label">Backend</span>
                      <strong>Node + Express</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="setup-stat-card">
                      <span className="setup-stat-label">Database</span>
                      <strong>MongoDB Atlas</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="setup-stat-card">
                      <span className="setup-stat-label">Auth Ready</span>
                      <strong>Live and Working</strong>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <h3 className="h6 text-uppercase text-muted mb-3">Upcoming Build Order</h3>
                <ul className="list-group list-group-flush">
                  {nextPhases.map((phase) => (
                    <li
                      key={phase}
                      className="list-group-item px-0 d-flex align-items-center gap-3"
                    >
                      <span className="phase-step-icon">
                        <i className="bi bi-arrow-right-short"></i>
                      </span>
                      <span>{phase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="row g-4">
            {featureCards.map((feature) => (
              <div className="col-md-4" key={feature.title}>
                <div className="feature-card h-100 p-4">
                  <div className="feature-icon mb-3">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <h2 className="h5 mb-2">{feature.title}</h2>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
