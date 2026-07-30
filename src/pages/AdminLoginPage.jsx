import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFormCard from '../components/AuthFormCard';
import useAuth from '../hooks/useAuth';

const initialFormState = {
  email: '',
  password: ''
};

function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    'Use the admin credentials defined in backend/.env.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both admin email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage('');
      await loginAdmin(formData);
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormCard
      title="Admin Login"
      subtitle="Sign in with an admin account to access protected administration routes."
      error={error}
      successMessage={successMessage}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitLabel="Login As Admin"
      footer={{
        fields: (
          <>
            <div>
              <label className="form-label" htmlFor="email">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control form-control-lg auth-input"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control form-control-lg auth-input"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </>
        ),
        content: (
          <>
            <Link className="text-primary fw-semibold" to="/login">
              User login
            </Link>
            <span> | </span>
            <Link className="text-primary fw-semibold" to="/register">
              Create user account
            </Link>
          </>
        )
      }}
    />
  );
}

export default AdminLoginPage;
