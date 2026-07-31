import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { createEvent, getAdminEvents } from '../services/events';

const initialFormState = {
  title: '',
  category: 'Conference',
  city: '',
  venue: '',
  organizerName: '',
  startDate: '',
  endDate: '',
  price: '',
  totalTickets: '',
  availableTickets: '',
  status: 'published',
  featured: false,
  description: ''
};

function AdminDashboardPage() {
  const { user } = useAuth();
  const [formState, setFormState] = useState(initialFormState);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const eventStats = useMemo(() => {
    const published = events.filter((event) => event.status === 'published').length;
    const featured = events.filter((event) => event.featured).length;
    const tickets = events.reduce((sum, event) => sum + (event.availableTickets || 0), 0);

    return { total: events.length, published, featured, tickets };
  }, [events]);

  useEffect(() => {
    const loadAdminEvents = async () => {
      try {
        const nextEvents = await getAdminEvents();
        setEvents(nextEvents);
      } catch (error) {
        setFeedback({
          type: 'danger',
          message: 'Unable to load admin events. Make sure the backend is running and the admin session is valid.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminEvents();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const nextEvent = await createEvent(formState);
      setEvents((currentEvents) => [nextEvent, ...currentEvents]);
      setFormState(initialFormState);
      setFeedback({
        type: 'success',
        message: 'Event created successfully and added to the admin list.'
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || error.message || 'Unable to create the event.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <span className="badge rounded-pill text-bg-warning px-3 py-2 mb-3">
              Phase 5 Admin Events Console
            </span>
            <h1 className="display-6 fw-semibold mb-3">Manage live events</h1>
            <p className="text-muted mb-0">
              Signed in as <strong>{user?.email}</strong>. This protected admin area now supports
              event publishing for the new events module before the full admin system arrives.
            </p>
          </div>
          <Link className="btn btn-outline-primary" to="/events">
            View Public Events Page
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-calendar-event"></i>
            </div>
            <span className="dashboard-stat-label">Total Events</span>
            <h2 className="h5 mb-2">{eventStats.total}</h2>
            <p className="text-muted mb-0 small">All event records currently visible to admins.</p>
          </div>
        </div>
        <div className="col-md-4 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-broadcast"></i>
            </div>
            <span className="dashboard-stat-label">Published</span>
            <h2 className="h5 mb-2">{eventStats.published}</h2>
            <p className="text-muted mb-0 small">Events currently shown through the public listing API.</p>
          </div>
        </div>
        <div className="col-md-4 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-stars"></i>
            </div>
            <span className="dashboard-stat-label">Featured</span>
            <h2 className="h5 mb-2">{eventStats.featured}</h2>
            <p className="text-muted mb-0 small">Featured items can surface on the landing page spotlight.</p>
          </div>
        </div>
        <div className="col-md-4 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <div className="feature-icon mb-3">
              <i className="bi bi-ticket-perforated"></i>
            </div>
            <span className="dashboard-stat-label">Tickets Available</span>
            <h2 className="h5 mb-2">{eventStats.tickets}</h2>
            <p className="text-muted mb-0 small">Current inventory available across all created events.</p>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div className={`alert alert-${feedback.type} mt-4`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="row g-4 mt-1">
        <div className="col-xl-5">
          <div className="glass-panel p-4 p-md-5 h-100">
            <span className="section-eyebrow">Create Event</span>
            <h2 className="h3 mb-4">Publish a new event</h2>
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-12">
                <label className="form-label" htmlFor="title">
                  Event Title
                </label>
                <input
                  id="title"
                  name="title"
                  className="form-control auth-input"
                  value={formState.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-select auth-input"
                  value={formState.category}
                  onChange={handleChange}
                >
                  <option value="Conference">Conference</option>
                  <option value="Festival">Festival</option>
                  <option value="Networking">Networking</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Music">Music</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select auth-input"
                  value={formState.status}
                  onChange={handleChange}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  className="form-control auth-input"
                  value={formState.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="venue">
                  Venue
                </label>
                <input
                  id="venue"
                  name="venue"
                  className="form-control auth-input"
                  value={formState.venue}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="organizerName">
                  Organizer
                </label>
                <input
                  id="organizerName"
                  name="organizerName"
                  className="form-control auth-input"
                  value={formState.organizerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="price">
                  Ticket Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  className="form-control auth-input"
                  value={formState.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="totalTickets">
                  Total Tickets
                </label>
                <input
                  id="totalTickets"
                  name="totalTickets"
                  type="number"
                  min="1"
                  className="form-control auth-input"
                  value={formState.totalTickets}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="availableTickets">
                  Available Tickets
                </label>
                <input
                  id="availableTickets"
                  name="availableTickets"
                  type="number"
                  min="0"
                  className="form-control auth-input"
                  value={formState.availableTickets}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  className="form-control auth-input"
                  value={formState.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="endDate">
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  className="form-control auth-input"
                  value={formState.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="form-control auth-input"
                  value={formState.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="event-checkbox">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formState.featured}
                    onChange={handleChange}
                  />
                  <span>Feature this event on the landing page spotlight.</span>
                </label>
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="glass-panel p-4 p-md-5 h-100">
            <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
              <div>
                <span className="section-eyebrow">Event Inventory</span>
                <h2 className="h3 mb-0">Current admin event list</h2>
              </div>
              <span className="text-muted small">Public pages only show published events.</span>
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
                        <span>Price</span>
                        <strong>Rs. {event.price}</strong>
                      </div>
                      <div className="event-meta-row">
                        <span>Tickets</span>
                        <strong>
                          {event.availableTickets} / {event.totalTickets}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {!loading && events.length === 0 ? (
              <p className="text-muted mb-0">No events exist yet. Create one using the form.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
