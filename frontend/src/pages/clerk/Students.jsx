import React, { useState } from 'react';

const Students = () => {
    const [activeTab, setActiveTab] = useState('database');

    // Mock Data
    const students = [
        { id: 'STU-001', name: 'Arjun', level: 'Beginner A', parent: 'Vimalan' },
        { id: 'STU-002', name: 'Priya', level: 'Intermediate B', parent: 'Vimalan' },
        { id: 'STU-003', name: 'Gautam', level: 'Starter', parent: 'Vimalan' },
        { id: 'STU-004', name: 'Sarah', level: 'Advanced', parent: 'Nisha' },
        { id: 'STU-005', name: 'Rohan', level: 'Competition', parent: 'David' },
    ];

    const approvals = [
        { name: 'Liam', age: 7, parent: 'James', applied: 'Dec 1, 2024', class: 'Beginner Class' },
        { name: 'Emma', age: 9, parent: 'Sophia', applied: 'Dec 2, 2024', class: 'Intermediate Class' },
        { name: 'Noah', age: 6, parent: 'Michael', applied: 'Dec 2, 2024', class: 'Starter Class' },
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Student Management</h3>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['Database', 'Registration', 'Approval'].map(tab => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-1 fw-bold position-relative text-capitalize ${activeTab === tab.toLowerCase() ? 'text-success' : 'text-secondary'}`}
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

            {/* Content */}
            <div className="row">
                <div className="col-12">
                    {/* DATABASE TAB */}
                    {activeTab === 'database' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold m-0">Student Database</h5>
                                <span className="text-secondary small">Total: 157 Students</span>
                            </div>

                            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light text-secondary small fw-bold text-uppercase">
                                            <tr>
                                                <th className="py-3 ps-4 border-0">ID</th>
                                                <th className="py-3 border-0">Name</th>
                                                <th className="py-3 border-0">Level</th>
                                                <th className="py-3 border-0">Parent</th>
                                                <th className="py-3 pe-4 text-end border-0">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((stu, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4 fw-bold">{stu.id}</td>
                                                    <td>{stu.name}</td>
                                                    <td>{stu.level}</td>
                                                    <td>{stu.parent}</td>
                                                    <td className="text-end pe-4">
                                                        <button className="btn btn-sm btn-light text-success fw-bold">View</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-3 border-top d-flex justify-content-between align-items-center">
                                    <span className="text-secondary small">Showing 1 to 5 of 157 students</span>
                                    <div className="btn-group">
                                        <button className="btn btn-outline-secondary btn-sm">Previous</button>
                                        <button className="btn btn-outline-secondary btn-sm">Next</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REGISTRATION TAB */}
                    {activeTab === 'registration' && (
                        <div className="card border-0 shadow-sm p-5 rounded-4" style={{ maxWidth: '800px' }}>
                            <h5 className="fw-bold mb-4">New Student Registration</h5>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Student Name</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Age</label>
                                    <input type="number" className="form-control bg-light border-0 py-2" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Parent Name</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Contact Number</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Level</label>
                                    <select className="form-select bg-light border-0 py-2">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Registration Date</label>
                                    <input type="date" className="form-control bg-light border-0 py-2" />
                                </div>

                                <div className="col-12 mt-4">
                                    <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                                        Submit Registration
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APPROVAL TAB */}
                    {activeTab === 'approval' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold m-0">Registration Approval Queue</h5>
                                <span className="text-secondary small">Pending: 5 Registrations</span>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                {approvals.map((app, idx) => (
                                    <div key={idx} className="card border-0 shadow-sm p-4 rounded-3 d-flex flex-row align-items-center justify-content-between">
                                        <div>
                                            <h6 className="fw-bold m-0">Student: {app.name} (Age {app.age})</h6>
                                            <div className="small text-secondary mt-1">Parent: {app.parent} | Applied: {app.applied}</div>
                                            <div className="small  text-muted">{app.class}</div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-success btn-sm px-3 fw-bold"><i className="bi bi-check-lg me-1"></i> Approve</button>
                                            <button className="btn btn-danger btn-sm px-3 fw-bold"><i className="bi bi-x-lg me-1"></i> Reject</button>
                                            <button className="btn btn-light btn-sm px-3 fw-bold border"><i className="bi bi-telephone me-1"></i> Contact</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;
