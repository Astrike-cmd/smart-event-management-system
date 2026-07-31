import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminBookings } from '../services/bookings';

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

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const nextBookings = await getAdminBookings();
        setBookings(nextBookings);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load booking records. Confirm the backend is running and the admin session is active.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.bookingStatus === 'confirmed');
    const cancelled = bookings.filter((booking) => booking.bookingStatus === 'cancelled');
    const revenue = confirmed.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const tickets = confirmed.reduce((sum, booking) => sum + booking.quantity, 0);

    return {
      total: bookings.length,
      confirmed: confirmed.length,
      cancelled: cancelled.length,
      revenue,
      tickets
    };
  }, [bookings]);

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <span className="badge rounded-pill text-bg-warning px-3 py-2 mb-3">
              Phase 6 Admin Booking Oversight
            </span>
            <h1 className="display-6 fw-semibold mb-3">Review booking activity</h1>
            <p className="text-muted mb-0">
              Monitor confirmed tickets, cancellations, demand signals, and attendee records across the platform.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link className="btn btn-outline-primary" to="/admin/dashboard">
              Back To Admin Dashboard
            </Link>
            <Link className="btn btn-primary" to="/events">
              View Public Events
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">All Bookings</span>
            <h2 className="h4 mb-2">{stats.total}</h2>
            <p className="text-muted mb-0 small">Every booking stored in the booking module.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Confirmed Tickets</span>
            <h2 className="h4 mb-2">{stats.tickets}</h2>
            <p className="text-muted mb-0 small">Seats currently held by active bookings.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Cancellations</span>
            <h2 className="h4 mb-2">{stats.cancelled}</h2>
            <p className="text-muted mb-0 small">Bookings cancelled and returned to inventory.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Confirmed Revenue</span>
            <h2 className="h4 mb-2">Rs. {stats.revenue}</h2>
            <p className="text-muted mb-0 small">Total booking value from active attendee records.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="glass-panel p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
          <div>
            <span className="section-eyebrow">Booking Records</span>
            <h2 className="h3 mb-0">Admin booking feed</h2>
          </div>
          <span className="text-muted small">Sorted from newest to oldest.</span>
        </div>

        {loading ? <p className="text-muted mb-0">Loading booking records...</p> : null}

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
                      {booking.user?.name} | {booking.user?.email}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="h5 mb-1">Rs. {booking.totalAmount}</div>
                    <small className="text-muted">
                      {booking.quantity} ticket(s) | {booking.paymentStatus}
                    </small>
                  </div>
                </div>

                <div className="event-meta-list">
                  <div className="event-meta-row">
                    <span>Booked On</span>
                    <strong>{formatDate(booking.createdAt)}</strong>
                  </div>
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
                </div>

                <div className="d-flex gap-2 flex-wrap mt-4">
                  <Link className="btn btn-outline-primary" to={`/events/${booking.eventSlug}`}>
                    Open Event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && bookings.length === 0 ? (
          <div className="dashboard-mini-card p-4">
            <h3 className="h5 mb-2">No booking records yet</h3>
            <p className="text-muted mb-0">
              Bookings will appear here once users begin checking out from event detail pages.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AdminBookingsPage;
