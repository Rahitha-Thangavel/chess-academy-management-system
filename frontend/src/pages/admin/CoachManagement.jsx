import React from 'react';

const CoachManagement = () => {
    const coaches = [
        {
            name: 'Ravi',
            role: 'Beginner Specialist',
            classes: 'Beginner A, Beginner B',
            experience: '5 years',
            students: '35',
            salary: 'LKR 25,000',
            status: 'Active',
            active: true
        },
        {
            name: 'Malini',
            role: 'Intermediate Specialist',
            classes: 'Intermediate A, Intermediate B',
            experience: '7 years',
            students: '28',
            salary: 'LKR 30,000',
            status: 'Active',
            active: true
        },
        {
            name: 'Rajesh',
            role: 'Advanced Coach',
            classes: 'Advanced A',
            experience: '10 years',
            students: '15',
            salary: 'LKR 45,000',
            status: 'Active',
            active: true
        },
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Coach Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                    <i className="bi bi-person-plus-fill me-2"></i> Add New Coach
                </button>
            </div>

            <div className="row g-4">
                {coaches.map((coach, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 className="fw-bold m-0">{coach.name}</h5>
                                    <p className="text-secondary small m-0">{coach.role}</p>
                                </div>
                                <span className="badge bg-success rounded-pill px-3 py-2" style={{ backgroundColor: '#6c9343 !important' }}>{coach.status}</span>
                            </div>

                            <div className="mb-3">
                                <small className="text-secondary fw-bold d-block mb-1">Classes</small>
                                <p className="fw-bold text-dark m-0">{coach.classes}</p>
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <small className="text-secondary fw-bold d-block mb-1">Experience</small>
                                    <p className="fw-bold m-0">{coach.experience}</p>
                                </div>
                                <div className="text-end">
                                    <small className="text-secondary fw-bold d-block mb-1">Students</small>
                                    <p className="fw-bold m-0">{coach.students}</p>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                <div>
                                    <small className="text-secondary fw-bold d-block mb-1">Salary</small>
                                    <p className="fw-bold m-0">{coach.salary}</p>
                                </div>
                                <span className="text-success small fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Active</span>
                            </div>

                            <div className="d-flex gap-3 mt-4">
                                <button className="btn btn-light text-success fw-bold flex-grow-1" style={{ color: '#6c9343' }}>View Profile</button>
                                <button className="btn btn-light text-success fw-bold flex-grow-1" style={{ color: '#6c9343' }}>Schedule</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachManagement;
