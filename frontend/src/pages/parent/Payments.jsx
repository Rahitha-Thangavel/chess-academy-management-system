/**
 * Page component: Payments.
 * 
 * Defines a route/page-level React component.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const formatCurrency = (value) => `LKR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const Payments = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            const [summaryRes, paymentsRes] = await Promise.all([
                axios.get('/payments/family_summary/', {
                    params: { month: selectedMonth, year: selectedYear },
                }),
                axios.get('/payments/'),
            ]);

            setSummary(summaryRes.data);
            setHistory((paymentsRes.data || []).map((payment) => ({
                id: payment.id,
                date: payment.payment_date,
                student: payment.student_name,
                amount: payment.amount,
                method: payment.payment_method,
                type: payment.payment_type,
            })));
        } catch (error) {
            console.error('Error loading payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Loading payment details...</div>;
    }

    const monthlyItems = summary?.monthly_items || [];
    const tournamentItems = summary?.tournament_items || [];
    const pendingMonthlyItems = monthlyItems.filter((item) => !item.is_paid);
    const selectedPeriodLabel = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <h3 className="fw-bold m-0">Payment Management</h3>
                <div className="d-flex gap-2">
                    <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                        {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        className="form-control"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{ width: '120px' }}
                    />
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <h5 className="fw-bold mb-2">Family Monthly Fee Summary</h5>
                        <p className="text-secondary mb-0">
                            First child is charged the full monthly fee of <strong>LKR 2,000.00</strong>. Each additional child receives a <strong>25% sibling discount</strong> on that child&apos;s monthly fee.
                        </p>
                    </div>
                    <div className="text-end">
                        <div className="small text-secondary fw-bold">Total Payable This Month</div>
                        <div className="h4 fw-bold text-success m-0">{formatCurrency(summary?.grand_total_due)}</div>
                    </div>
                </div>
                <div className="alert alert-light border mt-3 mb-0">
                    <strong>Selected month:</strong> {selectedPeriodLabel}
                    <div className="small text-muted mt-1">
                        Closed months are finalized using full attendance for that month. The current month is shown as an in-progress estimate until the month ends.
                    </div>
                </div>
                <div className="row g-3 mt-2">
                    {monthlyItems.map((item) => (
                        <div key={item.student_id} className="col-lg-4 col-md-6">
                            <div className="border rounded-4 p-3 h-100 bg-light">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="fw-bold">{item.student_name}</div>
                                        <div className="small text-muted">Child {item.sibling_position} in family billing order</div>
                                    </div>
                                    <span className={`badge ${item.is_paid ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {item.is_paid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="small text-secondary d-flex justify-content-between mb-1">
                                    <span>Base monthly fee</span>
                                    <span>{formatCurrency(item.base_fee)}</span>
                                </div>
                                <div className="small text-secondary d-flex justify-content-between mb-1">
                                    <span>Attendance-adjusted fee</span>
                                    <span>{formatCurrency(item.attendance_adjusted_fee)}</span>
                                </div>
                                <div className="small text-secondary d-flex justify-content-between mb-1">
                                    <span>Classes attended / scheduled</span>
                                    <span>{item.attendance_count} / {item.scheduled_class_count}</span>
                                </div>
                                <div className="small text-success d-flex justify-content-between mb-1">
                                    <span>Sibling discount</span>
                                    <span>- {formatCurrency(item.sibling_discount_amount)}</span>
                                </div>
                                <div className="small text-muted mb-3">
                                    {!item.month_closed
                                        ? `This month is still in progress, so the full monthly fee is shown for now. Final adjustment happens at month end.`
                                        : item.fee_mode === 'PER_DAY'
                                            ? `Low attendance month: per-day fee of ${formatCurrency(item.per_day_fee_rate)} applied for ${item.attendance_count} attended classes.`
                                            : item.fee_mode === 'HALF_MONTH'
                                                ? `Attended ${item.attendance_count} of ${item.scheduled_class_count} classes, so half-month fee is applied.`
                                                : item.fee_mode === 'NO_ATTENDANCE'
                                                    ? 'No attended classes were recorded for this closed month.'
                                                    : (item.sibling_position === 1 ? 'No sibling discount on the first child.' : '25% discount applied to this child.')}
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                    <span className="fw-bold">Due</span>
                                    <span className="fw-bold text-success">{formatCurrency(item.calculated_fee)}</span>
                                </div>
                                {!item.is_paid && (
                                    <button
                                        className="btn btn-success text-white fw-bold w-100 mt-3"
                                        style={{ backgroundColor: '#6c9343', border: 'none' }}
                                        onClick={() => navigate(`/parent/payment/checkout/${item.student_id}?kind=MONTHLY&month=${selectedMonth}&year=${selectedYear}`)}
                                    >
                                        Pay Monthly Fee
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold m-0">Tournament Fees</h5>
                    <span className="fw-bold text-success">{formatCurrency(summary?.tournament_total_due)}</span>
                </div>
                {tournamentItems.length === 0 ? (
                    <div className="text-muted">No unpaid tournament fees right now.</div>
                ) : (
                    <div className="row g-3">
                        {tournamentItems.map((item) => (
                            <div key={item.registration_id} className="col-lg-4 col-md-6">
                                <div className="border rounded-4 p-3 h-100 bg-light">
                                    <div className="fw-bold">{item.tournament_name}</div>
                                    <div className="small text-muted mb-1">Student: {item.student_name}</div>
                                    <div className="small text-muted mb-3">Date: {new Date(item.tournament_date).toLocaleDateString()}</div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">Entry Fee</span>
                                        <span className="fw-bold text-success">{formatCurrency(item.amount)}</span>
                                    </div>
                                    <button
                                        className="btn btn-success text-white fw-bold w-100 mt-3"
                                        style={{ backgroundColor: '#6c9343', border: 'none' }}
                                        onClick={() => navigate(`/parent/payment/checkout/${item.registration_id}?kind=TOURNAMENT&studentId=${item.student_id}&month=${selectedMonth}&year=${selectedYear}`)}
                                    >
                                        Pay Tournament Fee
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3">Monthly Breakdown</h5>
                {pendingMonthlyItems.length === 0 ? (
                    <div className="text-success fw-bold">All monthly fees are already paid for this month.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary small fw-bold">
                                <tr>
                                    <th>Student</th>
                                    <th>Base Fee</th>
                                    <th>Attendance Rule</th>
                                    <th>Sibling Discount</th>
                                    <th>Total Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingMonthlyItems.map((item) => (
                                    <tr key={item.student_id}>
                                        <td className="fw-bold">{item.student_name}</td>
                                        <td>{formatCurrency(item.base_fee)}</td>
                                        <td>
                                            {!item.month_closed
                                                ? 'In-progress month'
                                                : item.fee_mode === 'PER_DAY'
                                                    ? 'Per-day fee'
                                                    : item.fee_mode === 'HALF_MONTH'
                                                        ? 'Half-month fee'
                                                        : item.fee_mode === 'NO_ATTENDANCE'
                                                            ? 'No attendance'
                                                            : 'Full-month fee'}
                                        </td>
                                        <td className="text-success">- {formatCurrency(item.sibling_discount_amount)}</td>
                                        <td className="fw-bold">{formatCurrency(item.calculated_fee)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-3 bg-light border-bottom">
                    <h5 className="fw-bold m-0">Payment History</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary small fw-bold">
                            <tr>
                                <th className="ps-4">Date</th>
                                <th>Student</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th className="pe-4">Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No payment history found.</td></tr>
                            ) : history.map((record) => (
                                <tr key={record.id}>
                                    <td className="ps-4">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="fw-bold">{record.student}</td>
                                    <td>{record.type === 'MONTHLY' ? 'Monthly Fee' : 'Tournament Fee'}</td>
                                    <td>{formatCurrency(record.amount)}</td>
                                    <td className="pe-4">{record.method}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payments;
