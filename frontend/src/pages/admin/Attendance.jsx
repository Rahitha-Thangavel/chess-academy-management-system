import React, { useEffect, useRef, useState } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { useAppUI } from '../../contexts/AppUIContext';
import { useLocation } from 'react-router-dom';

const ACADEMY_TIMEZONE = 'Asia/Colombo';
const getAcademyDateKey = () => new Intl.DateTimeFormat('sv-SE', {
    timeZone: ACADEMY_TIMEZONE,
}).format(new Date());

const getAttendanceStatusLabel = (item) => {
    if (item.can_record_attendance) return 'Open now';
    if (item.attendance_window_status === 'EXPIRED') {
        const closesAt = item.attendance_closes_at ? new Date(item.attendance_closes_at) : null;
        return closesAt
            ? `Closed at ${closesAt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
            : 'Closed';
    }
    if (item.attendance_window_status === 'BEFORE_WINDOW') return `Opens at ${(item.start_time || '').slice(0, 5)}`;
    return item.attendance_window_message;
};

const getAttendanceStatusClasses = (item) => {
    if (item.can_record_attendance) {
        return {
            textClass: 'text-success',
            buttonClass: 'btn-success text-white',
            buttonStyle: { backgroundColor: '#6c9343', border: 'none' },
        };
    }
    if (item.attendance_window_status === 'BEFORE_WINDOW') {
        return {
            textClass: 'text-primary',
            buttonClass: 'btn-outline-primary',
            buttonStyle: {},
        };
    }
    if (item.attendance_window_status === 'EXPIRED') {
        return {
            textClass: 'text-danger',
            buttonClass: 'btn-outline-danger',
            buttonStyle: {},
        };
    }
    return {
        textClass: 'text-secondary',
        buttonClass: 'btn-outline-secondary',
        buttonStyle: {},
    };
};

const buildAttendanceAlerts = (flags) => ([
    ...(flags?.missing_batches || []).map((item) => ({
        id: `missing-${item.batch_id}`,
        title: item.batch_name,
        description: item.issue,
        cardClass: 'bg-warning-subtle',
    })),
    ...(flags?.partial_batches || []).map((item) => ({
        id: `partial-${item.batch_id}`,
        title: item.batch_name,
        description: `${item.issue} ${item.recorded_count}/${item.expected_count} recorded.`,
        cardClass: 'bg-info-subtle',
    })),
    ...(flags?.inconsistent_records || []).map((item) => ({
        id: `inconsistent-${item.attendance_id}`,
        title: item.student_name,
        description: `${item.batch_name}: ${item.issue}`,
        cardClass: 'bg-danger-subtle',
    })),
    ...(flags?.coach_timestamp_issues || []).map((item) => ({
        id: `coach-${item.coach_attendance_id}`,
        title: item.coach_name,
        description: `${item.batch_name} on ${new Date(item.date).toLocaleDateString()}: ${item.issue}`,
        cardClass: 'bg-light',
    })),
]);

const Attendance = () => {
    const { notifySuccess, notifyError, notifyInfo } = useAppUI();
    const location = useLocation();
    const [batches, setBatches] = useState([]);
    const [todaysClasses, setTodaysClasses] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchStudents, setBatchStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // {student_id: 'PRESENT'/'ABSENT'}
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [flags, setFlags] = useState(null);
    const [ignoredAlerts, setIgnoredAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const autoOpenedRef = useRef(false);
    const ignoredAlertsStorageKey = `attendance-alerts-ignored-${getAcademyDateKey()}`;

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(ignoredAlertsStorageKey);
            setIgnoredAlerts(stored ? JSON.parse(stored) : []);
        } catch (error) {
            console.error('Error reading ignored attendance alerts:', error);
            setIgnoredAlerts([]);
        }
    }, [ignoredAlertsStorageKey]);

    useEffect(() => {
        fetchBatches();
        fetchAttendanceSummary();
        fetchFlags();
        fetchTodaysClasses();
    }, []);

    useEffect(() => {
        const batchId = location.state?.batchId;
        if (!batchId || autoOpenedRef.current || batches.length === 0) {
            return;
        }

        const batch = batches.find((item) => item.id === batchId);
        if (batch) {
            autoOpenedRef.current = true;
            handleBatchSelect(batch);
        }
    }, [batches, location.state]);

    const fetchBatches = async () => {
        try {
            const response = await axios.get('/batches/');
            setBatches(response.data);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchAttendanceSummary = async () => {
        try {
            const response = await axios.get('/student-attendance/');
            setAttendanceRecords(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFlags = async () => {
        try {
            const response = await axios.get('/student-attendance/flags/');
            setFlags(response.data);
        } catch (error) {
            console.error('Error fetching attendance flags:', error);
        }
    };

    const fetchTodaysClasses = async () => {
        try {
            const response = await axios.get('/analytics/reports/daily_summary/');
            setTodaysClasses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching today classes:', error);
        }
    };

    const handleBatchSelect = async (batch) => {
        if (batch?.can_record_attendance === false) {
            notifyInfo(batch.attendance_window_message || 'Attendance is not available for this class right now.');
            return;
        }

        const selected = {
            id: batch.id || batch.batch_id,
            batch_name: batch.batch_name || batch.class,
            attendance_date: batch.attendance_date || getAcademyDateKey(),
        };
        setSelectedBatch(selected);
        try {
            // Fetch enrollments for this batch to get only enrolled students
            const stuResponse = await axios.get(`/enrollments/?batch=${selected.id}`);
            // Map enrollments to student structure expected by the UI
            const students = stuResponse.data.map(enrollment => ({
                id: enrollment.student,
                first_name: enrollment.student_name, // Serializer provides full name
                last_name: '' // Already included in student_name
            }));
            setBatchStudents(students);

            // Initialize attendance as PRESENT
            const initial = {};
            students.forEach(s => initial[s.id] = 'PRESENT');
            setAttendanceData(initial);

            setShowRecordModal(true);
        } catch (error) {
            console.error('Error fetching batch students:', error);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData({ ...attendanceData, [studentId]: status });
    };

    const handleSubmitAttendance = async () => {
        try {
            const formatted = Object.keys(attendanceData).map(id => ({
                student_id: id,
                status: attendanceData[id]
            }));

            await axios.post('/student-attendance/bulk_record/', {
                batch_id: selectedBatch.id,
                date: selectedBatch.attendance_date,
                attendance: formatted
            });

            notifySuccess('Attendance recorded successfully.');
            setShowRecordModal(false);
            fetchAttendanceSummary();
            fetchFlags();
            fetchTodaysClasses();
        } catch (error) {
            console.error('Error recording attendance:', error);
            notifyError(error.response?.data?.error || 'Failed to record attendance.');
        }
    };

    const updateIgnoredAlerts = (nextIgnored) => {
        setIgnoredAlerts(nextIgnored);
        try {
            window.localStorage.setItem(ignoredAlertsStorageKey, JSON.stringify(nextIgnored));
        } catch (error) {
            console.error('Error saving ignored attendance alerts:', error);
        }
    };

    const handleIgnoreAlert = (alertId) => {
        if (ignoredAlerts.includes(alertId)) {
            return;
        }
        updateIgnoredAlerts([...ignoredAlerts, alertId]);
        notifyInfo('Alert ignored for today.');
    };

    const handleResetIgnoredAlerts = () => {
        updateIgnoredAlerts([]);
        notifySuccess('Ignored attendance alerts were restored.');
    };

    const allAttendanceAlerts = buildAttendanceAlerts(flags);
    const visibleAttendanceAlerts = allAttendanceAlerts.filter((alert) => !ignoredAlerts.includes(alert.id));

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Attendance Management</h3>
                <div className="d-flex gap-2">
                    <select className="form-select border-0 shadow-sm" onChange={(e) => {
                        const batch = todaysClasses.find(b => b.batch_id === e.target.value);
                        if (batch) handleBatchSelect(batch);
                    }}>
                        <option value="">Record Attendance for...</option>
                        {todaysClasses.map(b => (
                            <option key={b.batch_id} value={b.batch_id}>{b.class}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="alert alert-light border rounded-4 d-flex gap-3 align-items-start mb-4">
                <i className="bi bi-journal-text fs-4 text-success"></i>
                <div className="small text-muted">
                    Students write attendance in the class notebook first. Admin and Clerk can record that notebook attendance digitally later, but it must be entered within 24 hours from the class start time.
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 bg-light border-bottom">
                            <h6 className="fw-bold m-0 text-secondary">Attendance Recording Windows</h6>
                        </div>
                        <div className="p-4">
                            {todaysClasses.length === 0 ? (
                                <div className="text-center text-muted py-3">No classes currently available for attendance recording.</div>
                            ) : (
                                <div className="row g-3">
                                    {todaysClasses.map((item) => (
                                        <div key={item.batch_id} className="col-md-6 col-xl-4">
                                            {(() => {
                                                const statusConfig = getAttendanceStatusClasses(item);
                                                return (
                                            <div className="border rounded-4 p-3 h-100 bg-light">
                                                <div className="fw-bold mb-1">{item.class}</div>
                                                <div className="small text-secondary mb-1">
                                                    {new Date(item.attendance_date).toLocaleDateString()} {item.is_today ? '(Today)' : '(Previous class)'}
                                                </div>
                                                <div className="small text-muted mb-1">{item.start_time} - {item.end_time}</div>
                                                <div className="small text-muted mb-3">{item.coach}</div>
                                                <div className={`small fw-bold mb-3 ${statusConfig.textClass}`}>{getAttendanceStatusLabel(item)}</div>
                                                <button
                                                    className={`btn btn-sm fw-bold ${statusConfig.buttonClass}`}
                                                    style={statusConfig.buttonStyle}
                                                    onClick={() => handleBatchSelect(item)}
                                                >
                                                    {item.can_record_attendance ? 'Open now' : 'Unavailable'}
                                                </button>
                                            </div>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Attendance Alerts</h6>
                        </div>
                        <div className="p-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                                <div className="small text-muted">
                                    Classes that may have missing or inconsistent attendance records.
                                </div>
                                {ignoredAlerts.length > 0 && (
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={handleResetIgnoredAlerts}
                                    >
                                        Reset Ignored
                                    </button>
                                )}
                            </div>
                            {visibleAttendanceAlerts.length === 0 ? (
                                <div className="text-center py-3 text-muted">
                                    {allAttendanceAlerts.length === 0
                                        ? 'No attendance alerts for today.'
                                        : 'All attendance alerts are ignored for today.'}
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {visibleAttendanceAlerts.map((alert) => (
                                        <div key={alert.id} className="col-md-6">
                                            <div className={`border rounded-3 p-3 ${alert.cardClass} h-100 d-flex flex-column`}>
                                                <div className="fw-bold">{alert.title}</div>
                                                <div className="small text-muted mb-3">{alert.description}</div>
                                                <div className="mt-auto">
                                                    <button
                                                        className="btn btn-sm btn-outline-dark"
                                                        onClick={() => handleIgnoreAlert(alert.id)}
                                                    >
                                                        Ignore
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="p-3 bg-light border-bottom">
                            <h6 className="fw-bold m-0 text-secondary">Recent Attendance Records</h6>
                        </div>
                        <div className="table-responsive p-3">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="text-secondary small fw-bold">
                                    <tr>
                                        <th className="border-0 ps-4">Student</th>
                                        <th className="border-0">Batch</th>
                                        <th className="border-0">Date</th>
                                        <th className="border-0 pe-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRecords.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4">No records found.</td></tr>
                                    ) : (
                                        attendanceRecords.slice(0, 10).map((record) => (
                                            <tr key={record.id}>
                                                <td className="ps-4 fw-bold">{record.student_name}</td>
                                                <td>{record.batch_name}</td>
                                                <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                                                <td className="pe-4">
                                                    <span className={`badge rounded-pill ${record.status === 'PRESENT' ? 'bg-success' : 'bg-danger'}`}
                                                        style={{ backgroundColor: record.status === 'PRESENT' ? '#6c9343' : '' }}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>
                        Record Attendance: {selectedBatch?.batch_name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table hover align="middle">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchStudents.map(student => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td>{student.first_name} {student.last_name}</td>
                                    <td className="text-center">
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                className={`btn ${attendanceData[student.id] === 'PRESENT' ? 'btn-success' : 'btn-outline-success'}`}
                                                style={attendanceData[student.id] === 'PRESENT' ? { backgroundColor: '#6c9343', border: 'none' } : {}}
                                                onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                            >Present</button>
                                            <button
                                                className={`btn ${attendanceData[student.id] === 'ABSENT' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                            >Absent</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRecordModal(false)}>Cancel</Button>
                    <Button variant="success" style={{ backgroundColor: '#6c9343', border: 'none' }} onClick={handleSubmitAttendance}>
                        Submit Attendance
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Attendance;
