import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const Attendance = () => {
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await axios.get('/coaches/');
            setAttendanceHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check if attended on a specific date
    const getStatusForDate = (day) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth(); // 0-indexed
        const dateStr = new Date(year, month, day).toISOString().split('T')[0]; // Format: YYYY-MM-DD (local logic simplified)

        // Correct comparison:
        // Format local date to YYYY-MM-DD properly
        const d = new Date(year, month, day);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const record = attendanceHistory.find(r => r.date === formattedDate);
        return record ? 1 : 0; // 1=Present (if record exists)
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startDayOffset = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() || 7; // 1(Mon)-7(Sun) adjustment might be needed depending on calendar start
    // Standard JS getDay(): 0=Sun, 1=Mon...
    // Let's adjust to Mon start: 0->6, 1->0
    const jsDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monStartOffset = jsDay === 0 ? 6 : jsDay - 1;

    // Calculate Hours
    const totalHours = attendanceHistory.reduce((acc, curr) => acc + (parseFloat(curr.hours_logged) || 0), 0);
    // Rough approximations for Today/Week/Month without complex date math libraries for now
    const todayStr = new Date().toISOString().split('T')[0];
    const todayHours = attendanceHistory.find(r => r.date === todayStr)?.hours_logged || 0;


    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">My Attendance History</h3>

            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <small className="text-secondary">Today's Hours</small>
                            <h4 className="fw-bold m-0 mt-1">{todayHours} hrs</h4>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <small className="text-secondary">Total Logged</small>
                            <h4 className="fw-bold m-0 mt-1">{totalHours} hrs</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h5>
                    <div className="btn-group">
                        <button className="btn btn-light btn-sm rounded-circle" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><i className="bi bi-chevron-left"></i></button>
                        <button className="btn btn-light btn-sm rounded-circle ms-1" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><i className="bi bi-chevron-right"></i></button>
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
                    {[...Array(monStartOffset)].map((_, i) => (
                        <div key={`empty-${i}`} style={{ width: '14.28%', height: '60px' }}></div>
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const isPresent = getStatusForDate(day);
                        let color = 'light';
                        let icon = null;

                        if (isPresent) { color = 'success-subtle text-success'; icon = 'bi-check-lg'; }

                        return (
                            <div key={day} style={{ width: '14.28%', height: '80px' }} className="p-1">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 rounded-3 border-light border">
                                    <span className="small mb-1 text-secondary">{day}</span>
                                    {isPresent ? (
                                        <div className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center`} style={{ width: '30px', height: '30px' }}>
                                            <i className={`bi ${icon}`}></i>
                                        </div>
                                    ) : (
                                        <div style={{ height: '30px' }}></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Attendance;
