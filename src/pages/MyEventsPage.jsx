import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EventImage from '../components/EventImage';
import useAuth from '../hooks/useAuth';
import { createEvent, deleteEvent, getManagedEvents, updateEvent } from '../services/events';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_EVENT_IMAGE_SIZE = 1.5 * 1024 * 1024;

const createInitialFormState = (user) => ({
  title: '',
  category: 'Conference',
  city: '',
  venue: '',
  organizerName: user?.name || '',
  imageData: '',
  startDate: '',
  endDate: '',
  price: '',
  totalTickets: '',
  availableTickets: '',
  status: 'published',
  description: '',
  featured: false,
  featuredDurationHours: '24'
});

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

const formatDateTimeLocal = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const normalizedDate = new Date(date.getTime() - offset * 60 * 1000);
  return normalizedDate.toISOString().slice(0, 16);
};

const isFeatureActive = (event) => {
  const featureEnd = new Date(event.featuredUntil);
  return Boolean(event.featured) && !Number.isNaN(featureEnd.getTime()) && featureEnd.getTime() >= Date.now();
};

const getRemainingFeaturedHours = (event) => {
  if (!isFeatureActive(event)) {
    return '24';
  }

  const remainingMs = new Date(event.featuredUntil).getTime() - Date.now();
  return String(Math.min(24, Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)))));
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });

