import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'PARENT',
    phone: '',
    address: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    qualification: '',
    hourly_rate: '',
    emergency_contact: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirm_password) newErrors.confirm_password = 'Please confirm password';
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    // Role-specific validations
    if (formData.role === 'COACH') {
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
 const userData = { ...formData };

      if (formData.role === "COACH") {
        userData.hourly_rate = Number(formData.hourly_rate);
      } else {
        delete userData.hourly_rate;
        delete userData.qualification;
        delete userData.date_of_birth;
      }
    
    const result = await register(userData);
    
    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      switch (role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'CLERK':
          navigate('/clerk/dashboard');
          break;
        case 'COACH':
          navigate('/coach/dashboard');
          break;
        case 'PARENT':
          navigate('/parent/dashboard');
          break;
        default:
          navigate('/');
      }
    }
    
    setIsSubmitting(false);
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'COACH':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="qualification" className="form-label">
                Qualification *
              </label>
              <textarea
                className={`form-control ${errors.qualification ? 'is-invalid' : ''}`}
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                rows="3"
                required
                disabled={isSubmitting}
              />
              {errors.qualification && (
                <div className="invalid-feedback">{errors.qualification}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="hourly_rate" className="form-label">
                Hourly Rate (LKR) *
              </label>
              <input
                type="number"
                className={`form-control ${errors.hourly_rate ? 'is-invalid' : ''}`}
                id="hourly_rate"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
              />
              {errors.hourly_rate && (
                <div className="invalid-feedback">{errors.hourly_rate}</div>
              )}
            </div>
          </>
        );

      case 'PARENT':
        return (
          <div className="mb-3">
            <label htmlFor="emergency_contact" className="form-label">
              Emergency Contact
            </label>
            <input
              type="tel"
              className="form-control"
              id="emergency_contact"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h2 className="text-primary">Chess Academy</h2>
          <h4>Create Your Account</h4>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {typeof error === 'object' ? JSON.stringify(error) : error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="first_name" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <div className="invalid-feedback">{errors.first_name}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="last_name" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <div className="invalid-feedback">{errors.last_name}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              Role *
            </label>
            <select
              className="form-control"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="PARENT">Parent</option>
              <option value="COACH">Coach</option>
              <option value="CLERK">Clerk</option>
            </select>
            <small className="text-muted">
              Note: Admin accounts can only be created by existing admins
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="date_of_birth" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              disabled={isSubmitting}
            />
          </div>

          {renderRoleSpecificFields()}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="confirm_password" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              {errors.confirm_password && (
                <div className="invalid-feedback">{errors.confirm_password}</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>

          <div className="text-center">
            <p className="mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-decoration-none">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;