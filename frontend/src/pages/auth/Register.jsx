/**
 * Page component: Register.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  // Start with no role selected to show the Selection Screen first
  const [role, setRole] = useState('');

  // Base State
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    phone: '',
    // Common for all
    first_name: '',
    last_name: '',
    // Parent Specific
    address: '',
    emergency_contact: '',
    relationship: '',
    // Coach Specific
    specialization: '',
    hourly_rate: '',
    hire_date: '',
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const { register, error: authError, setError: setAuthError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setAuthError(null); // Clear global auth errors when component mounts
  }, []);

  useEffect(() => {
    const pwd = formData.password;
    setPasswordCriteria({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    });

    if (errors.confirm_password && formData.confirm_password) {
      if (pwd === formData.confirm_password) {
        setErrors(prev => ({ ...prev, confirm_password: '' }));
      }
    }
  }, [formData.password, formData.confirm_password, errors.confirm_password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';

    if (role === 'COACH') {
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.hourly_rate) newErrors.hourly_rate = 'Hourly rate is required';
    }

    if (!passwordCriteria.length || !passwordCriteria.upper ||
      !passwordCriteria.lower || !passwordCriteria.special) {
      newErrors.password = 'Please meet all password requirements.';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('creating');

    const payload = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      confirm_password: formData.confirm_password,
      phone: formData.phone,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: role
    };

    if (role === 'PARENT') {
      payload.address = formData.address;
      payload.emergency_contact = formData.emergency_contact;
      payload.relationship = formData.relationship;
    } else if (role === 'COACH') {
      payload.specialization = formData.specialization;
      payload.hourly_rate = formData.hourly_rate;
      payload.hire_date = formData.hire_date || null;
    }

    try {
      const result = await register(payload);
      if (result.success) {
        setSubmitStatus('created');
        setTimeout(() => {
          navigate('/verify-email-sent', { state: { email: formData.email } });
        }, 2000);
      } else {
        setSubmitStatus('');
        // Handle Backend Validation Errors
        if (result.error && result.error.errors) {
          const backendErrors = {};
          Object.keys(result.error.errors).forEach((key) => {
            backendErrors[key] = result.error.errors[key][0];
          });
          setErrors(backendErrors);
          setAuthError(null); // Don't show global error if we have field errors
        }
      }
    } catch (e) {
      console.error(e);
      setSubmitStatus('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (submitStatus === 'creating' || submitStatus === 'created') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
        <div className="card p-5 text-center shadow-sm" style={{ maxWidth: '400px' }}>
          {submitStatus === 'creating' ? (
            <>
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <h4 className="mb-2">Creating Account...</h4>
            </>
          ) : (
            <>
              <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
              <h4 className="mb-2">Account Created!</h4>
              <p className="text-muted">Please check your email.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 1: Role Selection Screen ---
  if (!role) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-5">
            <h2 className="text-primary fw-bold">Join Chess Academy</h2>
            <p className="lead text-muted">Select your account type to get started</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="card h-100 text-center p-4 border-2 hover-shadow cursor-pointer transition-all"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => setRole('PARENT')}
                onMouseEnter={(e) => e.currentTarget.classList.add('shadow-lg')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('shadow-lg')}>
                <div className="display-4 mb-3">👨‍👩‍👧‍👦</div>
                <h4 className="text-primary fw-bold">Parent</h4>
                <p className="text-muted small">For enrolling students & managing payments.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 text-center p-4 border-2 hover-shadow cursor-pointer transition-all"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => setRole('COACH')}
                onMouseEnter={(e) => e.currentTarget.classList.add('shadow-lg')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('shadow-lg')}>
                <div className="display-4 mb-3">♟️</div>
                <h4 className="text-primary fw-bold">Coach</h4>
                <p className="text-muted small">For teaching masters & managing classes.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 text-center p-4 border-2 hover-shadow cursor-pointer transition-all"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => setRole('CLERK')}
                onMouseEnter={(e) => e.currentTarget.classList.add('shadow-lg')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('shadow-lg')}>
                <div className="display-4 mb-3">📝</div>
                <h4 className="text-primary fw-bold">Clerk</h4>
                <p className="text-muted small">For administrative staff & management.</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-5">
            <p>Already have an account? <Link to="/login" className="text-primary fw-bold">Sign In</Link></p>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: Registration Form ---
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="mb-4">
          <button className="btn btn-link text-decoration-none text-muted p-0 mb-2" onClick={() => setRole('')}>
            ← Back to Role Selection
          </button>
          <h2 className="text-primary fw-bold text-center">Create Account</h2>
        </div>

        {authError && (
          <div className="alert alert-danger">
            {typeof authError === 'object'
              ? (authError.message || authError.error || 'Registration failed')
              : authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* First Name & Last Name (Visible for ALL roles, at the top) */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
              {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
              {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          {/* Phone - Common Field */}
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Parent Specific Fields */}
          {role === 'PARENT' && (
            <>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea className="form-control" name="address" rows="2" value={formData.address} onChange={handleChange}></textarea>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Emergency Contact</label>
                  <input type="text" className="form-control" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Relationship with Student</label>
                  <input type="text" className="form-control" name="relationship" value={formData.relationship} onChange={handleChange} placeholder="e.g. Father, Mother" />
                </div>
              </div>
            </>
          )}

          {/* Coach Specific Fields */}
          {role === 'COACH' && (
            <>
              <div className="mb-3">
                <label className="form-label">Specialization</label>
                <input type="text" className={`form-control ${errors.specialization ? 'is-invalid' : ''}`} name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Grandmaster, Opening Theory" />
                {errors.specialization && <div className="invalid-feedback">{errors.specialization}</div>}
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Hourly Rate</label>
                  <input type="number" step="0.01" className={`form-control ${errors.hourly_rate ? 'is-invalid' : ''}`} name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} />
                  {errors.hourly_rate && <div className="invalid-feedback">{errors.hourly_rate}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Hire Date</label>
                  <input type="date" className="form-control" name="hire_date" value={formData.hire_date} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {/* Password Fields */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}

            {/* Validations Checklist */}
            {formData.password && (
              <div className="mt-2 text-muted small">
                <span className={`me-3 ${passwordCriteria.length ? 'text-success' : ''}`}>{passwordCriteria.length ? '✓' : '○'} 8+ Chars</span>
                <span className={`me-3 ${passwordCriteria.upper ? 'text-success' : ''}`}>{passwordCriteria.upper ? '✓' : '○'} Uppercase</span>
                <span className={`me-3 ${passwordCriteria.lower ? 'text-success' : ''}`}>{passwordCriteria.lower ? '✓' : '○'} Lowercase</span>
                <span className={`${passwordCriteria.special ? 'text-success' : ''}`}>{passwordCriteria.special ? '✓' : '○'} Special</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
            />
            <div className="invalid-feedback">
              {errors.confirm_password}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center mt-3">
            <small>Already have an account? <Link to="/login">Login</Link></small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;