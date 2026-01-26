import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            setStatus({ type: 'danger', message: 'Passwords do not match.' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post(`http://localhost:8000/api/auth/password-reset/${token}/`, {
                token: token,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });
            setStatus({ type: 'success', message: response.data.message });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus({
                type: 'danger',
                message: error.response?.data?.error || 'An error occurred. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <h2 className="text-success" style={{ color: '#6c9343 !important' }}>AAA Grand Master</h2>
                    <h4>Set New Password</h4>
                </div>

                {status.message && (
                    <div className={`alert alert-${status.type} alert-dismissible fade show`} role="alert">
                        {status.message}
                        <button type="button" className="btn-close" onClick={() => setStatus({ type: '', message: '' })}></button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.new_password}
                            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100 mb-3" style={{ backgroundColor: '#6c9343' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