function MyEventsPage() {
  const { user } = useAuth();
  const [formState, setFormState] = useState(() => createInitialFormState(user));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState('');
  const [editingEventId, setEditingEventId] = useState('');
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const eventStats = useMemo(() => {
    const published = events.filter((event) => event.status === 'published').length;
    const drafts = events.filter((event) => event.status === 'draft').length;
    const tickets = events.reduce((sum, event) => sum + (event.availableTickets || 0), 0);

    return {
      total: events.length,
      published,
      drafts,
      tickets
    };
  }, [events]);

  useEffect(() => {
    setFormState((currentState) => ({
      ...currentState,
      organizerName: currentState.organizerName || user?.name || ''
    }));
  }, [user]);

  useEffect(() => {
    const loadManagedEvents = async () => {
      try {
        const nextEvents = await getManagedEvents();
        setEvents(nextEvents);
      } catch (error) {
        setFeedback({
          type: 'danger',
          message: error.response?.data?.message || 'Unable to load your events right now.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadManagedEvents();
  }, []);

  const resetForm = () => {
    setEditingEventId('');
    setFormState(createInitialFormState(user));
  };

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearImageSelection = () => {
    setFormState((currentState) => ({
      ...currentState,
      imageData: ''
    }));
  };

  const handleImageChange = async (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFeedback({
        type: 'danger',
        message: 'Upload a PNG, JPG, JPEG, or WEBP image for the event.'
      });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_EVENT_IMAGE_SIZE) {
      setFeedback({
        type: 'danger',
        message: 'Event images must be 1.5 MB or smaller.'
      });
      event.target.value = '';
      return;
    }

    try {
      const imageData = await readFileAsDataUrl(file);
      setFormState((currentState) => ({
        ...currentState,
        imageData
      }));
      setFeedback({
        type: 'primary',
        message: `"${file.name}" is ready to publish with your event.`
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.message || 'Unable to load the selected image.'
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleEdit = (eventItem) => {
    setEditingEventId(eventItem._id);
    setFormState({
      title: eventItem.title,
      category: eventItem.category,
      city: eventItem.city,
      venue: eventItem.venue,
      organizerName: eventItem.organizerName,
      imageData: eventItem.imageData || '',
      startDate: formatDateTimeLocal(eventItem.startDate),
      endDate: formatDateTimeLocal(eventItem.endDate),
      price: String(eventItem.price ?? ''),
      totalTickets: String(eventItem.totalTickets ?? ''),
      availableTickets: String(eventItem.availableTickets ?? ''),
      status: eventItem.status,
      description: eventItem.description,
      featured: isFeatureActive(eventItem),
      featuredDurationHours: getRemainingFeaturedHours(eventItem)
    });
    setFeedback({
      type: 'primary',
      message: `Editing "${eventItem.title}". Update the form and save when ready.`
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        ...formState,
        price: Number(formState.price),
        totalTickets: Number(formState.totalTickets),
        availableTickets:
            formState.availableTickets === '' ? '' : Number(formState.availableTickets),
          featuredDurationHours: formState.featured ? Number(formState.featuredDurationHours) : ''
      };

      if (editingEventId) {
        const updatedEvent = await updateEvent(editingEventId, payload);
        setEvents((currentEvents) =>
          currentEvents.map((eventItem) =>
            eventItem._id === editingEventId ? updatedEvent : eventItem
          )
        );
        setFeedback({
          type: 'success',
          message: 'Your event was updated successfully.'
        });
      } else {
        const nextEvent = await createEvent(payload);
        setEvents((currentEvents) => [nextEvent, ...currentEvents]);
        setFeedback({
          type: 'success',
          message: 'Your event was created successfully.'
        });
      }

      resetForm();
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to save this event right now.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Delete "${eventTitle}"? Active bookings for this event will be cancelled automatically.`
    );

    if (!confirmed) {
      return;
    }

    setActiveDeleteId(eventId);
    setFeedback({ type: '', message: '' });

    try {
      const response = await deleteEvent(eventId);
      setEvents((currentEvents) => currentEvents.filter((eventItem) => eventItem._id !== eventId));

      if (editingEventId === eventId) {
        resetForm();
      }

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
            <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3">
              Event Creator Workspace
            </span>
            <h1 className="display-6 fw-semibold mb-3">Create and manage your events</h1>
            <p className="text-muted mb-0">
              Publish new events, adjust ticket inventory, and keep your organizer listings up to
              date from one user workspace.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap section-action-group">
            <Link className="btn btn-outline-primary" to="/events">
              Browse Public Events
            </Link>
            <Link className="btn btn-primary" to="/bookings">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">My Events</span>
            <h2 className="h4 mb-2">{eventStats.total}</h2>
            <p className="text-muted mb-0 small">Every event currently owned by your account.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Published</span>
            <h2 className="h4 mb-2">{eventStats.published}</h2>
            <p className="text-muted mb-0 small">Events currently visible through the public listing.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Drafts</span>
            <h2 className="h4 mb-2">{eventStats.drafts}</h2>
            <p className="text-muted mb-0 small">Draft events you can finish and publish later.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Tickets Available</span>
            <h2 className="h4 mb-2">{eventStats.tickets}</h2>
            <p className="text-muted mb-0 small">Open inventory remaining across your event lineup.</p>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div className={`alert alert-${feedback.type || 'info'}`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="glass-panel p-4 p-md-5 h-100">
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
              <div>
                <span className="section-eyebrow">{editingEventId ? 'Edit Event' : 'Create Event'}</span>
                <h2 className="h3 mb-0">
                  {editingEventId ? 'Update your event details' : 'Publish a new event'}
                </h2>
              </div>
              {editingEventId ? (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>

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
                  <option value="Other">Other</option>
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
              <div className="col-12">
                <label className="form-label" htmlFor="eventImage">
                  Event Image
                </label>
                <input
                  id="eventImage"
                  name="eventImage"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="form-control auth-input"
                  onChange={handleImageChange}
                />
                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mt-2">
                  <p className="text-muted small mb-0">
                    Optional. Upload a PNG, JPG, JPEG, or WEBP image up to 1.5 MB.
                  </p>
                  {formState.imageData ? (
                    <button
                      type="button"
                      className="btn btn-nav-link"
                      onClick={clearImageSelection}
                    >
                      Remove Image
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="col-12">
                <EventImage
                  src={formState.imageData}
                  alt={formState.title ? `${formState.title} preview` : 'Event preview'}
                  variant="form"
                  placeholder="Upload an event image to preview it here"
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
                <div className="dashboard-check-item">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    className="form-check-input mt-1"
                    checked={formState.featured}
                    onChange={handleChange}
                  />
                  <div>
                    <label className="form-label mb-1" htmlFor="featured">
                      Feature this event on the homepage
                    </label>
                    <p className="text-muted small mb-0">
                      Opt in to homepage placement for a limited window of up to 24 hours.
                    </p>
                  </div>
                </div>
              </div>
              {formState.featured ? (
                <div className="col-md-6">
                  <label className="form-label" htmlFor="featuredDurationHours">
                    Homepage feature duration
                  </label>
                  <input
                    id="featuredDurationHours"
                    name="featuredDurationHours"
                    type="number"
                    min="1"
                    max="24"
                    className="form-control auth-input"
                    value={formState.featuredDurationHours}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-muted small mt-2 mb-0">
                    Choose any whole number from 1 to 24 hours.
                  </p>
                </div>
              ) : null}
              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingEventId
                      ? 'Saving Changes...'
                      : 'Creating Event...'
                    : editingEventId
                      ? 'Save Event Changes'
                      : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="glass-panel p-4 p-md-5 h-100">
            <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
              <div>
                <span className="section-eyebrow">My Event List</span>
                <h2 className="h3 mb-0">Current organizer inventory</h2>
              </div>
              <span className="text-muted small">Only published events appear on public pages.</span>
            </div>

            {loading ? <p className="text-muted mb-0">Loading your events...</p> : null}

            {!loading && events.length > 0 ? (
              <div className="scroll-panel">
                <div className="event-admin-list">
                  {events.map((eventItem) => (
                    <article className="dashboard-action-card" key={eventItem._id}>
                      <EventImage
                        src={eventItem.imageData}
                        alt={eventItem.title}
                        variant="admin"
                        showPlaceholder={false}
                      />
                      <div className="d-flex justify-content-between gap-3 flex-wrap mb-2">
                        <div>
                          <h3 className="h6 mb-1">{eventItem.title}</h3>
                          <p className="text-muted small mb-0">
                            {eventItem.category} | {eventItem.city} | {eventItem.venue}
                          </p>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <span className="spotlight-tag">{eventItem.status}</span>
                          {isFeatureActive(eventItem) ? (
                            <span className="event-price-chip">Homepage Featured</span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-muted small mb-3">{eventItem.description}</p>
                      <div className="event-meta-list">
                        <div className="event-meta-row">
                          <span>Date</span>
                          <strong>{formatDate(eventItem.startDate)}</strong>
                        </div>
                        <div className="event-meta-row">
                          <span>Price</span>
                          <strong>Rs. {eventItem.price}</strong>
                        </div>
                        <div className="event-meta-row">
                          <span>Tickets</span>
                          <strong>
                            {eventItem.availableTickets} / {eventItem.totalTickets}
                          </strong>
                        </div>
                        {isFeatureActive(eventItem) ? (
                          <div className="event-meta-row">
                            <span>Featured Until</span>
                            <strong>{formatDate(eventItem.featuredUntil)}</strong>
                          </div>
                        ) : null}
                      </div>
                      <div className="d-flex gap-2 flex-wrap mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(eventItem)}
                        >
                          Edit Event
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(eventItem._id, eventItem.title)}
                          disabled={activeDeleteId === eventItem._id}
                        >
                          {activeDeleteId === eventItem._id ? 'Deleting...' : 'Delete Event'}
                        </button>
                        {['published', 'sold_out'].includes(eventItem.status) ? (
                          <Link className="btn btn-nav-link" to={`/events/${eventItem.slug}`}>
                            View Public Page
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {!loading && events.length === 0 ? (
              <p className="text-muted mb-0">No events created yet. Use the form to publish your first event.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MyEventsPage;
