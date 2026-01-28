import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form } from 'react-bootstrap';

const Schedule = () => {
    const [batches, setBatches] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentBatch, setCurrentBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
        fetchCoaches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await axios.get('/batches/');
            setBatches(response.data);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoaches = async () => {
        try {
            const response = await axios.get('/users/?role=COACH');
            setCoaches(response.data);
        } catch (error) {
            console.error('Error fetching coaches:', error);
        }
    };

    const handleEditClick = (batch) => {
        setCurrentBatch({ ...batch });
        setShowEditModal(true);
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/batches/${currentBatch.id}/`, currentBatch);
            alert('Batch updated successfully!');
            setShowEditModal(false);
            fetchBatches();
        } catch (error) {
            console.error('Error updating batch:', error);
            alert('Failed to update batch.');
        }
    };

    // Group batches by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const groupedBatches = {};
    days.forEach(day => {
        groupedBatches[day] = batches.filter(b => b.schedule_day === day.toUpperCase());
    });

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Class Schedule Management</h3>
            </div>

            <div className="d-flex flex-column gap-4">
                {days.map((day) => (
                    groupedBatches[day].length > 0 && (
                        <div key={day}>
                            <div className="p-2 text-white px-3 rounded-top-3" style={{ backgroundColor: '#7da65d', width: 'fit-content', minWidth: '150px' }}>
                                <h6 className="fw-bold m-0">{day}</h6>
                            </div>
                            <div className="p-3 bg-light rounded-end-3 rounded-bottom-3 border-start border-5 border-success" style={{ borderColor: '#6c9343 !important' }}>
                                <div className="d-flex flex-column gap-2">
                                    {groupedBatches[day].map((b) => (
                                        <div key={b.id} className="bg-white p-3 rounded-3 shadow-sm d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-4 flex-grow-1">
                                                <div className="text-secondary small fw-bold" style={{ minWidth: '120px' }}>{b.start_time} - {b.end_time}</div>
                                                <div className="fw-bold text-dark flex-grow-1">{b.batch_name}</div>
                                                <div className="text-secondary small">Coach: {b.coach_name}</div>
                                            </div>
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleEditClick(b)}>Adjust Time/Coach</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Adjust Batch Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {currentBatch && (
                        <Form onSubmit={handleUpdateBatch}>
                            <Form.Group className="mb-3">
                                <Form.Label>Batch Name</Form.Label>
                                <Form.Control type="text" value={currentBatch.batch_name} readOnly bg="light" />
                            </Form.Group>
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <Form.Label>Start Time</Form.Label>
                                    <Form.Control type="time" required value={currentBatch.start_time} onChange={(e) => setCurrentBatch({ ...currentBatch, start_time: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <Form.Label>End Time</Form.Label>
                                    <Form.Control type="time" required value={currentBatch.end_time} onChange={(e) => setCurrentBatch({ ...currentBatch, end_time: e.target.value })} />
                                </div>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Assign Coach</Form.Label>
                                <Form.Select value={currentBatch.coach} onChange={(e) => setCurrentBatch({ ...currentBatch, coach: e.target.value })}>
                                    <option value="">Select Coach...</option>
                                    {coaches.map(c => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button variant="light" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                <Button type="submit" className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>Save Changes</Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Schedule;
