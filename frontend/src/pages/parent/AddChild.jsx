import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddChild = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would typically send data to backend
        navigate('/parent/registration-success');
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>Register New Student</h3>
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
                                <input type="text" className="form-control bg-light border-0 py-2" required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Last Name</label>
                                <input type="text" className="form-control bg-light border-0 py-2" required />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Date of Birth</label>
                                <input type="date" className="form-control bg-light border-0 py-2" required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Current Grade Level</label>
                                <select className="form-select bg-light border-0 py-2" required>
                                    <option value="">Select Grade</option>
                                    <option value="Grade 1">Grade 1</option>
                                    <option value="Grade 2">Grade 2</option>
                                    <option value="Grade 3">Grade 3</option>
                                    <option value="Grade 4">Grade 4</option>
                                    <option value="Grade 5">Grade 5</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Preferred Start Date</label>
                                <input type="date" className="form-control bg-light border-0 py-2" required />
                            </div>
                        </div>

                        <div className="mt-5 d-flex justify-content-end gap-3">
                            <button type="button" className="btn btn-light fw-bold px-4" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn text-white fw-bold px-5 shadow-sm" style={{ backgroundColor: '#6c9343' }}>
                                Submit Registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddChild;
