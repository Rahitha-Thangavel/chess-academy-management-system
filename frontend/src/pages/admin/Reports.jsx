import React from 'react';

const Reports = () => {
    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4 text-success" style={{ color: '#6c9343' }}>Reports & Analytics</h3>

            <div className="alert alert-info border-0 shadow-sm rounded-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                This module is under development. Detailed reporting features will be available soon.
            </div>

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm p-4 text-center rounded-4">
                        <div className="mb-3 text-success">
                            <i className="bi bi-file-earmark-bar-graph fs-1"></i>
                        </div>
                        <h5 className="fw-bold">Financial Reports</h5>
                        <p className="text-muted small">Download monthly revenue and expense reports.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto">Generate Report</button>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm p-4 text-center rounded-4">
                        <div className="mb-3 text-success">
                            <i className="bi bi-people fs-1"></i>
                        </div>
                        <h5 className="fw-bold">Attendance Reports</h5>
                        <p className="text-muted small">Student and coach attendance summaries.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto">Generate Report</button>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm p-4 text-center rounded-4">
                        <div className="mb-3 text-success">
                            <i className="bi bi-trophy fs-1"></i>
                        </div>
                        <h5 className="fw-bold">Tournament Reports</h5>
                        <p className="text-muted small">Participation and results analytics.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto">Generate Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
