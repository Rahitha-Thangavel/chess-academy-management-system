import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentReceipt = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card border-0 shadow-lg rounded-4 p-0 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center p-5 text-white" style={{ backgroundColor: '#6c9343' }}>
                    <div className="rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-check-lg display-5"></i>
                    </div>
                    <h4 className="fw-bold m-0">Payment Successful!</h4>
                    <p className="opacity-75 m-0 mt-2">Thank you for your payment.</p>
                </div>

                <div className="p-4 bg-white">
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                        <span className="text-secondary">Transaction ID</span>
                        <span className="fw-bold text-dark">TXN-{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                        <span className="text-secondary">Date</span>
                        <span className="fw-bold text-dark">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                        <span className="text-secondary">Payment Method</span>
                        <span className="fw-bold text-dark">Credit Card</span>
                    </div>
                    <div className="d-flex justify-content-between mb-4">
                        <span className="text-secondary fw-bold">Amount Paid</span>
                        <span className="fw-bold text-success h5 m-0">LKR 1,600</span>
                    </div>

                    <button
                        onClick={() => navigate('/parent/payments')}
                        className="btn btn-outline-success fw-bold w-100 py-2"
                    >
                        Back to Payments
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentReceipt;
