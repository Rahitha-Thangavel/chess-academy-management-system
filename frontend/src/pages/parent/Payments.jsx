import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const Payments = () => {
    const navigate = useNavigate();
    const [fees, setFees] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get Children
            const childrenRes = await axios.get('/students/my_children/');
            const children = childrenRes.data;

            // 2. Get Payments
            const paymentsRes = await axios.get('/payments/');
            const paymentHistory = paymentsRes.data;

            setHistory(paymentHistory.map(p => ({
                id: p.id,
                date: p.payment_date,
                student: children.find(c => c.id === p.student)?.first_name || p.student,
                amount: `LKR ${p.amount}`,
                method: p.payment_method,
                status: 'Paid'
            })));

            // 3. Calculate Fees / Determine Status
            const feeList = [];
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // 1-12
            const currentYear = currentDate.getFullYear();

            for (const child of children) {
                // Check if paid this month
                const hasPaid = paymentHistory.some(p =>
                    p.student === child.id &&
                    new Date(p.payment_date).getMonth() + 1 === currentMonth &&
                    new Date(p.payment_date).getFullYear() === currentYear &&
                    p.payment_type === 'MONTHLY'
                );

                if (!hasPaid) {
                    // Fetch calculated fee
                    const feeRes = await axios.get(`/payments/calculate_fee/`, {
                        params: { student_id: child.id, month: currentMonth, year: currentYear }
                    });

                    const feeData = feeRes.data;
                    feeList.push({
                        id: child.id,
                        name: child.first_name,
                        monthlyFee: `LKR ${feeData.base_fee}`,
                        discount: feeData.sibling_count >= 2 ? '10% Siblings' : 'None',
                        totalDue: `LKR ${feeData.calculated_fee}`,
                        dueDate: `5th ${new Date().toLocaleString('default', { month: 'short' })}`,
                        status: 'Pending'
                    });
                } else {
                    // Start of Paid Logic
                    feeList.push({
                        id: child.id,
                        name: child.first_name,
                        monthlyFee: '-',
                        discount: '-',
                        totalDue: '-',
                        dueDate: '-',
                        status: 'Paid'
                    });
                }
            }

            setFees(feeList);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Payment Management</h3>

            <h5 className="fw-bold mb-3">Current Fee Status</h5>

            {/* Fee Cards */}
            <div className="row g-4 mb-5">
                {fees.length === 0 ? <div className="col-12"><p className="text-muted">No fee records found.</p></div> : fees.map((fee) => {
                    const isPaid = fee.status === 'Paid';
                    const badgeClass = !isPaid ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-success-subtle text-success border border-success-subtle';
                    return (
                        <div key={fee.id} className="col-lg-4 col-md-6">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold m-0">{fee.name}</h5>
                                    <span className={`badge ${badgeClass} rounded-pill px-3 py-2`}>
                                        {!isPaid && <i className="bi bi-exclamation-triangle-fill me-1"></i>}
                                        {isPaid && <i className="bi bi-check-circle-fill me-1"></i>}
                                        {fee.status}
                                    </span>
                                </div>

                                {!isPaid && (
                                    <>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary small fw-bold">Monthly Fee:</span>
                                            <span className="fw-bold">{fee.monthlyFee}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3 text-success">
                                            <span className="small fw-bold">Discount:</span>
                                            <span className="small fw-bold text-end">{fee.discount}</span>
                                        </div>

                                        <hr className="my-3" />

                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark">Total Due:</span>
                                            <span className="fw-bold h5 m-0">{fee.totalDue}</span>
                                        </div>
                                    </>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                    {!isPaid ? (
                                        <div>
                                            <small className="text-secondary fw-bold d-block">Due Date</small>
                                            <span className="text-secondary small">{fee.dueDate}</span>
                                        </div>
                                    ) : <div><small className="text-success fw-bold">Payment Complete</small></div>}

                                    <button
                                        className={`btn fw-bold px-4 ${!isPaid ? 'btn-success text-white' : 'btn-light text-secondary disabled'}`}
                                        style={{ backgroundColor: !isPaid ? '#6c9343' : '' }}
                                        onClick={() => !isPaid && navigate(`/parent/payment/checkout/${fee.id}`)}
                                        disabled={isPaid}
                                    >
                                        {!isPaid ? 'Pay Now' : 'Paid'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Payment History */}
            <div className="row g-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0">Payment History</h5>
                    </div>

                    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-secondary small fw-bold">
                                    <tr>
                                        <td className="py-3 ps-4 border-0">Date</td>
                                        <td className="py-3 border-0">Student</td>
                                        <td className="py-3 border-0">Amount</td>
                                        <td className="py-3 border-0">Method</td>
                                        <td className="py-3 pe-4 text-end border-0">Status</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-3">No payment history found.</td></tr>
                                    ) : history.map((record, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 text-secondary small fw-bold">{record.date}</td>
                                            <td className="fw-bold small">{record.student}</td>
                                            <td className="text-secondary small fw-bold">{record.amount}</td>
                                            <td className="text-secondary small">{record.method}</td>
                                            <td className="text-end pe-4">
                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
