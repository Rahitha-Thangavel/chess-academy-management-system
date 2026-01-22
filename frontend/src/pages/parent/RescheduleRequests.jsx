import React, { useState } from 'react';

const RescheduleRequests = () => {
    const [activeTab, setActiveTab] = useState('All');

    // Mock Data
    const summary = {
        pending: 2,
        approved: 3,
        rejected: 1
    };

    const requests = [
        {
            id: 1,
            student: 'Arjun',
            originalClass: 'Dec 5, 2024 - 4:00 PM',
            reason: 'Medical Appointment',
            preferred: 'Dec 7, 2024 - 4:00 PM',
            status: 'Pending',
            submitted: 'Dec 1, 2024'
        },
        {
            id: 2,
            student: 'Priya',
            originalClass: 'Dec 6, 2024 - 5:00 PM',
            reason: 'School Exam',
            preferred: 'Dec 8, 2024 - 5:00 PM',
            status: 'Pending',
            submitted: 'Dec 2, 2024'
        },
        {
            id: 3,
            student: 'Gautam',
            originalClass: 'Nov 25, 2024 - 3:00 PM',
            makeUpClass: 'Nov 27, 2024 - 3:00 PM',
            reason: 'Family Function',
            status: 'Approved',
            approvedBy: 'Admin',
            approvalDate: 'Nov 24, 2024'
        },
        {
            id: 4,
            student: 'Arjun',
            originalClass: 'Nov 15, 2024 - 4:00 PM',
            makeUpClass: 'Nov 20, 2024 - 4:00 PM',
            reason: 'Doctor Appointment',
            status: 'Approved',
            approvedBy: 'Admin',
            approvalDate: 'Nov 17, 2024'
        },
        {
            id: 5,
            student: 'Priya',
            originalClass: 'Nov 15, 2024 - 5:00 PM',
            reason: 'Personal Trip',
            status: 'Rejected',
            rejectedBy: 'Admin',
            rejectionDate: 'Nov 14, 2024',
            rejectionReason: 'No available slots for make-up class'
        }
    ];

    const filteredRequests = activeTab === 'All' ? requests : requests.filter(r => r.status === activeTab);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return { color: 'warning', icon: 'bi-clock-history', text: 'Waiting Admin Approval' };
            case 'Approved': return { color: 'success', icon: 'bi-check-circle-fill', text: 'Approved' };
            case 'Rejected': return { color: 'danger', icon: 'bi-x-circle-fill', text: 'Rejected' };
            default: return { color: 'secondary', icon: '', text: status };
        }
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Reschedule Requests</h3>

            {/* Notifications */}
            <div className="alert alert-warning border-start border-4 border-warning bg-warning-subtle text-dark mb-5" role="alert">
                <h6 className="fw-bold mb-2"><i className="bi bi-exclamation-circle-fill me-2 text-warning"></i> Notifications</h6>
                <ul className="mb-0 small ps-3">
                    <li className="mb-1">Your reschedule request for <strong>Arjun</strong> has been approved!</li>
                    <li>New make-up class scheduled: Dec 7, 4:00 PM</li>
                </ul>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0 text-secondary">Pending Requests</h5>
                            <span className="badge bg-warning text-dark rounded-pill fs-6">{summary.pending}</span>
                        </div>
                        <p className="text-muted small m-0">Awaiting approval from admin</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0 text-success">Approved Requests</h5>
                            <span className="badge bg-success rounded-pill fs-6">{summary.approved}</span>
                        </div>
                        <p className="text-muted small m-0">Successfully rescheduled classes</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0 text-danger">Rejected Requests</h5>
                            <span className="badge bg-danger rounded-pill fs-6">{summary.rejected}</span>
                        </div>
                        <p className="text-muted small m-0">Unable to accommodate</p>
                    </div>
                </div>
            </div>

            {/* Request History */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0">Request History</h5>
                <button className="btn text-white px-4 py-2 fw-bold rounded-2" style={{ backgroundColor: '#6c9343' }}>
                    Request New Reschedule <i className="bi bi-chevron-right ms-1"></i>
                </button>
            </div>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-3 fw-bold position-relative ${activeTab === tab ? 'text-success' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab} {tab !== 'All' && requests.filter(r => r.status === tab).length > 0 && `(${requests.filter(r => r.status === tab).length})`}
                            {activeTab === tab && (
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="d-flex flex-column gap-3">
                {filteredRequests.map(req => {
                    const badge = getStatusBadge(req.status);
                    return (
                        <div key={req.id} className="card border-0 shadow-sm p-4 rounded-3">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="fw-bold m-0">For: {req.student}</h6>
                                <div className={`text-${badge.color} fw-bold small d-flex align-items-center gap-2`}>
                                    <i className={`bi ${badge.icon}`}></i> {badge.text}
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-7">
                                    <div className="row mb-2">
                                        <div className="col-4 text-secondary small">Original Class:</div>
                                        <div className="col-8 small fw-bold">{req.originalClass}</div>
                                    </div>
                                    {req.status === 'Pending' && (
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Reason:</div>
                                            <div className="col-8 small">{req.reason}</div>
                                        </div>
                                    )}
                                    {/* Make-up class for Approved */}
                                    {req.makeUpClass && (
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Make-up Class:</div>
                                            <div className="col-8 small fw-bold">{req.makeUpClass}</div>
                                        </div>
                                    )}
                                    {/* Preferred for Pending */}
                                    {req.preferred && (
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Preferred Make-up:</div>
                                            <div className="col-8 small fw-bold">{req.preferred}</div>
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {req.rejectionReason && (
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Rejection Reason:</div>
                                            <div className="col-8 small text-danger">{req.rejectionReason}</div>
                                        </div>
                                    )}
                                    {/* Reason for Approved/Rejected if not Pending */}
                                    {req.status !== 'Pending' && (
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Reason:</div>
                                            <div className="col-8 small">{req.reason}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-5 text-end d-flex flex-column justify-content-between">
                                    {/* Right side info */}
                                    <div className="text-secondary small">
                                        {req.status === 'Pending' && (
                                            <>
                                                <div>Submitted: {req.submitted}</div>
                                                <button className="btn btn-link text-danger text-decoration-none fw-bold p-0 mt-2 small">Cancel Request</button>
                                            </>
                                        )}
                                        {req.status === 'Approved' && (
                                            <>
                                                <div>Approved By: {req.approvedBy}</div>
                                                <div>Approval Date: {req.approvalDate}</div>
                                            </>
                                        )}
                                        {req.status === 'Rejected' && (
                                            <>
                                                <div>Rejected By: {req.rejectedBy}</div>
                                                <div>Rejection Date: {req.rejectionDate}</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default RescheduleRequests;
