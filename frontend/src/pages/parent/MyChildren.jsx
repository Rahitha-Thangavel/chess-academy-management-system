import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { Modal, Button } from 'react-bootstrap';

const MyChildren = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await axios.get('/students/my_children/');
            setChildren(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching children:', error);
            setError(error.response?.data?.error || 'Failed to load children.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (child) => {
        setSelectedChild(child);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        if (status === 'ACTIVE') {
            return (
                <div className="badge rounded-pill d-flex align-items-center gap-2 px-3 py-2" style={{ backgroundColor: '#e6f4ea', color: '#1e7e34' }}>
                    Active <i className="bi bi-check-square-fill"></i>
                </div>
            );
        } else if (status === 'PENDING') {
            return (
                <div className="badge rounded-pill d-flex align-items-center gap-2 px-3 py-2 bg-warning-subtle text-warning-emphasis">
                    Pending <i className="bi bi-hourglass-split"></i>
                </div>
            );
        } else {
            return (
                <div className="badge rounded-pill d-flex align-items-center gap-2 px-3 py-2 bg-danger-subtle text-danger">
                    {status}
                </div>
            );
        }
    };

    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>My Children</h3>
                <button
                    className="btn fw-bold text-white px-4 py-2 shadow-sm"
                    style={{ backgroundColor: '#6c9343' }}
                    onClick={() => navigate('/parent/add-child')}
                >
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Register a New Student
                </button>
            </div>

            {children.length === 0 ? (
                <div className="text-center p-5 bg-light rounded-3">
                    <p className="text-muted">No children registered yet.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {children.map((child) => (
                        <div key={child.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold h4 m-0"
                                        style={{ width: '60px', height: '60px', backgroundColor: '#6c9343' }}
                                    >
                                        {child.first_name.charAt(0)}
                                    </div>
                                    {getStatusBadge(child.status)}
                                </div>

                                <h5 className="fw-bold mb-1">{child.first_name} {child.last_name}</h5>
                                <p className="text-muted mb-4">{child.grade_level || 'N/A'}</p>

                                <div className="d-flex flex-column gap-3 mb-4">
                                    <div className="d-flex align-items-center gap-3 text-secondary">
                                        <i className="bi bi-building"></i>
                                        <span>School: {child.school || 'N/A'}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 text-secondary">
                                        <i className="bi bi-calendar"></i>
                                        <span>Joined: {new Date(child.enrollment_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn text-white w-100 py-2 rounded-2"
                                    style={{ backgroundColor: '#6c9343' }}
                                    onClick={() => handleViewDetails(child)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Student Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedChild && (
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Full Name</span>
                                <span className="fw-bold text-dark">{selectedChild.first_name} {selectedChild.last_name}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Date of Birth</span>
                                <span className="text-dark">{selectedChild.date_of_birth}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">School</span>
                                <span className="text-dark">{selectedChild.school || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Grade Level</span>
                                <span className="text-dark">{selectedChild.grade_level}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="text-secondary fw-bold">Joined On</span>
                                <span className="text-dark">{new Date(selectedChild.enrollment_date).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-secondary fw-bold">Status</span>
                                <span className="badge bg-success">{selectedChild.status}</span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MyChildren;
