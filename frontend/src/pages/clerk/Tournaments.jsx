import React, { useState } from 'react';

const Tournaments = () => {
    const [activeTab, setActiveTab] = useState('tournament registration');

    const upcoming = [
        {
            title: 'Junior Chess Championship 2024',
            date: 'Dec 15, 2024',
            deadline: 'Dec 10',
            venue: 'Jaffna Central Hall',
            participants: '32 registered',
            fee: 'Rs. 500',
            status: 'Registration Open',
            id: 1
        },
        {
            title: 'AAA Academy Monthly Contest',
            date: 'Dec 25, 2024',
            deadline: 'Dec 25',
            venue: 'AAA Chess Academy',
            participants: '25 registered',
            fee: 'Free',
            status: 'Registration Open',
            id: 2
        },
        {
            title: 'District Level Tournament 2025',
            date: 'Jan 20, 2025',
            deadline: 'Jan 10',
            venue: 'District Sports Complex',
            participants: '18 registered',
            fee: 'Rs. 750',
            status: 'Early Registration',
            id: 3
        }
    ];

    const participants = [
        { name: 'Arjun', id: 'STU-001', feeStatus: 'Paid', status: 'Payment Recorded', color: 'success' },
        { name: 'Priya', id: 'STU-002', feeStatus: 'Paid', status: 'Payment Recorded', color: 'success' },
        { name: 'Sarah', id: 'STU-004', feeStatus: 'Pending', status: 'Record Payment', color: 'warning', action: true },
        { name: 'Rohan', id: 'STU-005', feeStatus: 'Paid', status: 'Payment Recorded', color: 'success' },
        { name: 'Maya', id: 'STU-006', feeStatus: 'Paid', status: 'Payment Recorded', color: 'success' },
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Tournament Management</h3>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['Tournament Registration', 'Tournament Management'].map(tab => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === tab.toLowerCase() ? 'text-success' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'tournament registration' && (
                <div className="row g-4">
                    {/* Upcoming List */}
                    <div className="col-12">
                        <h5 className="fw-bold mb-3">Upcoming Tournaments</h5>
                        <div className="d-flex flex-column gap-3">
                            {upcoming.map((t, idx) => (
                                <div key={idx} className="card border-0 shadow-sm p-4 rounded-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h5 className="fw-bold">{t.title}</h5>
                                            <div className="d-flex flex-wrap gap-3 text-secondary small mt-2">
                                                <span><i className="bi bi-calendar me-1"></i> {t.date}</span>
                                                <span><i className="bi bi-geo-alt me-1"></i> {t.venue}</span>
                                                <span><i className="bi bi-people me-1"></i> {t.participants}</span>
                                                <span><i className="bi bi-tag me-1"></i> Entry Fee: {t.fee}</span>
                                            </div>
                                            <div className="d-flex gap-3 mt-2 small">
                                                <span className="text-success fw-bold">Status: {t.status}</span>
                                                <span className="text-secondary">| Deadline: {t.deadline}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column gap-2">
                                            <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#6c9343' }}>Register Student</button>
                                            <button className="btn btn-light text-secondary fw-bold px-4">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Participants Table */}
                    <div className="col-12 mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0">Junior Chess Championship Participants</h5>
                            <span className="text-secondary small">5 Registered</span>
                        </div>

                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-secondary small fw-bold">
                                        <tr>
                                            <th className="py-3 ps-4 border-0">Student</th>
                                            <th className="py-3 border-0">ID</th>
                                            <th className="py-3 border-0">Fee Status</th>
                                            <th className="py-3 pe-4 text-end border-0">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((p, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4 fw-bold">{p.name}</td>
                                                <td className="text-secondary">{p.id}</td>
                                                <td>
                                                    {p.feeStatus === 'Paid' ? (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                                                            <i className="bi bi-check-lg me-1"></i> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">
                                                            <i className="bi bi-exclamation-triangle-fill me-1"></i> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-end pe-4">
                                                    {p.action ? (
                                                        <span className="text-success small fw-bold cursor-pointer">Record Payment</span>
                                                    ) : (
                                                        <span className="text-secondary small">Payment Recorded</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tournament management' && (
                <div className="card border-0 shadow-sm p-5 rounded-4" style={{ maxWidth: '800px' }}>
                    <h5 className="fw-bold mb-4">Tournament Setup</h5>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Tournament Name</label>
                            <input type="text" className="form-control bg-light border-0 py-2" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Tournament Date</label>
                            <input type="date" className="form-control bg-light border-0 py-2" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Venue</label>
                            <input type="text" className="form-control bg-light border-0 py-2" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Registration Deadline</label>
                            <input type="date" className="form-control bg-light border-0 py-2" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Entry Fee</label>
                            <input type="text" className="form-control bg-light border-0 py-2" placeholder="Rs." />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Maximum Participants</label>
                            <input type="number" className="form-control bg-light border-0 py-2" />
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold text-secondary">Tournament Description</label>
                            <textarea className="form-control bg-light border-0 py-2" rows="3"></textarea>
                        </div>

                        <div className="col-12 mt-4">
                            <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                                <i className="bi bi-plus-circle me-2"></i> Create Tournament
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tournaments;
