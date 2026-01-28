import React from 'react';
import axios from '../../api/axiosInstance';

const CoachManagement = () => {
    const [coaches, setCoaches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedCoach, setSelectedCoach] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);

    React.useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const response = await axios.get('/auth/users/?role=COACH');
            setCoaches(response.data);
        } catch (error) {
            console.error('Error fetching coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (coach) => {
        setSelectedCoach(coach);
        setShowModal(true);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Coach Management</h3>
                {/* Add Coach button removed as requested */}
            </div>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {coaches.length > 0 ? (
                        coaches.map((coach, idx) => (
                            <div key={idx} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h5 className="fw-bold m-0">{coach.first_name} {coach.last_name}</h5>
                                            <p className="text-secondary small m-0">{coach.email}</p>
                                        </div>
                                        <span className="badge bg-success rounded-pill px-3 py-2" style={{ backgroundColor: '#6c9343 !important' }}>
                                            {coach.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-secondary fw-bold d-block mb-1">Qualification</small>
                                        <p className="fw-bold text-dark m-0">{coach.qualification || 'N/A'}</p>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                        <div>
                                            <small className="text-secondary fw-bold d-block mb-1">Hourly Rate</small>
                                            <p className="fw-bold m-0">{coach.hourly_rate ? `LKR ${coach.hourly_rate}` : 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3 mt-4">
                                        <button
                                            className="btn btn-light text-success fw-bold flex-grow-1"
                                            style={{ color: '#6c9343' }}
                                            onClick={() => handleViewProfile(coach)}
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center text-secondary">
                            <p>No coaches found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* View Profile Modal */}
            {showModal && selectedCoach && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-success" style={{ color: '#6c9343' }}>Coach Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="text-center mb-4">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-person-fill text-secondary fs-1"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1">{selectedCoach.first_name} {selectedCoach.last_name}</h4>
                                    <p className="text-secondary mb-0">{selectedCoach.role}</p>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <small className="text-secondary d-block fw-bold">Email</small>
                                        <p className="mb-0">{selectedCoach.email}</p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary d-block fw-bold">Phone</small>
                                        <p className="mb-0">{selectedCoach.phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-12">
                                        <small className="text-secondary d-block fw-bold">Qualification</small>
                                        <p className="mb-0">{selectedCoach.qualification || 'N/A'}</p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary d-block fw-bold">Hourly Rate</small>
                                        <p className="mb-0">{selectedCoach.hourly_rate ? `LKR ${selectedCoach.hourly_rate}` : 'N/A'}</p>
                                    </div>
                                    {selectedCoach.date_of_birth && (
                                        <div className="col-6">
                                            <small className="text-secondary d-block fw-bold">Date of Birth</small>
                                            <p className="mb-0">{selectedCoach.date_of_birth}</p>
                                        </div>
                                    )}
                                    <div className="col-6">
                                        <small className="text-secondary d-block fw-bold">Status</small>
                                        <span className={`badge ${selectedCoach.is_active ? 'bg-success' : 'bg-danger'}`}>
                                            {selectedCoach.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachManagement;
