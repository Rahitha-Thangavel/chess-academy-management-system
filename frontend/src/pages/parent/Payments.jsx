import React from 'react';

const Payments = () => {
    // Mock Data
    const fees = [
        {
            id: 1,
            name: 'Arjun',
            monthlyFee: 'LKR 2,000',
            discount: '-LKR 400 (20% for 3 children)',
            totalDue: 'LKR 1,600',
            dueDate: 'Dec 5, 2024',
            status: 'Pending',
            cardColor: 'border-warning'
        },
        {
            id: 2,
            name: 'Priya',
            monthlyFee: 'LKR 2,000',
            discount: '-LKR 400 (20% for 3 children)',
            totalDue: 'LKR 1,600',
            dueDate: 'Dec 5, 2024',
            status: 'Pending',
            cardColor: 'border-warning'
        },
        {
            id: 3,
            name: 'Gautam',
            monthlyFee: 'LKR 2,000',
            discount: '-LKR 400 (20% for 3 children)',
            totalDue: 'LKR 1,600',
            dueDate: 'Dec 5, 2024',
            status: 'Pending',
            cardColor: 'border-warning'
        }
    ];

    const history = [
        { date: '2024-11-05', student: 'Arjun', amount: 'LKR 1,600', method: 'Card', status: 'Paid' },
        { date: '2024-10-05', student: 'Arjun', amount: 'LKR 1,600', method: 'Transfer', status: 'Paid' },
        { date: '2024-09-05', student: 'Arjun', amount: 'LKR 2,000', method: 'Card', status: 'Paid' },
        { date: '2024-08-05', student: 'Arjun', amount: 'LKR 2,000', method: 'Cash', status: 'Paid' },
        { date: '2024-11-05', student: 'Priya', amount: 'LKR 1,600', method: 'Card', status: 'Paid' },
        { date: '2024-10-05', student: 'Priya', amount: 'LKR 1,600', method: 'Transfer', status: 'Paid' },
        { date: '2024-11-05', student: 'Gautam', amount: 'LKR 1,600', method: 'Card', status: 'Paid' },
        { date: '2024-10-05', student: 'Gautam', amount: 'LKR 1,600', method: 'Transfer', status: 'Paid' },
    ];

    const upcoming = [
        { date: 'Dec 5, 2024', student: 'Arjun', amount: 'LKR 1,600' },
        { date: 'Dec 5, 2024', student: 'Priya', amount: 'LKR 1,600' },
        { date: 'Dec 5, 2024', student: 'Gautam', amount: 'LKR 1,600' },
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Payment Management</h3>

            <h5 className="fw-bold mb-3">Current Fee Status</h5>

            {/* Fee Cards */}
            <div className="row g-4 mb-5">
                {fees.map((fee) => (
                    <div key={fee.id} className="col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold m-0">{fee.name}</h5>
                                <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-2">
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i> {fee.status}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-secondary small fw-bold">Monthly Fee:</span>
                                <span className="fw-bold">{fee.monthlyFee}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-success">
                                <span className="small fw-bold">Sibling<br />Discount:</span>
                                <span className="small fw-bold text-end" style={{ maxWidth: '100px' }}>{fee.discount}</span>
                            </div>

                            <hr className="my-3" />

                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-dark">Total Due:</span>
                                <span className="fw-bold h5 m-0">{fee.totalDue}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="text-secondary small"><i className="bi bi-calendar me-1"></i> Due Date:</span>
                                <span className="text-secondary small">{fee.dueDate}</span>
                            </div>

                            <button className="btn text-white w-100 py-2 rounded-2 fw-bold" style={{ backgroundColor: '#6c9343' }}>
                                Pay Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment History & Upcoming */}
            <div className="row g-4">
                {/* History Table */}
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0">Payment History</h5>
                        <div className="dropdown">
                            <button className="btn btn-light btn-sm dropdown-toggle fw-bold text-secondary bg-white border" type="button">
                                All Children
                            </button>
                        </div>
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
                                    {history.map((record, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 text-secondary small fw-bold">{record.date}</td>
                                            <td className="fw-bold small">{record.student}</td>
                                            <td className="text-secondary small fw-bold">{record.amount}</td>
                                            <td className="text-secondary small"><i className="bi bi-credit-card me-1"></i> {record.method}</td>
                                            <td className="text-end pe-4">
                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                                                    <i className="bi bi-check-circle-fill me-1"></i> {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Upcoming Payments (Optional, can be separate or below) - Adding as separate section below table for now */}
                <div className="col-12 mt-4">
                    <h5 className="fw-bold mb-3">Upcoming Payments</h5>
                    <div className="card border-0 shadow-sm p-4 rounded-3">
                        {upcoming.map((item, idx) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center border-bottom py-3">
                                <div>
                                    <h6 className="fw-bold m-0 text-secondary small">{item.date} : <span className="text-dark h6 fw-bold">{item.amount}</span></h6>
                                    <small className="text-muted">{item.student}</small>
                                </div>
                                <button className="btn btn-sm text-white px-3" style={{ backgroundColor: '#6c9343' }}>Pay</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Payments;
