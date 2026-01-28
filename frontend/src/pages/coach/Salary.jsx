import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const Salary = () => {
    const { user } = useAuth();
    const [salaryData, setSalaryData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentSalary();
        fetchSalaryHistory();
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

            <h5 className="fw-bold mb-3">Payment History (Finalized)</h5>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
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
                            {history.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No finalized records yet.</td></tr>
                            ) : (
                                history.map((row) => (
                                    <tr key={row.id}>
                                        <td className="ps-4 fw-bold">{row.payment_period}</td>
                                        <td>{row.total_hours}</td>
                                        <td>LKR {row.hourly_rate}</td>
                                        <td className="fw-bold">LKR {(parseFloat(row.total_hours) * parseFloat(row.hourly_rate)).toFixed(2)}</td>
                                        <td className="text-end pe-4">
                                            <span className="badge bg-success rounded-pill px-3">PAID</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Salary;
