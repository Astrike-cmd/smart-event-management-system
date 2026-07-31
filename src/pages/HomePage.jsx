import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getMyBookings } from '../services/bookings';
import { getFeaturedEvents } from '../services/events';
import useAuth from '../hooks/useAuth';

const HOMEPAGE_BOOKINGS_PREFERENCE_KEY = 'smart-event-homepage-bookings';

const heroHighlights = [
  {
    icon: 'bi-calendar-event',
    title: 'Discover real live events',
    description:
      'Browse concerts, conferences, workshops, festivals, and community experiences created inside the platform.'
  },
  {
    icon: 'bi-ticket-perforated',
    title: 'Book in a few clicks',
    description:
      'Move from discovery to checkout with a cleaner flow, direct pricing, and clear ticket availability.'
  },
  {
    icon: 'bi-shield-check',
    title: 'Operate with control',
    description:
      'JWT sessions, role-based access, and admin controls keep event publishing and booking operations secure.'
  }
];

const platformStats = [
  { value: 'Users + Admins', label: 'Attendee workspaces and admin controls stay separated.' },
  { value: 'Live API', label: 'Home, events, and bookings read directly from the backend.' },
  { value: 'JWT', label: 'Protected routes keep account and admin actions secure.' },
  { value: 'MongoDB', label: 'Event and booking records stay persistent and editable.' }
];

const platformFocus = [
  {
    title: 'Live event discovery',
    label: 'Public event listings and featured event placement',
    status: 'Active'
  },
  {
    title: 'Secure access',
    label: 'User registration, login, and admin-only routes',
    status: 'Secured'
  },
  {
    title: 'Booking management',
    label: 'Ticket confirmation, booking history, and cancellation',
    status: 'Active'
  },
  {
    title: 'Admin oversight',
    label: 'Delete stale events and manage user bookings',
    status: 'Active'
  }
];

const experienceSteps = [
  {
    icon: 'bi-search',
    title: 'Explore events',
    description:
      'Users land on a cleaner homepage, scan categories, and find experiences that match their interests.'
  },
  {
    icon: 'bi-person-check',
    title: 'Sign in securely',
    description:
      'Authentication keeps bookings personal while admins remain separated inside protected tools.'
  },
  {
    icon: 'bi-credit-card',
    title: 'Book with confidence',
    description:
      'Live booking flows connect event details, ticket quantity, confirmation tracking, and booking history.'
  }
];

const audienceCards = [
  {
    icon: 'bi-people',
    title: 'For Attendees',
    description: 'Make discovery easy with featured events, simple navigation, and a clear path to booking.',
    points: ['Quick sign-up and login', 'Live booking history', 'Personal event access']
  },
  {
    icon: 'bi-kanban',
    title: 'For Organizers and Admins',
    description: 'Users create events while admins oversee platform quality and booking operations.',
    points: ['User event creator workspace', 'Admin booking controls', 'Event cleanup and oversight']
  }
];

const formatEventDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date TBD';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

