import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cancelBooking, getMyBookings } from '../services/bookings';

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

function BookingsPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    type: location.state?.successMessage ? 'success' : '',
    message: location.state?.successMessage || ''
  });
  const [activeBookingId, setActiveBookingId] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const nextBookings = await getMyBookings();
        setBookings(nextBookings);
      } catch (error) {
        setFeedback({
          type: 'danger',
          message: error.response?.data?.message || 'Unable to load your bookings right now.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const bookingStats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.bookingStatus === 'confirmed');
    const cancelled = bookings.filter((booking) => booking.bookingStatus === 'cancelled');
    const spend = confirmed.reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
      total: bookings.length,
      confirmed: confirmed.length,
      cancelled: cancelled.length,
      spend
    };
  }, [bookings]);

  const handleCancelBooking = async (bookingId) => {
    setActiveBookingId(bookingId);
    setFeedback({ type: '', message: '' });

    try {
      const updatedBooking = await cancelBooking(bookingId);

      setBookings((currentBookings) =>
        currentBookings.map((booking) => (booking._id === bookingId ? updatedBooking : booking))
      );
      setFeedback({
        type: 'success',
        message: 'Booking cancelled and ticket inventory restored successfully.'
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to cancel this booking right now.'
      });
    } finally {
      setActiveBookingId('');
    }
  };

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3">
              Phase 6 Booking Workspace
            </span>
            <h1 className="display-6 fw-semibold mb-3">Track your bookings</h1>
            <p className="text-muted mb-0">
              Review confirmed tickets, watch event schedules, and cancel bookings when plans change.
            </p>
          </div>
          <Link className="btn btn-outline-primary" to="/events">
            Book More Events
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Total Bookings</span>
            <h2 className="h4 mb-2">{bookingStats.total}</h2>
            <p className="text-muted mb-0 small">Every booking created from your user account.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Confirmed</span>
            <h2 className="h4 mb-2">{bookingStats.confirmed}</h2>
            <p className="text-muted mb-0 small">Bookings currently active for future attendance.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Cancelled</span>
            <h2 className="h4 mb-2">{bookingStats.cancelled}</h2>
            <p className="text-muted mb-0 small">Bookings you cancelled after confirmation.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Confirmed Spend</span>
            <h2 className="h4 mb-2">Rs. {bookingStats.spend}</h2>
            <p className="text-muted mb-0 small">Total value across bookings that remain active.</p>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div className={`alert alert-${feedback.type}`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="glass-panel p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
          <div>
            <span className="section-eyebrow">Booking History</span>
            <h2 className="h3 mb-0">Your ticket timeline</h2>
          </div>
          <span className="text-muted small">Newest bookings appear first.</span>
        </div>

        {loading ? <p className="text-muted mb-0">Loading your bookings...</p> : null}

        {!loading && bookings.length > 0 ? (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="dashboard-action-card booking-card" key={booking._id}>
                <div className="d-flex justify-content-between gap-3 flex-wrap mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <span className="spotlight-tag">{booking.bookingReference}</span>
                      <span className="event-price-chip">{booking.bookingStatus}</span>
                    </div>
                    <h3 className="h5 mb-1">{booking.eventTitle}</h3>
                    <p className="text-muted small mb-0">
                      Booked on {formatDate(booking.createdAt)} | Payment {booking.paymentStatus}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="h5 mb-1">Rs. {booking.totalAmount}</div>
                    <small className="text-muted">{booking.quantity} ticket(s)</small>
                  </div>
                </div>

                <div className="event-meta-list">
                  <div className="event-meta-row">
                    <span>Event Date</span>
                    <strong>{formatDate(booking.eventStartDate)}</strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Venue</span>
                    <strong>
                      {booking.venue}, {booking.city}
                    </strong>
                  </div>
                  <div className="event-meta-row">
                    <span>Status</span>
                    <strong>{booking.event?.status === 'sold_out' ? 'Sold Out Event' : 'Scheduled'}</strong>
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap mt-4">
                  <Link className="btn btn-outline-primary" to={`/events/${booking.eventSlug}`}>
                    View Event
                  </Link>
                  {booking.bookingStatus === 'confirmed' ? (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={activeBookingId === booking._id}
                    >
                      {activeBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && bookings.length === 0 ? (
          <div className="dashboard-mini-card p-4">
            <h3 className="h5 mb-2">No bookings yet</h3>
            <p className="text-muted mb-3">
              Start from the events module and confirm your first ticket booking.
            </p>
            <Link className="btn btn-primary" to="/events">
              Browse Events
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default BookingsPage;
