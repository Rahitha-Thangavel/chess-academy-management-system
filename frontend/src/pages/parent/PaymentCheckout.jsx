import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useAppUI } from '../../contexts/AppUIContext';

const PaymentCheckout = () => {
    const { notifyError } = useAppUI();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const [isProcessing, setIsProcessing] = useState(false);
    const [fee, setFee] = useState(null);
    const [studentId, setStudentId] = useState('');
    const query = new URLSearchParams(location.search);
    const paymentKind = query.get('kind') || 'MONTHLY';
    const tournamentStudentId = query.get('studentId');
    const selectedMonth = Number(query.get('month')) || (new Date().getMonth() + 1);
    const selectedYear = Number(query.get('year')) || new Date().getFullYear();

    useEffect(() => {
        const loadFee = async () => {
            if (!id) return;
            try {
                if (paymentKind === 'TOURNAMENT') {
                    const registrationRes = await axios.get(`/registrations/${id}/`);
                    setStudentId(registrationRes.data.student);
                    const tournamentRes = await axios.get(`/tournaments/${registrationRes.data.tournament}/`);
                    setFee({
                        student_name: registrationRes.data.student_name,
                        label: registrationRes.data.tournament_name,
                        base_fee: tournamentRes.data.entry_fee,
                        calculated_fee: tournamentRes.data.entry_fee,
                        sibling_discount_amount: '0.00',
                    });
                    return;
                }
                const res = await axios.get(`/payments/calculate_fee/`, {
                    params: { student_id: id, month: selectedMonth, year: selectedYear },
                });
                setFee(res.data);
            } catch (err) {
                console.error('Failed to load fee:', err);
            }
        };

        loadFee();
    }, [id, paymentKind, selectedMonth, selectedYear]);

    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const pay = async () => {
            try {
                const now = new Date();
                const paymentDate = now.toISOString().split('T')[0];
                const computedAmount = fee?.calculated_fee ? Number(fee.calculated_fee) : 0;

                const payload = {
                    student: paymentKind === 'TOURNAMENT' ? tournamentStudentId || studentId : id,
                    amount: computedAmount,
                    payment_date: paymentKind === 'MONTHLY'
                        ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
                        : paymentDate,
                    payment_method: 'CARD',
                    payment_type: paymentKind,
                    ...(paymentKind === 'TOURNAMENT' ? { registration_id: id } : {}),
                };

                const res = await axios.post('/payments/', payload);
                setIsProcessing(false);
                navigate(`/parent/payment/receipt/${res.data.id}`);
            } catch (err) {
                console.error('Payment failed:', err);
                setIsProcessing(false);
                notifyError('Payment failed. Please try again.');
            }
        };

        pay();
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>Secure Checkout</h3>
            </div>

            <div className="row g-4">
                {/* Order Summary */}
                <div className="col-md-5 order-md-last">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-4 bg-light border-bottom">
                            <h5 className="fw-bold m-0 text-secondary">Order Summary</h5>
                            {paymentKind === 'MONTHLY' && (
                                <small className="text-muted">Billing month: {new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</small>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-secondary">
                                    {paymentKind === 'MONTHLY'
                                        ? `Student Fee (${fee?.student_name || 'Student'})`
                                        : `Tournament Fee (${fee?.label || 'Tournament'})`}
                                </span>
                                <span className="fw-bold">{fee?.base_fee ? `LKR ${fee.base_fee}` : 'LKR 0.00'}</span>
                            </div>
                            {paymentKind === 'MONTHLY' && (
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-success small">Discount (Sibling)</span>
                                    <span className="text-success small">
                                        - LKR {fee?.sibling_discount_amount || '0.00'}
                                    </span>
                                </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold h5 m-0">Total Due</span>
                                    <span className="fw-bold h4 m-0 text-success" style={{ color: '#6c9343' }}>
                                        LKR {fee?.calculated_fee ? fee.calculated_fee : '0.00'}
                                    </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h5 className="fw-bold mb-4">Payment Details</h5>

                        <form onSubmit={handlePayment}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-secondary">Cardholder Name</label>
                                <input type="text" className="form-control bg-light border-0 py-2" placeholder="John Doe" required />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold small text-secondary">Card Number</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-credit-card"></i></span>
                                    <input type="text" className="form-control bg-light border-0 py-2" placeholder="0000 0000 0000 0000" required />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-6">
                                    <label className="form-label fw-bold small text-secondary">Expiry Date</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" placeholder="MM/YY" required />
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-bold small text-secondary">CVV</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" placeholder="123" required />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn text-white fw-bold w-100 py-3 shadow-sm"
                                style={{ backgroundColor: '#6c9343' }}
                                disabled={isProcessing || !fee}
                            >
                                {isProcessing ? (
                                    <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
                                ) : (
                                    <span>Pay LKR {fee?.calculated_fee || '0.00'}</span>
                                )}
                            </button>

                            <div className="text-center mt-3">
                                <small className="text-muted"><i className="bi bi-lock-fill me-1"></i> Payments are secure and encrypted</small>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCheckout;
