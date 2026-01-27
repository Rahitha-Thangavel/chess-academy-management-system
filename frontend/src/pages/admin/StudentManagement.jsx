import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button } from 'react-bootstrap';

const StudentManagement = () => {
    const [activeTab, setActiveTab] = useState('database');
    const [students, setStudents] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [filters, setFilters] = useState({ grade_level: '', school: '' });

    // Add Student Form
    const [newStudent, setNewStudent] = useState({
        first_name: '', last_name: '', date_of_birth: '', grade_level: '', school: '', parent_username: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchPendingStudents();
    }, [searchQuery, statusFilter]);

    const fetchStudents = async () => {
        try {
            let query = '/students/?';
            if (activeTab === 'database') query += 'status=ACTIVE&';
            if (searchQuery) query += `search=${searchQuery}&`;
            if (statusFilter) query += `status=${statusFilter}&`;

            const response = await axios.get(query);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchPendingStudents = async () => {
        try {
            const response = await axios.get('/students/pending/');
            setPendingStudents(response.data);
        } catch (error) {
            console.error('Error fetching pending students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/students/${id}/approve/`);
            fetchStudents();
            fetchPendingStudents();
            alert('Student approved successfully!');
            setShowModal(false);
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Failed to approve student.');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this student?')) return;
        try {
            await axios.post(`/students/${id}/reject/`);
            fetchPendingStudents();
            alert('Student rejected.');
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting student:', error);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/students/', newStudent);
            alert('Student added successfully!');
            setShowAddModal(false);
            setNewStudent({ first_name: '', last_name: '', date_of_birth: '', grade_level: '', school: '', parent_username: '' });
            fetchStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            alert(error.response?.data?.parent_username?.[0] || 'Failed to add student');
        }
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Student Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }} onClick={() => setShowAddModal(true)}>
                    <i className="bi bi-person-plus-fill me-2"></i> Add New Student
                </button>
            </div>

            {/* Student Database Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Student Database</h6>
                </div>

                <div className="p-4">
                    {/* Search & Filter */}
                    <div className="d-flex gap-3 mb-4">
                        <div className="input-group" style={{ maxWidth: '300px' }}>
                            <input
                                type="text"
                                className="form-control border-end-0 bg-light"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="input-group-text bg-light border-start-0"><i className="bi bi-search"></i></span>
                        </div>
                        {/* Status Filter */}
                        <select
                            className="form-select bg-light border-0"
                            style={{ maxWidth: '150px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th className="py-3 ps-4 border-0" style={{ width: '15%' }}>ID</th>
                                    <th className="py-3 border-0" style={{ width: '20%' }}>Name</th>
                                    <th className="py-3 border-0" style={{ width: '15%' }}>Class/Grade</th>
                                    <th className="py-3 border-0" style={{ width: '20%' }}>School</th>
                                    <th className="py-3 pe-4 text-end border-0" style={{ width: '15%' }}>Status</th>
                                    <th className="py-3 pe-4 text-center border-0" style={{ width: '15%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">No students found.</td>
                                    </tr>
                                ) : (
                                    students.map((stu) => (
                                        <tr key={stu.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{stu.id}</div>
                                            </td>
                                            <td className="fw-bold text-dark">{stu.first_name} {stu.last_name}</td>
                                            <td className="text-secondary">{stu.grade_level || 'N/A'}</td>
                                            <td className="text-secondary">{stu.school || 'N/A'}</td>
                                            <td className="text-end pe-4">
                                                <span className={`badge px-3 py-2 rounded-pill fw-normal ${stu.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}
                                                    style={{ backgroundColor: stu.status === 'ACTIVE' ? '#6c9343 !important' : '' }}>
                                                    {stu.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-light border fw-bold" onClick={() => handleViewDetails(stu)}>View</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Registration Queue Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">Registration Queue</h6>
                </div>

                <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold m-0">Pending Approvals</h6>
                        <span className="badge bg-warning text-white rounded-pill px-3">{pendingStudents.length} Pending</span>
                    </div>

                    {pendingStudents.length === 0 ? (
                        <div className="text-center py-4 text-muted border rounded bg-light">
                            No pending registrations.
                        </div>
                    ) : (
                        pendingStudents.map((student) => (
                            <div key={student.id} className="p-4 rounded-3 d-flex justify-content-between align-items-start mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                                <div>
                                    <h6 className="fw-bold m-0 mb-1">Student: {student.first_name} {student.last_name}</h6>
                                    <p className="text-secondary small m-0 mb-3">
                                        Applied: {new Date(student.enrollment_date).toLocaleDateString()} <br />
                                        Grade: {student.grade_level} <br />
                                        <span className="text-dark fw-bold">Registered by: {student.created_by_name || 'Parent'}</span>
                                    </p>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm text-white fw-bold px-3" style={{ backgroundColor: '#6c9343' }} onClick={() => handleApprove(student.id)}>Approve</button>
                                        <button className="btn btn-sm btn-danger text-white fw-bold px-3" onClick={() => handleReject(student.id)}>Reject</button>
                                        <button className="btn btn-sm btn-white border fw-bold px-3" onClick={() => handleViewDetails(student)}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Student Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
                                <span className="text-secondary fw-bold">Applied On</span>
                                <span className="text-dark">{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Parent Name</span>
                                <span className="text-dark">{selectedStudent.parent_name}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-secondary fw-bold">Current Status</span>
                                <span className="badge bg-warning text-dark">{selectedStudent.status}</span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedStudent?.status === 'PENDING' && (
                        <>
                            <Button variant="danger" onClick={() => selectedStudent && handleReject(selectedStudent.id)}>
                                Reject
                            </Button>
                            <Button variant="success" style={{ backgroundColor: '#6c9343', border: 'none' }} onClick={() => selectedStudent && handleApprove(selectedStudent.id)}>
                                Approve Student
                            </Button>
                        </>
                    )}
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Add Student Modal (Admin) */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Add New Student</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
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
                            <div className="form-text">The parent account must exist before adding a student.</div>
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
                                Add Student
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default StudentManagement;
