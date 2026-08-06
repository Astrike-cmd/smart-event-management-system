import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers } from '../services/auth';
import {
  cancelAdminBooking,
  createAdminBooking,
  getAdminBookings,
  transferAdminBooking
} from '../services/bookings';
import { getManagedEvents } from '../services/events';
import { confirmUpiPayment } from '../services/payments';

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
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });
  const [createForm, setCreateForm] = useState({
    userId: '',
    eventId: '',
    quantity: 1
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState('');
  const [transferTargets, setTransferTargets] = useState({});
  const [isFeedCleared, setIsFeedCleared] = useState(false);

  const bookableEvents = useMemo(
    () => events.filter((event) => event.status === 'published' && event.availableTickets > 0),
    [events]
  );

  const loadAdminData = async () => {
    const [nextBookings, nextUsers, nextEvents] = await Promise.all([
      getAdminBookings(),
      getAdminUsers(),
      getManagedEvents()
    ]);

    setBookings(nextBookings);
    setUsers(nextUsers);
    setEvents(nextEvents);
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        await loadAdminData();
      } catch (requestError) {
        setFeedback({
          type: 'danger',
          message:
            requestError.response?.data?.message ||
            'Unable to load booking operations. Confirm the backend is running and the admin session is active.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPage();
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

  const replaceBooking = (updatedBooking) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      )
    );
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((currentState) => ({
      ...currentState,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setFeedback({ type: '', message: '' });

    try {
      const booking = await createAdminBooking(createForm);
      setBookings((currentBookings) => [booking, ...currentBookings]);
      setIsFeedCleared(false);
      setCreateForm({
        userId: '',
        eventId: '',
        quantity: 1
      });
      const refreshedEvents = await getManagedEvents();
      setEvents(refreshedEvents);
      setFeedback({
        type: 'success',
        message: `Booking ${booking.bookingReference} was created successfully for ${booking.user?.email}.`
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to create this booking right now.'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setActiveBookingId(bookingId);
    setFeedback({ type: '', message: '' });

    try {
      const updatedBooking = await cancelAdminBooking(bookingId);
      replaceBooking(updatedBooking);
      setIsFeedCleared(false);
      const refreshedEvents = await getManagedEvents();
      setEvents(refreshedEvents);
      setFeedback({
        type: 'success',
        message: 'Booking cancelled successfully and ticket inventory was restored.'
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

  const handleConfirmUpiPayment = async (bookingId) => {
    setActiveBookingId(bookingId);
    setFeedback({ type: '', message: '' });
    try {
      const updatedBooking = await confirmUpiPayment(bookingId);
      replaceBooking(updatedBooking);
      setFeedback({ type: 'success', message: `UPI payment confirmed for ${updatedBooking.bookingReference}.` });
    } catch (error) {
      setFeedback({ type: 'danger', message: error.response?.data?.message || 'Unable to confirm this UPI payment.' });
    } finally {
      setActiveBookingId('');
    }
  };
  const handleTransferSelection = (bookingId, userId) => {
    setTransferTargets((currentState) => ({
      ...currentState,
      [bookingId]: userId
    }));
  };

  const handleTransferBooking = async (bookingId) => {
    const userId = transferTargets[bookingId];

    if (!userId) {
      setFeedback({
        type: 'danger',
        message: 'Select a user before transferring a booking.'
      });
      return;
    }

    setActiveBookingId(bookingId);
    setFeedback({ type: '', message: '' });

    try {
      const updatedBooking = await transferAdminBooking(bookingId, { userId });
      replaceBooking(updatedBooking);
      setIsFeedCleared(false);
      setFeedback({
        type: 'success',
        message: `Booking ${updatedBooking.bookingReference} was transferred successfully.`
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to transfer this booking right now.'
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
            <span className="section-pill mb-3">
              Admin Booking Operations
            </span>
            <h1 className="display-6 fw-semibold mb-3">Operate user bookings</h1>
            <p className="text-muted mb-0">
              Create bookings for any user, transfer active bookings to a different user, and
              cancel bookings when needed from one cleaner operations screen.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap section-action-group">
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
            <p className="text-muted mb-0 small">Every booking stored in the platform.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Confirmed Tickets</span>
            <h2 className="h4 mb-2">{stats.tickets}</h2>
            <p className="text-muted mb-0 small">Seats currently held by active user bookings.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Cancellations</span>
            <h2 className="h4 mb-2">{stats.cancelled}</h2>
            <p className="text-muted mb-0 small">Bookings already cancelled and refunded.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Confirmed Revenue</span>
            <h2 className="h4 mb-2">Rs. {stats.revenue}</h2>
            <p className="text-muted mb-0 small">Total confirmed value across active bookings.</p>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div className={`alert alert-${feedback.type || 'info'}`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <div className="glass-panel p-4 p-md-5 h-100">
            <span className="section-eyebrow">Create Booking</span>
            <h2 className="h3 mb-4">Book on behalf of a user</h2>

            <form className="row g-3" onSubmit={handleCreateBooking}>
              <div className="col-12">
                <label className="form-label" htmlFor="userId">
                  User Account
                </label>
                <select
                  id="userId"
                  name="userId"
                  className="form-select auth-input"
                  value={createForm.userId}
                  onChange={handleCreateChange}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="eventId">
                  Event
                </label>
                <select
                  id="eventId"
                  name="eventId"
                  className="form-select auth-input"
                  value={createForm.eventId}
                  onChange={handleCreateChange}
                  required
                >
                  <option value="">Select an event</option>
                  {bookableEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.title} ({event.availableTickets} left)
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="quantity">
                  Ticket Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  className="form-control auth-input"
                  value={createForm.quantity}
                  onChange={handleCreateChange}
                  required
                />
              </div>
              <div className="col-12">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isCreating || users.length === 0 || bookableEvents.length === 0}
                >
                  {isCreating ? 'Creating Booking...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="glass-panel p-4 p-md-5 h-100">
            <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
              <div>
                <span className="section-eyebrow">Booking Records</span>
                <h2 className="h3 mb-0">Admin booking feed</h2>
              </div>
              <div className="d-flex gap-2 flex-wrap section-action-group">
                <span className="text-muted small align-self-center">
                  {bookings.length} record{bookings.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setIsFeedCleared((currentState) => !currentState)}
                  disabled={loading || bookings.length === 0}
                >
                  {isFeedCleared ? 'Restore Feed' : 'Clear Feed'}
                </button>
              </div>
            </div>

            {loading ? <p className="text-muted mb-0">Loading booking records...</p> : null}

            {!loading && bookings.length > 0 && !isFeedCleared ? (
              <div className="scroll-panel scroll-panel--compact">
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
                          {booking.user?.name || 'Unknown user'} | {booking.user?.email || 'No email'}
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

                    {booking.bookingStatus === 'confirmed' ? (
                      <div className="row g-2 mt-4">
                        <div className="col-md-7">
                          <select
                            className="form-select auth-input"
                            value={transferTargets[booking._id] || ''}
                            onChange={(event) =>
                              handleTransferSelection(booking._id, event.target.value)
                            }
                          >
                            <option value="">Select transfer target</option>
                            {users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-5 d-grid">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => handleTransferBooking(booking._id)}
                            disabled={activeBookingId === booking._id}
                          >
                            {activeBookingId === booking._id ? 'Updating...' : 'Transfer Booking'}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="d-flex gap-2 flex-wrap mt-3">
                      {booking.bookingStatus === 'pending_payment' && booking.paymentProvider === 'upi_manual' ? (
                        <button type="button" className="btn btn-primary" onClick={() => handleConfirmUpiPayment(booking._id)} disabled={activeBookingId === booking._id}>
                          {activeBookingId === booking._id ? 'Confirming...' : 'Confirm UPI Payment'}
                        </button>
                      ) : null}
                      {booking.event ? (
                        <Link className="btn btn-outline-primary" to={`/events/${booking.eventSlug}`}>
                          Open Event
                        </Link>
                      ) : null}
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
              </div>
            ) : null}

            {!loading && bookings.length === 0 ? (
              <div className="dashboard-mini-card p-4">
                <h3 className="h5 mb-2">No booking records yet</h3>
                <p className="text-muted mb-0">
                  Bookings will appear here once users or admins begin creating bookings.
                </p>
              </div>
            ) : null}

            {!loading && bookings.length > 0 && isFeedCleared ? (
              <div className="dashboard-mini-card p-4">
                <h3 className="h5 mb-2">Booking feed cleared from view</h3>
                <p className="text-muted mb-3">
                  The records still exist. Restore the feed whenever you want to review them again.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsFeedCleared(false)}
                >
                  Restore Feed
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminBookingsPage;
