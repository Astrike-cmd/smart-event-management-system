import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EventImage from '../components/EventImage';
import upiQr from '../assets/eventify-upi-qr.jpeg';
import useAuth from '../hooks/useAuth';
import { createBooking } from '../services/bookings';
import { getEventBySlug } from '../services/events';
import { completeDemoPayment, submitUpiPayment } from '../services/payments';

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
  const [quantityInput, setQuantityInput] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('demo');
  const [upiReference, setUpiReference] = useState('');
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

  const parsedQuantity = useMemo(() => {
    const nextQuantity = Number.parseInt(quantityInput, 10);
    return Number.isNaN(nextQuantity) ? 0 : nextQuantity;
  }, [quantityInput]);

  const totalAmount = useMemo(() => {
    if (!event) {
      return 0;
    }

    return event.price * Math.max(parsedQuantity, 0);
  }, [event, parsedQuantity]);

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

    if (parsedQuantity < 1) {
      setFeedback({
        type: 'danger',
        message: 'Enter at least 1 ticket before booking.'
      });
      return;
    }

    const bookingQuantity = event ? Math.min(parsedQuantity, Math.max(event.availableTickets, 1)) : parsedQuantity;

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      let booking;

      if (event.price === 0) {
        booking = await createBooking({ eventId: event._id, quantity: bookingQuantity });
      } else if (paymentMethod === 'upi') {
        booking = await submitUpiPayment({
          eventId: event._id,
          quantity: bookingQuantity,
          paymentId: upiReference
        });
      } else {
        booking = await completeDemoPayment({ eventId: event._id, quantity: bookingQuantity });
      }

      navigate('/bookings', {
        state: {
          successMessage: `Booking ${booking.bookingReference} confirmed successfully.`
        }
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || error.message || 'Unable to complete the booking right now.'
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
                  value={quantityInput}
                  onChange={(changeEvent) => setQuantityInput(changeEvent.target.value)}
                  onBlur={() => {
                    if (!event) {
                      return;
                    }

                    const clampedQuantity = Math.min(
                      Math.max(parsedQuantity || 1, 1),
                      Math.max(event.availableTickets, 1)
                    );
                    setQuantityInput(String(clampedQuantity));
                  }}
                  disabled={isSoldOut}
                />

                {event.price > 0 ? (
                  <div className="mb-4">
                    <label className="form-label">Payment Method</label>
                    <div className="d-grid gap-2">
                      <label className="dashboard-mini-card p-3 d-flex gap-2 align-items-start">
                        <input type="radio" name="paymentMethod" value="demo" checked={paymentMethod === 'demo'} onChange={() => setPaymentMethod('demo')} />
                        <span><strong>Demo Payment</strong><br /><small className="text-muted">For project testing only. No money is charged.</small></span>
                      </label>
                      <label className="dashboard-mini-card p-3 d-flex gap-2 align-items-start">
                        <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                        <span><strong>Pay by UPI QR</strong><br /><small className="text-muted">Scan your QR, then submit the UPI reference for admin review.</small></span>
                      </label>
                    </div>
                    {paymentMethod === 'upi' ? (
                      <div className="dashboard-mini-card p-3 mt-3">
                        <img className="img-fluid rounded mb-3" src={upiQr} alt="Eventify UPI payment QR code" />
                        <label className="form-label" htmlFor="upiReference">UPI Transaction / Reference ID</label>
                        <input id="upiReference" className="form-control auth-input" value={upiReference} onChange={(changeEvent) => setUpiReference(changeEvent.target.value)} placeholder="Example: 412345678901" required={paymentMethod === 'upi'} />
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
                    {submitting ? 'Processing...' : isSoldOut ? 'Sold Out' : event.price === 0 ? 'Confirm Free Booking' : paymentMethod === 'upi' ? 'Submit UPI Payment' : 'Complete Demo Payment'}
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
