/**
 * Page component: Attendance.
 * 
 * Defines a route/page-level React component.
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button } from 'react-bootstrap';

const Attendance = () => {
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await axios.get('/coaches/');
            setAttendanceHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const recordMap = useMemo(() => {
        const map = {};
        attendanceHistory.forEach((record) => {
            map[record.date] = record;
        });
        return map;
    }, [attendanceHistory]);

    const getRecordForDay = (day) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const d = new Date(year, month, day);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return recordMap[`${yyyy}-${mm}-${dd}`] || null;
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const jsDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monStartOffset = jsDay === 0 ? 6 : jsDay - 1;

    const currentMonthRecords = useMemo(() => attendanceHistory.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear();
    }), [attendanceHistory, currentMonth]);

    const totalHoursForMonth = currentMonthRecords.reduce((acc, curr) => acc + (parseFloat(curr.worked_hours) || 0), 0);
    const totalSessionsForMonth = currentMonthRecords.filter((record) => record.clock_in_time).length;
    const completedSessionsForMonth = currentMonthRecords.filter((record) => record.clock_in_time && record.clock_out_time).length;

    if (loading) {
        return <div className="p-5 text-center">Loading attendance history...</div>;
    }

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">My Attendance History</h3>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-secondary fw-bold d-block mb-2">Total Worked Hours</small>
                            <h3 className="fw-bold text-success m-0">{totalHoursForMonth.toFixed(2)} hrs</h3>
                            <div className="small text-muted mt-2">
                                For {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-secondary fw-bold d-block mb-2">Sessions Recorded</small>
                            <h3 className="fw-bold text-primary m-0">{totalSessionsForMonth}</h3>
                            <div className="small text-muted mt-2">
                                For {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-secondary fw-bold d-block mb-2">Completed Sessions</small>
                            <h3 className="fw-bold text-warning m-0">{completedSessionsForMonth}</h3>
                            <div className="small text-muted mt-2">
                                For {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h5>
                    <div className="btn-group">
                        <button className="btn btn-light btn-sm rounded-circle" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><i className="bi bi-chevron-left"></i></button>
                        <button className="btn btn-light btn-sm rounded-circle ms-1" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><i className="bi bi-chevron-right"></i></button>
                    </div>
                </div>

                <div className="d-flex justify-content-between mb-3 text-secondary small fw-bold text-center px-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} style={{ width: '13%' }}>{day}</div>
                    ))}
                </div>

                <div className="d-flex flex-wrap">
                    {[...Array(monStartOffset)].map((_, i) => (
                        <div key={`empty-${i}`} style={{ width: '14.28%', height: '60px' }}></div>
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const record = getRecordForDay(day);
                        const isCompleted = !!record?.clock_out_time;

                        return (
                            <div key={day} style={{ width: '14.28%', height: '86px' }} className="p-1">
                                <button
                                    type="button"
                                    className={`w-100 h-100 rounded-3 border-0 ${record ? 'shadow-sm' : 'border bg-white'}`}
                                    style={{
                                        backgroundColor: record ? (isCompleted ? '#e9f7ef' : '#fff7e6') : '#ffffff',
                                        cursor: record ? 'pointer' : 'default',
                                    }}
                                    onClick={() => record && setSelectedRecord(record)}
                                    disabled={!record}
                                >
                                    <div className="small text-secondary mb-1">{day}</div>
                                    {record ? (
                                        <div className={`small fw-bold ${isCompleted ? 'text-success' : 'text-warning'}`}>
                                            {isCompleted ? `${record.worked_hours || '0.00'}h` : 'Open'}
                                        </div>
                                    ) : null}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal show={!!selectedRecord} onHide={() => setSelectedRecord(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Attendance Session Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Batch</span>
                                <span className="fw-bold">{selectedRecord.batch_name}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Date</span>
                                <span>{new Date(selectedRecord.date).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Start Time</span>
                                <span>{selectedRecord.clock_in_time ? new Date(selectedRecord.clock_in_time).toLocaleTimeString() : 'Not started'}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">End Time</span>
                                <span>{selectedRecord.clock_out_time ? new Date(selectedRecord.clock_out_time).toLocaleTimeString() : 'Still running / not ended'}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-secondary fw-bold">Worked Hours</span>
                                <span className="fw-bold">{selectedRecord.worked_hours || '0.00'} hrs</span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedRecord(null)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Attendance;
