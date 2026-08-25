import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPayments } from '../services/payments';

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

const statusBadges = {
  paid: 'success',
  pending: 'warning',
  refunded: 'secondary',
  failed: 'danger',
  not_required: 'info'
};

const statusLabels = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  failed: 'Failed',
  not_required: 'Free Ticket'
};

const methodLabels = {
  demo_gateway: 'Demo Gateway',
  upi_transfer: 'UPI Transfer',
  offline: 'Offline / Admin',
  none: 'No Payment'
};

function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setPayments(await getAdminPayments());
      } catch (requestError) {
        setFeedback({
          type: 'danger',
          message:
            requestError.response?.data?.message ||
            'Unable to load the payments ledger. Confirm the backend is running and the admin session is active.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const stats = useMemo(() => {
    const paid = payments.filter((payment) => payment.status === 'paid');
    const pending = payments.filter((payment) => payment.status === 'pending');
    const refunded = payments.filter((payment) => payment.status === 'refunded');

    return {
      total: payments.length,
      collected: paid.reduce((sum, payment) => sum + payment.amount, 0),
      pending: pending.length,
      pendingValue: pending.reduce((sum, payment) => sum + payment.amount, 0),
      refunded: refunded.reduce((sum, payment) => sum + payment.amount, 0)
    };
  }, [payments]);

  const visiblePayments = useMemo(
    () =>
      statusFilter === 'all'
        ? payments
        : payments.filter((payment) => payment.status === statusFilter),
    [payments, statusFilter]
  );

  return (
    <div className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div>
            <span className="section-eyebrow">Payments</span>
            <h1 className="h2 mb-2">Payment Ledger</h1>
            <p className="text-muted mb-0">
              Every payment recorded by the platform, including demo gateway charges, manual UPI
              transfers, free ticket entries, and refunds issued on cancellation.
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
            <span className="dashboard-stat-label">All Payments</span>
            <h2 className="h4 mb-2">{stats.total}</h2>
            <p className="text-muted mb-0 small">Total payment records in the ledger.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Amount Collected</span>
            <h2 className="h4 mb-2">Rs. {stats.collected}</h2>
            <p className="text-muted mb-0 small">Settled value across all paid payments.</p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Awaiting Review</span>
            <h2 className="h4 mb-2">{stats.pending}</h2>
            <p className="text-muted mb-0 small">
              Rs. {stats.pendingValue} in unverified transfers.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="feature-card dashboard-stat-card p-4 h-100">
            <span className="dashboard-stat-label">Refunded</span>
            <h2 className="h4 mb-2">Rs. {stats.refunded}</h2>
            <p className="text-muted mb-0 small">Returned to users after cancellations.</p>
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
            <span className="section-eyebrow">Ledger</span>
            <h2 className="h3 mb-0">Recorded payments</h2>
          </div>
          <div>
            <label className="form-label" htmlFor="statusFilter">
              Filter by status
            </label>
            <select
              id="statusFilter"
              className="form-select auth-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="not_required">Free tickets</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-muted mb-0">Loading payments...</p>
        ) : visiblePayments.length === 0 ? (
          <p className="text-muted mb-0">No payments match this filter yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">User</th>
                  <th scope="col">Event</th>
                  <th scope="col">Method</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Transaction ID</th>
                  <th scope="col">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <span className="fw-semibold d-block">{payment.paymentReference}</span>
                      <span className="text-muted small">{payment.bookingReference}</span>
                    </td>
                    <td>
                      <span className="d-block">{payment.user?.name || 'Removed user'}</span>
                      <span className="text-muted small">{payment.user?.email || '-'}</span>
                    </td>
                    <td>
                      <span className="d-block">{payment.eventTitle}</span>
                      <span className="text-muted small">{payment.event?.city || '-'}</span>
                    </td>
                    <td>{methodLabels[payment.method] || payment.method}</td>
                    <td className="fw-semibold">Rs. {payment.amount}</td>
                    <td>
                      <span
                        className={`badge text-bg-${statusBadges[payment.status] || 'secondary'}`}
                      >
                        {statusLabels[payment.status] || payment.status}
                      </span>
                      {payment.confirmedBy ? (
                        <span className="text-muted small d-block">
                          by {payment.confirmedBy.name}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-muted small">{payment.transactionId || '-'}</td>
                    <td className="text-muted small">{formatDate(payment.createdAt)}</td>
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

export default AdminPaymentsPage;
