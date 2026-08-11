import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/events';
import { getMyBookings } from '../services/bookings';
import useAuth from '../hooks/useAuth';

const formatDate = (value, options) => {
  if (!value) {
    return 'Not available yet';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available yet';
  }

  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

function UserDashboardPage() {
  const { user, updateProfilePhoto } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a PNG, JPG, or WebP image.');
      return;
    }

    if (file.size > 1_000_000) {
      setPhotoError('Choose an image smaller than 1 MB.');
      return;
    }

    setPhotoError('');
    setIsUploadingPhoto(true);

    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read this image.'));
        reader.readAsDataURL(file);
      });

      await updateProfilePhoto(imageData);
    } catch (error) {
      setPhotoError(error.response?.data?.message || error.message || 'Unable to update your profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const accountSummary = useMemo(() => {
    const memberSince = formatDate(user?.createdAt, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const lastUpdated = formatDate(user?.updatedAt, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const initials = user?.name
      ? user.name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'SE';
    const shortId = user?._id ? `${user._id.slice(0, 6)}...${user._id.slice(-4)}` : 'Pending';

    return {
      memberSince,
      lastUpdated,
      initials,
      shortId,
      firstName: user?.name?.split(' ')[0] || 'there'
    };
  }, [user]);

  const overviewCards = [
    {
      icon: 'bi-person-check',
      label: 'Account Status',
      value: 'Authenticated',
      description: 'Your user session is active and protected by JWT.'
    },
    {
      icon: 'bi-calendar2-check',
      label: 'Member Since',
      value: accountSummary.memberSince,
      description: 'Core account details are available directly from your session.'
    },
    {
      icon: 'bi-shield-lock',
      label: 'Access Level',
      value: user?.role === 'user' ? 'User Workspace' : 'Restricted',
      description: 'Role-based access keeps attendee and admin journeys separate.'
    },
    {
      icon: 'bi-arrow-up-right-circle',
      label: 'Booking Status',
      value: 'Connected',
      description: 'Your account connects event discovery, booking creation, and booking history.'
    }
  ];

  const workspaceCards = [
    {
      icon: 'bi-person-vcard',
      title: 'Profile Details',
      description: 'Review the identity details currently stored in your authenticated account.'
    },
    {
      icon: 'bi-ticket-detailed',
      title: 'Booking Workspace',
      description: 'Review confirmed tickets, cancellations, payment state, and event timelines.'
    },
    {
      icon: 'bi-calendar-plus',
      title: 'Event Creator Tools',
      description: 'Create your own events, update listings, and manage ticket inventory from a protected route.'
    },
    {
      icon: 'bi-stars',
      title: 'Account Overview',
      description: 'Keep your event activity, profile details, and key actions in one place.'
    }
  ];

  const workspaceHighlights = [
    'Secure sign-in and session restoration are active.',
    'Role-based routing keeps this dashboard available only to normal users.',
    'Profile metadata stays synced with the authenticated account.',
    'Event discovery, booking history, and user-created events are connected.'
  ];

  const quickActions = [
    {
      icon: 'bi-house-door',
      title: 'Browse Landing Page',
      description: 'Return to the public homepage and review the product entry experience.',
      to: '/',
      buttonLabel: 'Go Home'
    },
    {
      icon: 'bi-calendar-event',
      title: 'Open Events Module',
      description: 'Open the live events listing and browse what is currently available on the platform.',
      to: '/events',
      buttonLabel: 'View Events'
    },
    {
      icon: 'bi-calendar-plus',
      title: 'Manage My Events',
      description: 'Create your own events, update ticket inventory, and maintain organizer listings.',
      to: '/my-events',
      buttonLabel: 'Open My Events'
    },
    {
      icon: 'bi-ticket-perforated',
      title: 'View My Bookings',
      description: 'Review your confirmed tickets, track totals, and cancel bookings if needed.',
      to: '/bookings',
      buttonLabel: 'Open Bookings'
    }
  ];


  useEffect(() => {
    const loadRecentBookings = async () => {
      try {
        setRecentBookings((await getMyBookings()).slice(0, 3));
      } catch {
        setRecentBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    loadRecentBookings();
  }, []);  useEffect(() => {
    const loadVisibleEvents = async () => {
      try {
        const events = await getEvents({ limit: 3, upcoming: true });
        setUpcomingEvents(events);
      } catch (error) {
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    loadVisibleEvents();
  }, []);

  return (
    <section className="container py-5 user-dashboard-page">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="dashboard-hero-grid">
          <div>
            <span className="section-pill mb-3">
              User Workspace
            </span>
            <h1 className="display-6 fw-semibold mb-3">
              Welcome back, {accountSummary.firstName}
            </h1>
            <p className="text-muted mb-4">
              Your dashboard brings profile visibility, session details, and direct access
              to booking and event tools into one place.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link className="btn btn-primary dashboard-explore-button" to="/events">
                <i className="bi bi-calendar-event" aria-hidden="true" />
                Explore events
              </Link>
              <span className="auth-welcome-chip">
                {user?.email}
              </span>
            </div>
            <div className="dashboard-tickets-card">
              <div className="dashboard-tickets-heading">
                <div>
                  <span className="section-eyebrow">Your tickets</span>
                  <h2>Upcoming bookings</h2>
                </div>
                <Link to="/bookings" aria-label="View all bookings"><i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
              </div>

              {bookingsLoading ? <p className="dashboard-tickets-empty">Loading tickets…</p> : null}
              {!bookingsLoading && recentBookings.length > 0 ? (
                <div className="dashboard-ticket-list">
                  {recentBookings.map((booking) => (
                    <Link className="dashboard-ticket-row" to="/bookings" key={booking._id}>
                      <span className="dashboard-ticket-icon"><i className="bi bi-ticket-perforated" aria-hidden="true" /></span>
                      <span>
                        <strong>{booking.eventTitle}</strong>
                        <small>{formatDate(booking.eventStartDate, { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                      </span>
                      <i className="bi bi-chevron-right" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              ) : null}
              {!bookingsLoading && recentBookings.length === 0 ? <p className="dashboard-tickets-empty">No tickets yet. Find an event to get started.</p> : null}
            </div>
          </div>

          <div className="dashboard-profile-card">
                        <div className="profile-photo-control">
              <div className="dashboard-avatar dashboard-avatar--photo">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name + ' profile'} />
                ) : (
                  accountSummary.initials
                )}
              </div>
              <label className="profile-photo-button" htmlFor="profilePhoto">
                <i className={'bi ' + (isUploadingPhoto ? 'bi-arrow-repeat' : 'bi-camera')} aria-hidden="true" />
                <span>{isUploadingPhoto ? 'Uploading…' : 'Change photo'}</span>
              </label>
              <input
                id="profilePhoto"
                className="visually-hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleProfilePhotoChange}
                disabled={isUploadingPhoto}
              />
            </div>
            <div>
              <span className="section-eyebrow">Account Overview</span>
              <h2 className="h4 mb-1">{user?.name}</h2>
              <p className="text-muted mb-4">
                Personal dashboard access is active and ready to use.
              </p>
            </div>

                        {photoError ? <p className="profile-photo-error" role="alert">{photoError}</p> : null}
<div className="dashboard-meta-list">
              <div className="dashboard-meta-row">
                <span>Role</span>
                <strong>{user?.role}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Member Since</span>
                <strong>{accountSummary.memberSince}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Account ID</span>
                <strong>{accountSummary.shortId}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Last Synced</span>
                <strong>{accountSummary.lastUpdated}</strong>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {overviewCards.map((card) => (
          <div className="col-md-6 col-xl-3" key={card.label}>
            <div className="feature-card dashboard-stat-card p-4 h-100">
              <span className="dashboard-stat-label">{card.label}</span>
              <h2 className="h5 mb-2">{card.value}</h2>
              <p className="text-muted mb-0 small">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="glass-panel p-4 p-md-5 h-100">
            <span className="section-eyebrow">Workspace</span>
            <h2 className="h3 mb-4">Tools in your workspace</h2>
            <div className="row g-3">
              {workspaceCards.map((card) => (
                <div className="col-md-4" key={card.title}>
                  <div className="dashboard-mini-card h-100">
                    <h3 className="h6 mb-2">{card.title}</h3>
                    <p className="text-muted mb-0 small">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass-panel p-4 p-md-5 h-100">
            <span className="section-eyebrow">Workspace Highlights</span>
            <h2 className="h3 mb-4">What is available here</h2>
            <div className="dashboard-checklist">
              {workspaceHighlights.map((item) => (
                <div className="dashboard-check-item" key={item}>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
          <div>
            <span className="section-eyebrow">Upcoming Events</span>
            <h2 className="h3 mb-0">What you can explore next</h2>
          </div>
          <div className="section-action-group">
            <Link className="btn btn-outline-primary" to="/events">
              Go to Events
            </Link>
            <Link className="btn btn-primary" to="/my-events">
              Manage My Events
            </Link>
          </div>
        </div>

        {eventsLoading ? <p className="text-muted mb-0">Loading upcoming events...</p> : null}

        {!eventsLoading && upcomingEvents.length > 0 ? (
          <div className="row g-3">
            {upcomingEvents.map((event) => (
              <div className="col-md-4" key={event._id}>
                <div className="dashboard-mini-card h-100">
                  <span className="spotlight-tag">{event.category}</span>
                  <h3 className="h6 mt-3 mb-2">{event.title}</h3>
                  <p className="text-muted small mb-3">{event.description}</p>
                  <div className="event-meta-list">
                    <div className="event-meta-row">
                      <span>City</span>
                      <strong>{event.city}</strong>
                    </div>
                    <div className="event-meta-row">
                      <span>Tickets Left</span>
                      <strong>{event.availableTickets}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!eventsLoading && upcomingEvents.length === 0 ? (
          <p className="text-muted mb-0">Upcoming events will appear here once the events API is reachable.</p>
        ) : null}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="feature-card p-4 p-md-5 h-100">
            <span className="section-eyebrow">Profile Details</span>
            <h2 className="h4 mb-4">Your authenticated account data</h2>
            <div className="dashboard-meta-list">
              <div className="dashboard-meta-row">
                <span>Full Name</span>
                <strong>{user?.name}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Email Address</span>
                <strong>{user?.email}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Role</span>
                <strong>{user?.role}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Session Type</span>
                <strong>Protected user session</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="feature-card p-4 p-md-5 h-100">
            <span className="section-eyebrow">Quick Actions</span>
            <h2 className="h4 mb-4">Move through the product</h2>
            <div className="d-grid gap-3">
              {quickActions.map((action) => (
                <div className="dashboard-action-card" key={action.title}>
                  <div className="flex-grow-1">
                    <h3 className="h6 mb-2">{action.title}</h3>
                    <p className="text-muted mb-3 small">{action.description}</p>
                    <Link className="btn btn-outline-primary" to={action.to}>
                      {action.buttonLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserDashboardPage;
