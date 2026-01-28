import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('daily recording');
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    // Recording State
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [students, setStudents] = useState([]);
    const [markingAttendance, setMarkingAttendance] = useState({}); // {studentId: status}
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAttendanceSummary();
    }, [showAll]);

    const fetchAttendanceSummary = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/analytics/reports/daily_summary/?all=${showAll}`);
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching attendance summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRecord = async (batch) => {
        setSelectedBatch(batch);
        setShowRecordModal(true);
        setLoading(true);
        try {
            // Fetch students enrolled in this batch
            const enrollResponse = await axios.get(`/batches/batch-enrollments/?batch=${batch.batch_id}`);
            const studentList = enrollResponse.data.map(e => ({
                id: e.student,
                name: e.student_name, // Assuming serializer includes this
                id_display: e.student_id_display // Assuming serializer includes this
            }));

            // Fetch existing attendance for today
            const today = new Date().toISOString().split('T')[0];
            const attResponse = await axios.get(`/attendance/student-attendance/?batch=${batch.batch_id}&attendance_date=${today}`);

            const initialMarkings = {};
            studentList.forEach(s => {
                const existing = attResponse.data.find(a => a.student === s.id);
                initialMarkings[s.id] = existing ? existing.status : 'PRESENT'; // Default to present if not marked
            });

            setStudents(studentList);
            setMarkingAttendance(initialMarkings);
        } catch (error) {
            console.error('Error fetching batch students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setMarkingAttendance({
            ...markingAttendance,
            [studentId]: status
        });
    };

    const handleSubmitAttendance = async () => {
        setSubmitting(true);
        try {
            const attendancePayload = Object.entries(markingAttendance).map(([id, status]) => ({
                student_id: id,
                status: status
            }));

            await axios.post('/attendance/student-attendance/bulk_record/', {
                batch_id: selectedBatch.batch_id,
                date: new Date().toISOString().split('T')[0],
                attendance: attendancePayload
            });

            toast.success('Attendance recorded successfully!');
            setShowRecordModal(false);
            fetchAttendanceSummary();
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error('Failed to record attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Attendance Management</h3>

            <div className="d-flex justify-content-end mb-3">
                <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                    <i className="bi bi-calendar"></i>
                    <span className="small">{new Date().toLocaleDateString()}</span>
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
                    <div className="p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
                        <div>
                            <h5 className="fw-bold m-0">{showAll ? 'All Scheduled Batches' : "Today's Attendance Summary"}</h5>
                            <small className="text-muted">{showAll ? 'Listing all batches in the system' : formatDate(new Date())}</small>
                        </div>
                        <button
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${showAll ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setShowAll(!showAll)}
                            style={showAll ? { backgroundColor: '#6c9343', borderColor: '#6c9343' } : { color: '#6c9343', borderColor: '#6c9343' }}
                        >
                            <i className={`bi bi-${showAll ? 'filter' : 'list-ul'} me-2`}></i>
                            {showAll ? 'Showing All' : 'Show All Batches'}
                        </button>
                    </div>

                    <div className="table-responsive">
                        {loading && !showRecordModal ? (
                            <div className="p-4 text-center text-muted">Loading attendance summary...</div>
                        ) : (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-secondary small fw-bold">
                                    <tr>
                                        <th className="py-3 ps-4 border-0">Class</th>
                                        <th className="py-3 border-0">Coach</th>
                                        <th className="py-3 border-0">Schedule</th>
                                        <th className="py-3 border-0">Attendance</th>
                                        <th className="py-3 pe-4 text-end border-0">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-bold">{row.class}</td>
                                            <td className="text-secondary">{row.coach}</td>
                                            <td className="text-secondary small">{row.schedule}</td>
                                            <td className="small fw-bold text-secondary">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className={`rounded-circle bg-${row.color}`} style={{ width: '8px', height: '8px' }}></div>
                                                    {row.status}
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm text-white fw-bold px-3"
                                                    style={{ backgroundColor: '#6c9343' }}
                                                    onClick={() => handleOpenRecord(row)}
                                                >
                                                    Record
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {summary.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted small">No classes scheduled for today.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-clock-history h1 d-block mb-3"></i>
                    <p>Attendance History Viewer to be implemented.</p>
                </div>
            )}

            {/* Record Attendance Modal */}
            <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Mark Attendance: {selectedBatch?.class}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="text-secondary small">
                            <i className="bi bi-person-badge me-1"></i> Coach: <strong>{selectedBatch?.coach}</strong>
                        </div>
                        <div className="small fw-bold text-success">
                            {formatDate(new Date())}
                        </div>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '400px' }}>
                        <table className="table table-hover">
                            <thead className="sticky-top bg-white small fw-bold text-secondary">
                                <tr>
                                    <th>Student</th>
                                    <th className="text-center">Present</th>
                                    <th className="text-center">Absent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-4">Loading students...</td></tr>
                                ) : students.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-4 text-muted">No students enrolled in this batch.</td></tr>
                                ) : students.map(student => (
                                    <tr key={student.id}>
                                        <td className="py-3">
                                            <div className="fw-bold">{student.name}</div>
                                            <div className="text-muted small">{student.id_display || student.id}</div>
                                        </td>
                                        <td className="text-center py-3">
                                            <input
                                                type="radio"
                                                className="form-check-input border-success"
                                                name={`att-${student.id}`}
                                                checked={markingAttendance[student.id] === 'PRESENT'}
                                                onChange={() => handleStatusChange(student.id, 'PRESENT')}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </td>
                                        <td className="text-center py-3">
                                            <input
                                                type="radio"
                                                className="form-check-input border-danger"
                                                name={`att-${student.id}`}
                                                checked={markingAttendance[student.id] === 'ABSENT'}
                                                onChange={() => handleStatusChange(student.id, 'ABSENT')}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" className="fw-bold px-4" onClick={() => setShowRecordModal(false)}>Cancel</Button>
                    <Button
                        className="text-white fw-bold px-4"
                        style={{ backgroundColor: '#6c9343', border: 'none' }}
                        onClick={handleSubmitAttendance}
                        disabled={submitting || loading || students.length === 0}
                    >
                        {submitting ? 'Saving...' : 'Save Attendance'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Attendance;
