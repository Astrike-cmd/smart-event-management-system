import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAdminFeedback, getAdminFeedback } from '../services/feedback';

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
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

function AdminFeedbackPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [activeDeleteId, setActiveDeleteId] = useState('');
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviews(await getAdminFeedback());
      } catch (requestError) {
        setFeedback({
          type: 'danger',
          message:
            requestError.response?.data?.message ||
            'Unable to load reviews. Confirm the backend is running and the admin session is active.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const uniqueEvents = new Set(reviews.map((review) => review.event?._id).filter(Boolean));
    const uniqueReviewers = new Set(reviews.map((review) => review.user?._id).filter(Boolean));
    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      total: reviews.length,
      average,
      events: uniqueEvents.size,
      reviewers: uniqueReviewers.size
    };
  }, [reviews]);

  const visibleReviews = useMemo(
    () =>
      ratingFilter === 'all'
        ? reviews
        : reviews.filter((review) => String(review.rating) === ratingFilter),
    [reviews, ratingFilter]
  );

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm('Remove this review permanently?');

    if (!confirmed) {
      return;
    }

    setActiveDeleteId(reviewId);
    setFeedback({ type: '', message: '' });

    try {
      await deleteAdminFeedback(reviewId);
      setReviews((currentReviews) => currentReviews.filter((review) => review._id !== reviewId));
      setFeedback({ type: 'success', message: 'Review removed successfully.' });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to remove this review right now.'
      });
    } finally {
      setActiveDeleteId('');
    }
  };

  return (
    <div className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <span className="section-eyebrow">Feedback</span>
            <h1 className="h2 mb-2">Attendee Reviews</h1>
            <p className="text-muted mb-0">
              Every review submitted by attendees with a confirmed booking, across all events on
              the platform.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap section-action-group">
            <Link className="btn btn-outline-primary" to="/admin/dashboard">
              Back To Admin Dashboard
            </Link>
            <Link className="btn btn-primary" to="/admin/bookings">
              Admin Bookings
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Total Reviews</span>
            <h2 className="h4 mb-2">{stats.total}</h2>
            <p className="text-muted mb-0 small">Every review record currently stored.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Average Rating</span>
            <h2 className="h4 mb-2">{stats.total ? `${stats.average.toFixed(1)} / 5` : '-'}</h2>
            <p className="text-muted mb-0 small">Platform-wide average across all reviews.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Events Reviewed</span>
            <h2 className="h4 mb-2">{stats.events}</h2>
            <p className="text-muted mb-0 small">Unique events with at least one review.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Reviewers</span>
            <h2 className="h4 mb-2">{stats.reviewers}</h2>
            <p className="text-muted mb-0 small">Unique attendees who left a review.</p>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div className={`alert alert-${feedback.type || 'info'}`} role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="glass-panel p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <span className="section-eyebrow">Reviews</span>
            <h2 className="h3 mb-0">Submitted feedback</h2>
          </div>
          <div>
            <label className="form-label" htmlFor="ratingFilter">
              Filter by rating
            </label>
            <select
              id="ratingFilter"
              className="form-select auth-input"
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-muted mb-0">Loading reviews...</p>
        ) : visibleReviews.length === 0 ? (
          <p className="text-muted mb-0">No reviews match this filter yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Reviewer</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Comment</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleReviews.map((review) => (
                  <tr key={review._id}>
                    <td>
                      {review.event ? (
                        <>
                          <span className="fw-semibold d-block">{review.event.title}</span>
                          <span className="text-muted small">{review.event.city}</span>
                        </>
                      ) : (
                        <span className="text-muted small">Removed event</span>
                      )}
                    </td>
                    <td>
                      <span className="d-block">{review.user?.name || 'Removed user'}</span>
                      <span className="text-muted small">{review.user?.email || '-'}</span>
                    </td>
                    <td>{renderStars(review.rating)}</td>
                    <td className="text-muted small" style={{ maxWidth: '320px' }}>
                      {review.comment}
                    </td>
                    <td className="text-muted small">{formatDate(review.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(review._id)}
                        disabled={activeDeleteId === review._id}
                      >
                        {activeDeleteId === review._id ? 'Removing...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeedbackPage;
