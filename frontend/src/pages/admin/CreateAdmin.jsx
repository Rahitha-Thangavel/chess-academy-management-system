import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear status
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validation
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            // Use authAPI directly to include auth headers
            // We do NOT use register() from context because we don't want to switch session
            await authAPI.register({
                ...formData,
                role: 'ADMIN' // Force role to Admin
            });

            setSuccess('New Admin account created successfully!');
            setFormData({
                email: '',
                first_name: '',
                last_name: '',
                phone: '',
                password: '',
                confirm_password: ''
            });
            // Optional: Navigate back after delay
            // setTimeout(() => navigate('/admin/dashboard'), 2000);

        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.email || 'Failed to create admin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Create New Admin</h4>
                </div>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-control"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="form-control"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                className="form-control"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAdmin;
