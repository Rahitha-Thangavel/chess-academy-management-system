/**
 * Page component: Reschedulerequests.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAppUI } from '../../contexts/AppUIContext';

const RescheduleRequests = () => {
    const { notifySuccess, notifyError } = useAppUI();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentReq, setCurrentReq] = useState(null);
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [adminComment, setAdminComment] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDING');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/reschedule-requests/');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching reschedule requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (req, type) => {
        setCurrentReq(req);
        setActionType(type);
        setAdminComment('');
        setShowModal(true);
    };

    const handleSubmitAction = async (e) => {
        e.preventDefault();
        try {
            const endpoint = `/reschedule-requests/${currentReq.id}/${actionType}/`;
            await axios.post(endpoint, { admin_comment: adminComment });
            notifySuccess(`Request ${actionType}d successfully.`);
            setShowModal(false);
            fetchRequests();
        } catch (error) {
            console.error(`Error ${actionType}ing request:`, error.response?.data || error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to approve request. Please check connection and permissions.';
            notifyError(errorMsg);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filterStatus === 'ALL') return true;
        return req.status === filterStatus;
    });

    if (loading) return <div className="p-5 text-center">Loading requests...</div>;

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Reschedule Approval</h3>
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">{filteredRequests.length} {filterStatus === 'ALL' ? '' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()} Requests</span>
            </div>

            {/* Status Filter Tabs */}
            <div className="d-flex gap-2 mb-4">
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`btn btn-sm fw-bold px-3 rounded-pill ${filterStatus === status ? (status === 'PENDING' ? 'btn-warning text-dark' : status === 'APPROVED' ? 'btn-success text-white' : status === 'REJECTED' ? 'btn-danger text-white' : 'btn-secondary text-white') : 'btn-light text-secondary border'}`}
                    >
                        {status === 'ALL' ? 'All Requests' : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">{filterStatus === 'ALL' ? 'All Requests' : `${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()} Requests`}</h6>
                </div>
                <div className="p-4 d-flex flex-column gap-3">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-5 text-muted">No {filterStatus.toLowerCase()} requests found.</div>
                    ) : (
                        filteredRequests.map((req) => (
                            <div key={req.id} className="border rounded-3 p-4 bg-light position-relative">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span className="badge rounded-pill bg-info small">Student</span>
                                            <h6 className="fw-bold m-0">{req.student_name} <span className="text-muted fw-normal small">(Parent: {req.parent_name})</span></h6>
                                        </div>
                                        {req.original_batch_name && <small className="text-secondary fw-bold">Class: {req.original_batch_name}</small>}
                                    </div>
                                    <span className={`badge shadow-sm ${req.status === 'PENDING' ? 'bg-warning text-dark' : req.status === 'APPROVED' ? 'bg-success' : 'bg-danger'}`}>
                                        {req.status}
                                    </span>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-5">
                                        <div className="p-3 bg-white rounded border">
                                            <small className="text-secondary d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Original Date</small>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <i className="bi bi-calendar-x text-danger"></i>
                                                <span className="fw-bold fs-5">{new Date(req.original_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 d-flex align-items-center justify-content-center">
                                        <i className="bi bi-arrow-right fs-1 text-secondary"></i>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="p-3 bg-white rounded border border-success">
                                            <small className="text-success d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Requested Date</small>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <i className="bi bi-calendar-check text-success"></i>
                                                <span className="fw-bold fs-5 text-success">{new Date(req.preferred_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded mb-3">
                                    <small className="fw-bold text-secondary">Reason:</small>
                                    <p className="m-0 text-dark fst-italic">"{req.reason}"</p>
                                </div>

                                {req.admin_comment && (
                                    <div className="bg-light border p-2 rounded mb-3">
                                        <small className="fw-bold text-muted">Admin Note:</small>
                                        <p className="m-0 text-dark small">"{req.admin_comment}"</p>
                                    </div>
                                )}

                                {req.status === 'PENDING' && (
                                    <div className="d-flex justify-content-end gap-3">
                                        <button className="btn btn-outline-danger fw-bold px-4" onClick={() => handleActionClick(req, 'reject')}>Reject</button>
                                        <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#6c9343' }} onClick={() => handleActionClick(req, 'approve')}>Approve</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: actionType === 'approve' ? '#6c9343' : '#dc3545' }}>
                        {actionType === 'approve' ? 'Approve' : 'Reject'} Reschedule Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitAction}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary text-uppercase">Admin Comments / Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder={actionType === 'approve' ? "Optional notes (e.g. 'Make-up class confirmed for...')" : "Reason for rejection (Required)"}
                                required={actionType === 'reject'}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" className="text-white fw-bold px-4" style={{ backgroundColor: actionType === 'approve' ? '#6c9343' : '#dc3545', border: 'none' }}>
                                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default RescheduleRequests;
