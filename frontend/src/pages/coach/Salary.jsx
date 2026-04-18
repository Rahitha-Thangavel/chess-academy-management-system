import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const Salary = () => {
    const { user } = useAuth();
    const [salaryData, setSalaryData] = useState(null);
    const [history, setHistory] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('');

    useEffect(() => {
        fetchCurrentSalary();
        fetchSalaryHistory();
        fetchSalaryTrends();
    }, []);

    const fetchCurrentSalary = async () => {
        try {
            const now = new Date();
            const response = await axios.post('/salaries/calculate_salary/', {
                coach_id: user.id,
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });
            setSalaryData(response.data);
        } catch (error) {
            console.error('Error fetching current salary:', error);
        }
    };

    const fetchSalaryHistory = async () => {
        try {
            const response = await axios.get('/salaries/');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching salary history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryTrends = async () => {
        try {
            const response = await axios.get('/analytics/reports/coach_salary_summary/');
            setTrends(response.data?.trend || []);
        } catch (error) {
            console.error('Error fetching salary trends:', error);
        }
    };

    const availablePeriods = React.useMemo(() => {
        const periods = [...new Set(history.map((row) => row.payment_period).filter(Boolean))];
        return periods.sort((a, b) => new Date(`1 ${b}`) - new Date(`1 ${a}`));
    }, [history]);

    useEffect(() => {
        if (!selectedPeriod && availablePeriods.length > 0) {
            setSelectedPeriod(availablePeriods[0]);
        }
    }, [availablePeriods, selectedPeriod]);

    const visibleHistory = React.useMemo(() => (
        selectedPeriod
            ? history.filter((row) => row.payment_period === selectedPeriod)
            : history
    ), [history, selectedPeriod]);

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Salary & Payments</h3>

            <h5 className="fw-bold mb-3">Current Month Estimation</h5>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-success-subtle rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <i className="bi bi-currency-dollar h4 m-0 text-success"></i>
                            <span className="text-secondary small fw-bold text-uppercase">Estimated Salary</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">LKR {salaryData?.salary_amount || '0.00'}</h2>
                        <small className="text-muted">Based on current attendance</small>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-light rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <i className="bi bi-clock h4 m-0 text-secondary"></i>
                            <span className="text-secondary small fw-bold text-uppercase">Hours Worked</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">{salaryData?.total_hours || '0.00'} hours</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-light rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <i className="bi bi-coin h4 m-0 text-secondary"></i>
                            <span className="text-secondary small fw-bold text-uppercase">Hourly Rate</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">LKR {salaryData?.hourly_rate || '0.00'} <span className="fs-6 text-muted fw-normal">/hour</span></h2>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
                <div>
                    <h5 className="fw-bold mb-1">Monthly Salary History</h5>
                    <div className="small text-muted">Each row represents one monthly salary record.</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="small fw-semibold text-secondary">Salary Month</span>
                    <select
                        className="form-select"
                        style={{ minWidth: '180px' }}
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        {availablePeriods.map((period) => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="px-4 pt-4">
                    <div className="alert alert-light border mb-0">
                        <strong>Selected payroll month:</strong> {selectedPeriod || 'No month selected'}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary small fw-bold">
                            <tr>
                                <th className="py-3 ps-4 border-0">Period</th>
                                <th className="py-3 border-0">Hours</th>
                                <th className="py-3 border-0">Rate</th>
                                <th className="py-3 border-0">Total</th>
                                <th className="py-3 pe-4 text-end border-0">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleHistory.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No finalized records yet.</td></tr>
                            ) : (
                                visibleHistory.map((row) => (
                                    <tr key={row.id}>
                                        <td className="ps-4 fw-bold">{row.payment_period}</td>
                                        <td>{row.total_hours} hrs</td>
                                        <td>LKR {row.hourly_rate}</td>
                                        <td className="fw-bold">LKR {row.net_amount || (parseFloat(row.total_hours) * parseFloat(row.hourly_rate)).toFixed(2)}</td>
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

            <h5 className="fw-bold mb-3 mt-5">Salary Trends</h5>
            <div className="row g-3">
                {trends.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted">No trend data available yet.</div>
                    </div>
                ) : (
                    trends.map((trend) => (
                        <div key={trend.payment_period} className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
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
