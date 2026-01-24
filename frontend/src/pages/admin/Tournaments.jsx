import React from 'react';

const Tournaments = () => {
    // Mock Data
    const tournaments = [
        {
            title: 'Junior Chess Championship 2024',
            status: 'Registration Open',
            date: 'Dec 15, 2024',
            time: '8:00 AM',
            location: 'Main Academy Hall',
            registered: 32,
            categories: ['Under 10', 'Under 12', 'Under 15'],
            fee: 'LKR 500'
        },
        {
            title: 'AAA Academy Monthly Contest',
            status: 'Registration Open',
            date: 'Dec 28, 2024',
            time: '9:00 AM',
            location: 'Academy Annex',
            registered: 25,
            categories: ['Beginner', 'Intermediate', 'Advanced'],
            fee: 'Free'
        }
    ];

    const requests = [
        { name: 'Arjun', id: 'STU-001', tournament: 'Junior Chess Championship 2024', category: 'Under 10 Category', date: 'Dec 2, 2024', status: 'Pending' },
        { name: 'Sarah', id: 'STU-004', tournament: 'Junior Chess Championship 2024', category: 'Under 12 Category', date: 'Dec 1, 2024', status: 'Pending' },
        { name: 'Gautam', id: 'STU-003', tournament: 'AAA Academy Monthly Contest', category: 'Beginner Category', date: 'Dec 3, 2024', status: 'Pending' },
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Tournament Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                    <i className="bi bi-plus-lg me-2"></i> Create Tournament
                </button>
            </div>

            <div className="row g-4">
                {/* Active Tournaments Column */}
                <div className="col-lg-8">
                    <div className="d-flex flex-column gap-4">
                        {tournaments.map((t, idx) => (
                            <div key={idx} className="card border-0 shadow-sm rounded-4 p-4 position-relative overflow-hidden">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div style={{ maxWidth: '70%' }}>
                                        <h5 className="fw-bold text-success mb-3" style={{ color: '#6c9343' }}>{t.title}</h5>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <div className="d-flex gap-2">
                                                    <i className="bi bi-calendar-event text-secondary"></i>
                                                    <div>
                                                        <small className="fw-bold d-block">Date & Location</small>
                                                        <small className="text-muted">{t.date} • {t.location}</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex gap-2">
                                                    <i className="bi bi-people text-secondary"></i>
                                                    <div>
                                                        <small className="fw-bold d-block">Participants</small>
                                                        <small className="text-muted">{t.registered} registered</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex gap-2 mb-1">
                                                <i className="bi bi-trophy text-secondary"></i>
                                                <small className="fw-bold">Categories</small>
                                            </div>
                                            <div className="d-flex gap-2 flex-wrap ps-4">
                                                {t.categories.map((cat, i) => (
                                                    <span key={i} className="badge bg-light text-secondary border fw-normal">{cat}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-4">
                                            <div>
                                                <small className="fw-bold d-block">Entry Fee:</small>
                                                <span className="fw-bold">{t.fee}</span>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-light text-secondary fw-bold px-3">Participants</button>
                                                <button className="btn btn-sm text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }}>Manage</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge - Top Right */}
                                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center text-center p-3 shadow-sm"
                                        style={{ width: '90px', height: '90px', backgroundColor: '#6c9343', fontSize: '0.7rem', lineHeight: '1.2' }}>
                                        Registration<br />Open
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requests Column */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Tournament Registration Requests</h6>
                        </div>
                        <div className="p-4 d-flex flex-column gap-3">
                            {requests.map((req, idx) => (
                                <div key={idx} className="p-3 rounded-3 bg-light border">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 className="fw-bold m-0">{req.name} <span className="text-secondary small fw-normal">({req.id})</span></h6>
                                            <small className="text-secondary d-block mt-1" style={{ lineHeight: '1.2' }}>
                                                {req.tournament}<br />
                                                <span className="text-muted fst-italic">{req.category}</span>
                                            </small>
                                            <small className="text-muted d-block mt-1">Requested on: {req.date}</small>
                                        </div>
                                        <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center text-center shadow-sm"
                                            style={{ width: '40px', height: '40px', fontSize: '0.6rem' }}>
                                            Pending
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 mt-3">
                                        <button className="btn btn-sm text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }}>Approve</button>
                                        <button className="btn btn-sm text-danger fw-bold px-3 border border-danger bg-white">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tournaments;
