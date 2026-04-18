import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const Tournaments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [tournaments, setTournaments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournaments();
        fetchRegistrations();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await axios.get('/tournaments/');
            // Handle both array (no pagination) and object (pagination) responses
            const data = response.data;
            if (Array.isArray(data)) {
                setTournaments(data);
            } else if (data && Array.isArray(data.results)) {
                setTournaments(data.results);
            } else {
                console.error("Unexpected tournaments data format:", data);
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
            setRegistrations(response.data);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Tournament Participation</h3>

            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    <button
                        className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === 'upcoming' ? 'text-success' : 'text-secondary'}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Available Tournaments
                        {activeTab === 'upcoming' && (
                            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                        )}
                    </button>
                    <button
                        className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === 'history' ? 'text-success' : 'text-secondary'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        My registrations
                        {activeTab === 'history' && (
                            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                        )}
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    {activeTab === 'upcoming' && (
                        <div className="d-flex flex-column gap-3">
                            {tournaments.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-light rounded shadow-sm">No upcoming tournaments.</div>
                            ) : (
                                tournaments.map(t => (
                                    <div key={t.id} className="card border-0 shadow-sm p-4 rounded-3">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="fw-bold m-0">{t.tournament_name}</h5>
                                            <span className={`badge px-3 py-2 rounded-pill ${t.window_status === 'OPEN' ? 'bg-secondary' : t.window_status === 'FINISHED' ? 'bg-secondary' : 'bg-success-subtle text-success'}`}>
                                                {t.window_status === 'OPEN' ? 'Started' : t.window_status === 'FINISHED' ? 'Closed' : 'Open'}
                                            </span>
                                        </div>
                                        <div className="row g-4 mb-4">
                                            <div className="col-md-6 text-secondary">
                                                <div className="mb-2"><i className="bi bi-calendar-event me-2"></i>Date: {new Date(t.tournament_date).toLocaleDateString()}</div>
                                                <div className="mb-2"><i className="bi bi-clock me-2"></i>Time: {t.start_time?.slice(0, 5)} - {t.end_time?.slice(0, 5)}</div>
                                                <div><i className="bi bi-geo-alt me-2"></i>Venue: {t.venue}</div>
                                            </div>
                                            <div className="col-md-6 text-secondary">
                                                <div className="mb-2"><i className="bi bi-currency-dollar me-2"></i>Entry Fee: LKR {t.entry_fee}</div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-3">
                                            <button
                                                className={`btn px-4 py-2 rounded-2 fw-bold ${t.window_status === 'UPCOMING' || t.window_status === 'BEFORE_START' ? 'text-white' : 'btn-outline-secondary'}`}
                                                style={(t.window_status === 'UPCOMING' || t.window_status === 'BEFORE_START') ? { backgroundColor: '#6c9343' } : {}}
                                                onClick={() => (t.window_status === 'UPCOMING' || t.window_status === 'BEFORE_START') && navigate(`/parent/tournaments/register/${t.id}`)}
                                                disabled={!(t.window_status === 'UPCOMING' || t.window_status === 'BEFORE_START')}
                                            >
                                                {(t.window_status === 'UPCOMING' || t.window_status === 'BEFORE_START') ? 'Register Child' : 'Registration Closed'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="d-flex flex-column gap-3">
                            {registrations.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-light rounded shadow-sm">You haven't registered for any tournaments.</div>
                            ) : (
                                registrations.map(reg => (
                                    <div key={reg.id} className="card border-0 shadow-sm p-4 rounded-3">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h5 className="fw-bold m-0">{reg.tournament_name}</h5>
                                                <small className="text-secondary">Participant: {reg.student_name}</small>
                                            </div>
                                            <span className={`badge ${reg.payment_status === 'PAID' ? 'bg-success' : 'bg-warning'} px-3 py-2 rounded-pill`}>
                                                {reg.payment_status}
                                            </span>
                                        </div>
                                        <div className="row g-4">
                                            <div className="col-md-6 text-secondary small">
                                                Registered on: {new Date(reg.registration_date).toLocaleDateString()} • Status: {reg.status}
                                            </div>
                                            <div className="col-md-6 text-end">
                                                {reg.rank && <div className="fw-bold text-success">Result: Rank {reg.rank} (Score: {reg.score})</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tournaments;
