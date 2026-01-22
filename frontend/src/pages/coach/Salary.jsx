import React from 'react';

const Salary = () => {
    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Salary & Payments</h3>

            <h5 className="fw-bold mb-3">Current Month</h5>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-success-subtle" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-currency-dollar h5 m-0"></i>
                            </div>
                            <span className="text-secondary small fw-bold text-uppercase">Salary</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">Rs. 24,000</h2>
                        <small className="text-muted">November 2024</small>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-light" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="bg-white text-secondary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-clock h5 m-0"></i>
                            </div>
                            <span className="text-secondary small fw-bold text-uppercase">Hours Worked</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">40 hours</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-light" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="bg-white text-secondary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-coin h5 m-0"></i>
                            </div>
                            <span className="text-secondary small fw-bold text-uppercase">Hourly Rate</span>
                        </div>
                        <h2 className="fw-bold m-0 mt-2">Rs. 600 <span className="fs-5 text-muted fw-normal">/hour</span></h2>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold mb-3">Salary Breakdown</h5>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-2">
                    <div>
                        <span className="fw-bold d-block">Basic Hours</span>
                        <small className="text-muted">40 hours × Rs. 600</small>
                    </div>
                    <span className="fw-bold h5 m-0">Rs. 24,000</span>
                </div>
            </div>

            <h5 className="fw-bold mb-3">Payment History</h5>
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary small fw-bold">
                            <tr>
                                <td className="py-3 ps-4 border-0">Month</td>
                                <td className="py-3 border-0">Amount</td>
                                <td className="py-3 border-0">Status</td>
                                <td className="py-3 pe-4 text-end border-0">Receipt</td>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { month: 'October 2024', amount: 'Rs. 27,000' },
                                { month: 'September 2024', amount: 'Rs. 25,500' },
                                { month: 'August 2024', amount: 'Rs. 27,000' },
                                { month: 'July 2024', amount: 'Rs. 24,000' },
                            ].map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold">{row.month}</td>
                                    <td className="text-secondary">{row.amount}</td>
                                    <td>
                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                                            paid
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-link text-success text-decoration-none small fw-bold">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Salary;
