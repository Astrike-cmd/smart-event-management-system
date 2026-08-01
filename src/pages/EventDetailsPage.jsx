import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EventImage from '../components/EventImage';
import useAuth from '../hooks/useAuth';
import { createBooking } from '../services/bookings';
import { getEventBySlug } from '../services/events';

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

function EventDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const nextEvent = await getEventBySlug(slug);
        setEvent(nextEvent);
      } catch (error) {
        setFeedback({
          type: 'danger',
          message: error.response?.data?.message || 'Unable to load this event right now.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [slug]);

  const isSoldOut = useMemo(
    () => !event || event.status === 'sold_out' || event.availableTickets === 0,
    [event]
  );

  const totalAmount = useMemo(() => {
    if (!event) {
      return 0;
    }

    return event.price * quantity;
  }, [event, quantity]);

  const handleBooking = async (submitEvent) => {
    submitEvent.preventDefault();

    if (!event) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAdmin) {
      setFeedback({
        type: 'danger',
        message: 'Admin accounts cannot self-book here. Use the admin booking console to create bookings for users.'
      });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const booking = await createBooking({
        eventId: event._id,
        quantity
      });

      navigate('/bookings', {
        state: {
          successMessage: `Booking ${booking.bookingReference} confirmed successfully.`
        }
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to complete the booking right now.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-5 page-shell page-shell--details">
      {loading ? (
        <div className="glass-panel p-4">
          <p className="text-muted mb-0">Loading event details...</p>
        </div>
      ) : null}

      {!loading && feedback.message && !event ? (
        <div className={`alert alert-${feedback.type || 'danger'}`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      {!loading && event ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="glass-panel p-4 p-md-5 h-100">
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
                <div>
                  <span className="spotlight-tag">{event.category}</span>
                  <h1 className="display-6 fw-semibold mt-3 mb-3">{event.title}</h1>
                  <p className="text-muted mb-0">{event.description}</p>
                </div>
                <span className="event-price-chip">
                  {event.price === 0 ? 'Free Entry' : `Rs. ${event.price} / ticket`}
                </span>
              </div>

              <EventImage src={event.imageData} alt={event.title} variant="detail" />

              <div className="booking-detail-grid">
                <div className="dashboard-mini-card p-4">
                  <span className="section-eyebrow">Schedule</span>
                  <div className="event-meta-list">
                    <div className="event-meta-row">
                      <span>Starts</span>
                      <strong>{formatDate(event.startDate)}</strong>
                    </div>
                    <div className="event-meta-row">
                      <span>Ends</span>
                      <strong>{formatDate(event.endDate)}</strong>
                    </div>
                    <div className="event-meta-row">
                      <span>Status</span>
                      <strong>{event.status === 'sold_out' ? 'Sold Out' : 'Open for booking'}</strong>
                    </div>
                  </div>
                </div>

                <div className="dashboard-mini-card p-4">
                  <span className="section-eyebrow">Venue</span>
                  <div className="event-meta-list">
                    <div className="event-meta-row">
                      <span>City</span>
                      <strong>{event.city}</strong>
                    </div>
                    <div className="event-meta-row">
                      <span>Location</span>
                      <strong>{event.venue}</strong>
                    </div>
                    <div className="event-meta-row">
                      <span>Organizer</span>
                      <strong>{event.organizerName}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-4 mt-4">
                <span className="section-eyebrow">Booking Notes</span>
                <div className="dashboard-checklist">
                  <div className="dashboard-check-item">
                    <span>Ticket availability updates immediately after a booking is confirmed.</span>
                  </div>
                  <div className="dashboard-check-item">
                    <span>Your booking history stays inside the protected user workspace.</span>
                  </div>
                  <div className="dashboard-check-item">
                    <span>Cancelled bookings restore ticket inventory for the event automatically.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="glass-panel p-4 p-md-5">
              <span className="section-pill mb-3">
                Ticket Booking
              </span>
              <h2 className="h3 mb-3">Book your tickets</h2>
              <p className="text-muted">
                {isSoldOut
                  ? 'This event has reached full capacity.'
                  : `Only ${event.availableTickets} tickets are currently available.`}
              </p>

              {feedback.message && event ? (
                <div className={`alert alert-${feedback.type || 'danger'}`} role="alert">
                  {feedback.message}
                </div>
              ) : null}

              <form onSubmit={handleBooking}>
                <label className="form-label" htmlFor="quantity">
                  Ticket Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={Math.max(event.availableTickets, 1)}
                  className="form-control auth-input mb-3"
                  value={quantity}
                  onChange={(changeEvent) =>
                    setQuantity(Math.max(1, Number.parseInt(changeEvent.target.value, 10) || 1))
                  }
                  disabled={isSoldOut}
                />

                <div className="booking-summary-card mb-4">
                  <div className="event-meta-row">
                    <span>Price Per Ticket</span>
                    <strong>{event.price === 0 ? 'Free' : `Rs. ${event.price}`}</strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Total</span>
                    <strong>{totalAmount === 0 ? 'Free' : `Rs. ${totalAmount}`}</strong>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div className="d-grid gap-2">
                    <Link className="btn btn-primary" to="/login">
                      Sign In To Book
                    </Link>
                    <Link className="btn btn-outline-primary" to="/register">
                      Create User Account
                    </Link>
                  </div>
                ) : (
                  <button className="btn btn-primary w-100" type="submit" disabled={submitting || isSoldOut}>
                    {submitting ? 'Confirming Booking...' : isSoldOut ? 'Sold Out' : 'Confirm Booking'}
                  </button>
                )}
              </form>

              <div className="d-grid gap-2 mt-3">
                <Link className="btn btn-outline-primary" to="/events">
                  Back To Events
                </Link>
                {isAuthenticated && !isAdmin ? (
                  <Link className="btn btn-nav-link" to="/bookings">
                    View My Bookings
                  </Link>
                ) : null}
                {isAuthenticated && isAdmin ? (
                  <Link className="btn btn-nav-link" to="/admin/bookings">
                    Open Admin Booking Console
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default EventDetailsPage;
