/**
 * Page component: Attendance.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const Attendance = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceMap, setAttendanceMap] = useState({});
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, rate: '0%' });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDayOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0=Sun, 1=Mon... 
    // Adjust offset if you want Mon start (0->6, 1->0) etc. Standard JS getDay() is Sun=0. 
    // If UI expects Mon=0, offset = (day + 6) % 7. Let's assume Sun=0 for now or match UI grid.
    // UI header: Mon, Tue... Sun. This implies Mon start.
    const uiStartDayOffset = (startDayOffset + 6) % 7;

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchAttendance();
        }
    }, [selectedChild, currentDate]);

    const fetchChildren = async () => {
        try {
            const res = await axios.get('/students/my_children/');
            setChildren(res.data);
            if (res.data.length > 0) {
                setSelectedChild(res.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            // Fetch all records for parent (backend filters by parent user)
            const res = await axios.get('/student-attendance/');

            // Filter by selected child and current month
            const childRecords = res.data.filter(r =>
                r.student === parseInt(selectedChild) || r.student === selectedChild
                // Backend might return ID or object. Usually ID in generic view set unless nested.
                // Looking at serializer: BatchEnrollmentSerializer (not used here), AttendanceSerializer?
                // Standard AttendanceSerializer usually has student field.
            );

            // Process records for the month
            const map = {};
            let present = 0;
            let absent = 0;
            const historyList = [];

            childRecords.forEach(record => {
                const d = new Date(record.attendance_date);
                if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                    const day = d.getDate();
                    const statusChar = record.status === 'PRESENT' ? 'P' : record.status === 'ABSENT' ? 'A' : 'L';
                    map[day] = statusChar;

                    if (record.status === 'PRESENT') present++;
                    else absent++;

                    historyList.push({
                        date: d.toLocaleDateString(),
                        status: record.status,
                        time: '-', // Backend doesn't seem to have check-in time for students yet? Or check model.
                        color: record.status === 'PRESENT' ? 'success' : 'danger'
                    });
                }
            });

            setAttendanceMap(map);
            setHistory(historyList.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));

            const total = present + absent;
            setStats({
                total,
                present,
                absent,
                rate: total > 0 ? Math.round((present / total) * 100) + '%' : '0%'
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    const getDayStatus = (day) => attendanceMap[day];

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
                        {children.map(c => (
                            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                        ))}
                    </select>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <h5 className="m-0 fw-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h5>
                    <div className="btn-group">
                        <button className="btn btn-light btn-sm rounded-circle" onClick={() => changeMonth(-1)}><i className="bi bi-chevron-left"></i></button>
                        <button className="btn btn-light btn-sm rounded-circle ms-1" onClick={() => changeMonth(1)}><i className="bi bi-chevron-right"></i></button>
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
                            {[...Array(uiStartDayOffset)].map((_, i) => (
                                <div key={`empty-${i}`} style={{ width: '14%', height: '80px' }}></div>
                            ))}
                            {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const status = getDayStatus(day);
                                let bgClass = 'bg-light text-muted'; // Default/Empty
                                let text = '-';

                                if (status === 'P') { bgClass = 'bg-success-subtle text-success'; text = 'P'; }
                                if (status === 'A') { bgClass = 'bg-danger-subtle text-danger'; text = 'A'; }

                                return (
                                    <div key={day} style={{ width: '14%', height: '90px' }} className="p-1">
                                        <div className="d-flex flex-column align-items-center justify-content-between py-2 rounded-3 h-100">
                                            <span className={`small fw-bold ${!status ? 'text-dark' : 'text-secondary'}`}>{day}</span>
                                            {status ? (
                                                <div
                                                    className={`d-flex align-items-center justify-content-center rounded-circle fw-bold ${bgClass}`}
                                                    style={{ width: '35px', height: '35px', fontSize: '14px' }}
                                                >
                                                    {text}
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
                                <small className="text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Absent</small>
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
                            <span style={{ width: '50%' }}>Date</span>
                            <span style={{ width: '50%' }}>Status</span>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {history.length === 0 ? <p className="text-muted text-center">No records.</p> : history.map((record, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center px-2 py-2 rounded-2 hover-bg-light">
                                    <span className="fw-bold text-dark" style={{ width: '50%' }}>{record.date}</span>
                                    <div style={{ width: '50%' }}>
                                        <span className={`badge bg-${record.color}-subtle text-${record.color} border border-${record.color}-subtle rounded-pill px-3`}>
                                            {record.status}
                                        </span>
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