function HomePage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [health, setHealth] = useState({
    loading: true,
    status: 'Checking API connection...',
    variant: 'secondary'
  });
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [featuredEventsLoading, setFeaturedEventsLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showBookingsOnHome, setShowBookingsOnHome] = useState(() => {
    const storedPreference = window.localStorage.getItem(HOMEPAGE_BOOKINGS_PREFERENCE_KEY);
    return storedPreference !== 'false';
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

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        const events = await getFeaturedEvents(3);
        setFeaturedEvents(events);
      } catch (error) {
        setFeaturedEvents([]);
      } finally {
        setFeaturedEventsLoading(false);
      }
    };

    loadFeaturedEvents();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      HOMEPAGE_BOOKINGS_PREFERENCE_KEY,
      String(showBookingsOnHome)
    );
  }, [showBookingsOnHome]);

  useEffect(() => {
    const loadRecentBookings = async () => {
      if (!isAuthenticated || isAdmin || !showBookingsOnHome) {
        setRecentBookings([]);
        setBookingsLoading(false);
        return;
      }

      setBookingsLoading(true);

      try {
        const bookings = await getMyBookings();
        setRecentBookings(bookings.slice(0, 3));
      } catch (error) {
        setRecentBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    loadRecentBookings();
  }, [isAdmin, isAuthenticated, showBookingsOnHome]);

  const healthBadgeClass = useMemo(
    () => (health.loading ? 'Checking API...' : health.variant === 'danger' ? 'Needs attention' : 'Connected'),
    [health.loading, health.variant]
  );

  const toggleHomepageBookings = () => {
    setShowBookingsOnHome((currentValue) => !currentValue);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container py-5">
          <div className="row align-items-center g-4 py-lg-5">
            <div className="col-lg-7">
              <div className="glass-panel p-4 p-md-5">
                <span className="section-pill mb-3 hero-badge">
                  Live Event Platform
                </span>
                <h1 className="display-5 fw-semibold mb-3">
                  A cleaner way to publish, manage, and book events
                </h1>
                <p className="lead text-muted mb-4">
                  Smart Event Management brings event discovery, account access, booking,
                  and admin oversight together in one tighter, production-focused interface.
                </p>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  {!isAuthenticated ? (
                    <>
                      <Link className="btn btn-primary btn-lg px-4" to="/register">
                        Create Account
                      </Link>
                      <Link className="btn btn-outline-primary btn-lg px-4" to="/events">
                        Browse Events
                      </Link>
                      <Link className="btn btn-outline-primary btn-lg px-4" to="/admin/login">
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
                      <span className="section-eyebrow">Platform Status</span>
                      <h2 className="h4 mb-1">System health and availability</h2>
                    </div>
                    <span className="health-status-pill">
                      <i className="bi bi-activity me-2"></i>
                      {healthBadgeClass}
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
                  <span className="section-eyebrow">Operations</span>
                  <h3 className="h5 mb-3">Current platform coverage</h3>
                  <div className="status-list">
                    {platformFocus.map((item) => (
                      <div className="status-row" key={item.title}>
                        <span className="status-step-icon">
                          <i className="bi bi-arrow-right-short"></i>
                        </span>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between gap-3 flex-wrap">
                            <strong>{item.title}</strong>
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
              <h2 className="display-6 fw-semibold mb-0">Featured events people can book right now</h2>
            </div>
            <p className="text-muted mb-0 landing-section-copy">
              Featured cards pull from real upcoming event records only.
            </p>
          </div>

          {featuredEventsLoading ? (
            <div className="glass-panel p-4">
              <p className="text-muted mb-0">Loading featured events...</p>
            </div>
          ) : null}

          {!featuredEventsLoading && featuredEvents.length > 0 ? (
            <div className="row g-4">
              {featuredEvents.map((event) => (
                <div className="col-md-4" key={event._id || event.slug}>
                  <div className="feature-card spotlight-card h-100 p-4">
                    <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                      <span className="spotlight-tag">{event.category}</span>
                      <span className="event-price-chip">
                        {event.price === 0 ? 'Free' : `Rs. ${event.price}`}
                      </span>
                    </div>
                    <h2 className="h5 mb-2">{event.title}</h2>
                    <p className="text-muted mb-3">{event.description}</p>
                    <div className="event-meta-list">
                      <div className="event-meta-row">
                        <span>Date</span>
                        <strong>{formatEventDate(event.startDate)}</strong>
                      </div>
                      <div className="event-meta-row">
                        <span>Venue</span>
                        <strong>
                          {event.venue}, {event.city}
                        </strong>
                      </div>
                      <div className="event-meta-row">
                        <span>Tickets Left</span>
                        <strong>{event.availableTickets}</strong>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link className="btn btn-primary" to={`/events/${event.slug}`}>
                        {event.availableTickets === 0 ? 'View Details' : 'Book Event'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!featuredEventsLoading && featuredEvents.length === 0 ? (
            <div className="glass-panel p-4 p-md-5 empty-state-card">
              <span className="section-eyebrow">No Featured Events</span>
              <h3 className="h4 mb-3">The homepage stays empty until real events are published</h3>
              <p className="text-muted mb-4">
                Publish featured upcoming events to surface them here, or use admin controls
                to remove stale records from the inventory.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link className="btn btn-primary" to={isAdmin ? '/admin/dashboard' : '/events'}>
                  {isAdmin ? 'Open Admin Dashboard' : 'Browse All Events'}
                </Link>
                {isAdmin ? (
                  <Link className="btn btn-outline-primary" to="/admin/bookings">
                    Open Admin Bookings
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <div className="d-flex flex-wrap gap-3">
              <Link className="btn btn-outline-primary" to="/events">
                Browse All Events
              </Link>
              {isAdmin ? (
                <Link className="btn btn-nav-link" to="/admin/dashboard">
                  Review Event Inventory
                </Link>
              ) : null}
            </div>
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
                  Give visitors a clear path from discovery to confirmation with real event data,
                  account access, and booking history that all stay in sync.
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

      {isAuthenticated && !isAdmin ? (
        <section className="pb-5">
          <div className="container">
            <div className="glass-panel p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
                <div>
                  <span className="section-eyebrow">Home Bookings</span>
                  <h2 className="h3 mb-0">Recent bookings on your home page</h2>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={toggleHomepageBookings}
                  >
                    {showBookingsOnHome ? 'Hide On Home' : 'Show On Home'}
                  </button>
                  <Link className="btn btn-primary" to="/bookings">
                    Manage Bookings
                  </Link>
                </div>
              </div>

              {showBookingsOnHome ? (
                <>
                  {bookingsLoading ? <p className="text-muted mb-0">Loading your recent bookings...</p> : null}

                  {!bookingsLoading && recentBookings.length > 0 ? (
                    <div className="row g-3">
                      {recentBookings.map((booking) => (
                        <div className="col-md-4" key={booking._id}>
                          <article className="dashboard-mini-card h-100 home-booking-card">
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                              <span className="spotlight-tag">{booking.bookingReference}</span>
                              <span className="event-price-chip">{booking.bookingStatus}</span>
                            </div>
                            <h3 className="h6 mb-2">{booking.eventTitle}</h3>
                            <p className="text-muted small mb-3">
                              {booking.quantity} ticket(s) • {formatEventDate(booking.eventStartDate)}
                            </p>
                            <div className="event-meta-list">
                              <div className="event-meta-row">
                                <span>Venue</span>
                                <strong>
                                  {booking.venue}, {booking.city}
                                </strong>
                              </div>
                              <div className="event-meta-row">
                                <span>Total</span>
                                <strong>Rs. {booking.totalAmount}</strong>
                              </div>
                            </div>
                          </article>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {!bookingsLoading && recentBookings.length === 0 ? (
                    <div className="dashboard-mini-card p-4">
                      <h3 className="h5 mb-2">No bookings to show yet</h3>
                      <p className="text-muted mb-3">
                        Once you book an event, your most recent activity appears here for quicker access.
                      </p>
                      <Link className="btn btn-primary" to="/events">
                        Browse Events
                      </Link>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="dashboard-mini-card p-4">
                  <h3 className="h5 mb-2">Homepage booking preview is turned off</h3>
                  <p className="text-muted mb-3">
                    Turn it back on any time from here or from your bookings page.
                  </p>
                  <button type="button" className="btn btn-primary" onClick={toggleHomepageBookings}>
                    Show Bookings On Home
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="pb-5">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="section-eyebrow text-white-50">All-In-One Workspace</span>
              <h2 className="display-6 fw-semibold text-white mb-2">
                Keep discovery, booking, and admin control in one place
              </h2>
              <p className="mb-0 text-white-50">
                Move from live event discovery into booking and platform operations without leaving the product.
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
