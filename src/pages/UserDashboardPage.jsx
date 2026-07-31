import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const formatDate = (value, options) => {
  if (!value) {
    return 'Not available yet';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available yet';
  }

  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

function UserDashboardPage() {
  const { user } = useAuth();

  const accountSummary = useMemo(() => {
    const memberSince = formatDate(user?.createdAt, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const lastUpdated = formatDate(user?.updatedAt, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const initials = user?.name
      ? user.name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'SE';
    const shortId = user?._id ? `${user._id.slice(0, 6)}...${user._id.slice(-4)}` : 'Pending';

    return {
      memberSince,
      lastUpdated,
      initials,
      shortId,
      firstName: user?.name?.split(' ')[0] || 'there'
    };
  }, [user]);

  const overviewCards = [
    {
      icon: 'bi-person-check',
      label: 'Account Status',
      value: 'Authenticated',
      description: 'Your user session is active and protected by JWT.'
    },
    {
      icon: 'bi-calendar2-check',
      label: 'Member Since',
      value: accountSummary.memberSince,
      description: 'Your dashboard now surfaces core account details from the live session.'
    },
    {
      icon: 'bi-shield-lock',
      label: 'Access Level',
      value: user?.role === 'user' ? 'User Workspace' : 'Restricted',
      description: 'Role-based access keeps attendee and admin journeys separate.'
    },
    {
      icon: 'bi-arrow-up-right-circle',
      label: 'Next Module',
      value: 'Phase 5 Events',
      description: 'The upcoming release will connect this dashboard to live event data.'
    }
  ];

  const workspaceCards = [
    {
      icon: 'bi-person-vcard',
      title: 'Profile Snapshot',
      description: 'Review the identity details currently stored in your authenticated account.'
    },
    {
      icon: 'bi-ticket-detailed',
      title: 'Booking Workspace',
      description: 'This area is prepared for ticket history, confirmation states, and purchase tracking.'
    },
    {
      icon: 'bi-stars',
      title: 'Personalized Journey',
      description: 'Future dashboard updates can highlight saved interests, recommended events, and reminders.'
    }
  ];

  const readinessItems = [
    'Secure sign-in and session restoration are already working.',
    'Role-based routing keeps this dashboard available only to normal users.',
    'Profile metadata is now visible from the live authenticated user object.',
    'The next step is wiring event discovery and booking history into this workspace.'
  ];

  const quickActions = [
    {
      icon: 'bi-house-door',
      title: 'Browse Landing Page',
      description: 'Return to the public homepage and review the product entry experience.',
      to: '/',
      buttonLabel: 'Go Home'
    },
    {
      icon: 'bi-calendar-event',
      title: 'Prepare For Events Module',
      description: 'This dashboard is now ready to receive featured events and upcoming attendance data.',
      to: '/',
      buttonLabel: 'View Roadmap'
    }
  ];

  return (
    <section className="container py-5">
      <div className="glass-panel p-4 p-md-5 mb-4">
        <div className="dashboard-hero-grid">
          <div>
            <span className="badge rounded-pill text-bg-primary px-3 py-2 mb-3">
              Phase 4 User Dashboard
            </span>
            <h1 className="display-6 fw-semibold mb-3">
              Welcome back, {accountSummary.firstName}
            </h1>
            <p className="text-muted mb-4">
              Your dashboard now presents a personalized account workspace with profile
              visibility, session status, and a clear bridge toward events and booking modules.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link className="btn btn-primary btn-lg px-4" to="/">
                Explore Events Home
              </Link>
              <span className="auth-welcome-chip">
                <i className="bi bi-envelope"></i>
                {user?.email}
              </span>
            </div>
          </div>

          <div className="dashboard-profile-card">
            <div className="dashboard-avatar">{accountSummary.initials}</div>
            <div>
              <span className="section-eyebrow">Account Overview</span>
              <h2 className="h4 mb-1">{user?.name}</h2>
              <p className="text-muted mb-4">
                Personal dashboard access is active and ready for feature expansion.
              </p>
            </div>

            <div className="dashboard-meta-list">
              <div className="dashboard-meta-row">
                <span>Role</span>
                <strong>{user?.role}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Member Since</span>
                <strong>{accountSummary.memberSince}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Account ID</span>
                <strong>{accountSummary.shortId}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Last Synced</span>
                <strong>{accountSummary.lastUpdated}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {overviewCards.map((card) => (
          <div className="col-md-6 col-xl-3" key={card.label}>
            <div className="feature-card dashboard-stat-card p-4 h-100">
              <div className="feature-icon mb-3">
                <i className={`bi ${card.icon}`}></i>
              </div>
              <span className="dashboard-stat-label">{card.label}</span>
              <h2 className="h5 mb-2">{card.value}</h2>
              <p className="text-muted mb-0 small">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="glass-panel p-4 p-md-5 h-100">
            <span className="section-eyebrow">Workspace</span>
            <h2 className="h3 mb-4">What this dashboard now covers</h2>
            <div className="row g-3">
              {workspaceCards.map((card) => (
                <div className="col-md-4" key={card.title}>
                  <div className="dashboard-mini-card h-100">
                    <div className="feature-icon mb-3">
                      <i className={`bi ${card.icon}`}></i>
                    </div>
                    <h3 className="h6 mb-2">{card.title}</h3>
                    <p className="text-muted mb-0 small">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass-panel p-4 p-md-5 h-100">
            <span className="section-eyebrow">Readiness Checklist</span>
            <h2 className="h3 mb-4">Platform progress for users</h2>
            <div className="dashboard-checklist">
              {readinessItems.map((item) => (
                <div className="dashboard-check-item" key={item}>
                  <i className="bi bi-check2-circle"></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="feature-card p-4 p-md-5 h-100">
            <span className="section-eyebrow">Profile Details</span>
            <h2 className="h4 mb-4">Your authenticated account data</h2>
            <div className="dashboard-meta-list">
              <div className="dashboard-meta-row">
                <span>Full Name</span>
                <strong>{user?.name}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Email Address</span>
                <strong>{user?.email}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Role</span>
                <strong>{user?.role}</strong>
              </div>
              <div className="dashboard-meta-row">
                <span>Session Type</span>
                <strong>Protected user session</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="feature-card p-4 p-md-5 h-100">
            <span className="section-eyebrow">Quick Actions</span>
            <h2 className="h4 mb-4">Move through the product</h2>
            <div className="d-grid gap-3">
              {quickActions.map((action) => (
                <div className="dashboard-action-card" key={action.title}>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="feature-icon">
                      <i className={`bi ${action.icon}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h3 className="h6 mb-2">{action.title}</h3>
                      <p className="text-muted mb-3 small">{action.description}</p>
                      <Link className="btn btn-outline-primary" to={action.to}>
                        {action.buttonLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserDashboardPage;
