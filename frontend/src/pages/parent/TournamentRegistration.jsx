import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TournamentRegistration = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [selectedChild, setSelectedChild] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would submit the registration
        navigate('/parent/registration-success');
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>Tournament Registration</h3>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}>
                    <h5 className="fw-bold text-white m-0">Junior Chess Championship 2024</h5>
                    <p className="text-white-50 m-0 small">Dec 15, 2024 | 8:00 AM | Main Academy Hall</p>
                </div>

                <div className="p-5 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">Select Child</label>
                            <select
                                className="form-select bg-light border-0 py-2"
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                required
                            >
                                <option value="">Choose a student...</option>
                                <option value="1">Arjun</option>
                                <option value="2">Priya</option>
                                <option value="3">Gautam</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">Category</label>
                            <select className="form-select bg-light border-0 py-2" required>
                                <option value="">Select Category</option>
                                <option value="Under 10">Under 10</option>
                                <option value="Under 12">Under 12</option>
                                <option value="Under 15">Under 15</option>
                            </select>
                        </div>

                        <div className="alert alert-light border rounded-3 text-secondary small">
                            <i className="bi bi-info-circle me-2"></i>
                            Registration Fee: <span className="fw-bold text-dark">LKR 500</span>. Will be added to your next payment invoice.
                        </div>

                        <div className="mt-5 d-flex justify-content-end gap-3">
                            <button type="button" className="btn btn-light fw-bold px-4" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn text-white fw-bold px-5 shadow-sm" style={{ backgroundColor: '#6c9343' }}>
                                Confirm Registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TournamentRegistration;
