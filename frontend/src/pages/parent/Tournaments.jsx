import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Tournaments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');

    const upcoming = [
        {
            id: 1,
            title: 'Junior Chess Championship 2024',
            date: 'Dec 15, 2024',
            venue: 'Jaffna Central Hall',
            fee: 'LKR 500',
            deadline: 'Dec 10, 2024',
            closesIn: '0 days',
            status: 'Open for Registration'
        },
        {
            id: 2,
            title: 'AAA Academy Monthly Contest',
            date: 'Dec 28, 2024',
            venue: 'AAA Chess Academy',
            fee: 'Free',
            deadline: 'Dec 25, 2024',
            closesIn: '9 days', // Adjusted for variety
            status: 'Open for Registration'
        }
    ];

    const history = [
        {
            id: 1,
            title: 'District Level Tournament 2024',
            date: 'Oct 20, 2024',
            participant: 'Arjun',
            result: '3rd Place',
            prize: 'Certificate + Medal',
            medal: 'bronze'
        },
        {
            id: 2,
            title: 'Academy Championship 2024',
            date: 'Sep 15, 2024',
            participant: 'Priya',
            result: '1st Place',
            prize: 'Trophy + Certificate',
            medal: 'gold'
        },
        {
            id: 3,
            title: "Beginner's Challenge 2024",
            date: 'Aug 10, 2024',
            participant: 'Gautam',
            result: 'Participation',
            prize: 'Certificate',
            medal: null
        }

    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Tournament Participation</h3>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    <button
                        className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === 'upcoming' ? 'text-success' : 'text-secondary'}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming Tournaments
                        {activeTab === 'upcoming' && (
                            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                        )}
                    </button>
                    <button
                        className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === 'history' ? 'text-success' : 'text-secondary'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Tournament History
                        {activeTab === 'history' && (
                            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="row">
                <div className="col-12">
                    {activeTab === 'upcoming' && (
                        <div className="d-flex flex-column gap-3">
                            {upcoming.map(t => (
                                <div key={t.id} className="card border-0 shadow-sm p-4 rounded-3">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="fw-bold m-0" style={{ maxWidth: '70%' }}>{t.title}</h5>
                                        <span className="badge bg-primary-subtle text-primary fw-normal px-3 py-2 rounded-pill">
                                            {t.status}
                                        </span>
                                    </div>

                                    <div className="row g-4 mb-3">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                                                <i className="bi bi-calendar-event text-success"></i>
                                                <span>Date: {t.date}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-secondary">
                                                <i className="bi bi-ticket-perforated text-success"></i>
                                                <span>Entry Fee: {t.fee}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                                                <i className="bi bi-geo-alt text-success"></i>
                                                <span>Venue: {t.venue}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-secondary">
                                                <i className="bi bi-clock-history text-success"></i>
                                                <span>Registration Deadline:<br />{t.deadline}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 text-warning small mb-4">
                                        <i className="bi bi-exclamation-triangle-fill"></i>
                                        <span>Registration closes in {t.closesIn}</span>
                                    </div>

                                    <div className="d-flex gap-3">
                                        <button
                                            className="btn text-white px-4 py-2 rounded-2 fw-bold"
                                            style={{ backgroundColor: '#6c9343' }}
                                            onClick={() => navigate(`/parent/tournaments/register/${t.id}`)}
                                        >
                                            Register Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="d-flex flex-column gap-3">
                            {history.map(t => (
                                <div key={t.id} className="card border-0 shadow-sm p-4 rounded-3">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <h5 className="fw-bold m-0">{t.title}</h5>
                                        {t.medal === 'gold' && <i className="bi bi-trophy-fill text-warning h4"></i>}
                                        {t.medal === 'bronze' && <i className="bi bi-award-fill text-warning h4" style={{ color: '#cd7f32' }}></i>}
                                        {!t.medal && t.result === 'Participation' && <i className="bi bi-star-fill text-warning h4"></i>}
                                    </div>

                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                                                <i className="bi bi-calendar-event text-success"></i>
                                                <span>Date: {t.date}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-secondary">
                                                <i className="bi bi-trophy text-success"></i>
                                                <span>Result: {t.result}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                                                <i className="bi bi-person text-success"></i>
                                                <span>Participant: {t.participant}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-secondary">
                                                <i className="bi bi-gift text-success"></i>
                                                <span>Prize: {t.prize}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <button className="btn btn-link text-decoration-none text-secondary fw-bold p-0">
                                            View Certificate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tournaments;
