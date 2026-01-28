import React from 'react';

const MyClasses = () => {
    const [batches, setBatches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const { default: axios } = await import('../../api/axiosInstance');
            const res = await axios.get('/batches/');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [showModal, setShowModal] = React.useState(false);
    const [selectedBatch, setSelectedBatch] = React.useState(null);

    const handleViewDetails = (batch) => {
        setSelectedBatch(batch);
        setShowModal(true);
    };

    if (loading) return <div className="p-4 text-center">Loading classes...</div>;

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">My Classes</h3>

            {batches.length === 0 ? (
                <div className="text-center p-5 bg-light rounded-3">
                    <p className="text-muted">You don't have any assigned classes yet.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {batches.map((cls) => (
                        <div key={cls.id} className="col-md-6 col-xl-4">
                            <div className="card border-0 shadow-sm p-0 overflow-hidden h-100" style={{ borderRadius: '12px' }}>
                                <div className="h-1 bg-success" style={{ height: '8px' }}></div>
                                <div className="p-4">
                                    <h5 className="fw-bold mb-3">{cls.batch_name}</h5>

                                    <div className="d-flex flex-column gap-3 mb-4">
                                        <div className="d-flex align-items-center gap-3 text-secondary">
                                            <i className="bi bi-clock-history"></i>
                                            <span>{cls.schedule_day}, {cls.start_time} - {cls.end_time}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 text-secondary">
                                            <i className="bi bi-people"></i>
                                            <span>{cls.current_students || 0}/{cls.max_students} Students</span>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <button
                                            className="btn btn-link text-success text-decoration-none fw-bold p-0"
                                            onClick={() => handleViewDetails(cls)}
                                        >
                                            View Details <i className="bi bi-chevron-right small"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {showModal && selectedBatch && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow-lg border-0">
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold text-success">{selectedBatch.batch_name}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                                    <div className="bg-white p-2 rounded-circle shadow-sm">
                                        <i className="bi bi-calendar-event text-success fs-4"></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block uppercase fw-bold" style={{ fontSize: '10px' }}>SCHEDULE</small>
                                        <span className="fw-bold text-dark">{selectedBatch.schedule_day}s</span>
                                        <div className="small text-secondary">{selectedBatch.start_time} - {selectedBatch.end_time}</div>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="p-3 border rounded-3 text-center h-100">
                                            <i className="bi bi-people fs-4 text-primary mb-2 d-block"></i>
                                            <small className="text-muted d-block">Students</small>
                                            <span className="fw-bold">{selectedBatch.current_students || 0}/{selectedBatch.max_students}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0">
                                <button className="btn btn-secondary px-4 rounded-pill" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyClasses;
