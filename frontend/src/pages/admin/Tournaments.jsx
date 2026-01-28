import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form } from 'react-bootstrap';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newTournament, setNewTournament] = useState({
        tournament_name: '',
        tournament_date: '',
        venue: '',
        entry_fee: '0.00'
    });

    useEffect(() => {
        fetchTournaments();
        fetchRegistrations();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await axios.get('/tournaments/');
            setTournaments(response.data);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    };

    const fetchRegistrations = async () => {
        try {
            const response = await axios.get('/registrations/');
            // Only show pending ones in the request queue
            setRegistrations(response.data.filter(r => r.payment_status === 'PENDING'));
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTournament = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/tournaments/', newTournament);
            alert('Tournament created successfully!');
            setShowModal(false);
            setNewTournament({ tournament_name: '', tournament_date: '', venue: '', entry_fee: '0.00' });
            fetchTournaments();
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Failed to create tournament.');
        }
    };

    const handleApproveRegistration = async (id) => {
        try {
            await axios.post(`/registrations/${id}/record_fee/`);
            alert('Registration approved and fee recorded.');
            fetchRegistrations();
        } catch (error) {
            console.error('Error approving registration:', error);
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Tournament Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }} onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Create Tournament
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="d-flex flex-column gap-4">
                        {tournaments.length === 0 ? (
                            <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted">No tournaments found.</div>
                        ) : (
                            tournaments.map((t) => (
                                <div key={t.id} className="card border-0 shadow-sm rounded-4 p-4 position-relative overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ maxWidth: '70%' }}>
                                            <h5 className="fw-bold text-success mb-3" style={{ color: '#6c9343' }}>{t.tournament_name}</h5>
                                            <div className="row g-3 mb-3">
                                                <div className="col-md-6">
                                                    <div className="d-flex gap-2">
                                                        <i className="bi bi-calendar-event text-secondary"></i>
                                                        <div>
                                                            <small className="fw-bold d-block">Date & Location</small>
                                                            <small className="text-muted">{new Date(t.tournament_date).toLocaleDateString()} • {t.venue || 'TBD'}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex gap-2">
                                                        <i className="bi bi-people text-secondary"></i>
                                                        <div>
                                                            <small className="fw-bold d-block">Entry Fee</small>
                                                            <small className="text-muted">LKR {t.entry_fee}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-light text-secondary fw-bold px-3">Participants</button>
                                                <button className="btn btn-sm text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }}>Manage</button>
                                            </div>
                                        </div>
                                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center text-center p-3 shadow-sm"
                                            style={{ width: '90px', height: '90px', backgroundColor: '#6c9343', fontSize: '0.7rem', lineHeight: '1.2' }}>
                                            ID: {t.id}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Registration Requests</h6>
                        </div>
                        <div className="p-4 d-flex flex-column gap-3">
                            {registrations.length === 0 ? (
                                <div className="text-center py-4 text-muted border rounded bg-light">No pending requests.</div>
                            ) : (
                                registrations.map((req) => (
                                    <div key={req.id} className="p-3 rounded-3 bg-light border">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="fw-bold m-0">{req.student_name}</h6>
                                                <small className="text-secondary d-block mt-1">{req.tournament_name}</small>
                                                <small className="text-muted d-block mt-1">Requested: {new Date(req.registration_date).toLocaleDateString()}</small>
                                            </div>
                                            <span className="badge bg-warning">Pending</span>
                                        </div>
                                        <div className="d-flex gap-2 mt-3">
                                            <button className="btn btn-sm text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }} onClick={() => handleApproveRegistration(req.id)}>Approve</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Create New Tournament</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCreateTournament}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tournament Name</Form.Label>
                            <Form.Control type="text" required value={newTournament.tournament_name} onChange={(e) => setNewTournament({ ...newTournament, tournament_name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tournament Date</Form.Label>
                            <Form.Control type="date" required value={newTournament.tournament_date} onChange={(e) => setNewTournament({ ...newTournament, tournament_date: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Venue</Form.Label>
                            <Form.Control type="text" value={newTournament.venue} onChange={(e) => setNewTournament({ ...newTournament, venue: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Entry Fee (LKR)</Form.Label>
                            <Form.Control type="number" step="0.01" value={newTournament.entry_fee} onChange={(e) => setNewTournament({ ...newTournament, entry_fee: e.target.value })} />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>Create Tournament</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Tournaments;
