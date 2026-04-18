import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const Payments = () => {
    const [activeTab, setActiveTab] = useState('fee collection');
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [dues, setDues] = useState([]);
    const [payments, setPayments] = useState([]);
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('2000');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchParents();
        fetchDues();
        fetchPayments();
    }, []);

    useEffect(() => {
        if (selectedParent) {
            fetchStudents(selectedParent);
        } else {
            setStudents([]);
        }
    }, [selectedParent]);

    const fetchParents = async () => {
        try {
            const response = await axios.get('/auth/users/?role=PARENT');
            setParents(Array.isArray(response.data) ? response.data : (response.data?.results || []));
        } catch (error) {
            console.error('Error fetching parents:', error);
        }
    };

    const fetchStudents = async (parentId) => {
        try {
            const response = await axios.get(`/students/?parent_user=${parentId}&status=ACTIVE`);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchDues = async () => {
        try {
            const response = await axios.get('/payments/dues/');
            setDues(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching dues:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await axios.get('/payments/');
            setPayments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const recentPayments = useMemo(
        () => payments
            .slice()
            .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
            .slice(0, 10),
        [payments]
    );

    const handleRecordPayment = async () => {
        if (!selectedStudent || !amount) {
            toast.error('Please select a student and enter the amount.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/payments/', {
                student: selectedStudent,
                amount,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                payment_type: 'MONTHLY',
            });
            toast.success('Payment recorded successfully.');
            setSelectedParent('');
            setSelectedStudent('');
            setAmount('2000');
            fetchDues();
            fetchPayments();
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error('Failed to record payment.');
        } finally {
            setLoading(false);
        }
    };

    const summaryCards = [
        { label: 'Parents in System', value: parents.length, tone: 'text-success' },
        { label: 'Students with Dues', value: dues.length, tone: 'text-warning' },
        { label: 'Recent Payments Logged', value: recentPayments.length, tone: 'text-primary' },
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Payment Processing</h3>
                    <div className="text-muted small mt-1">Clerk responsibilities focus on collecting and recording parent fee payments.</div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {summaryCards.map((stat) => (
                    <div key={stat.label} className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <small className="text-secondary fw-bold d-block mb-2">{stat.label}</small>
                                <h3 className={`fw-bold m-0 ${stat.tone}`}>{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['Fee Collection', 'Payment Tracking'].map((tab) => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === tab.toLowerCase() ? 'text-success' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'fee collection' && (
                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                            <h5 className="fw-bold mb-4">Record Parent Payment</h5>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Parent Name</label>
                                    <select
                                        className="form-select bg-light border-0 py-2"
                                        value={selectedParent}
                                        onChange={(e) => setSelectedParent(e.target.value)}
                                    >
                                        <option value="">Select Parent</option>
                                        {parents.map((parent) => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.first_name} {parent.last_name} ({parent.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Student</label>
                                    <select
                                        className="form-select bg-light border-0 py-2"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        disabled={!selectedParent}
                                    >
                                        <option value="">{selectedParent ? 'Select Student' : 'Select Parent First'}</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name} ({student.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Amount</label>
                                    <input
                                        type="number"
                                        className="form-control bg-light border-0 py-2"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Payment Method</label>
                                    <select
                                        className="form-select bg-light border-0 py-2"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="CARD">Card</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-secondary">Payment Date</label>
                                    <input
                                        type="date"
                                        className="form-control bg-light border-0 py-2"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    className="btn text-white fw-bold px-4 py-2"
                                    style={{ backgroundColor: '#6c9343' }}
                                    onClick={handleRecordPayment}
                                    disabled={loading}
                                >
                                    <i className="bi bi-credit-card me-2"></i>
                                    {loading ? 'Recording...' : 'Record Payment'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                            <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                                <h6 className="fw-bold m-0">Students with Pending Monthly Fees</h6>
                            </div>
                            <div className="p-3 d-flex flex-column gap-3">
                                {dues.length === 0 ? (
                                    <div className="text-center py-4 text-muted">No pending monthly fees right now.</div>
                                ) : (
                                    dues.slice(0, 8).map((row) => (
                                        <div key={row.id} className="border rounded-4 p-3 bg-light">
                                            <div className="fw-bold">{row.name}</div>
                                            <div className="small text-muted">{row.parent}</div>
                                            <div className="small text-muted mb-3">{row.parent_phone}</div>
                                            <button
                                                className="btn btn-sm btn-outline-success fw-bold"
                                                onClick={() => {
                                                    setSelectedStudent(row.id);
                                                    setAmount('2000');
                                                }}
                                            >
                                                Prepare Payment
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payment tracking' && (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                        <h6 className="fw-bold m-0">Recent Recorded Payments</h6>
                    </div>
                    <div className="table-responsive p-3">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th className="ps-4">Student</th>
                                    <th>Type</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">No recent payments recorded.</td></tr>
                                ) : recentPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="ps-4 fw-bold">{payment.student_name}</td>
                                        <td>{payment.payment_type}</td>
                                        <td>{payment.payment_method}</td>
                                        <td className="fw-bold text-success">LKR {payment.amount}</td>
                                        <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
