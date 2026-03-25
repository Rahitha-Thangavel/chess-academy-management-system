import React from 'react';
import axios from '../../api/axiosInstance';

const CoachManagement = () => {
    const [coaches, setCoaches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedCoach, setSelectedCoach] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = React.useState('');
    const [qualificationFilter, setQualificationFilter] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [minRate, setMinRate] = React.useState('');
    const [maxRate, setMaxRate] = React.useState('');

    // Debounced values
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [debouncedQual, setDebouncedQual] = React.useState('');

    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedQual(qualificationFilter), 500);
        return () => clearTimeout(handler);
    }, [qualificationFilter]);

    React.useEffect(() => {
        fetchCoaches();
    }, [debouncedSearch, debouncedQual, statusFilter, minRate, maxRate]);

    const fetchCoaches = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('role', 'COACH');

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (debouncedQual) params.append('qualification', debouncedQual);
            if (statusFilter) params.append('status', statusFilter);
            if (minRate) params.append('min_rate', minRate);
            if (maxRate) params.append('max_rate', maxRate);

            const queryString = params.toString();
            const response = await axios.get(`/auth/users/?${queryString}`);
            setCoaches(response.data);
        } catch (error) {
            console.error('Error fetching coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setQualificationFilter('');
        setStatusFilter('');
        setMinRate('');
        setMaxRate('');
    };

    const handleViewProfile = (coach) => {
        setSelectedCoach(coach);
        setShowModal(true);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Coach Management</h3>
            </div>

            {/* Filter Bar */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-secondary">Search Name</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control border-end-0 bg-light border-0"
                                placeholder="Search coach..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="input-group-text bg-light border-start-0 border-0"><i className="bi bi-search text-secondary"></i></span>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-secondary">Qualification</label>
                        <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="e.g. FIDE, National"
                            value={qualificationFilter}
                            onChange={(e) => setQualificationFilter(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-secondary">Status</label>
                        <select
                            className="form-select bg-light border-0"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-secondary">Min Rate (LKR)</label>
                        <input
                            type="number"
                            className="form-control bg-light border-0"
                            placeholder="Min"
                            value={minRate}
                            onChange={(e) => setMinRate(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-secondary">Max Rate (LKR)</label>
                        <input
                            type="number"
                            className="form-control bg-light border-0"
                            placeholder="Max"
                            value={maxRate}
                            onChange={(e) => setMaxRate(e.target.value)}
                        />
                    </div>

                    <div className="col-md-1">
                        <button
                            className="btn btn-light border w-100 fw-bold"
                            onClick={handleResetFilters}
                            title="Reset Filters"
                            style={{ height: '38px' }}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                        </button>
                    </div>
                </div>
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
