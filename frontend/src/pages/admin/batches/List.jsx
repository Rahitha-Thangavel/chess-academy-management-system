import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosInstance';
import { Modal, Button, Form, Table, Badge, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BatchList = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [applications, setApplications] = useState([]);

    // Filter State
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Batch Modal State
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [coaches, setCoaches] = useState([]);
    const [currentBatch, setCurrentBatch] = useState({
        batch_name: '',
        batch_type: 'RECURRING',
        status: 'ACTIVE',
        schedule_day: 'MON',
        exact_date: '',
        start_time: '',
        end_time: '',
        max_students: 50,
        coach_user: ''
    });

    useEffect(() => {
        fetchBatches();
        fetchApplications();
        fetchCoaches();
    }, [statusFilter, typeFilter, dayFilter]); // Refetch when filters change

    const fetchBatches = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('batch_type', typeFilter);
            if (dayFilter) params.append('schedule_day', dayFilter);

            const res = await axios.get(`/batches/?${params.toString()}`);
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await axios.get('/coach-applications/');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCoaches = async () => {
        try {
            const res = await axios.get('/auth/users/?role=COACH');
            setCoaches(res.data.results || res.data);
        } catch (err) {
            console.error("Error fetching coaches", err);
        }
    };

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...currentBatch,
                coach_user: currentBatch.coach_user ? currentBatch.coach_user : null,
                exact_date: currentBatch.batch_type === 'ONE_TIME' ? currentBatch.exact_date : null,
                schedule_day: currentBatch.batch_type === 'RECURRING' ? currentBatch.schedule_day : null
            };

            if (currentBatch.id) {
                await axios.put(`/batches/${currentBatch.id}/`, payload);
                toast.success('Batch updated successfully');
            } else {
                await axios.post('/batches/', payload);
                toast.success('Batch created successfully');
            }
            setShowBatchModal(false);
            fetchBatches();
            resetBatchForm();
        } catch (err) {
            toast.error(err.response?.data?.non_field_errors?.[0] || 'Failed to save batch');
            console.error(err);
        }
    };

    const resetBatchForm = () => {
        setCurrentBatch({
            batch_name: '',
            batch_type: 'RECURRING',
            status: 'ACTIVE',
            schedule_day: 'MON',
            exact_date: '',
            start_time: '',
            end_time: '',
            max_students: 50,
            coach_user: ''
        });
    }

    const handleApprove = async (appId, notes) => {
        try {
            await axios.post(`/coach-applications/${appId}/approve/`, { admin_notes: notes });
            toast.success('Application Approved');
            fetchApplications();
            fetchBatches();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (appId, notes) => {
        try {
            await axios.post(`/coach-applications/${appId}/reject/`, { admin_notes: notes });
            toast.success('Application Rejected');
            fetchApplications();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const filteredBatches = batches.filter(b =>
        b.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE': return <Badge bg="success">Active</Badge>;
            case 'INACTIVE': return <Badge bg="secondary">Inactive</Badge>;
            case 'FINISHED': return <Badge bg="primary">Finished</Badge>;
            default: return <Badge bg="light" text="dark">{status}</Badge>;
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-secondary fw-bold m-0">Batch Management</h4>
                <Button variant="success" onClick={() => { resetBatchForm(); setShowBatchModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i>Create New Batch
                </Button>
            </div>

            <Tabs defaultActiveKey="batches" className="mb-4 custom-tabs">
                <Tab eventKey="batches" title="All Batches">
                    {/* Filter Bar */}
                    <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Search Batch</label>
                                <input
                                    type="text"
                                    className="form-control border-0 shadow-none"
                                    placeholder="Search by ID or Name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-secondary">Status</label>
                                <select className="form-select border-0 shadow-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                    <option value="">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="FINISHED">Finished</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-secondary">Type</label>
                                <select className="form-select border-0 shadow-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                    <option value="">All Types</option>
                                    <option value="RECURRING">Recurring</option>
                                    <option value="ONE_TIME">One-time</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-secondary">Day</label>
                                <select className="form-select border-0 shadow-none" value={dayFilter} onChange={e => setDayFilter(e.target.value)}>
                                    <option value="">All Days</option>
                                    <option value="MON">Monday</option>
                                    <option value="TUE">Tuesday</option>
                                    <option value="WED">Wednesday</option>
                                    <option value="THU">Thursday</option>
                                    <option value="FRI">Friday</option>
                                    <option value="SAT">Saturday</option>
                                    <option value="SUN">Sunday</option>
                                </select>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <Button variant="light" className="w-100 border" onClick={() => { setStatusFilter(''); setTypeFilter(''); setDayFilter(''); setSearchQuery(''); }}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light border-bottom">
                                <tr>
                                    <th className="ps-4">Batch ID</th>
                                    <th>Batch Name</th>
                                    <th>Type</th>
                                    <th>Schedule</th>
                                    <th>Next Class</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBatches.map(batch => (
                                    <tr key={batch.id}>
                                        <td className="ps-4 text-secondary small fw-bold">{batch.id}</td>
                                        <td className="fw-bold">{batch.batch_name}</td>
                                        <td>
                                            <Badge bg={batch.batch_type === 'RECURRING' ? 'info' : 'warning'} text="dark" className="fw-normal">
                                                {batch.batch_type === 'RECURRING' ? 'Weekly' : 'One-time'}
                                            </Badge>
                                        </td>
                                        <td>
                                            {batch.batch_type === 'RECURRING' ? (
                                                <div className="small">
                                                    <span className="text-primary fw-bold me-2">{batch.schedule_day}</span>
                                                    {batch.start_time.substring(0, 5)} - {batch.end_time.substring(0, 5)}
                                                </div>
                                            ) : (
                                                <div className="small">
                                                    <span className="text-muted fw-bold me-2">{batch.exact_date}</span>
                                                    {batch.start_time.substring(0, 5)} - {batch.end_time.substring(0, 5)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="small text-secondary">{batch.next_class_date || 'N/A'}</span>
                                        </td>
                                        <td>{getStatusBadge(batch.status)}</td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <Button variant="light" size="sm" className="btn-icon" onClick={() => { setCurrentBatch(batch); setShowViewModal(true); }}>
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                                <Button variant="light" size="sm" className="btn-icon" onClick={() => { setCurrentBatch(batch); setShowBatchModal(true); }}>
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Tab>

                <Tab eventKey="applications" title="Coach Applications">
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light border-bottom">
                                <tr>
                                    <th className="ps-4">Coach</th>
                                    <th>Applied For</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td className="ps-4 fw-bold">{app.coach_name}</td>
                                        <td>{app.batch_name} <small className="text-muted d-block">{app.batch_schedule}</small></td>
                                        <td>{new Date(app.application_date).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}>
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            {app.status === 'PENDING' && (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="outline-success" size="sm" onClick={() => handleApprove(app.id, 'Approved by Admin')}>
                                                        Approve
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleReject(app.id, 'Rejected by Admin')}>
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Tab>
            </Tabs>

            {/* Create/Edit Modal */}
            <Modal show={showBatchModal} onHide={() => setShowBatchModal(false)} centered size="lg" className="rounded-4">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{currentBatch.id ? 'Edit Batch' : 'Create New Batch'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleBatchSubmit}>
                    <Modal.Body className="pt-4">
                        <div className="row">
                            <div className="col-md-8 mb-3">
                                <Form.Label className="small fw-bold">Batch Name</Form.Label>
                                <Form.Control type="text" required placeholder="e.g. Beginner Class 01"
                                    value={currentBatch.batch_name}
                                    onChange={e => setCurrentBatch({ ...currentBatch, batch_name: e.target.value })}
                                />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold">Type</Form.Label>
                                <Form.Select required
                                    value={currentBatch.batch_type}
                                    onChange={e => setCurrentBatch({ ...currentBatch, batch_type: e.target.value })}
                                >
                                    <option value="RECURRING">Recurring (Weekly)</option>
                                    <option value="ONE_TIME">One-time Class</option>
                                </Form.Select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold">Status</Form.Label>
                                <Form.Select required
                                    value={currentBatch.status}
                                    onChange={e => setCurrentBatch({ ...currentBatch, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="FINISHED">Finished</option>
                                </Form.Select>
                            </div>
                            {currentBatch.batch_type === 'RECURRING' ? (
                                <div className="col-md-4 mb-3">
                                    <Form.Label className="small fw-bold">Schedule Day</Form.Label>
                                    <Form.Select required
                                        value={currentBatch.schedule_day}
                                        onChange={e => setCurrentBatch({ ...currentBatch, schedule_day: e.target.value })}
                                    >
                                        <option value="MON">Monday</option>
                                        <option value="TUE">Tuesday</option>
                                        <option value="WED">Wednesday</option>
                                        <option value="THU">Thursday</option>
                                        <option value="FRI">Friday</option>
                                        <option value="SAT">Saturday</option>
                                        <option value="SUN">Sunday</option>
                                    </Form.Select>
                                </div>
                            ) : (
                                <div className="col-md-4 mb-3">
                                    <Form.Label className="small fw-bold">Exact Date</Form.Label>
                                    <Form.Control type="date" required
                                        value={currentBatch.exact_date || ''}
                                        onChange={e => setCurrentBatch({ ...currentBatch, exact_date: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold">Max Capacity</Form.Label>
                                <Form.Control type="number" required
                                    value={currentBatch.max_students}
                                    onChange={e => setCurrentBatch({ ...currentBatch, max_students: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold">Start Time</Form.Label>
                                <Form.Control type="time" required
                                    value={currentBatch.start_time}
                                    onChange={e => setCurrentBatch({ ...currentBatch, start_time: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold">End Time</Form.Label>
                                <Form.Control type="time" required
                                    value={currentBatch.end_time}
                                    onChange={e => setCurrentBatch({ ...currentBatch, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Assigned Coach (Optional)</Form.Label>
                            <Form.Select
                                value={currentBatch.coach_user || ''}
                                onChange={e => setCurrentBatch({ ...currentBatch, coach_user: e.target.value })}
                            >
                                <option value="">-- No Coach Assigned --</option>
                                {coaches.map(c => (
                                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={() => setShowBatchModal(false)} className="fw-bold">Cancel</Button>
                        <Button variant="success" type="submit" className="fw-bold px-4">Save Batch</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered className="rounded-4">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Batch Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    <div className="p-3 bg-light rounded-4 mb-3 text-center">
                        <span className="text-secondary small fw-bold d-block mb-1">{currentBatch.id}</span>
                        <h4 className="fw-bold mb-1">{currentBatch.batch_name}</h4>
                        <div className="d-flex justify-content-center gap-2">
                            {getStatusBadge(currentBatch.status)}
                            <Badge bg="info" text="dark">{currentBatch.batch_type}</Badge>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-6">
                            <label className="text-muted small d-block">Schedule</label>
                            <span className="fw-bold">
                                {currentBatch.batch_type === 'RECURRING' ? currentBatch.schedule_day : currentBatch.exact_date}
                            </span>
                        </div>
                        <div className="col-6">
                            <label className="text-muted small d-block">Time</label>
                            <span className="fw-bold">{currentBatch.start_time} - {currentBatch.end_time}</span>
                        </div>
                        <div className="col-6">
                            <label className="text-muted small d-block">Next Class</label>
                            <span className="fw-bold text-primary">{currentBatch.next_class_date || 'N/A'}</span>
                        </div>
                        <div className="col-6">
                            <label className="text-muted small d-block">Class Capacity</label>
                            <span className="fw-bold">{currentBatch.current_students} / {currentBatch.max_students} Students</span>
                        </div>
                        <div className="col-12 border-top pt-3">
                            <label className="text-muted small d-block">Assigned Coach</label>
                            <div className="d-flex align-items-center mt-1">
                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                    <i className="bi bi-person"></i>
                                </div>
                                <span className="fw-bold">{currentBatch.coach_name || 'No Coach Assigned'}</span>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowViewModal(false)} className="w-100 fw-bold">Close</Button>
                </Modal.Footer>
            </Modal>
        </div >
    );
};

export default BatchList;
