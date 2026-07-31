import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { deleteEvent, getManagedEvents } from '../services/events';

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date TBD';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

function AdminDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeleteId, setActiveDeleteId] = useState('');
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const eventStats = useMemo(() => {
    const published = events.filter((event) => event.status === 'published').length;
    const cancelled = events.filter((event) => event.status === 'cancelled').length;
    const tickets = events.reduce((sum, event) => sum + (event.availableTickets || 0), 0);

    return { total: events.length, published, cancelled, tickets };
  }, [events]);

  useEffect(() => {
    const loadAdminEvents = async () => {
      try {
        const nextEvents = await getManagedEvents();
        setEvents(nextEvents);
      } catch (error) {
        setFeedback({
          type: 'danger',
          message:
            error.response?.data?.message ||
            'Unable to load event records. Make sure the backend is running and the admin session is valid.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminEvents();
  }, []);

  const handleDelete = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Delete "${eventTitle}"? Active bookings tied to this event will be cancelled automatically.`
    );

    if (!confirmed) {
      return;
    }

    setActiveDeleteId(eventId);
    setFeedback({ type: '', message: '' });

    try {
      const response = await deleteEvent(eventId);
      setEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
      setFeedback({
        type: 'success',
        message:
          response.cancelledBookingsCount > 0
            ? `Event deleted. ${response.cancelledBookingsCount} booking(s) were cancelled automatically.`
            : 'Event deleted successfully.'
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to delete this event right now.'
      });
    } finally {
      setActiveDeleteId('');
    }
  };

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <span className="badge rounded-pill text-bg-warning px-3 py-2 mb-3">
              Admin Event Oversight
            </span>
            <h1 className="display-6 fw-semibold mb-3">Oversee platform events</h1>
            <p className="text-muted mb-0">
              Signed in as <strong>{user?.email}</strong>. Admin accounts can review all events,
              delete events, and manage bookings, but they can no longer create events.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link className="btn btn-outline-primary" to="/events">
              View Public Events Page
            </Link>
            <Link className="btn btn-primary" to="/admin/bookings">
              Open Booking Operations
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-calendar-event"></i>
            </div>
            <span className="dashboard-stat-label">Total Events</span>
            <h2 className="h5 mb-2">{eventStats.total}</h2>
            <p className="text-muted mb-0 small">Every event record currently visible to admins.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-broadcast"></i>
            </div>
            <span className="dashboard-stat-label">Published</span>
            <h2 className="h5 mb-2">{eventStats.published}</h2>
            <p className="text-muted mb-0 small">Events currently exposed to public event discovery.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-x-octagon"></i>
            </div>
            <span className="dashboard-stat-label">Cancelled</span>
            <h2 className="h5 mb-2">{eventStats.cancelled}</h2>
            <p className="text-muted mb-0 small">Events that are no longer active on the platform.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-ticket-perforated"></i>
            </div>
            <span className="dashboard-stat-label">Tickets Available</span>
            <h2 className="h5 mb-2">{eventStats.tickets}</h2>
            <p className="text-muted mb-0 small">Open inventory remaining across all listed events.</p>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div className={`alert alert-${feedback.type || 'info'}`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="glass-panel p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
          <div>
            <span className="section-eyebrow">Event Inventory</span>
            <h2 className="h3 mb-0">Platform-wide event feed</h2>
          </div>
          <span className="text-muted small">Admins can review or delete any event record.</span>
        </div>

        {loading ? <p className="text-muted mb-0">Loading events...</p> : null}

        {!loading && events.length > 0 ? (
          <div className="event-admin-list">
            {events.map((event) => (
              <article className="dashboard-action-card" key={event._id}>
                <div className="d-flex justify-content-between gap-3 flex-wrap mb-2">
                  <div>
                    <h3 className="h6 mb-1">{event.title}</h3>
                    <p className="text-muted small mb-0">
                      {event.category} | {event.city} | {event.venue}
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="spotlight-tag">{event.status}</span>
                    {event.featured ? <span className="event-price-chip">Featured</span> : null}
                  </div>
                </div>
                <p className="text-muted small mb-3">{event.description}</p>
                <div className="event-meta-list">
                  <div className="event-meta-row">
                    <span>Organizer</span>
                    <strong>{event.organizerName}</strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Created By</span>
                    <strong>{event.createdBy?.email || 'Seeded record'}</strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Date</span>
                    <strong>{formatDate(event.startDate)}</strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Tickets</span>
                    <strong>
                      {event.availableTickets} / {event.totalTickets}
                    </strong>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap mt-4">
                  {['published', 'sold_out'].includes(event.status) ? (
                    <Link className="btn btn-outline-primary" to={`/events/${event.slug}`}>
                      Open Event
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(event._id, event.title)}
                    disabled={activeDeleteId === event._id}
                  >
                    {activeDeleteId === event._id ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && events.length === 0 ? (
          <p className="text-muted mb-0">No events exist yet. User-created events will appear here.</p>
        ) : null}
      </div>
    </section>
  );
}

export default AdminDashboardPage;
