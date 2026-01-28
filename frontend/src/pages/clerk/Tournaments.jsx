import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const Tournaments = () => {
    const [activeTab, setActiveTab] = useState('tournament registration');
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Tournament Form
    const [formData, setFormData] = useState({
        tournament_name: '',
        tournament_date: '',
        venue: '',
        registration_deadline: '',
        entry_fee: '',
        max_participants: '',
        description: ''
    });

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await axios.get('/tournaments/tournaments/');
            setTournaments(response.data);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTournament = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/tournaments/tournaments/', formData);
            toast.success('Tournament created successfully!');
            setFormData({
                tournament_name: '',
                tournament_date: '',
                venue: '',
                registration_deadline: '',
                entry_fee: '',
                max_participants: '',
                description: ''
            });
            fetchTournaments();
            setActiveTab('tournament registration');
        } catch (error) {
            console.error('Error creating tournament:', error);
            toast.error('Failed to create tournament');
        }
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Tournament Management</h3>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['Tournament Registration', 'Tournament Management'].map(tab => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === tab.toLowerCase() ? 'text-success' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'tournament registration' && (
                <div className="row g-4">
                    {/* Upcoming List */}
                    <div className="col-12">
                        <h5 className="fw-bold mb-3">Upcoming Tournaments</h5>
                        <div className="d-flex flex-column gap-3">
                            {loading ? (
                                <div className="p-4 text-center text-muted">Loading tournaments...</div>
                            ) : tournaments.map((t, idx) => (
                                <div key={idx} className="card border-0 shadow-sm p-4 rounded-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="fw-bold">{t.tournament_name}</h5>
                                            <div className="d-flex flex-wrap gap-3 text-secondary small mt-2">
                                                <span><i className="bi bi-calendar me-1"></i> {t.tournament_date}</span>
                                                <span><i className="bi bi-geo-alt me-1"></i> {t.venue}</span>
                                                <span><i className="bi bi-people me-1"></i> {t.max_participants} max</span>
                                                <span><i className="bi bi-tag me-1"></i> Entry Fee: LKR {t.entry_fee}</span>
                                            </div>
                                            <div className="d-flex gap-3 mt-2 small">
                                                <span className="text-secondary">Deadline: {t.registration_deadline}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column gap-2">
                                            <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#6c9343' }}>Register Student</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!loading && tournaments.length === 0 && (
                                <div className="p-5 text-center bg-light rounded-3 text-muted">
                                    <p className="m-0">No upcoming tournaments found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tournament management' && (
                <div className="card border-0 shadow-sm p-5 rounded-4" style={{ maxWidth: '800px' }}>
                    <h5 className="fw-bold mb-4">Tournament Setup</h5>

                    <form onSubmit={handleCreateTournament} className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Tournament Name</label>
                            <input
                                type="text"
                                className="form-control bg-light border-0 py-2"
                                value={formData.tournament_name}
                                onChange={(e) => setFormData({ ...formData, tournament_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Tournament Date</label>
                            <input
                                type="date"
                                className="form-control bg-light border-0 py-2"
                                value={formData.tournament_date}
                                onChange={(e) => setFormData({ ...formData, tournament_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Venue</label>
                            <input
                                type="text"
                                className="form-control bg-light border-0 py-2"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Registration Deadline</label>
                            <input
                                type="date"
                                className="form-control bg-light border-0 py-2"
                                value={formData.registration_deadline}
                                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Entry Fee</label>
                            <input
                                type="number"
                                className="form-control bg-light border-0 py-2"
                                placeholder="LKR"
                                value={formData.entry_fee}
                                onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Maximum Participants</label>
                            <input
                                type="number"
                                className="form-control bg-light border-0 py-2"
                                value={formData.max_participants}
                                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold text-secondary">Tournament Description</label>
                            <textarea
                                className="form-control bg-light border-0 py-2"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                                <i className="bi bi-plus-circle me-2"></i> Create Tournament
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Tournaments;
