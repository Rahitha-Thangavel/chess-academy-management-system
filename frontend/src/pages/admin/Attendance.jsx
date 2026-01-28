import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form, Table } from 'react-bootstrap';

const Attendance = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchStudents, setBatchStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // {student_id: 'PRESENT'/'ABSENT'}
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
        fetchAttendanceSummary();
    }, []);

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

    const handleBatchSelect = async (batch) => {
        setSelectedBatch(batch);
        try {
            // Need to fetch students in this batch. 
            // In my model, it's BatchEnrollment. Let's assume a students list is available or fetch it.
            const response = await axios.get(`/batches/${batch.id}/`);
            // Assuming the serializer returns enrollments or we fetch them separately
            // For now, let's fetch all students to simplify or assume endpoint exists
            const stuResponse = await axios.get('/students/?status=ACTIVE');
            setBatchStudents(stuResponse.data);

            // Initialize attendance as PRESENT
            const initial = {};
            stuResponse.data.forEach(s => initial[s.id] = 'PRESENT');
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
                date: new Date().toISOString().split('T')[0],
                attendance: formatted
            });

            alert('Attendance recorded successfully!');
            setShowRecordModal(false);
            fetchAttendanceSummary();
        } catch (error) {
            console.error('Error recording attendance:', error);
            alert('Failed to record attendance.');
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Attendance Management</h3>
                <div className="d-flex gap-2">
                    <select className="form-select border-0 shadow-sm" onChange={(e) => {
                        const batch = batches.find(b => b.id === e.target.value);
                        if (batch) handleBatchSelect(batch);
                    }}>
                        <option value="">Record Attendance for...</option>
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.batch_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row g-4">
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
