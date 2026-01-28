import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosInstance';
import { Modal, Button, Form, Table, Badge, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BatchList = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [applications, setApplications] = useState([]);

    // Batch Modal State
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [coaches, setCoaches] = useState([]);
    const [currentBatch, setCurrentBatch] = useState({
        batch_name: '',
        schedule_day: 'MON',
        start_time: '',
        end_time: '',
        max_students: 50,
        coach_user: ''
    });

    useEffect(() => {
        fetchBatches();
        fetchApplications();
        fetchCoaches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches/');
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
            // Prepare payload to send null if coach_user is empty string
            const payload = {
                ...currentBatch,
                coach_user: currentBatch.coach_user ? currentBatch.coach_user : null
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
            setCurrentBatch({ batch_name: '', schedule_day: 'MON', start_time: '', end_time: '', max_students: 50, coach_user: '' });
        } catch (err) {
            toast.error('Failed to save batch');
            console.error(err);
        }
    };

    const handleApprove = async (appId, notes) => {
        try {
            await axios.post(`/coach-applications/${appId}/approve/`, { admin_notes: notes });
            toast.success('Application Approved');
            fetchApplications();
            fetchBatches(); // Update batches as coach is assigned
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

    return (
        <div className="container-fluid p-4">
            <h4 className="mb-4 text-secondary fw-bold">Batch Management</h4>

            <Tabs defaultActiveKey="batches" className="mb-3">
                <Tab eventKey="batches" title="Active Batches">
                    <Button variant="success" className="mb-3" onClick={() => setShowBatchModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Create New Batch
                    </Button>
                    <div className="card shadow-sm border-0">
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Batch Name</th>
                                    <th>Schedule</th>
                                    <th>Coach</th>
                                    <th>Students</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map(batch => (
                                    <tr key={batch.id}>
                                        <td className="fw-bold">{batch.batch_name}</td>
                                        <td>
                                            <Badge bg="info" className="me-2">{batch.schedule_day}</Badge>
                                            {batch.start_time} - {batch.end_time}
                                        </td>
                                        <td>{batch.coach_name || <span className="text-muted fst-italic">Unassigned</span>}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{ height: '6px', width: '80px' }}>
                                                    <div className="progress-bar bg-success"
                                                        style={{ width: `${(batch.current_students / batch.max_students) * 100}%` }}></div>
                                                </div>
                                                <small className="text-muted">{batch.current_students}/{batch.max_students}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <Button variant="link" size="sm" onClick={() => { setCurrentBatch(batch); setShowBatchModal(true); }}>
                                                <i className="bi bi-pencil-fill text-secondary"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Tab>

                <Tab eventKey="applications" title="Coach Applications">
                    <div className="card shadow-sm border-0">
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Coach</th>
                                    <th>Applied For</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td className="fw-bold">{app.coach_name}</td>
                                        <td>{app.batch_name} <small className="text-muted d-block">{app.batch_schedule}</small></td>
                                        <td>{new Date(app.application_date).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}>
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            {app.status === 'PENDING' && (
                                                <div className="d-flex gap-2">
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
                        {applications.length === 0 && <p className="text-center p-3 text-muted">No applications found.</p>}
                    </div>
                </Tab>
            </Tabs>

            {/* Create/Edit Modal */}
            <Modal show={showBatchModal} onHide={() => setShowBatchModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentBatch.id ? 'Edit Batch' : 'Create New Batch'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleBatchSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Batch Name</Form.Label>
                            <Form.Control type="text" required
                                value={currentBatch.batch_name}
                                onChange={e => setCurrentBatch({ ...currentBatch, batch_name: e.target.value })}
                            />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label>Day</Form.Label>
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
                            <div className="col-md-6 mb-3">
                                <Form.Label>Max Students</Form.Label>
                                <Form.Control type="number" required
                                    value={currentBatch.max_students}
                                    onChange={e => setCurrentBatch({ ...currentBatch, max_students: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control type="time" required
                                    value={currentBatch.start_time}
                                    onChange={e => setCurrentBatch({ ...currentBatch, start_time: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control type="time" required
                                    value={currentBatch.end_time}
                                    onChange={e => setCurrentBatch({ ...currentBatch, end_time: e.target.value })}
                                />
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Assigned Coach (Optional)</Form.Label>
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
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowBatchModal(false)}>Cancel</Button>
                        <Button variant="success" type="submit">Save Batch</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default BatchList;
