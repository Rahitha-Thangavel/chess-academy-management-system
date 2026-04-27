/**
 * Page component: Reschedulerequests.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const RescheduleRequests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/reschedule-requests/');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return { color: 'warning', icon: 'bi-clock-history', text: 'Waiting Admin Approval' };
            case 'APPROVED': return { color: 'success', icon: 'bi-check-circle-fill', text: 'Approved' };
            case 'REJECTED': return { color: 'danger', icon: 'bi-x-circle-fill', text: 'Rejected' };
            default: return { color: 'secondary', icon: '', text: status };
        }
    };

    const filteredRequests = activeTab === 'All' ? requests : requests.filter(r => r.status === activeTab.toUpperCase());

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>Reschedule Requests</h3>
                <button
                    className="btn fw-bold text-white px-4 py-2 shadow-sm"
                    style={{ backgroundColor: '#6c9343' }}
                    onClick={() => navigate('/parent/reschedule/new')}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    New Request
                </button>
            </div>

            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-3 fw-bold position-relative ${activeTab === tab ? 'text-success' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="d-flex flex-column gap-3">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-5 text-muted bg-light rounded shadow-sm border">No requests found.</div>
                ) : (
                    filteredRequests.map(req => {
                        const badge = getStatusBadge(req.status);
                        return (
                            <div key={req.id} className="card border-0 shadow-sm p-4 rounded-3">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h6 className="fw-bold m-0">Student: {req.student_name}</h6>
                                    <div className={`text-${badge.color} fw-bold small d-flex align-items-center gap-2`}>
                                        <i className={`bi ${badge.icon}`}></i> {badge.text}
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-7">
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Reason:</div>
                                            <div className="col-8 small">{req.reason}</div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Original Date:</div>
                                            <div className="col-8 small fw-bold">{new Date(req.original_date).toLocaleDateString()}</div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-4 text-secondary small">Make-up Date:</div>
                                            <div className="col-8 small fw-bold">{new Date(req.preferred_date).toLocaleDateString()}</div>
                                        </div>
                                        {req.admin_comment && (
                                            <div className="row mb-2">
                                                <div className="col-4 text-secondary small">Admin Notes:</div>
                                                <div className="col-8 small italic text-muted">"{req.admin_comment}"</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-5 text-end text-secondary small">
                                        Submitted on: {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RescheduleRequests;
