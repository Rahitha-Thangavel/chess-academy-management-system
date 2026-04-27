/**
 * Page component: Studentmanagement.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button } from 'react-bootstrap';
import { useAppUI } from '../../contexts/AppUIContext';

const StudentManagement = ({
    showRegistrationQueue = true,
    addButtonLabel = 'Add New Student',
    addModalTitle = 'Add New Student',
    addSuccessMessage = 'Student added successfully.',
}) => {
    const { confirm, notifySuccess, notifyError } = useAppUI();
    const [activeTab, setActiveTab] = useState('database');
    const [students, setStudents] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState([]);
    const [assignBatchId, setAssignBatchId] = useState('');

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');

    // Debounced values
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedSchool, setDebouncedSchool] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSchool(schoolFilter);
        }, 500);
        return () => clearTimeout(handler);
    }, [schoolFilter]);

    // Add Student Form
    const [newStudent, setNewStudent] = useState({
        nic: '', first_name: '', last_name: '', date_of_birth: '', grade_level: '', school: '', parent_username: ''
    });

    useEffect(() => {
        fetchStudents();
        if (showRegistrationQueue) {
            fetchPendingStudents();
        } else {
            setPendingStudents([]);
            setLoading(false);
        }
        fetchBatches();
    }, [debouncedSearch, statusFilter, batchFilter, gradeFilter, debouncedSchool, activeTab, showRegistrationQueue]);

    const fetchBatches = async () => {
        try {
            const response = await axios.get('/batches/');
            setBatches(response.data);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const params = new URLSearchParams();

            if (activeTab === 'database' && !statusFilter) {
                params.append('status', 'ACTIVE');
            }
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (statusFilter) params.append('status', statusFilter);
            if (batchFilter) params.append('enrollments__batch', batchFilter);
            if (gradeFilter) params.append('grade_level', gradeFilter);
            if (debouncedSchool) params.append('school__icontains', debouncedSchool);

            const queryString = params.toString();
            const response = await axios.get(`/students/${queryString ? '?' + queryString : ''}`);
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
            notifySuccess('Student approved successfully.');
            setShowModal(false);
        } catch (error) {
            console.error('Error approving student:', error);
            notifyError('Failed to approve student.');
        }
    };

    const handleReject = async (id) => {
        const shouldReject = await confirm({
            title: 'Reject Student Registration',
            message: 'Are you sure you want to reject this student registration?',
            confirmLabel: 'Reject',
            variant: 'danger',
        });
        if (!shouldReject) return;
        try {
            await axios.post(`/students/${id}/reject/`);
            fetchPendingStudents();
            notifySuccess('Student rejected.');
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting student:', error);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/students/', newStudent);
            notifySuccess(addSuccessMessage);
            setShowAddModal(false);
            setNewStudent({ nic: '', first_name: '', last_name: '', date_of_birth: '', grade_level: '', school: '', parent_username: '' });
            fetchStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            notifyError(
                error.response?.data?.nic?.[0] ||
                error.response?.data?.parent_username?.[0] ||
                'Failed to add student.'
            );
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setBatchFilter('');
        setGradeFilter('');
        setSchoolFilter('');
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleOpenAssignBatch = (student) => {
        setSelectedStudent(student);
        setAssignBatchId('');
        setShowAssignModal(true);
    };

    const handleAssignBatch = async () => {
        if (!selectedStudent || !assignBatchId) {
            notifyError('Select a batch to assign.');
            return;
        }
        try {
            await axios.post('/enrollments/', {
                student: selectedStudent.id,
                batch: assignBatchId,
            });
            notifySuccess('Student assigned to batch successfully.');
            setShowAssignModal(false);
            setShowModal(false);
            fetchStudents();
        } catch (error) {
            console.error('Error assigning batch:', error);
            notifyError(error.response?.data?.error || 'Failed to assign batch.');
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Student Management</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }} onClick={() => setShowAddModal(true)}>
                    <i className="bi bi-person-plus-fill me-2"></i> {addButtonLabel}
                </button>
            </div>

            {/* Registration Queue Section */}
            {showRegistrationQueue && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
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
            )}

            {/* Student Database Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Student Database</h6>
                </div>

                <div className="p-4">
                    {/* Search & Filter */}
                    <div className="row g-3 mb-4 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Search</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control border-end-0 bg-light"
                                    placeholder="Search by name, ID, NIC, school..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <span className="input-group-text bg-light border-start-0"><i className="bi bi-search"></i></span>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Status</label>
                            <select
                                className="form-select bg-light border-0"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Batch</label>
                            <select
                                className="form-select bg-light border-0"
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                            >
                                <option value="">All Batches</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.batch_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Grade</label>
                            <select
                                className="form-select bg-light border-0"
                                value={gradeFilter}
                                onChange={(e) => setGradeFilter(e.target.value)}
                            >
                                <option value="">All Grades</option>
                                {[...Array(13)].map((_, i) => (
                                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-bold">School</label>
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder="Filter by school..."
                                value={schoolFilter}
                                onChange={(e) => setSchoolFilter(e.target.value)}
                            />
                        </div>

                        <div className="col-md-1">
                            <button
                                className="btn btn-light border w-100 fw-bold"
                                onClick={handleResetFilters}
                                title="Reset Filters"
                                style={{ height: '38px' }}
                            >
                                <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <style>
                            {`
                                .student-table {
                                    border-collapse: collapse;
                                    width: 100%;
                                }
                                .student-table th, .student-table td {
                                    border: 1px solid #dee2e6;
                                }
                                .student-table th {
                                    text-align: center !important;
                                    vertical-align: middle;
                                }
                                .student-table td {
                                    vertical-align: middle;
                                }
                            `}
                        </style>
                        <table className="table table-hover align-middle mb-0 student-table">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th className="py-3 ps-4" style={{ width: '10%' }}>ID</th>
                                    <th className="py-3" style={{ width: '15%' }}>Name</th>
                                    <th className="py-3" style={{ width: '10%' }}>Class/Grade</th>
                                    <th className="py-3" style={{ width: '15%' }}>School</th>
                                    <th className="py-3" style={{ width: '15%' }}>Batch</th>
                                    <th className="py-3 pe-4" style={{ width: '10%' }}>Status</th>
                                    <th className="py-3 pe-4" style={{ width: '10%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">No students found.</td>
                                    </tr>
                                ) : (
                                    students.map((stu) => (
                                        <tr key={stu.id}>
                                            <td className="ps-4 text-center">
                                                <div className="fw-bold text-dark">{stu.id}</div>
                                            </td>
                                            <td className="fw-bold text-dark">{stu.first_name} {stu.last_name}</td>
                                            <td className="text-secondary text-center">{stu.grade_level || 'N/A'}</td>
                                            <td className="text-secondary">{stu.school || 'N/A'}</td>
                                            <td className="text-secondary">
                                                {stu.batch_names && stu.batch_names.length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {stu.batch_names.map((bn, idx) => (
                                                            <span key={idx} className="badge bg-info text-white" style={{ fontSize: '0.75rem' }}>{bn}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">Not in any batch</span>
                                                )}
                                            </td>
                                            <td className="text-center pe-4">
                                                <span className={`badge px-3 py-2 rounded-pill fw-normal ${stu.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}
                                                    style={{ backgroundColor: stu.status === 'ACTIVE' ? '#6c9343 !important' : '' }}>
                                                    {stu.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-sm btn-light border fw-bold" onClick={() => handleViewDetails(stu)}>View</button>
                                                    {stu.status === 'ACTIVE' && (
                                                        <button className="btn btn-sm btn-outline-success fw-bold" onClick={() => handleOpenAssignBatch(stu)}>
                                                            Add to Batch
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
                                <span className="text-secondary fw-bold">NIC</span>
                                <span className="text-dark">{selectedStudent.nic || 'N/A'}</span>
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
                    {selectedStudent?.status === 'ACTIVE' && (
                        <Button variant="success" style={{ backgroundColor: '#6c9343', border: 'none' }} onClick={() => handleOpenAssignBatch(selectedStudent)}>
                            Add to Batch
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Assign Student to Batch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <div className="small text-secondary mb-2">Student</div>
                        <div className="fw-bold">{selectedStudent?.first_name} {selectedStudent?.last_name}</div>
                    </div>
                    <div>
                        <label className="form-label small fw-bold">Select Batch</label>
                        <select
                            className="form-select"
                            value={assignBatchId}
                            onChange={(e) => setAssignBatchId(e.target.value)}
                        >
                            <option value="">Choose a batch...</option>
                            {batches
                                .filter((batch) => batch.status === 'ACTIVE')
                                .filter((batch) => !selectedStudent?.enrollments?.some((enrollment) => enrollment.batch === batch.id))
                                .map((batch) => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.batch_name} ({batch.batch_type === 'ONE_TIME' ? batch.exact_date : batch.schedule_day} {String(batch.start_time).slice(0, 5)}-{String(batch.end_time).slice(0, 5)})
                                    </option>
                                ))}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                    <Button variant="success" style={{ backgroundColor: '#6c9343', border: 'none' }} onClick={handleAssignBatch}>
                        Assign Batch
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Student Modal (Admin) */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>{addModalTitle}</Modal.Title>
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
                                <label className="form-label">NIC <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newStudent.nic}
                                    onChange={(e) => setNewStudent({ ...newStudent, nic: e.target.value })}
                                    placeholder="Enter student NIC"
                                    required
                                />
                            </div>
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
