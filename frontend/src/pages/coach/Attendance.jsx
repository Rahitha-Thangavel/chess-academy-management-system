import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('checked-out'); // 'checked-in' or 'checked-out'

    const handleCheckIn = () => {
        setStatus(status === 'checked-in' ? 'checked-out' : 'checked-in');
    };

    // Mock Calendar Data for Nov 2024
    const daysInMonth = 30;
    const startDayOffset = 4; // Nov 1 2024 was Friday

    // 1=Present (Green), 2=Absent(Red), 3=Late(Yellow/Orange), 0=None
    const attendanceData = {
        1: 1, 2: 0, 3: 0, // 2,3 weekend
        4: 1, 5: 1, 6: 2, 7: 1, 8: 1,
        11: 1, 12: 1, 13: 1, 14: 3, 15: 1,
        18: 1, 19: 1, 20: 1, 21: 1,
        25: 1, 26: 1, 27: 1, 28: 1, 29: 1
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Attendance</h3>

            {/* Today's Section */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold mb-4">Today's Attendance</h5>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-5">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3" style={{ minWidth: '300px' }}>
                        <div className={`rounded-circle p-2 ${status === 'checked-in' ? 'bg-success' : 'bg-secondary'}`}></div>
                        <div>
                            <small className="text-secondary d-block">Current Status</small>
                            <span className="fw-bold">{status === 'checked-in' ? 'Checked In' : 'Not Checked In'}</span>
                        </div>
                    </div>

                    <button
                        className={`btn ${status === 'checked-in' ? 'btn-danger' : 'btn-success'} px-4 py-2 fw-bold`}
                        onClick={() => navigate('/coach/mark-attendance')}
                        style={{ minWidth: '150px' }}
                    >
                        Mark Attendance
                    </button>
                </div>

                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <small className="text-secondary">Today's Hours</small>
                            <h4 className="fw-bold m-0 mt-1">4 hours</h4>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <small className="text-secondary">This Week</small>
                            <h4 className="fw-bold m-0 mt-1">32 hours</h4>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <small className="text-secondary">This Month</small>
                            <h4 className="fw-bold m-0 mt-1">128 hours</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0">November 2024</h5>
                    <div className="btn-group">
                        <button className="btn btn-light btn-sm rounded-circle"><i className="bi bi-chevron-left"></i></button>
                        <button className="btn btn-light btn-sm rounded-circle ms-1"><i className="bi bi-chevron-right"></i></button>
                    </div>
                </div>

                <div className="d-flex justify-content-between mb-3 text-secondary small fw-bold text-center px-1">
                    <div style={{ width: '13%' }}>Mon</div>
                    <div style={{ width: '13%' }}>Tue</div>
                    <div style={{ width: '13%' }}>Wed</div>
                    <div style={{ width: '13%' }}>Thu</div>
                    <div style={{ width: '13%' }}>Fri</div>
                    <div style={{ width: '13%' }}>Sat</div>
                    <div style={{ width: '13%' }}>Sun</div>
                </div>

                <div className="d-flex flex-wrap">
                    {[...Array(startDayOffset)].map((_, i) => (
                        <div key={`empty-${i}`} style={{ width: '14.28%', height: '60px' }}></div>
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const stat = attendanceData[day];
                        let icon = null;
                        let color = 'light';

                        if (stat === 1) { color = 'success-subtle text-success'; icon = 'bi-check-lg'; }
                        if (stat === 2) { color = 'danger-subtle text-danger'; icon = 'bi-x-lg'; }
                        if (stat === 3) { color = 'warning-subtle text-warning'; icon = 'bi-clock'; }

                        // Weekends
                        const isWeekend = (startDayOffset + i) % 7 >= 5;

                        return (
                            <div key={day} style={{ width: '14.28%', height: '80px' }} className="p-1">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 rounded-3">
                                    <span className="small mb-1 text-secondary">{day}</span>
                                    {stat ? (
                                        <div className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center`} style={{ width: '30px', height: '30px' }}>
                                            <i className={`bi ${icon}`}></i>
                                        </div>
                                    ) : (
                                        <div style={{ height: '30px' }}></div>
                                    )}
                                    {isWeekend && !stat && <span className="text-black-50" style={{ fontSize: '10px' }}>W/E</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="d-flex gap-4 mt-4 justify-content-center small text-secondary">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-check-lg text-success"></i> Present
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-x-lg text-danger"></i> Absent
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-clock text-warning"></i> Late
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
