import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css'; // Import custom styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = new URLSearchParams(window.location.search);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendUrl, setResendUrl] = useState(null);

  React.useEffect(() => {
    setError(null); // Clear any existing errors on mount
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please check your email to verify your account before logging in.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      switch (role) {
        case 'ADMIN': navigate('/admin/dashboard'); break;
        case 'CLERK': navigate('/clerk/dashboard'); break;
        case 'COACH': navigate('/coach/dashboard'); break;
        case 'PARENT': navigate('/parent/dashboard'); break;
        default: navigate('/');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left Side - Visuals */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-icon">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <h1 className="visual-title">AAA Grand Masters</h1>
            <p className="visual-text">
              Where champions are forged. Strategy, discipline, and mastery in every move.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <div className="form-floating-custom">
                <i className="bi bi-person input-icon"></i>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <div className="form-floating-custom">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control-custom"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                />
                <label className="form-check-label text-secondary small" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" class="link-custom small">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="link-custom">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;