import React, { useState } from 'react';

const RescheduleRequests = () => {
    // Mock Data
    const requests = [
        {
            id: 1,
            requester: 'Coach Ravi',
            role: 'Coach',
            class: 'Beginner A',
            currentDate: 'Dec 5, 2024 (10:00 AM)',
            requestedDate: 'Dec 7, 2024 (4:00 PM)',
            reason: 'Medical Appointment',
            status: 'Pending'
        },
        {
            id: 2,
            requester: 'James (Parent of Liam)',
            role: 'Parent',
            class: 'Beginner B',
            currentDate: 'Dec 6, 2024',
            requestedDate: 'Dec 8, 2024',
            reason: 'Family Event',
            status: 'Pending'
        },
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Reschedule Approval</h3>
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">12 Pending Requests</span>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">Pending Requests</h6>
                </div>
                <div className="p-4 d-flex flex-column gap-3">
                    {requests.map((req, idx) => (
                        <div key={idx} className="border rounded-3 p-4 bg-light position-relative">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className={`badge rounded-pill ${req.role === 'Coach' ? 'bg-primary' : 'bg-info'} small`}>{req.role}</span>
                                        <h6 className="fw-bold m-0">{req.requester}</h6>
                                    </div>
                                    <small className="text-secondary fw-bold">Class: {req.class}</small>
                                </div>
                                <span className="badge bg-warning text-dark shadow-sm">Pending Approval</span>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-5">
                                    <div className="p-3 bg-white rounded border">
                                        <small className="text-secondary d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Currently Scheduled</small>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <i className="bi bi-calendar-x text-danger"></i>
                                            <span className="fw-bold fs-5">{req.currentDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2 d-flex align-items-center justify-content-center">
                                    <i className="bi bi-arrow-right fs-1 text-secondary"></i>
                                </div>
                                <div className="col-md-5">
                                    <div className="p-3 bg-white rounded border border-success">
                                        <small className="text-success d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Requested New Slot</small>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <i className="bi bi-calendar-check text-success"></i>
                                            <span className="fw-bold fs-5 text-success" style={{ color: '#6c9343' }}>{req.requestedDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded mb-3">
                                <small className="fw-bold text-secondary">Reason:</small>
                                <p className="m-0 text-dark fst-italic">"{req.reason}"</p>
                            </div>

                            <div className="d-flex justify-content-end gap-3">
                                <button className="btn btn-outline-danger fw-bold px-4">Reject Request</button>
                                <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#6c9343' }}>Approve Reschedule</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RescheduleRequests;
