import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const heroHighlights = [
  {
    icon: 'bi-calendar-event',
    title: 'Discover curated events',
    description: 'Browse concerts, conferences, campus festivals, workshops, and community experiences.'
  },
  {
    icon: 'bi-ticket-perforated',
    title: 'Book in a few clicks',
    description: 'Move from discovery to secure checkout with a clear, guided booking journey.'
  },
  {
    icon: 'bi-shield-check',
    title: 'Built on secure access',
    description: 'JWT sessions, role-based access, and protected routes already power the platform foundation.'
  }
];

const platformStats = [
  { value: '2 roles', label: 'User and admin journeys are separated cleanly.' },
  { value: '24/7', label: 'Event browsing stays available from any device.' },
  { value: 'JWT', label: 'Session handling is ready for protected modules.' },
  { value: 'MongoDB', label: 'Backend data layer is connected and scalable.' }
];

const spotlightEvents = [
  {
    icon: 'bi-music-note-beamed',
    category: 'Music Nights',
    title: 'Live concerts and DJ showcases',
    description: 'Highlight high-energy performances with seat visibility, dates, and ticket availability.'
  },
  {
    icon: 'bi-mortarboard',
    category: 'Campus Events',
    title: 'College fests and seminars',
    description: 'Promote academic programs, technical sessions, and celebration-driven campus activities.'
  },
  {
    icon: 'bi-briefcase',
    category: 'Professional Meetups',
    title: 'Workshops and networking sessions',
    description: 'Support speaker-led events with structured schedules, venue details, and attendee flows.'
  }
];

const experienceSteps = [
  {
    icon: 'bi-search',
    title: 'Explore events',
    description: 'Users land on a clear homepage, scan categories, and find experiences that match their interests.'
  },
  {
    icon: 'bi-person-check',
    title: 'Sign in securely',
    description: 'Authentication keeps bookings personal while admins remain separated inside protected tools.'
  },
  {
    icon: 'bi-credit-card',
    title: 'Book with confidence',
    description: 'Upcoming booking flows will connect event selection, ticket quantity, and confirmation screens.'
  }
];

const audienceCards = [
  {
    icon: 'bi-people',
    title: 'For Attendees',
    description: 'Make discovery easy with featured events, simple navigation, and a clear path to booking.',
    points: ['Quick sign-up and login', 'Future booking history', 'Personalized event access']
  },
  {
    icon: 'bi-kanban',
    title: 'For Organizers and Admins',
    description: 'Manage the platform with secure admin access before advanced event and booking modules arrive.',
    points: ['Admin-only dashboard entry', 'Role-restricted controls', 'Ready for event operations']
  }
];

