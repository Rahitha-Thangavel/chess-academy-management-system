import React, { useState } from 'react';

const Attendance = () => {
    const [selectedChild, setSelectedChild] = useState('Arjun');
    const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1)); // November 2024 as in mockup

    const children = ['Arjun', 'Priya', 'Gautam'];

    // Mock Calendar Data for Nov 2024
    const daysInMonth = 30;
    const startDayOffset = 4; // Nov 1 2024 was Friday (approx for mock)

    const attendanceData = {
        4: 'P', 5: 'P', 6: 'A', 7: 'P', 8: 'P',
        11: 'P', 12: 'P', 13: 'P', 14: 'L', 15: 'P',
        18: 'P', 19: 'P', 20: 'P', 21: 'P',
        25: 'P', 26: 'P', 27: 'P', 28: 'P'
    };

    const stats = {
        total: 20,
        present: 18,
        absent: 2, // Includes Late for simplicity in count or separate
        rate: '90%'
    };

    const history = [
        { date: 'Nov 28', status: 'Present', time: '10:00 AM - 11:30 AM', color: 'success' },
        { date: 'Nov 27', status: 'Present', time: '10:00 AM - 11:30 AM', color: 'success' },
        { date: 'Nov 26', status: 'Present', time: '10:00 AM - 11:30 AM', color: 'success' },
        { date: 'Nov 25', status: 'Present', time: '10:00 AM - 11:30 AM', color: 'success' },
        { date: 'Nov 21', status: 'Late', time: '10:15 AM - 11:30 AM', color: 'warning' },
    ];

    const getDayStatus = (day) => attendanceData[day];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Attendance Records</h3>

            {/* Controls */}
            <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
                <div style={{ minWidth: '200px' }}>
                    <label className="text-secondary small fw-bold mb-1">Select Child</label>
                    <select
                        className="form-select border-0 bg-light fw-bold"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                    >
                        {children.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <h5 className="m-0 fw-bold">November 2024</h5>
                    <div className="btn-group">
                        <button className="btn btn-light btn-sm rounded-circle"><i className="bi bi-chevron-left"></i></button>
                        <button className="btn btn-light btn-sm rounded-circle ms-1"><i className="bi bi-chevron-right"></i></button>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Col: Calendar */}
                <div className="col-lg-7 col-xl-8">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
                        <div className="d-flex justify-content-between mb-3 text-secondary small fw-bold text-center">
                            <div style={{ width: '14%' }}>Mon</div>
                            <div style={{ width: '14%' }}>Tue</div>
                            <div style={{ width: '14%' }}>Wed</div>
                            <div style={{ width: '14%' }}>Thu</div>
                            <div style={{ width: '14%' }}>Fri</div>
                            <div style={{ width: '14%' }}>Sat</div>
                            <div style={{ width: '14%' }}>Sun</div>
                        </div>

                        <div className="d-flex flex-wrap">
                            {[...Array(startDayOffset)].map((_, i) => (
                                <div key={`empty-${i}`} style={{ width: '14%', height: '80px' }}></div>
                            ))}
                            {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const status = getDayStatus(day);
                                let bgClass = 'bg-light text-muted'; // Default/Empty
                                let text = '-';

                                if (status === 'P') { bgClass = 'bg-success-subtle text-success'; text = 'P'; }
                                if (status === 'A') { bgClass = 'bg-danger-subtle text-danger'; text = 'A'; }
                                if (status === 'L') { bgClass = 'bg-warning-subtle text-warning'; text = 'L'; }

                                // Weekends
                                const isWeekend = (startDayOffset + i) % 7 >= 5;
                                if (!status && isWeekend) { bgClass = 'bg-white text-muted'; text = day; } // Just date for weekends if no status

                                return (
                                    <div key={day} style={{ width: '14%', height: '90px' }} className="p-1">
                                        <div className="d-flex flex-column align-items-center justify-content-between py-2 rounded-3 h-100"
                                        >
                                            <span className={`small fw-bold ${!status ? 'text-dark' : 'text-secondary'}`}>{day}</span>
                                            {status || !isWeekend ? (
                                                <div
                                                    className={`d-flex align-items-center justify-content-center rounded-circle fw-bold ${bgClass}`}
                                                    style={{ width: '35px', height: '35px', fontSize: '14px' }}
                                                >
                                                    {text !== '-' ? text : ''}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Col: Stats & History */}
                <div className="col-lg-5 col-xl-4">
                    {/* Stats Cards Row */}
                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
                                <small className="text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Total Classes</small>
                                <h2 className="fw-bold my-2">{stats.total}</h2>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
                                <small className="text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Present</small>
                                <h2 className="fw-bold my-2 text-success">{stats.present} <span className="fs-6 text-dark font-normal">days</span></h2>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
                                <small className="text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Absent/Late</small>
                                <h2 className="fw-bold my-2 text-danger">{stats.absent} <span className="fs-6 text-dark font-normal">days</span></h2>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
                                <small className="text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Attendance Rate</small>
                                <h2 className="fw-bold my-2 text-success">{stats.rate}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                        <h5 className="fw-bold mb-4">Recent Attendance History</h5>
                        <div className="d-flex justify-content-between text-secondaryx small fw-bold text-muted mb-3 px-2">
                            <span style={{ width: '30%' }}>Date</span>
                            <span style={{ width: '30%' }}>Status</span>
                            <span className="text-end" style={{ width: '40%' }}>Time</span>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {history.map((record, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center px-2 py-2 rounded-2 hover-bg-light">
                                    <span className="fw-bold text-dark" style={{ width: '30%' }}>{record.date}</span>
                                    <div style={{ width: '30%' }}>
                                        <span className={`badge bg-${record.color}-subtle text-${record.color} border border-${record.color}-subtle rounded-pill px-3`}>
                                            {record.status}
                                        </span>
                                    </div>
                                    <div className="text-end text-secondary small" style={{ width: '40%' }}>
                                        <i className="bi bi-clock me-1"></i> {record.time}
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

export default Attendance;
