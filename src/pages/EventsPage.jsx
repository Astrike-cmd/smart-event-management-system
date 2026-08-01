import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EventImage from '../components/EventImage';
import { getEvents } from '../services/events';

const formatEventDate = (value) => {
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

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const nextEvents = await getEvents({ limit: 12 });
        setEvents(nextEvents);
      } catch (requestError) {
        setError('Unable to load events right now. Please try again after the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(new Set(events.map((event) => event.category)));
    return ['All', ...values];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') {
      return events;
    }

    return events.filter((event) => event.category === selectedCategory);
  }, [events, selectedCategory]);

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between gap-4 flex-wrap align-items-end">
          <div>
            <span className="section-pill mb-3">
              Live Events
            </span>
            <h1 className="display-6 fw-semibold mb-3">Discover upcoming events</h1>
            <p className="text-muted mb-0">
              Explore live events published through the platform, including conferences,
              festivals, networking sessions, and booking-ready experiences.
            </p>
          </div>
          <Link className="btn btn-outline-primary" to="/">
            Return Home
          </Link>
        </div>
      </div>

      <div className="glass-panel p-4 mb-4">
        <div className="chip-scroll align-items-center">
          <span className="section-eyebrow mb-0">Categories</span>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-nav-link'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-4">
          <p className="text-muted mb-0">Loading events...</p>
        </div>
      ) : null}

      {error ? (
        <div className="glass-panel p-4 mb-4">
          <p className="text-danger mb-0">{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="row g-4">
          {filteredEvents.map((event) => (
            <div className="col-lg-4 col-md-6" key={event._id}>
              <article className="feature-card event-card p-4 h-100">
                <EventImage src={event.imageData} alt={event.title} variant="card" />
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <span className="spotlight-tag">{event.category}</span>
                  <span className="event-price-chip">
                    {event.price === 0 ? 'Free' : `Rs. ${event.price}`}
                  </span>
                </div>
                <h2 className="h5 mb-2">{event.title}</h2>
                <p className="text-muted small mb-3">{event.description}</p>
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
                    <span>Organizer</span>
                    <strong>{event.organizerName}</strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Tickets Left</span>
                    <strong>{event.availableTickets}</strong>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap mt-4">
                  <Link className="btn btn-primary" to={`/events/${event.slug}`}>
                    {event.availableTickets === 0 ? 'View Details' : 'Book Now'}
                  </Link>
                  <Link className="btn btn-outline-primary" to="/">
                    Home
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && filteredEvents.length === 0 ? (
        <div className="glass-panel p-4 mt-4">
          <p className="text-muted mb-0">No events match the selected category yet.</p>
        </div>
      ) : null}
    </section>
  );
}

export default EventsPage;
