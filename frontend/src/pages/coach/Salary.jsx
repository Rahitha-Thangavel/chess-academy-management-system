/**
 * Page component: Salary.
 * 
 * Defines a route/page-level React component.
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const buildPaymentPeriod = (month, year) => `${MONTHS[month - 1]} ${year}`;

const Salary = () => {
    const { user } = useAuth();
    const today = new Date();
    const [salaryData, setSalaryData] = useState(null);
    const [history, setHistory] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const coachId = user?.user || user?.id;

    const selectedPeriod = useMemo(
        () => buildPaymentPeriod(selectedMonth, selectedYear),
        [selectedMonth, selectedYear],
    );

    useEffect(() => {
        if (!coachId) {
            return;
        }
        fetchSalaryView();
    }, [coachId, selectedMonth, selectedYear]);

    const fetchSalaryView = async () => {
        setLoading(true);
        try {
            const [salaryEstimateRes, historyRes, trendsRes] = await Promise.all([
                axios.post('/salaries/calculate_salary/', {
                    coach_id: coachId,
                    month: selectedMonth,
                    year: selectedYear,
                }),
                axios.get('/salaries/'),
                axios.get(`/analytics/reports/coach_salary_summary/?month=${selectedMonth}&year=${selectedYear}`),
            ]);

            setSalaryData(salaryEstimateRes.data);
            setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
            setTrends(trendsRes.data?.trend || []);
        } catch (error) {
            console.error('Error loading coach salary view:', error);
        } finally {
            setLoading(false);
        }
    };

    const visibleHistory = useMemo(
        () => history.filter((row) => row.payment_period === selectedPeriod),
        [history, selectedPeriod],
    );

    const selectedTrend = useMemo(
        () => trends.find((trend) => trend.payment_period === selectedPeriod) || null,
        [trends, selectedPeriod],
    );

    if (loading) {
        return <div className="p-5 text-center">Loading salary details...</div>;
    }

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold m-0">Salary & Payments</h3>
                    <div className="small text-muted mt-1">
                        Live monthly salary details based on your actual recorded class timestamps.
                    </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <select
                        className="form-select"
                        style={{ minWidth: '160px' }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {MONTHS.map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <input
                        className="form-control"
                        style={{ width: '120px' }}
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="alert alert-light border mb-4">
                <strong>Selected payroll month:</strong> {selectedPeriod}
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-success-subtle rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <i className="bi bi-currency-dollar h4 m-0 text-success"></i>
                            <span className="text-secondary small fw-bold text-uppercase">Estimated Salary</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">LKR {salaryData?.salary_amount || '0.00'}</h2>
                        <small className="text-muted">For {selectedPeriod}</small>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-light rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <i className="bi bi-clock h4 m-0 text-secondary"></i>
                            <span className="text-secondary small fw-bold text-uppercase">Hours Worked</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">{salaryData?.total_hours || '0.00'} hours</h2>
                        <small className="text-muted">Monthly total from recorded sessions</small>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-light rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <i className="bi bi-coin h4 m-0 text-secondary"></i>
                            <span className="text-secondary small fw-bold text-uppercase">Hourly Rate</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">
                            LKR {salaryData?.hourly_rate || '0.00'} <span className="fs-6 text-muted fw-normal">/hour</span>
                        </h2>
                        <small className="text-muted">Current coach rate</small>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                <div className="px-4 pt-4">
                    <h5 className="fw-bold mb-1">Monthly Salary Record</h5>
                    <div className="small text-muted mb-3">
                        Finalized salary rows for the selected payroll month.
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary small fw-bold">
                            <tr>
                                <th className="py-3 ps-4 border-0">Period</th>
                                <th className="py-3 border-0">Hours</th>
                                <th className="py-3 border-0">Rate</th>
                                <th className="py-3 border-0">Net Amount</th>
                                <th className="py-3 pe-4 text-end border-0">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleHistory.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No finalized salary record for {selectedPeriod} yet.</td></tr>
                            ) : (
                                visibleHistory.map((row) => (
                                    <tr key={row.id}>
                                        <td className="ps-4 fw-bold">{row.payment_period}</td>
                                        <td>{row.total_hours} hrs</td>
                                        <td>LKR {row.hourly_rate}</td>
                                        <td className="fw-bold">LKR {row.net_amount}</td>
                                        <td className="text-end pe-4">
                                            <span className={`badge rounded-pill px-3 ${row.status === 'PAID' ? 'bg-success' : row.status === 'PROCESSING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <h5 className="fw-bold mb-3">Salary Trends</h5>
            <div className="row g-3">
                {trends.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted">No salary trend data available yet.</div>
                    </div>
                ) : (
                    trends.map((trend) => (
                        <div key={trend.payment_period} className="col-md-4">
                            <div className={`card border-0 shadow-sm rounded-4 p-4 h-100 ${selectedTrend?.payment_period === trend.payment_period ? 'bg-success-subtle' : ''}`}>
                                <small className="text-secondary fw-bold text-uppercase">{trend.payment_period}</small>
                                <h4 className="fw-bold mt-2 mb-1">LKR {Number(trend.total_net || 0).toFixed(2)}</h4>
                                <div className="small text-muted">Average net: LKR {Number(trend.average_net || 0).toFixed(2)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Salary;