const roadmap = [
  { phase: 'Phase 3', label: 'Landing Page', status: 'Current build' },
  { phase: 'Phase 4', label: 'User Dashboard', status: 'Next up' },
  { phase: 'Phase 5', label: 'Events Module', status: 'Planned' },
  { phase: 'Phase 6', label: 'Booking Module', status: 'Planned' }
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
                <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3 hero-badge">
                  Phase 3 Active: Landing Page Experience
                </span>
                <h1 className="display-5 fw-semibold mb-3">
                  Launch and book standout events from one modern platform
                </h1>
                <p className="lead text-muted mb-4">
                  Smart Event Management and Ticket Booking System now moves beyond the
                  setup baseline with a polished public-facing experience that introduces
                  events, explains the product journey, and guides visitors toward secure
                  account access.
                </p>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  {!isAuthenticated ? (
                    <>
                      <Link className="btn btn-primary btn-lg px-4" to="/register">
                        Create Account
                      </Link>
                      <Link className="btn btn-outline-primary btn-lg px-4" to="/login">
                        Explore as User
                      </Link>
                      <Link className="btn btn-outline-dark btn-lg px-4" to="/admin/login">
                        Admin Access
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        className="btn btn-primary btn-lg px-4"
                        to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                      >
                        Open {isAdmin ? 'Admin Dashboard' : 'Your Dashboard'}
                      </Link>
                      <span className="auth-welcome-chip">
                        Signed in as {user?.name} ({user?.role})
                      </span>
                    </>
                  )}
                </div>

                <div className="hero-highlight-list mt-4">
                  {heroHighlights.map((item) => (
                    <div className="hero-highlight-item" key={item.title}>
                      <div className="feature-icon">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div>
                        <h2 className="h6 mb-1">{item.title}</h2>
                        <p className="text-muted mb-0">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="status-stack h-100">
                <div className="glass-panel p-4 status-card">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <span className="section-eyebrow">Platform Snapshot</span>
                      <h2 className="h4 mb-1">Build status and core readiness</h2>
                    </div>
                    <span className={healthBadgeClass}>
                      <i className="bi bi-activity me-2"></i>
                      {health.loading ? 'Checking API...' : 'API Live'}
                    </span>
                  </div>

                  <p className="text-muted mb-4">{health.status}</p>

                  <div className="hero-stat-grid">
                    {platformStats.map((stat) => (
                      <div className="setup-stat-card" key={stat.value}>
                        <strong>{stat.value}</strong>
                        <span className="setup-stat-label mt-2 mb-0">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-4 status-card">
                  <span className="section-eyebrow">Roadmap</span>
                  <h3 className="h5 mb-3">Current build order</h3>
                  <div className="status-roadmap">
                    {roadmap.map((item) => (
                      <div className="status-row" key={item.phase}>
                        <span className="phase-step-icon">
                          <i className="bi bi-arrow-right-short"></i>
                        </span>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between gap-3 flex-wrap">
                            <strong>{item.phase}</strong>
                            <span className="text-muted small">{item.status}</span>
                          </div>
                          <p className="text-muted mb-0 small">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <span className="section-eyebrow">Event Spotlights</span>
              <h2 className="display-6 fw-semibold mb-0">Showcase the experiences people want to attend</h2>
            </div>
            <p className="text-muted mb-0 landing-section-copy">
              The landing page now frames the product around discovery, ticketing, and trust instead of setup-only messaging.
            </p>
          </div>

          <div className="row g-4">
            {spotlightEvents.map((event) => (
              <div className="col-md-4" key={event.title}>
                <div className="feature-card spotlight-card h-100 p-4">
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <span className="spotlight-tag">{event.category}</span>
                    <div className="feature-icon">
                      <i className={`bi ${event.icon}`}></i>
                    </div>
                  </div>
                  <h2 className="h5 mb-2">{event.title}</h2>
                  <p className="text-muted mb-0">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="glass-panel p-4 p-md-5">
            <div className="row g-4 align-items-start">
              <div className="col-lg-5">
                <span className="section-eyebrow">Booking Journey</span>
                <h2 className="display-6 fw-semibold mb-3">Guide visitors from interest to action</h2>
                <p className="text-muted mb-0">
                  Phase 3 sets up the storytelling layer that future modules will plug into,
                  making the next dashboard, events, and booking phases feel connected from day one.
                </p>
              </div>
              <div className="col-lg-7">
                <div className="row g-3">
                  {experienceSteps.map((step, index) => (
                    <div className="col-md-4" key={step.title}>
                      <div className="journey-step h-100">
                        <span className="journey-step-number">0{index + 1}</span>
                        <div className="feature-icon mb-3">
                          <i className={`bi ${step.icon}`}></i>
                        </div>
                        <h3 className="h6 mb-2">{step.title}</h3>
                        <p className="text-muted mb-0 small">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="row g-4">
            {audienceCards.map((card) => (
              <div className="col-lg-6" key={card.title}>
                <div className="feature-card audience-card h-100 p-4 p-md-5">
                  <div className="feature-icon mb-3">
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <span className="section-eyebrow">Audience Focus</span>
                  <h2 className="h4 mb-3">{card.title}</h2>
                  <p className="text-muted mb-4">{card.description}</p>
                  <div className="d-grid gap-3">
                    {card.points.map((point) => (
                      <div className="auth-feature-item" key={point}>
                        <i className="bi bi-check2-circle"></i>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="section-eyebrow text-white-50">Ready To Continue</span>
              <h2 className="display-6 fw-semibold text-white mb-2">
                The landing page is ready for the next product modules
              </h2>
              <p className="mb-0 text-white-50">
                Continue into the user dashboard and event management phases with a stronger public-facing foundation.
              </p>
            </div>
            <div className="cta-actions">
              <Link className="btn btn-light btn-lg px-4" to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/register'}>
                {isAuthenticated ? 'Open Workspace' : 'Start With Registration'}
              </Link>
              {!isAuthenticated ? (
                <Link className="btn btn-outline-light btn-lg px-4" to="/login">
                  Sign In
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
