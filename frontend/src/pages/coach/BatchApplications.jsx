import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Table, Button, Badge, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';

const BatchApplications = () => {
    const [batches, setBatches] = useState([]);
    const [applications, setApplications] = useState([]);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [applyMessage, setApplyMessage] = useState('');

    useEffect(() => {
        fetchBatches();
        fetchApplications();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches/unassigned/');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplications = async () => {
        try {
            // Coach sees only their apps
            const res = await axios.get('/coach-applications/');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApplyClick = (batch) => {
        // Check if already applied
        const existingApp = applications.find(app => app.batch === batch.id);
        if (existingApp) {
            toast.info(`You have already applied (Status: ${existingApp.status})`);
            return;
        }

        // Check if batch has coach (optional: maybe replace?)
        if (batch.coach_user) {
            toast.warning('This batch already has a coach assigned.');
            // Allow applying anyway? Let's assume yes for waitlist or replacement.
        }

        setSelectedBatch(batch);
        setShowApplyModal(true);
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/coach-applications/', {
                batch: selectedBatch.id,
                application_message: applyMessage
            });
            toast.success('Application submitted successfully');
            setShowApplyModal(false);
            setApplyMessage('');
            fetchApplications();
        } catch (err) {
            toast.error('Failed to submit application');
            console.error(err);
        }
    };

    const isApplied = (batchId) => {
        return applications.some(app => app.batch === batchId);
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Batch Opportunities</h3>

            <Tabs defaultActiveKey="available" className="mb-3">
                <Tab eventKey="available" title="Available Batches">
                    <div className="card shadow-sm border-0">
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Batch Name</th>
                                    <th>Schedule</th>
                                    <th>Current Coach</th>
                                    <th>Status</th>
                                    <th>Action</th>
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
                                        <td>{batch.coach_name || <span className="text-muted fst-italic">None</span>}</td>
                                        <td>
                                            {isApplied(batch.id) ? (
                                                <Badge bg="secondary">Applied</Badge>
                                            ) : batch.coach_user ? (
                                                <Badge bg="success">Filled</Badge>
                                            ) : (
                                                <Badge bg="primary">Open</Badge>
                                            )}
                                        </td>
                                        <td>
                                            {!isApplied(batch.id) && (
                                                <Button variant="outline-primary" size="sm" onClick={() => handleApplyClick(batch)}>
                                                    Apply
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Tab>
                <Tab eventKey="my_apps" title="My Applications">
                    <div className="card shadow-sm border-0">
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Batch</th>
                                    <th>Schedule</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td className="fw-bold">{app.batch_name}</td>
                                        <td>{app.batch_schedule}</td>
                                        <td>{new Date(app.application_date).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}>
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td className="small text-muted">{app.admin_notes}</td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">No applications found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Tab>
            </Tabs>

            <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Apply for {selectedBatch?.batch_name}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitApplication}>
                    <Modal.Body>
                        <p>Schedule: <strong>{selectedBatch?.schedule_day} {selectedBatch?.start_time} - {selectedBatch?.end_time}</strong></p>
                        <Form.Group className="mb-3">
                            <Form.Label>Message for Admin (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={applyMessage}
                                onChange={e => setApplyMessage(e.target.value)}
                                placeholder="Why are you interested in this batch?"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Submit Application</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default BatchApplications;
