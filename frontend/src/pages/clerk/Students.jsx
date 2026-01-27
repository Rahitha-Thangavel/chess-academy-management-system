import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button } from 'react-bootstrap';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('database');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Add Student Form
    const [newStudent, setNewStudent] = useState({
        first_name: '', last_name: '', date_of_birth: '', grade_level: '', school: '', parent_username: ''
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formError, setFormError] = useState(null);

    // View Details
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [activeTab]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/students/');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            await axios.post('/students/', newStudent);
            // Close add modal
            setShowAddModal(false);
            // Reset form
            setNewStudent({ first_name: '', last_name: '', date_of_birth: '', grade_level: '', school: '', parent_username: '' });
            // Refresh list
            fetchStudents();
            // Show success modal
            setSuccessMessage('Student registered successfully! Waiting for Admin approval.');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error adding student:', error);
            const errorMsg = error.response?.data?.parent_username?.[0] ||
                error.response?.data?.error ||
                'Failed to register student';
            setFormError(errorMsg);
        }
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Student Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }} onClick={() => { setShowAddModal(true); setFormError(null); }}>
                    <i className="bi bi-person-plus-fill me-2"></i> Register New Student
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Student Database</h6>
                </div>

                <div className="p-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th className="py-3 ps-4 border-0">ID</th>
                                    <th className="py-3 border-0">Name</th>
                                    <th className="py-3 border-0">Grade</th>
                                    <th className="py-3 border-0">School</th>
                                    <th className="py-3 border-0">Parent</th>
                                    <th className="py-3 border-0">Status</th>
                                    <th className="py-3 pe-4 text-end border-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                                ) : students.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-4 text-muted">No students found.</td></tr>
                                ) : (
                                    students.map((stu) => (
                                        <tr key={stu.id}>
                                            <td className="ps-4 fw-bold text-dark">{stu.id}</td>
                                            <td className="fw-bold text-dark">{stu.first_name} {stu.last_name}</td>
                                            <td className="text-secondary">{stu.grade_level}</td>
                                            <td className="text-secondary">{stu.school}</td>
                                            <td className="text-secondary">{stu.parent_name || 'N/A'}</td>
                                            <td className="">
                                                <span className={`badge px-3 py-2 rounded-pill fw-normal ${stu.status === 'ACTIVE' ? 'bg-success' : 'bg-warning text-dark'}`}
                                                    style={{ backgroundColor: stu.status === 'ACTIVE' ? '#6c9343 !important' : '' }}>
                                                    {stu.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => handleViewDetails(stu)}
                                                >
                                                    <i className="bi bi-eye me-1"></i> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Register New Student</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="alert alert-info small mb-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Students registered by Clerks require Admin approval before becoming active.
                    </div>

                    {formError && (
                        <div className="alert alert-danger small mb-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleAddStudent}>
                        <h6 className="text-secondary fw-bold mb-3">Parent Information</h6>
                        <div className="mb-4">
                            <label className="form-label">Parent Username <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter parent's username to link student"
                                value={newStudent.parent_username}
                                onChange={(e) => setNewStudent({ ...newStudent, parent_username: e.target.value })}
                                required
                            />
                        </div>

                        <h6 className="text-secondary fw-bold mb-3">Student Information</h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newStudent.first_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newStudent.last_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={newStudent.date_of_birth}
                                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Grade Level</label>
                                <select
                                    className="form-select"
                                    value={newStudent.grade_level}
                                    onChange={(e) => setNewStudent({ ...newStudent, grade_level: e.target.value })}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {[...Array(13)].map((_, i) => (
                                        <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">School</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newStudent.school}
                                    onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button type="submit" className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>
                                Register Student
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Body className="text-center p-5">
                    <div className="mb-4">
                        <i className="bi bi-check-circle-fill text-success display-1"></i>
                    </div>
                    <h4 className="fw-bold mb-3">Success!</h4>
                    <p className="text-muted mb-4">{successMessage}</p>
                    <Button variant="success" onClick={() => setShowSuccessModal(false)} className="px-4">
                        Okay
                    </Button>
                </Modal.Body>
            </Modal>

            {/* View Details Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Student Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudent && (
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Full Name</span>
                                <span className="fw-bold text-dark">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Student ID</span>
                                <span className="text-dark font-monospace">{selectedStudent.id}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Date of Birth</span>
                                <span className="text-dark">{selectedStudent.date_of_birth}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">School</span>
                                <span className="text-dark">{selectedStudent.school || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Grade Level</span>
                                <span className="text-dark">{selectedStudent.grade_level}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Parent</span>
                                <span className="text-dark">{selectedStudent.parent_name || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Joined On</span>
                                <span className="text-dark">{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-secondary fw-bold">Status</span>
                                <span className={`badge ${selectedStudent.status === 'ACTIVE' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {selectedStudent.status}
                                </span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Students;
