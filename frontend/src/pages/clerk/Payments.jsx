import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const Payments = () => {
    const [activeTab, setActiveTab] = useState('fee collection');
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('3000');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchParents();
        fetchStats();
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
            setParents(response.data);
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

    const fetchStats = async () => {
        try {
            const response = await axios.get('/analytics/reports/dashboard_stats/');
            setStatsData(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedStudent || !amount) {
            toast.error('Please select a student and enter amount');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/payments/', {
                student: selectedStudent,
                amount: amount,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                payment_type: 'MONTHLY'
            });
            toast.success('Payment recorded successfully!');
            setSelectedParent('');
            setSelectedStudent('');
            setAmount('3000');
            fetchStats();
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = [
        { label: 'Total Monthly Revenue', value: statsData ? `LKR ${statsData.monthly_revenue.toLocaleString()}` : '...' },
        { label: 'Today\'s Revenue', value: statsData ? `LKR ${statsData.today_payments.toLocaleString()}` : '...' },
        { label: 'Unpaid Students', value: statsData ? statsData.unpaid_students_count : '...' },
        { label: 'Upcoming Tournaments', value: statsData ? statsData.upcoming_tournaments_count : '...', color: 'success', bg: 'success-subtle' }
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Payment Processing</h3>

            {/* Stats */}
            <div className="row g-4 mb-5">
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-md-3">
                        <div className={`p-4 rounded-3 h-100 ${stat.bg ? 'bg-' + stat.bg : 'border'}`}>
                            <small className="text-secondary fw-bold d-block mb-2" style={{ maxWidth: '80%' }}>{stat.label}</small>
                            <h4 className={`fw-bold m-0 ${stat.color ? 'text-' + stat.color : 'text-dark'}`}>{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-bottom mb-4">
                <div className="d-flex gap-4">
                    {['Fee Collection', 'Payment Tracking', 'Receipts'].map(tab => (
                        <button
                            key={tab}
                            className={`btn border-0 py-2 px-1 fw-bold position-relative ${activeTab === tab.toLowerCase() ? 'text-success' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#6c9343' }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'fee collection' && (
                <div className="card border-0 shadow-sm p-4 rounded-4" style={{ maxWidth: '800px' }}>
                    <h5 className="fw-bold mb-4">Record New Payment</h5>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Parent Name</label>
                            <select
                                className="form-select bg-light border-0 py-2"
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                            >
                                <option value="">Select Parent</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.username})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Student(s)</label>
                            <select
                                className="form-select bg-light border-0 py-2"
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                disabled={!selectedParent}
                            >
                                <option value="">{selectedParent ? 'Select Student' : 'Select Parent First'}</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.id})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Amount</label>
                            <input
                                type="number"
                                className="form-control bg-light border-0 py-2"
                                placeholder="LKR"
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

                        <div className="col-12 mt-4">
                            <button
                                className="btn text-white fw-bold px-4 py-2"
                                style={{ backgroundColor: '#6c9343' }}
                                onClick={handleRecordPayment}
                                disabled={loading}
                            >
                                <i className="bi bi-credit-card me-2"></i> {loading ? 'Recording...' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'payment tracking' || activeTab === 'receipts') && (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-wallet2 h1 d-block mb-3"></i>
                    <p>{activeTab === 'payment tracking' ? 'Tracking' : 'Receipts'} Viewer to be implemented.</p>
                </div>
            )}

        </div>
    );
};

export default Payments;
