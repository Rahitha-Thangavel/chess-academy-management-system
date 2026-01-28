import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form, Table } from 'react-bootstrap';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [dues, setDues] = useState([]);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [calculatedFee, setCalculatedFee] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentType, setPaymentType] = useState('MONTHLY');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
        fetchDues();
        fetchStudents();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('/payments/');
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const fetchDues = async () => {
        try {
            const response = await axios.get('/payments/dues/');
            setDues(response.data);
        } catch (error) {
            console.error('Error fetching dues:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/students/?status=ACTIVE');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleStudentChange = async (studentId) => {
        setSelectedStudent(studentId);
        if (!studentId) {
            setCalculatedFee(null);
            return;
        }
        try {
            const now = new Date();
            const response = await axios.get(`/payments/calculate_fee/?student_id=${studentId}&month=${now.getMonth() + 1}`);
            setCalculatedFee(response.data);
        } catch (error) {
            console.error('Error calculating fee:', error);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/payments/', {
                student: selectedStudent,
                amount: calculatedFee.calculated_fee,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: paymentMethod,
                payment_type: paymentType
            });
            alert('Payment recorded successfully!');
            setShowRecordModal(false);
            fetchPayments();
            fetchDues();
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment.');
        }
    };

    const totalRevenue = payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Payment & Finance</h3>
                <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }} onClick={() => setShowRecordModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Record New Payment
                </button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Total Monthly Revenue</small>
                        <h3 className="fw-bold m-0">LKR {totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Pending Dues (Students)</small>
                        <h3 className="fw-bold m-0 text-danger">{dues.length}</h3>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">Incomplete Monthly Payments</h6>
                </div>
                <div className="table-responsive p-3">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary small fw-bold">
                            <tr>
                                <th className="py-3 ps-4 border-0">Student</th>
                                <th className="py-3 border-0">Parent</th>
                                <th className="py-3 border-0">Phone</th>
                                <th className="py-3 pe-4 text-end border-0">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dues.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-4">All students have paid for this month.</td></tr>
                            ) : (
                                dues.map((row) => (
                                    <tr key={row.id}>
                                        <td className="ps-4 fw-bold">{row.name}</td>
                                        <td>{row.parent}</td>
                                        <td>{row.parent_phone}</td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-success" onClick={() => {
                                                setSelectedStudent(row.id);
                                                handleStudentChange(row.id);
                                                setShowRecordModal(true);
                                            }}>Record Payment</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">Recent Payment History</h6>
                </div>
                <div className="table-responsive p-3">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Student</th>
                                <th>Type</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.slice(0, 10).map((row) => (
                                <tr key={row.id}>
                                    <td className="ps-4 fw-bold">{row.student_name}</td>
                                    <td>{row.payment_type}</td>
                                    <td>{row.payment_method}</td>
                                    <td className="fw-bold text-success">LKR {row.amount}</td>
                                    <td>{new Date(row.payment_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Record Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleRecordPayment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Student</Form.Label>
                            <Form.Select required value={selectedStudent} onChange={(e) => handleStudentChange(e.target.value)}>
                                <option value="">Select Student...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {calculatedFee && (
                            <div className="alert alert-info py-2 small mb-3">
                                <strong>Fee Calculation:</strong><br />
                                Base: LKR {calculatedFee.base_fee}<br />
                                Calculated: LKR {calculatedFee.calculated_fee}<br />
                                <span className="text-muted">(Includes {calculatedFee.sibling_count >= 2 ? 'sibling discount' : 'no sibling discount'} and {calculatedFee.attendance_count <= 4 ? 'partial attendance discount' : 'full attendance fee'})</span>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Payment Type</Form.Label>
                            <Form.Select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                                <option value="MONTHLY">Monthly Fee</option>
                                <option value="TOURNAMENT">Tournament Fee</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="CASH">Cash</option>
                                <option value="CARD">Card</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowRecordModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={!calculatedFee} className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>Record Payment</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Payments;
