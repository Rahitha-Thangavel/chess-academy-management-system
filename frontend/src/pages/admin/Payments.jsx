import React from 'react';

const Payments = () => {
    // Mock Data
    const pendingPayments = [
        { parent: 'Vimalan', children: '3 children', amount: 'LKR 4,800', dueDate: 'Dec 5', status: 'Pending' },
        { parent: 'Nisha', children: '1 child', amount: 'LKR 3,000', dueDate: 'Dec 5', status: 'Pending' },
        { parent: 'David', children: '1 child', amount: 'LKR 4,000', dueDate: 'Dec 5', status: 'Pending' },
    ];

    const history = [
        { name: 'Vimalan - November Fees', desc: '3 children - Paid on Nov 5', amount: 'LKR 12,000', status: 'Completed' },
        { name: 'Nisha - November Fees', desc: '1 child - Paid on Nov 3', amount: 'LKR 4,000', status: 'Completed' },
        { name: 'David - November Fees', desc: '1 child - Paid on Nov 10', amount: 'LKR 4,000', status: 'Completed' },
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4 text-success" style={{ color: '#6c9343' }}>Payment & Finance</h3>

            {/* Top Stats */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px', backgroundColor: '#6c9343 !important' }}>
                                <i className="bi bi-currency-dollar fs-5"></i>
                            </div>
                            <small className="fw-bold text-secondary">Total Monthly Revenue</small>
                        </div>
                        <h3 className="fw-bold m-0">LKR 243,500</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px', backgroundColor: '#6c9343 !important' }}>
                                <i className="bi bi-wallet2 fs-5"></i>
                            </div>
                            <small className="fw-bold text-secondary">Received This Month</small>
                        </div>
                        <h3 className="fw-bold m-0">LKR 195,700</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-clock-history fs-5"></i>
                            </div>
                            <small className="fw-bold text-secondary">Pending Payments</small>
                        </div>
                        <h3 className="fw-bold m-0">LKR 47,800</h3>
                    </div>
                </div>
            </div>

            {/* Pending Payments Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                    <h6 className="fw-bold m-0">Pending Payments</h6>
                </div>
                <div className="table-responsive p-3">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary small fw-bold">
                            <tr>
                                <th className="py-3 ps-4 border-0">Parent</th>
                                <th className="py-3 border-0">Children</th>
                                <th className="py-3 border-0">Amount</th>
                                <th className="py-3 border-0">Due Date</th>
                                <th className="py-3 pe-4 text-end border-0">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPayments.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold">{row.parent}</td>
                                    <td>{row.children}</td>
                                    <td>{row.amount}</td>
                                    <td>{row.dueDate}</td>
                                    <td className="text-end pe-4">
                                        <span className="badge bg-warning rounded-pill px-3 py-2 text-white">{row.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="row g-4">
                {/* Payment History */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Payment History</h6>
                        </div>
                        <div className="p-4 d-flex flex-column gap-3">
                            {history.map((item, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center border-bottom pb-3">
                                    <div>
                                        <h6 className="fw-bold m-0">{item.name}</h6>
                                        <small className="text-secondary">{item.desc}</small>
                                    </div>
                                    <div className="text-end">
                                        <h6 className="fw-bold m-0 mb-1">{item.amount}</h6>
                                        <span className="badge bg-success rounded-pill" style={{ backgroundColor: '#6c9343 !important' }}>{item.status}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center mt-2">
                                <span className="text-success fw-bold small cursor-pointer" style={{ color: '#6c9343' }}>View All Transactions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Revenue Breakdown</h6>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <div className="d-flex justify-content-between kb-2">
                                    <span className="fw-bold text-secondary">Tuition Fees</span>
                                    <span className="fw-bold">LKR 220,000</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '90%', backgroundColor: '#6c9343 !important' }}></div>
                                </div>
                                <small className="text-muted d-block text-end mt-1">90%</small>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between kb-2">
                                    <span className="fw-bold text-secondary">Tournament Fees</span>
                                    <span className="fw-bold">LKR 15,000</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '6%', opacity: 0.7, backgroundColor: '#6c9343 !important' }}></div>
                                </div>
                                <small className="text-muted d-block text-end mt-1">6%</small>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between kb-2">
                                    <span className="fw-bold text-secondary">Material Sales</span>
                                    <span className="fw-bold">LKR 8,500</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '4%', opacity: 0.5, backgroundColor: '#6c9343 !important' }}></div>
                                </div>
                                <small className="text-muted d-block text-end mt-1">4%</small>
                            </div>

                            <hr />
                            <div className="d-flex justify-content-between mt-3">
                                <span className="fw-bold text-secondary">Total Revenue</span>
                                <span className="fw-bold h5 text-dark m-0">LKR 243,500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
