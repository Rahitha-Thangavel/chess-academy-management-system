import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewRescheduleRequest = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate submission
        navigate('/parent/registration-success');
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>New Reschedule Request</h3>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}>
                    <h5 className="fw-bold text-white m-0">Request Details</h5>
                    <p className="text-white-50 m-0 small">Submit a request to change a class timing.</p>
                </div>

                <div className="p-5 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Select Child</label>
                                <select className="form-select bg-light border-0 py-2" required>
                                    <option value="">Choose...</option>
                                    <option value="1">Arjun</option>
                                    <option value="2">Priya</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Select Class</label>
                                <select className="form-select bg-light border-0 py-2" required>
                                    <option value="">Choose Class...</option>
                                    <option value="Beginner A">Beginner A</option>
                                    <option value="Intermediate B">Intermediate B</option>
                                </select>
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Scheduled Date</label>
                                <input type="date" className="form-control bg-light border-0 py-2" required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Preferred New Date</label>
                                <input type="date" className="form-control bg-light border-0 py-2" required />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">Reason for Rescheduling</label>
                            <textarea className="form-control bg-light border-0" rows="3" placeholder="e.g., Medical appointment, Family function..." required></textarea>
                        </div>

                        <div className="mt-5 d-flex justify-content-end gap-3">
                            <button type="button" className="btn btn-light fw-bold px-4" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn text-white fw-bold px-5 shadow-sm" style={{ backgroundColor: '#6c9343' }}>
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewRescheduleRequest;
