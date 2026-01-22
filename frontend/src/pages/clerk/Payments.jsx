import React, { useState } from 'react';

const Payments = () => {
    const [activeTab, setActiveTab] = useState('fee collection');

    // Stats
    const stats = [
        { label: 'Total Monthly Revenue', value: 'Rs. 243,500' },
        { label: 'Received This Month', value: 'Rs. 195,700' },
        { label: 'Pending Payments', value: 'Rs. 47,800' },
        { label: 'Overdue (> 30 days)', value: 'Rs. 18,500', color: 'danger', bg: 'danger-subtle' }
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
                            <select className="form-select bg-light border-0 py-2">
                                <option>Select Parent</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Student(s)</label>
                            <select className="form-select bg-light border-0 py-2">
                                <option>Select Parent First</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Amount</label>
                            <input type="text" className="form-control bg-light border-0 py-2" placeholder="Rs." />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Payment Method</label>
                            <select className="form-select bg-light border-0 py-2">
                                <option>Cash</option>
                                <option>Bank Transfer</option>
                                <option>Card</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Payment Date</label>
                            <input type="date" className="form-control bg-light border-0 py-2" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Reference/Receipt No.</label>
                            <input type="text" className="form-control bg-light border-0 py-2" />
                        </div>

                        <div className="col-12 mt-4">
                            <button className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#6c9343' }}>
                                <i className="bi bi-credit-card me-2"></i> Record Payment
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
