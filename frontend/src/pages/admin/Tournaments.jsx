/**
 * Page component: Tournaments.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form, Table, Tabs, Tab } from 'react-bootstrap';
import { useAppUI } from '../../contexts/AppUIContext';

const getWindowBadge = (status) => {
    switch (status) {
        case 'OPEN':
            return { label: 'Live Now', className: 'bg-success-subtle text-success border border-success-subtle' };
        case 'FINISHED':
            return { label: 'Finished', className: 'bg-secondary-subtle text-secondary border border-secondary-subtle' };
        default:
            return { label: 'Registration Open', className: 'bg-warning-subtle text-warning border border-warning-subtle' };
    }
};

const formatTournamentDate = (tournament) => (
    `${new Date(tournament.tournament_date).toLocaleDateString()} • ${tournament.start_time?.slice(0, 5)} - ${tournament.end_time?.slice(0, 5)}`
);

const getTournamentSortValue = (tournament) => {
    const dateValue = new Date(`${tournament.tournament_date}T${tournament.start_time || '00:00:00'}`).getTime();
    const finishedOffset = tournament.window_status === 'FINISHED' ? 10_000_000_000_000 : 0;
    return finishedOffset + dateValue;
};

const Tournaments = () => {
    const { notifySuccess, notifyError, notifyInfo } = useAppUI();
    const [tournaments, setTournaments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedTournamentId, setSelectedTournamentId] = useState('');
    const [tournamentParticipants, setTournamentParticipants] = useState([]);
    const [tournamentMatches, setTournamentMatches] = useState([]);
    const [managementLoading, setManagementLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('participants');

    // Attendance edits per registration (registration id -> PRESENT/ABSENT)
    const [attendanceEdits, setAttendanceEdits] = useState({});

    // Add match modal
    const [showAddMatchModal, setShowAddMatchModal] = useState(false);
    const [addMatchForm, setAddMatchForm] = useState({
        player1: '',
        player2: '',
        round_number: 1,
        match_date: '',
    });

    // Record result modal
    const [showRecordResultModal, setShowRecordResultModal] = useState(false);
    const [resultForm, setResultForm] = useState({
        matchId: null,
        winnerId: '',
        result_details: '',
        player1_score: '',
        player2_score: '',
        player1_rank: '',
        player2_rank: '',
    });

    const [newTournament, setNewTournament] = useState({
        tournament_name: '',
        tournament_date: '',
        start_time: '09:00',
        end_time: '17:00',
        venue: '',
        entry_fee: '0.00'
    });

    useEffect(() => {
        fetchTournaments();
        fetchRegistrations();
    }, []);

    useEffect(() => {
        if (!selectedTournamentId) return;
        fetchTournamentParticipants(selectedTournamentId);
        fetchTournamentMatches(selectedTournamentId);
    }, [selectedTournamentId]);

    const fetchTournaments = async () => {
        try {
            const response = await axios.get('/tournaments/');
            const data = response.data;
            if (Array.isArray(data)) {
                setTournaments(data);
            } else if (data && Array.isArray(data.results)) {
                setTournaments(data.results);
            } else {
                console.error('Unexpected tournaments data format:', data);
                setTournaments([]);
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setTournaments([]);
        }
    };

    const fetchRegistrations = async () => {
        try {
            const response = await axios.get('/registrations/');
            setRegistrations(response.data.filter(r => r.status === 'PENDING'));
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTournamentParticipants = async (tournamentId) => {
        setManagementLoading(true);
        try {
            const res = await axios.get(`/registrations/?tournament=${tournamentId}`);
            const allRegs = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            const approvedRegs = allRegs.filter(r => r.status === 'APPROVED');
            setTournamentParticipants(approvedRegs);

            const initEdits = {};
            approvedRegs.forEach(r => {
                initEdits[r.id] = r.attendance_status || '';
            });
            setAttendanceEdits(initEdits);
        } catch (error) {
            console.error('Error fetching tournament participants:', error);
        } finally {
            setManagementLoading(false);
        }
    };

    const fetchTournamentMatches = async (tournamentId) => {
        try {
            const res = await axios.get(`/matches/?tournament=${tournamentId}`);
            const all = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setTournamentMatches(all);
        } catch (error) {
            console.error('Error fetching tournament matches:', error);
        }
    };

    const handleCreateTournament = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/tournaments/', newTournament);
            notifySuccess('Tournament created successfully.');
            setShowModal(false);
            setNewTournament({ tournament_name: '', tournament_date: '', start_time: '09:00', end_time: '17:00', venue: '', entry_fee: '0.00' });
            fetchTournaments();
        } catch (error) {
            console.error('Error creating tournament:', error);
            notifyError('Failed to create tournament.');
        }
    };

    const handleApproveRegistration = async (id) => {
        try {
            await axios.post(`/registrations/${id}/approve/`);
            notifySuccess('Registration approved.');
            fetchRegistrations();
            if (selectedTournamentId) fetchTournamentParticipants(selectedTournamentId);
        } catch (error) {
            console.error('Error approving registration:', error);
            notifyError(error.response?.data?.detail || 'Failed to approve registration.');
        }
    };

    const handleRejectRegistration = async (id) => {
        try {
            await axios.post(`/registrations/${id}/reject/`);
            notifySuccess('Registration rejected.');
            fetchRegistrations();
            if (selectedTournamentId) fetchTournamentParticipants(selectedTournamentId);
        } catch (error) {
            console.error('Error rejecting registration:', error);
            notifyError(error.response?.data?.detail || 'Failed to reject registration.');
        }
    };

    const handleRecordFee = async (id) => {
        try {
            await axios.post(`/registrations/${id}/record_fee/`);
            notifySuccess('Registration approved and fee recorded.');
            fetchRegistrations();
            if (selectedTournamentId) fetchTournamentParticipants(selectedTournamentId);
        } catch (error) {
            console.error('Error recording fee:', error);
            notifyError(error.response?.data?.detail || 'Failed to record fee.');
        }
    };

    const handleSelectManage = (tournamentId) => {
        setSelectedTournamentId(tournamentId);
        setActiveTab('participants');
    };

    const saveAttendance = async (registrationId) => {
        try {
            const attendance_status = attendanceEdits[registrationId];
            if (!attendance_status) {
                notifyInfo('Please select PRESENT or ABSENT.');
                return;
            }
            await axios.post(`/registrations/${registrationId}/record_attendance/`, { attendance_status });
            await fetchTournamentParticipants(selectedTournamentId);
        } catch (error) {
            console.error('Failed to save attendance:', error);
            notifyError('Failed to save attendance.');
        }
    };

    const openRecordResult = (match) => {
        setResultForm({
            matchId: match.id,
            winnerId: match.winner || '',
            result_details: match.result_details || '',
            player1_score: '',
            player2_score: '',
            player1_rank: '',
            player2_rank: '',
        });
        setShowRecordResultModal(true);
    };

    const submitRecordResult = async () => {
        try {
            const player1Score = resultForm.player1_score === '' ? null : parseFloat(resultForm.player1_score);
            const player2Score = resultForm.player2_score === '' ? null : parseFloat(resultForm.player2_score);
            const player1Rank = resultForm.player1_rank === '' ? null : parseInt(resultForm.player1_rank, 10);
            const player2Rank = resultForm.player2_rank === '' ? null : parseInt(resultForm.player2_rank, 10);

            const payload = {
                winner_id: resultForm.winnerId || null,
                result_details: resultForm.result_details || '',
                player1_score: player1Score,
                player2_score: player2Score,
                player1_rank: player1Rank,
                player2_rank: player2Rank,
            };

            await axios.post(`/matches/${resultForm.matchId}/record_result/`, payload);
            setShowRecordResultModal(false);
            fetchTournamentMatches(selectedTournamentId);
            fetchTournamentParticipants(selectedTournamentId);
            notifySuccess('Match result recorded successfully.');
        } catch (error) {
            console.error('Failed to record match result:', error);
            notifyError('Failed to record match result.');
        }
    };

    const submitAddMatch = async () => {
        try {
            if (!addMatchForm.player1 || !addMatchForm.player2) {
                notifyInfo('Select both players.');
                return;
            }
            if (addMatchForm.player1 === addMatchForm.player2) {
                notifyInfo('Player 1 and Player 2 must be different.');
                return;
            }

            await axios.post('/matches/', {
                tournament: selectedTournamentId,
                player1: addMatchForm.player1,
                player2: addMatchForm.player2,
                round_number: Number(addMatchForm.round_number),
                match_date: addMatchForm.match_date ? `${addMatchForm.match_date}T00:00:00Z` : null,
            });

            setShowAddMatchModal(false);
            setAddMatchForm({ player1: '', player2: '', round_number: 1, match_date: '' });
            fetchTournamentMatches(selectedTournamentId);
            notifySuccess('Match created successfully.');
        } catch (error) {
            console.error('Failed to add match:', error);
            notifyError('Failed to add match.');
        }
    };

    const currentMatch = tournamentMatches.find(m => m.id === resultForm.matchId);
    const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId);
    const sortedTournaments = [...tournaments].sort((a, b) => getTournamentSortValue(a) - getTournamentSortValue(b));

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Tournament Management</h3>
                <button className="btn text-white fw-bold px-4 py-2 rounded-4 shadow-sm" style={{ backgroundColor: '#6c9343', border: 'none' }} onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Create Tournament
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="d-flex flex-column gap-4">
                        {tournaments.length === 0 ? (
                            <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted">No tournaments found.</div>
                        ) : (
                            sortedTournaments.map((t) => (
                                <div key={t.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                    <div className="p-4" style={{ background: 'linear-gradient(135deg, rgba(108,147,67,0.08), rgba(255,255,255,1) 42%)' }}>
                                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                                                <div>
                                                    <h5 className="fw-bold text-success mb-1" style={{ color: '#6c9343' }}>{t.tournament_name}</h5>
                                                    <small className="text-muted">Tournament ID: {t.id}</small>
                                                </div>
                                                <span className={`badge rounded-pill px-3 py-2 fw-semibold ${getWindowBadge(t.window_status).className}`}>
                                                    {getWindowBadge(t.window_status).label}
                                                </span>
                                            </div>
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-6">
                                                    <div className="bg-white border rounded-4 p-3 h-100 d-flex gap-2">
                                                        <i className="bi bi-calendar-event text-secondary mt-1"></i>
                                                        <div>
                                                            <small className="fw-bold d-block">Date & Location</small>
                                                            <small className="text-muted d-block">{formatTournamentDate(t)}</small>
                                                            <small className="text-muted d-block mt-1">{t.venue || 'Venue to be confirmed'}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="bg-white border rounded-4 p-3 h-100 d-flex gap-2">
                                                        <i className="bi bi-people text-secondary mt-1"></i>
                                                        <div>
                                                            <small className="fw-bold d-block">Entry Fee</small>
                                                            <small className="text-muted d-block">LKR {Number(t.entry_fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small>
                                                            <small className="text-muted d-block mt-1">{t.window_status === 'FINISHED' ? 'Tournament closed' : 'Ready for participant management'}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2 flex-wrap">
                                                <button
                                                    className="btn btn-sm btn-light border text-secondary fw-bold px-4 rounded-3"
                                                    onClick={() => handleSelectManage(t.id)}
                                                >
                                                    View Participants
                                                </button>
                                                <button
                                                    className="btn btn-sm text-white fw-bold px-4 rounded-3"
                                                    style={{ backgroundColor: '#6c9343', border: 'none' }}
                                                    onClick={() => handleSelectManage(t.id)}
                                                >
                                                    Manage Tournament
                                                </button>
                                            </div>
                                        </div>
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
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold m-0">Registration Requests</h6>
                                <span className="badge rounded-pill bg-white text-success">{registrations.length}</span>
                            </div>
                        </div>
                        <div className="p-4 d-flex flex-column gap-3">
                            {registrations.length === 0 ? (
                                <div className="text-center py-4 text-muted border rounded bg-light">No pending requests.</div>
                            ) : (
                                registrations.map((req) => (
                                    <div key={req.id} className="p-3 rounded-4 bg-light border">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h6 className="fw-bold m-0">{req.student_name}</h6>
                                                <small className="text-secondary d-block mt-1">{req.tournament_name}</small>
                                                <small className="text-muted d-block mt-2">Requested on {new Date(req.registration_date).toLocaleDateString()}</small>
                                            </div>
                                            <span className="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle">Pending</span>
                                        </div>
                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-sm text-white fw-bold px-3 rounded-3"
                                                style={{ backgroundColor: '#6c9343', border: 'none' }}
                                                onClick={() => handleApproveRegistration(req.id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-success fw-bold px-3 rounded-3"
                                                onClick={() => handleRecordFee(req.id)}
                                            >
                                                Approve + Fee
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger fw-bold px-3 rounded-3"
                                                onClick={() => handleRejectRegistration(req.id)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedTournamentId && (
                <div className="mt-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold m-0">Manage Tournament</h5>
                                    {selectedTournament && (
                                        <div className="small opacity-75 mt-1">{selectedTournament.tournament_name}</div>
                                    )}
                                </div>
                                <Button variant="light" size="sm" onClick={() => setSelectedTournamentId('')}>
                                    Close
                                </Button>
                            </div>
                        </div>

                        <div className="p-4">
                            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                                <Tab eventKey="participants" title="Participants Attendance">
                                    {managementLoading ? (
                                        <div className="text-center py-5 text-muted">Loading participants...</div>
                                    ) : (
                                        <Table hover responsive>
                                            <thead className="bg-light text-secondary small fw-bold">
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Attendance</th>
                                                    <th>Score/Rank</th>
                                                    <th className="text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tournamentParticipants.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">
                                                            No approved participants for this tournament.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tournamentParticipants.map((p) => (
                                                        <tr key={p.id}>
                                                            <td className="fw-bold">{p.student_name}</td>
                                                            <td>
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name={`att-${p.id}`}
                                                                            checked={attendanceEdits[p.id] === 'PRESENT'}
                                                                            onChange={() => setAttendanceEdits({ ...attendanceEdits, [p.id]: 'PRESENT' })}
                                                                        />
                                                                        <label className="form-check-label">Present</label>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name={`att-${p.id}`}
                                                                            checked={attendanceEdits[p.id] === 'ABSENT'}
                                                                            onChange={() => setAttendanceEdits({ ...attendanceEdits, [p.id]: 'ABSENT' })}
                                                                        />
                                                                        <label className="form-check-label">Absent</label>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-secondary small">
                                                                {p.score !== null && p.score !== undefined ? `Score: ${p.score}` : 'Score: -'} •{' '}
                                                                {p.rank !== null && p.rank !== undefined ? `Rank: ${p.rank}` : 'Rank: -'}
                                                            </td>
                                                            <td className="text-end">
                                                                <Button size="sm" variant="outline-success" onClick={() => saveAttendance(p.id)}>
                                                                    Save
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    )}
                                </Tab>

                                <Tab eventKey="matches" title="Match Results">
                                    <div className="d-flex justify-content-end mb-3">
                                        <Button
                                            variant="success"
                                            onClick={() => setShowAddMatchModal(true)}
                                            disabled={
                                                tournamentParticipants.length < 2 ||
                                                tournaments.find((t) => t.id === selectedTournamentId)?.window_status === 'FINISHED'
                                            }
                                        >
                                            Add Match
                                        </Button>
                                    </div>

                                    <Table hover responsive>
                                        <thead className="bg-light text-secondary small fw-bold">
                                            <tr>
                                                <th>Round</th>
                                                <th>Players</th>
                                                <th>Winner</th>
                                                <th>Outcome</th>
                                                <th className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tournamentMatches.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4 text-muted">
                                                        No matches for this tournament yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                tournamentMatches.map((m) => (
                                                    <tr key={m.id}>
                                                        <td className="fw-bold">{m.round_number}</td>
                                                        <td className="small text-secondary">{m.player1_name} vs {m.player2_name}</td>
                                                        <td className="fw-bold">{m.winner_name || '-'}</td>
                                                        <td className="small text-secondary">{m.result_details || '-'}</td>
                                                        <td className="text-end">
                                                            <Button size="sm" variant="outline-primary" onClick={() => openRecordResult(m)}>
                                                                Record Result
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Create New Tournament</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCreateTournament}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tournament Name</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={newTournament.tournament_name}
                                onChange={(e) => setNewTournament({ ...newTournament, tournament_name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tournament Date</Form.Label>
                            <Form.Control
                                type="date"
                                required
                                value={newTournament.tournament_date}
                                onChange={(e) => setNewTournament({ ...newTournament, tournament_date: e.target.value })}
                            />
                        </Form.Group>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        required
                                        value={newTournament.start_time}
                                        onChange={(e) => setNewTournament({ ...newTournament, start_time: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>End Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        required
                                        value={newTournament.end_time}
                                        onChange={(e) => setNewTournament({ ...newTournament, end_time: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Venue</Form.Label>
                            <Form.Control
                                type="text"
                                value={newTournament.venue}
                                onChange={(e) => setNewTournament({ ...newTournament, venue: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Entry Fee (LKR)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={newTournament.entry_fee}
                                onChange={(e) => setNewTournament({ ...newTournament, entry_fee: e.target.value })}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>
                                Create Tournament
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Add Match Modal */}
            <Modal show={showAddMatchModal} onHide={() => setShowAddMatchModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>
                        Add Tournament Match
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Player 1</Form.Label>
                            <Form.Select
                                value={addMatchForm.player1}
                                onChange={(e) => setAddMatchForm({ ...addMatchForm, player1: e.target.value })}
                            >
                                <option value="">Select</option>
                                {tournamentParticipants.map((p) => (
                                    <option key={p.id} value={p.student}>
                                        {p.student_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Player 2</Form.Label>
                            <Form.Select
                                value={addMatchForm.player2}
                                onChange={(e) => setAddMatchForm({ ...addMatchForm, player2: e.target.value })}
                            >
                                <option value="">Select</option>
                                {tournamentParticipants.map((p) => (
                                    <option key={p.id} value={p.student}>
                                        {p.student_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Round</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={addMatchForm.round_number}
                                        onChange={(e) => setAddMatchForm({ ...addMatchForm, round_number: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Match Date (optional)</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={addMatchForm.match_date}
                                        onChange={(e) => setAddMatchForm({ ...addMatchForm, match_date: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="light" onClick={() => setShowAddMatchModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="success" onClick={submitAddMatch}>
                                Create Match
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Record Result Modal */}
            <Modal show={showRecordResultModal} onHide={() => setShowRecordResultModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>
                        Record Match Result
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Winner</Form.Label>
                            <Form.Select
                                value={resultForm.winnerId}
                                onChange={(e) => setResultForm({ ...resultForm, winnerId: e.target.value })}
                            >
                                <option value="">Select winner</option>
                                {currentMatch ? (
                                    <>
                                        <option value={currentMatch.player1}>{currentMatch.player1_name}</option>
                                        <option value={currentMatch.player2}>{currentMatch.player2_name}</option>
                                    </>
                                ) : null}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Result Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={resultForm.result_details}
                                onChange={(e) => setResultForm({ ...resultForm, result_details: e.target.value })}
                            />
                        </Form.Group>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Player 1 Score</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={resultForm.player1_score}
                                        onChange={(e) => setResultForm({ ...resultForm, player1_score: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Player 1 Rank</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={resultForm.player1_rank}
                                        onChange={(e) => setResultForm({ ...resultForm, player1_rank: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Player 2 Score</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={resultForm.player2_score}
                                        onChange={(e) => setResultForm({ ...resultForm, player2_score: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Player 2 Rank</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={resultForm.player2_rank}
                                        onChange={(e) => setResultForm({ ...resultForm, player2_rank: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="light" onClick={() => setShowRecordResultModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="success" onClick={submitRecordResult}>
                                Save Result
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Tournaments;
