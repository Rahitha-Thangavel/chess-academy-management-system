import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:8000/api/auth/password-reset/', { email });
            setStatus({ type: 'success', message: response.data.message });
        } catch (error) {
            setStatus({
                type: 'danger',
                message: error.response?.data?.message || 'An error occurred. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <h2 className="text-primary">AAA Grand Masters</h2>
                    <h4>Reset Password</h4>
                    <p className="text-muted">Enter your email to receive a reset link</p>
                </div>

                {status.message && (
                    <div className={`alert alert-${status.type} alert-dismissible fade show`} role="alert">
                        {status.message}
                        <button type="button" className="btn-close" onClick={() => setStatus({ type: '', message: '' })}></button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-decoration-none">← Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
