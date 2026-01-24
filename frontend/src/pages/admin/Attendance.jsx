import React, { useState } from 'react';

const Attendance = () => {
    // Mock Data
    const summary = [
        { class: 'Beginner A', coach: 'Ravi', present: 16, total: 18, absent: 2, percentage: 89, color: 'success' },
        { class: 'Beginner B', coach: 'Ravi', present: 14, total: 17, absent: 3, percentage: 82, color: 'success' },
        { class: 'Intermediate A', coach: 'Malini', present: 12, total: 14, absent: 2, percentage: 86, color: 'success' },
    ];

    const students = [
        { name: 'Arjun', id: 'STU-001', class: 'Beginner A', coach: 'Ravi', percentage: 92, attended: 11, total: 12, color: 'success' },
        { name: 'Priya', id: 'STU-002', class: 'Intermediate B', coach: 'Malini', percentage: 75, attended: 9, total: 12, color: 'warning' },
    ];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dates = [4, 5, 6, 7, 8, 9, 10];
    const status = ['P', 'P', 'A', 'P', 'P', '-', '-']; // P=Present, A=Absent, -=No Class

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4 text-success" style={{ color: '#6c9343' }}>Attendance Management</h3>

            {/* Today's Summary */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-bold m-0 text-secondary">Today's Attendance Summary</h6>
                </div>
                <div className="table-responsive p-3">
                    <table className="table table-hover align-middle mb-0 border-white">
                        <thead className="text-secondary small fw-bold">
                            <tr>
                                <th className="border-0 ps-4">Class</th>
                                <th className="border-0">Coach</th>
                                <th className="border-0">Attendance</th>
                                <th className="border-0 pe-4" style={{ width: '30%' }}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold">{row.class}</td>
                                    <td>{row.coach}</td>
                                    <td>
                                        <div className="small">
                                            <div className="fw-bold">{row.present}/{row.total}</div>
                                            <div className="text-secondary">Present - {row.absent} Absent</div>
                                        </div>
                                    </td>
                                    <td className="pe-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                                <div
                                                    className={`progress-bar bg-${row.color}`}
                                                    role="progressbar"
                                                    style={{ width: `${row.percentage}%`, backgroundColor: '#6c9343' }}
                                                    aria-valuenow={row.percentage} aria-valuemin="0" aria-valuemax="100"
                                                ></div>
                                            </div>
                                            <span className="fw-bold small">{row.percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="row g-4">
                {/* Attendance Calendar */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Attendance Calendar</h6>
                        </div>
                        <div className="p-4">
                            <div className="border rounded-3 p-3 text-center">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small text-secondary fw-bold">Mon</span>
                                    <span className="small text-secondary fw-bold">Tue</span>
                                    <span className="small text-secondary fw-bold">Wed</span>
                                    <span className="small text-secondary fw-bold">Thu</span>
                                    <span className="small text-secondary fw-bold">Fri</span>
                                    <span className="small text-secondary fw-bold">Sat</span>
                                    <span className="small text-secondary fw-bold">Sun</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    {dates.map((date, idx) => (
                                        <div key={idx} className="d-flex flex-column align-items-center gap-2">
                                            <span className="fw-bold">{date}</span>
                                            {status[idx] === 'P' && (
                                                <div className="rounded bg-success text-white d-flex align-items-center justify-content-center shadow-sm"
                                                    style={{ width: '30px', height: '30px', backgroundColor: '#6c9343 !important' }}>P</div>
                                            )}
                                            {status[idx] === 'A' && (
                                                <div className="rounded bg-danger text-white d-flex align-items-center justify-content-center shadow-sm"
                                                    style={{ width: '30px', height: '30px' }}>A</div>
                                            )}
                                            {(status[idx] === '-' || status[idx] === 'No Class') && (
                                                <div className="rounded bg-light text-secondary d-flex align-items-center justify-content-center"
                                                    style={{ width: '30px', height: '30px' }}>-</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-center gap-4 mt-4 small">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-success" style={{ width: '10px', height: '10px', backgroundColor: '#6c9343' }}></div>
                                        <span>Present</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-danger" style={{ width: '10px', height: '10px' }}></div>
                                        <span>Absent</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-light border" style={{ width: '10px', height: '10px' }}></div>
                                        <span>No Class</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Attendance Tracker */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Student Attendance Tracker</h6>
                        </div>
                        <div className="p-4">
                            <input type="text" className="form-control bg-light border-0 py-2 mb-4" placeholder="Search student..." />

                            <div className="d-flex flex-column gap-3">
                                {students.map((stu, idx) => (
                                    <div key={idx} className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold m-0">{stu.name} <span className="text-secondary small fw-normal">({stu.id})</span></h6>
                                            <small className="text-secondary d-block mt-1">{stu.class} - Coach {stu.coach}</small>

                                            <div className="d-flex gap-1 mt-2">
                                                {[...Array(12)].map((_, i) => (
                                                    <div key={i} className={`rounded-circle ${i < stu.attended ? 'bg-success' : 'bg-secondary-subtle'}`}
                                                        style={{ width: '8px', height: '8px', backgroundColor: i < stu.attended ? '#6c9343' : '' }}></div>
                                                ))}
                                            </div>
                                            <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>{stu.attended}/{stu.total} classes attended</small>
                                        </div>

                                        <div className={`badge rounded-pill px-3 py-2 ${stu.percentage >= 90 ? 'bg-success' : 'bg-warning'}`}
                                            style={{ backgroundColor: stu.percentage >= 90 ? '#6c9343' : '' }}>
                                            {stu.percentage}% Attendance
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
