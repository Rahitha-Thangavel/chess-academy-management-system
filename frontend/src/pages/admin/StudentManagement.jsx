import React, { useState } from 'react';

const StudentManagement = () => {
    const [activeTab, setActiveTab] = useState('database');

    const students = [
        { id: 'STU-001', name: 'Arjun', class: 'Beginner A', parent: 'Vimalan', status: 'Active' },
        { id: 'STU-002', name: 'Priya', class: 'Intermediate B', parent: 'Vimalan', status: 'Active' },
        { id: 'STU-003', name: 'Gautam', class: 'Starter', parent: 'Vimalan', status: 'Active' },
        { id: 'STU-004', name: 'Sarah', class: 'Advanced', parent: 'Nisha', status: 'Active' },
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Student Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                    <i className="bi bi-person-plus-fill me-2"></i> Add New Student
                </button>
            </div>

            {/* Student Database Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Student Database</h6>
                </div>

                <div className="p-4">
                    {/* Search & Filter */}
                    <div className="d-flex gap-3 mb-4">
                        <div className="input-group" style={{ maxWidth: '300px' }}>
                            <input type="text" className="form-control border-end-0 bg-light" placeholder="Search students..." />
                            <span className="input-group-text bg-light border-start-0"><i className="bi bi-search"></i></span>
                        </div>
                        <button className="btn btn-light text-secondary fw-bold px-3">
                            <i className="bi bi-funnel me-2"></i> Filter
                        </button>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th className="py-3 ps-4 border-0" style={{ width: '15%' }}>ID</th>
                                    <th className="py-3 border-0" style={{ width: '20%' }}>Name</th>
                                    <th className="py-3 border-0" style={{ width: '25%' }}>Class</th>
                                    <th className="py-3 border-0" style={{ width: '20%' }}>Parent</th>
                                    <th className="py-3 pe-4 text-end border-0" style={{ width: '20%' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((stu, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{stu.id}</div>
                                        </td>
                                        <td className="fw-bold text-dark">{stu.name}</td>
                                        <td className="text-secondary">{stu.class}</td>
                                        <td className="text-secondary">{stu.parent}</td>
                                        <td className="text-end pe-4">
                                            <span className="badge bg-success px-3 py-2 rounded-pill fw-normal"
                                                style={{ backgroundColor: '#6c9343 !important' }}>
                                                {stu.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3 text-secondary small">
                        <span>Showing 4 of 115 active students</span>
                        <div className="d-flex align-items-center gap-2">
                            <span>Previous</span>
                            <button className="btn btn-sm btn-success text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }}>1</button>
                            <button className="btn btn-sm btn-light text-secondary fw-bold px-3">2</button>
                            <button className="btn btn-sm btn-light text-secondary fw-bold px-3">3</button>
                            <span>Next</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Queue Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">Registration Queue</h6>
                </div>

                <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold m-0">Pending Approvals</h6>
                        <span className="badge bg-warning text-white rounded-pill px-3">5 Pending</span>
                    </div>

                    {/* Pending Item Card */}
                    <div className="p-4 rounded-3 d-flex justify-content-between align-items-start" style={{ backgroundColor: '#f8f9fa' }}>
                        <div>
                            <h6 className="fw-bold m-0 mb-1">Student: Liam (Age 7)</h6>
                            <p className="text-secondary small m-0 mb-3">Parent: James <br /> Applied: Dec 1, 2024 | Beginner Class</p>

                            <div className="d-flex gap-2">
                                <button className="btn btn-sm text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }}>Approve</button>
                                <button className="btn btn-sm btn-danger text-white fw-bold px-3">Reject</button>
                                <button className="btn btn-sm btn-white border fw-bold px-3">Contact</button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-3">
                        <span className="text-success small fw-bold cursor-pointer" style={{ color: '#6c9343' }}>View All Pending (5)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
