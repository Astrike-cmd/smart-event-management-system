import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookingTicket from '../components/BookingTicket';
import { cancelBooking, getMyBookings } from '../services/bookings';

const HOMEPAGE_BOOKINGS_PREFERENCE_KEY = 'smart-event-homepage-bookings';

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

const buildPdfFileName = (booking) => {
  const safeEventTitle = booking.eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeEventTitle || 'event-ticket'}-${booking.bookingReference.toLowerCase()}.pdf`;
};

function BookingsPage() {
  const location = useLocation();
  const ticketRefs = useRef({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    type: location.state?.successMessage ? 'success' : '',
    message: location.state?.successMessage || ''
  });
  const [activeBookingId, setActiveBookingId] = useState('');
  const [downloadingBookingId, setDownloadingBookingId] = useState('');
  const [showOnHome, setShowOnHome] = useState(() => {
    const storedPreference = window.localStorage.getItem(HOMEPAGE_BOOKINGS_PREFERENCE_KEY);
    return storedPreference !== 'false';
  });

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

  const handleHomepageDisplayToggle = () => {
    const nextValue = !showOnHome;
    setShowOnHome(nextValue);
    window.localStorage.setItem(HOMEPAGE_BOOKINGS_PREFERENCE_KEY, String(nextValue));
  };

  const setTicketRef = (bookingId) => (element) => {
    if (element) {
      ticketRefs.current[bookingId] = element;
      return;
    }

    delete ticketRefs.current[bookingId];
  };

  const handleDownloadTicketPdf = async (booking) => {
    const ticketElement = ticketRefs.current[booking._id];

    if (!ticketElement) {
      setFeedback({
        type: 'danger',
        message: 'Unable to find the ticket layout for this booking right now.'
      });
      return;
    }

    setDownloadingBookingId(booking._id);
    setFeedback({ type: '', message: '' });

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const canvas = await html2canvas(ticketElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
      pdf.save(buildPdfFileName(booking));

      setFeedback({
        type: 'success',
        message: `Ticket PDF downloaded for ${booking.eventTitle}.`
      });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: 'Unable to generate the ticket PDF right now. Please try again.'
      });
    } finally {
      setDownloadingBookingId('');
    }
  };

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <span className="section-pill mb-3">
              Booking History
            </span>
            <h1 className="display-6 fw-semibold mb-3">Track your bookings</h1>
            <p className="text-muted mb-0">
              Review confirmed tickets, watch event schedules, and cancel bookings when plans change.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleHomepageDisplayToggle}
            >
              {showOnHome ? 'Hide On Home' : 'Show On Home'}
            </button>
            <Link className="btn btn-primary" to="/events">
              Book More Events
            </Link>
          </div>
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
            <p className="text-muted mb-0 small">Bookings currently active for scheduled events.</p>
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
          <span className="text-muted small">
            Homepage display is {showOnHome ? 'enabled' : 'hidden'}.
          </span>
        </div>

        {loading ? <p className="text-muted mb-0">Loading your bookings...</p> : null}

        {!loading && bookings.length > 0 ? (
          <div className="scroll-panel bookings-timeline-scroll">
            <div className="booking-list">
              {bookings.map((booking) => (
                <div key={booking._id}>
                  <BookingTicket
                    booking={booking}
                    formatDate={formatDate}
                    onDownloadPdf={handleDownloadTicketPdf}
                    isDownloading={downloadingBookingId === booking._id}
                    ref={setTicketRef(booking._id)}
                  />

                  <div className="d-flex gap-2 flex-wrap mt-3">
                    {booking.event ? (
                      <Link className="btn btn-outline-primary" to={`/events/${booking.eventSlug}`}>
                        View Event
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
                </div>
              ))}
            </div>
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
