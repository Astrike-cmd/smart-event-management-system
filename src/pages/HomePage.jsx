import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventImage from '../components/EventImage';
import { getMyBookings } from '../services/bookings';
import { getFeaturedEvents } from '../services/events';
import useAuth from '../hooks/useAuth';

const formatEventDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date TBD';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

function HomePage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [featuredEventsLoading, setFeaturedEventsLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        setFeaturedEvents(await getFeaturedEvents(3));
      } catch {
        setFeaturedEvents([]);
      } finally {
        setFeaturedEventsLoading(false);
      }
    };
    loadFeaturedEvents();
  }, []);

  useEffect(() => {
    const loadRecentBookings = async () => {
      if (!isAuthenticated || isAdmin) {
        setRecentBookings([]);
        return;
      }

      setBookingsLoading(true);
      try {
        setRecentBookings((await getMyBookings()).slice(0, 3));
      } catch {
        setRecentBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };
    loadRecentBookings();
  }, [isAuthenticated, isAdmin]);

  return (
    <div className="home-page home-page--simple">
      <section className="home-hero">
        <div className="container">
          <div className="home-hero-content">
            <span className="home-kicker">Find your next experience</span>
            <h1>Events worth stepping out for.</h1>
            <p>Discover, book, and manage events in one simple place.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/events">Explore events</Link>
              {!isAuthenticated ? (
                <Link className="btn btn-outline-primary btn-lg" to="/login">Sign in</Link>
              ) : (
                <Link className="btn btn-outline-primary btn-lg" to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                  {isAdmin ? 'Open dashboard' : 'Hi, ' + (user?.name?.split(' ')[0] || 'there')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="home-events-section">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <span className="section-eyebrow">Happening now</span>
              <h2>Featured events</h2>
            </div>
            <Link className="home-text-link" to="/events">
              See all events <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          {featuredEventsLoading ? (
            <div className="home-event-grid" aria-label="Loading featured events">
              {[1, 2, 3].map((item) => <div className="event-skeleton" key={item} />)}
            </div>
          ) : null}

          {!featuredEventsLoading && featuredEvents.length > 0 ? (
            <div className="home-event-grid">
              {featuredEvents.map((event) => (
                <article className="home-event-card" key={event._id || event.slug}>
                  <Link to={'/events/' + event.slug} className="home-event-image-link" aria-label={'View ' + event.title}>
                    <EventImage src={event.imageData} alt={event.title} variant="card" />
                  </Link>
                  <div className="home-event-card-body">
                    <div className="home-event-meta">
                      <span>{event.category}</span>
                      <span>{event.price === 0 ? 'Free' : 'Rs. ' + event.price}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{formatEventDate(event.startDate)} · {event.city}</p>
                    <Link className="home-card-link" to={'/events/' + event.slug}>
                      {event.availableTickets === 0 ? 'View details' : 'Book now'} <i className="bi bi-arrow-up-right" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!featuredEventsLoading && featuredEvents.length === 0 ? (
            <div className="home-empty-state">
              <div className="home-empty-icon"><i className="bi bi-calendar2-week" aria-hidden="true" /></div>
              <h3>Nothing featured yet</h3>
              <p>Explore all published events to find something to attend.</p>
              <Link className="btn btn-primary" to="/events">Browse events</Link>
            </div>
          ) : null}
        </div>
      </section>

      {isAuthenticated && !isAdmin ? (
        <section className="home-bookings-section">
          <div className="container">
            <div className="home-bookings-bar">
              <div>
                <span className="section-eyebrow">Your activity</span>
                <h2>Your recent bookings</h2>
              </div>
              <Link className="btn btn-outline-primary" to="/bookings">View all bookings</Link>
            </div>

            {bookingsLoading ? <div className="home-booking-loading">Loading your bookings…</div> : null}

            {!bookingsLoading && recentBookings.length > 0 ? (
              <div className="home-booking-list">
                {recentBookings.map((booking) => (
                  <Link className="home-booking-item" to="/bookings" key={booking._id}>
                    <span className="home-booking-date">{formatEventDate(booking.eventStartDate)}</span>
                    <span className="home-booking-name">{booking.eventTitle}</span>
                    <span className="home-booking-location">{booking.city}</span>
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : null}

            {!bookingsLoading && recentBookings.length === 0 ? (
              <div className="home-booking-loading">Your confirmed bookings will appear here.</div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default HomePage;
