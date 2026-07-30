function AuthFormCard({
  title,
  subtitle,
  onSubmit,
  error,
  successMessage,
  isSubmitting,
  submitLabel,
  footer
}) {
  return (
    <div className="glass-panel p-4 p-md-5 h-100">
      <h2 className="h3 mb-2">{title}</h2>
      <p className="text-muted mb-4">{subtitle}</p>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <div className="auth-form-fields d-grid gap-3">
          {footer?.fields}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mt-4 py-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Please wait...' : submitLabel}
        </button>
      </form>

      {footer?.content ? <div className="mt-4 text-center text-muted">{footer.content}</div> : null}
    </div>
  );
}

export default AuthFormCard;
