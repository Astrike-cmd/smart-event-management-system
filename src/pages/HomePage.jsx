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
        setFeaturedEvents(await getFeaturedEvents(5));
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
          <div className="home-hero-layout">
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

            <div className="hero-carousel-wrap">
              {featuredEventsLoading ? <div className="hero-carousel-skeleton" aria-label="Loading featured events" /> : null}

              {!featuredEventsLoading && featuredEvents.length > 0 ? (
                <div id="featuredEventsCarousel" className="carousel slide hero-event-carousel" data-bs-ride="carousel" data-bs-interval="4500">
                  <div className="carousel-inner">
                    {featuredEvents.map((event, index) => (
                      <div className={'carousel-item' + (index === 0 ? ' active' : '')} key={event._id || event.slug}>
                        <Link to={'/events/' + event.slug} className="hero-carousel-slide" aria-label={'View ' + event.title}>
                          <EventImage src={event.imageData} alt={event.title} variant="card" />
                          <div className="hero-carousel-caption">
                            <span>Featured event</span>
                            <h2>{event.title}</h2>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {featuredEvents.length > 1 ? (
                    <>
                      <button className="carousel-control-prev" type="button" data-bs-target="#featuredEventsCarousel" data-bs-slide="prev" aria-label="Previous featured event">
                        <span className="bi bi-arrow-left" aria-hidden="true" />
                      </button>
                      <button className="carousel-control-next" type="button" data-bs-target="#featuredEventsCarousel" data-bs-slide="next" aria-label="Next featured event">
                        <span className="bi bi-arrow-right" aria-hidden="true" />
                      </button>
                      <div className="carousel-indicators">
                        {featuredEvents.map((event, index) => (
                          <button key={event._id || event.slug} type="button" data-bs-target="#featuredEventsCarousel" data-bs-slide-to={index} className={index === 0 ? 'active' : ''} aria-current={index === 0 ? 'true' : undefined} aria-label={'Show ' + event.title} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {!featuredEventsLoading && featuredEvents.length === 0 ? (
                <Link className="hero-carousel-empty" to="/events">
                  <i className="bi bi-calendar2-week" aria-hidden="true" />
                  <span>Explore upcoming events</span>
                </Link>
              ) : null}
            </div>
          </div>
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
