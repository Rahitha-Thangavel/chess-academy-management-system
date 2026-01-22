import React, { useState } from 'react';

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('daily recording');

    const todaySummary = [
        { class: 'Beginner A', coach: 'Ravi', status: '19/19 Present | 2 Absent', color: 'success' },
        { class: 'Beginner B', coach: 'Ravi', status: '14/17 Present | 3 Absent', color: 'warning' },
        { class: 'Intermediate A', coach: 'Malini', status: '12/14 Present | 2 Absent', color: 'warning' },
        { class: 'Intermediate B', coach: 'Malini', status: '13/14 Present | 1 Absent', color: 'success' },
        { class: 'Starter A', coach: 'Rajesh', status: '10/12 Present | 2 Absent', color: 'warning' },
        { class: 'Advanced', coach: 'Kumar', status: '9/10 Present | 1 Absent', color: 'success' },
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Attendance Management</h3>

            <div className="d-flex justify-content-end mb-3">
                <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                    <i className="bi bi-calendar"></i>
                    <span className="small">mm/dd/yyyy</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    <button
                        className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === 'daily recording' ? 'text-success' : 'text-secondary'}`}
                        onClick={() => setActiveTab('daily recording')}
                    >
                        Daily Recording
                        {activeTab === 'daily recording' && (
                            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                        )}
                    </button>
                    <button
                        className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === 'history' ? 'text-success' : 'text-secondary'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Attendance History
                        {activeTab === 'history' && (
                            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'daily recording' && (
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
                        <h5 className="fw-bold m-0">Today's Attendance Summary</h5>
                        <span className="text-muted small">December 4, 2024</span>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th className="py-3 ps-4 border-0">Class</th>
                                    <th className="py-3 border-0">Coach</th>
                                    <th className="py-3 border-0">Attendance</th>
                                    <th className="py-3 pe-4 text-end border-0">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaySummary.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4 fw-bold">{row.class}</td>
                                        <td className="text-secondary">{row.coach}</td>
                                        <td className="small fw-bold text-secondary">{row.status}</td>
                                        <td className="text-end pe-4">
                                            <div className={`rounded-circle bg-${row.color} d-inline-block`} style={{ width: '10px', height: '10px' }}></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-clock-history h1 d-block mb-3"></i>
                    <p>Attendance History Viewer to be implemented.</p>
                </div>
            )}
        </div>
    );
};

export default Attendance;
