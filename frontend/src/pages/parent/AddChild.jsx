import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useAppUI } from '../../contexts/AppUIContext';

const AddChild = () => {
    const { notifyError } = useAppUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        grade_level: '',
        school: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/students/', formData);
            navigate('/parent/registration-success');
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMsg = error.response?.data?.errors
                ? JSON.stringify(error.response.data.errors)
                : error.response?.data?.error || 'Failed to register student. Please try again.';
            notifyError(`Failed to register: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>Register a New Student</h3>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}>
                    <h5 className="fw-bold text-white m-0">Student Information</h5>
                    <p className="text-white-50 m-0 small">Please fill in the details of your child for admission.</p>
                </div>

                <div className="p-5 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="form-control bg-light border-0 py-2"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="form-control bg-light border-0 py-2"
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    className="form-control bg-light border-0 py-2"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">School</label>
                                <input
                                    type="text"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleChange}
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="Enter current school"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Current Grade Level</label>
                                <select
                                    name="grade_level"
                                    value={formData.grade_level}
                                    onChange={handleChange}
                                    className="form-select bg-light border-0 py-2"
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {[...Array(13)].map((_, i) => (
                                        <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Preferred Start Date</label>
                                <input type="date" className="form-control bg-light border-0 py-2" />
                            </div>
                        </div>

                        <div className="mt-5 d-flex justify-content-end gap-3">
                            <button type="button" className="btn btn-light fw-bold px-4" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn text-white fw-bold px-5 shadow-sm" style={{ backgroundColor: '#6c9343' }} disabled={loading}>
                                {loading ? 'Registering...' : 'Submit Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddChild;
