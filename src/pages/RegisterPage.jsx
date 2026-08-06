import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFormCard from '../components/AuthFormCard';
import useAuth from '../hooks/useAuth';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
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

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please complete all fields.';
    }

    if (formData.name.trim().length < 2) {
      return 'Name must be at least 2 characters long.';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Password and confirm password must match.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormCard
      title="Create your account"
      subtitle="Join Eventify to book events."
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitLabel="Register"
      footer={{
        fields: (
          <>
            <div>
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control form-control-lg auth-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control form-control-lg auth-input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-control form-control-lg auth-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        ),
        content: (
          <>
            <span>Already have an account? </span>
            <Link className="text-primary fw-semibold" to="/login">
              Login here
            </Link>
          </>
        )
      }}
    />
  );
}

export default RegisterPage;
