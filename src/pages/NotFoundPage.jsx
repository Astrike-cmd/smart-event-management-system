import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="container py-5">
      <div className="glass-panel text-center p-5">
        <span className="badge rounded-pill text-bg-dark-subtle px-3 py-2 mb-3">
          Error 404
        </span>
        <h1 className="display-6 fw-semibold mb-3">Page Not Found</h1>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or is no longer available.
        </p>
        <Link className="btn btn-primary px-4" to="/">
          Back To Home
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
