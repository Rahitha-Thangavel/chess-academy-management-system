import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    password: '',
    confirm_password: '',
    qualification: '',
    hourly_rate: '',
    emergency_contact: '',
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'creating', 'created', ''

  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pwd = formData.password;
    setPasswordCriteria({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'first_name' || name === 'last_name') && value.length > 75) {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';

    if (!passwordCriteria.length || !passwordCriteria.upper ||
      !passwordCriteria.lower || !passwordCriteria.special) {
      newErrors.password = 'Please meet all password requirements.';
    }

    if (!formData.confirm_password) newErrors.confirm_password = 'Please confirm password';
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (role === 'COACH') {
      if (!formData.qualification) newErrors.qualification = 'Qualification is required';
      if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
        newErrors.hourly_rate = 'Valid hourly rate is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('creating');

    const userData = { ...formData, role: role };

    if (role === "COACH") {
      userData.hourly_rate = Number(formData.hourly_rate);
    } else {
      delete userData.hourly_rate;
      delete userData.qualification;
    }
    if (role !== "PARENT") {
      delete userData.emergency_contact;
    }

    try {
      const result = await register(userData);

      if (result.success) {
        setSubmitStatus('created');
        // Brief pause to show success message before redirect
        setTimeout(() => {
          navigate('/verify-email-sent', {
            state: { email: userData.email }
          });
        }, 1500);
      } else {
        setSubmitStatus('');
      }
    } catch (e) {
      console.error("Registration submit error:", e);
      setSubmitStatus('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Overlay
  if (submitStatus === 'creating' || submitStatus === 'created') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
        <div className="card p-5 text-center shadow-sm" style={{ maxWidth: '400px' }}>
          {submitStatus === 'creating' ? (
            <>
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <h4 className="mb-2">Creating your account...</h4>
              <p className="text-muted">Please wait while we set things up.</p>
            </>
          ) : (
            <>
              <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
              <h4 className="mb-2">Account Created!</h4>
              <p className="text-success">Check your email to verify.</p>
              <p className="small text-muted">Redirecting...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const renderPasswordChecklist = () => (
    <div className="card bg-light border-0 p-3 mb-3">
      <small className="fw-bold mb-2 d-block text-secondary">Password Requirements:</small>
      <div className="d-flex flex-wrap gap-3">
        <span className={passwordCriteria.length ? "text-success" : "text-muted"}>
          {passwordCriteria.length ? "✓" : "○"} At least 8 chars
        </span>
        <span className={passwordCriteria.upper ? "text-success" : "text-muted"}>
          {passwordCriteria.upper ? "✓" : "○"} 1 Uppercase
        </span>
        <span className={passwordCriteria.lower ? "text-success" : "text-muted"}>
          {passwordCriteria.lower ? "✓" : "○"} 1 Lowercase
        </span>
        <span className={passwordCriteria.special ? "text-success" : "text-muted"}>
          {passwordCriteria.special ? "✓" : "○"} 1 Special char
        </span>
      </div>
    </div>
  );

  // Role Selection View
  if (!role) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '800px' }}>
          <div className="text-center mb-5">
            <h2 className="text-primary fw-bold">Join AAA Grand Masters</h2>
            <p className="lead text-muted">Select your account type to get started</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-3">
              <div className="card h-100 text-center p-4 border-2 hover-shadow"
                style={{ cursor: 'pointer', borderColor: '#228B22' }}
                onClick={() => setRole('PARENT')}>
                <div className="display-4 mb-3">👨‍👩‍👧‍👦</div>
                <h4 className="text-primary">Parent</h4>
                <p className="text-muted small">For enrolling students.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 text-center p-4 border-2 hover-shadow"
                style={{ cursor: 'pointer', borderColor: '#228B22' }}
                onClick={() => setRole('COACH')}>
                <div className="display-4 mb-3">♟️</div>
                <h4 className="text-primary">Coach</h4>
                <p className="text-muted small">For teaching masters.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 text-center p-4 border-2 hover-shadow"
                style={{ cursor: 'pointer', borderColor: '#228B22' }}
                onClick={() => setRole('CLERK')}>
                <div className="display-4 mb-3">📝</div>
                <h4 className="text-primary">Clerk</h4>
                <p className="text-muted small">For admin staff.</p>
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <button className="btn btn-link text-decoration-none text-muted float-start" onClick={() => setRole('')}>
            ← Back
          </button>
          <h2 className="text-primary">Create {role.charAt(0) + role.slice(1).toLowerCase()} Account</h2>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {typeof error === 'object' ? JSON.stringify(error) : error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name</label>
              <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} required maxLength={75} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} required maxLength={75} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea className="form-control" name="address" value={formData.address} onChange={handleChange} rows="2" />
          </div>

          {role === 'COACH' && (
            <>
              <div className="mb-3">
                <label className="form-label">Qualification *</label>
                <textarea className="form-control" name="qualification" value={formData.qualification} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Hourly Rate (LKR) *</label>
                <input type="number" className="form-control" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} min="0" step="0.01" required />
              </div>
            </>
          )}

          {role === 'PARENT' && (
            <div className="mb-3">
              <label className="form-label">Emergency Contact</label>
              <input type="tel" className="form-control" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          {formData.password && renderPasswordChecklist()}

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isSubmitting}>
            Register
          </button>

          <div className="text-center">
            <p className="mb-0">Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;