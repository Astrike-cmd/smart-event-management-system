import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import EventImage from '../components/EventImage';
import upiQr from '../assets/eventify-upi-qr.jpeg';
import useAuth from '../hooks/useAuth';
import { createBooking } from '../services/bookings';
import { getEventBySlug } from '../services/events';
import {
  createFeedback,
  deleteFeedback,
  getEventFeedback,
  getMyFeedbackForEvent,
  updateFeedback
} from '../services/feedback';
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

const renderStars = (value) => (
  <span className="review-stars" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((star) => (
      <i key={star} className={`bi ${star <= Math.round(value) ? 'bi-star-fill' : 'bi-star'}`} />
    ))}
  </span>
);

function EventDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();
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
  const [reviews, setReviews] = useState({ count: 0, average: 0, feedback: [] });
  const [myReview, setMyReview] = useState({ eligible: false, feedback: null });
  const [myReviewLoaded, setMyReviewLoaded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDeleting, setReviewDeleting] = useState(false);
  const [reviewAlert, setReviewAlert] = useState({ type: '', message: '' });
  const [reviewsError, setReviewsError] = useState('');
  const [eligibilityError, setEligibilityError] = useState('');
  const [reviewRetry, setReviewRetry] = useState(0);

  useEffect(() => {
    if (!loading && event && hash === '#reviews') {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, event, hash]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setEvent(null);
    setFeedback({ type: '', message: '' });
    const loadEvent = async () => {
      try {
        const nextEvent = await getEventBySlug(slug);
        if (!cancelled) setEvent(nextEvent);
      } catch (error) {
        if (cancelled) return;
        setFeedback({
          type: 'danger',
          message: error.response?.data?.message || 'Unable to load this event right now.'
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvent();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!event?._id) {
      return;
    }

    let cancelled = false;
    setReviews({ count: 0, average: 0, feedback: [] });
    setReviewsError('');

    const loadReviews = async () => {
      try {
        const data = await getEventFeedback(event._id);

        if (!cancelled) {
          setReviews(data);
        }
      } catch (error) {
        if (!cancelled) setReviewsError('Unable to load reviews. Please try again.');
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [event?._id, reviewRetry]);

  useEffect(() => {
    setReviewForm({ rating: '5', comment: '' });
    setReviewAlert({ type: '', message: '' });
    setEligibilityError('');
    if (!event?._id || !isAuthenticated || isAdmin) {
      setMyReview({ eligible: false, feedback: null });
      setMyReviewLoaded(false);
      return;
    }

    let cancelled = false;
    setMyReviewLoaded(false);

    const loadMyReview = async () => {
      try {
        const data = await getMyFeedbackForEvent(event._id);

        if (cancelled) {
          return;
        }

        setMyReview({ eligible: data.eligible, feedback: data.feedback });

        if (data.feedback) {
          setReviewForm({ rating: String(data.feedback.rating), comment: data.feedback.comment });
        }
      } catch (error) {
        if (!cancelled) {
          setMyReview({ eligible: false, feedback: null });
          setEligibilityError('Unable to check your review eligibility. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setMyReviewLoaded(true);
        }
      }
    };

    loadMyReview();

    return () => {
      cancelled = true;
    };
  }, [event?._id, isAuthenticated, isAdmin, user?._id, reviewRetry]);

  const refreshReviews = async () => {
    try {
      setReviews(await getEventFeedback(event._id));
      setReviewsError('');
    } catch {
      setReviewsError('Your change was saved, but reviews could not be refreshed. Please try again.');
    }
  };

  const handleReviewSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    if (!event) {
      return;
    }

    const ratingValue = Number.parseInt(reviewForm.rating, 10);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setReviewAlert({ type: 'danger', message: 'Choose a rating between 1 and 5 stars.' });
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewAlert({ type: 'danger', message: 'Add a short comment with your review.' });
      return;
    }

    setReviewSubmitting(true);
    setReviewAlert({ type: '', message: '' });

    try {
      const payload = {
        eventId: event._id,
        rating: ratingValue,
        comment: reviewForm.comment.trim()
      };

      const savedFeedback = myReview.feedback
        ? await updateFeedback(myReview.feedback._id, payload)
        : await createFeedback(payload);

      setMyReview((current) => ({ ...current, feedback: savedFeedback }));
      await refreshReviews();
      setReviewAlert({ type: 'success', message: 'Thanks! Your review has been saved.' });
    } catch (error) {
      setReviewAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to save your review right now.'
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!myReview.feedback) {
      return;
    }

    const confirmed = window.confirm('Remove your review for this event?');

    if (!confirmed) {
      return;
    }

    setReviewDeleting(true);
    setReviewAlert({ type: '', message: '' });

    try {
      await deleteFeedback(myReview.feedback._id);
      setMyReview((current) => ({ ...current, feedback: null }));
      setReviewForm({ rating: '5', comment: '' });
      await refreshReviews();
      setReviewAlert({ type: 'success', message: 'Your review was removed.' });
    } catch (error) {
      setReviewAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to remove your review right now.'
      });
    } finally {
      setReviewDeleting(false);
    }
  };

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
        <>
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

        <div id="reviews" className="glass-panel p-4 p-md-5 mt-4">
          {reviewsError || eligibilityError ? (
            <div className="alert alert-warning" role="alert">
              {reviewsError || eligibilityError}
              <button type="button" className="btn btn-link" onClick={() => setReviewRetry((value) => value + 1)}>Try Again</button>
            </div>
          ) : null}
          <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
            <div>
              <span className="section-eyebrow">Attendee Reviews</span>
              <h2 className="h3 mb-0">
                {reviews.count > 0 ? `${reviews.average.toFixed(1)} / 5` : 'No reviews yet'}
              </h2>
            </div>
            {reviews.count > 0 ? (
              <div className="text-end">
                {renderStars(reviews.average)}
                <span className="text-muted small d-block">
                  {reviews.count} review{reviews.count === 1 ? '' : 's'}
                </span>
              </div>
            ) : null}
          </div>

          {!isAuthenticated ? (
            <div className="dashboard-mini-card p-4 mb-4">
              <p className="text-muted mb-2">Sign in with a confirmed booking to leave a review.</p>
              <Link className="btn btn-outline-primary" to="/login">
                Sign In
              </Link>
            </div>
          ) : null}

          {isAuthenticated && !isAdmin && myReviewLoaded ? (
            <div className="dashboard-mini-card p-4 mb-4">
              {myReview.eligible || myReview.feedback ? (
                <>
                  <h3 className="h6 mb-3">{myReview.feedback ? 'Edit your review' : 'Leave a review'}</h3>

                  {reviewAlert.message ? (
                    <div className={`alert alert-${reviewAlert.type || 'danger'}`} role="alert">
                      {reviewAlert.message}
                    </div>
                  ) : null}

                  <form onSubmit={handleReviewSubmit}>
                    <label className="form-label" htmlFor="reviewRating">
                      Rating
                    </label>
                    <select
                      id="reviewRating"
                      className="form-select auth-input mb-3"
                      value={reviewForm.rating}
                      onChange={(changeEvent) =>
                        setReviewForm((current) => ({ ...current, rating: changeEvent.target.value }))
                      }
                    >
                      {[5, 4, 3, 2, 1].map((star) => (
                        <option key={star} value={star}>
                          {star} Star{star === 1 ? '' : 's'}
                        </option>
                      ))}
                    </select>

                    <label className="form-label" htmlFor="reviewComment">
                      Comment
                    </label>
                    <textarea
                      id="reviewComment"
                      className="form-control auth-input mb-3"
                      rows={3}
                      maxLength={800}
                      value={reviewForm.comment}
                      onChange={(changeEvent) =>
                        setReviewForm((current) => ({ ...current, comment: changeEvent.target.value }))
                      }
                      placeholder="Share how the event went for you..."
                    />

                    <div className="d-flex gap-2 flex-wrap">
                      <button className="btn btn-primary" type="submit" disabled={reviewSubmitting || reviewDeleting}>
                        {reviewSubmitting ? 'Saving...' : myReview.feedback ? 'Update Review' : 'Submit Review'}
                      </button>
                      {myReview.feedback ? (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={handleReviewDelete}
                          disabled={reviewDeleting || reviewSubmitting}
                        >
                          {reviewDeleting ? 'Removing...' : 'Remove Review'}
                        </button>
                      ) : null}
                    </div>
                  </form>
                </>
              ) : (
                <p className="text-muted mb-0">
                  {eligibilityError ? 'Review eligibility is currently unavailable.' : 'Book this event and have a confirmed booking to leave a review.'}
                </p>
              )}
            </div>
          ) : null}

          {reviews.feedback.length > 0 ? (
            <div className="d-grid gap-3">
              {reviews.feedback.map((item) => (
                <div className="dashboard-mini-card p-3" key={item._id}>
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
                    <strong>{item.user?.name || 'Eventify Attendee'}</strong>
                    {renderStars(item.rating)}
                  </div>
                  <p className="text-muted small mb-1">{item.comment}</p>
                  <span className="text-muted small">{formatDate(item.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">Be the first to review this event.</p>
          )}
        </div>
        </>
      ) : null}
    </section>
  );
}

export default EventDetailsPage;
