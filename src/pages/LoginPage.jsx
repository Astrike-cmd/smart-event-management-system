import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthFormCard from '../components/AuthFormCard';
import useAuth from '../hooks/useAuth';

const initialFormState = {
  email: '',
  password: ''
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
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
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      const nextPath = location.state?.from?.pathname || '/dashboard';
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormCard
      title="User Login"
      subtitle="Welcome back."
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitLabel="Login"
      footer={{
        fields: (
          <>
            <div>
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control form-control-lg auth-input"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </>
        ),
        content: (
          <>
            <span>New user? </span>
            <Link className="text-primary fw-semibold" to="/register">
              Create an account
            </Link>
            <span> | </span>
            <Link className="text-primary fw-semibold" to="/admin/login">
              Admin login
            </Link>
          </>
        )
      }}
    />
  );
}

export default LoginPage;
