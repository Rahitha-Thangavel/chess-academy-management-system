/**
 * Page component: Verifyemailsent.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const VerifyEmailSent = () => {
    const location = useLocation();
    const email = location.state?.email || 'your email';

    const [resendStatus, setResendStatus] = useState('');
    const [resendMessage, setResendMessage] = useState('');

    const handleResend = async () => {
        if (!email || email === 'your email') return;
        setResendStatus('sending');
        try {
            await axiosInstance.post('/auth/resend-verification/', { email });
            setResendStatus('sent');
            setResendMessage('Verification email resent!');
            setTimeout(() => {
                setResendStatus('');
                setResendMessage('');
            }, 5000);
        } catch (error) {
            setResendStatus('error');
            setResendMessage('Failed to resend email.');
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-5 text-center" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="mb-4">
                    <i className="bi bi-envelope-check-fill text-success display-1"></i>
                </div>

                <h2 className="mb-3 text-primary">Verify Your Email</h2>

                <p className="lead mb-4">
                    We've sent a verification email to: <br />
                    <strong>{email}</strong>
                </p>

                <div className="alert alert-info py-2">
                    <small>Click the link in the email to activate your account. Link expires in 24 hours.</small>
                </div>

                <div className="d-grid gap-2 col-md-8 mx-auto mt-4">
                    <p className="small text-muted mb-2">Didn't receive the email?</p>
                    <button
                        className="btn btn-outline-secondary btn-sm mb-3"
                        onClick={handleResend}
                        disabled={resendStatus === 'sending'}
                    >
                        {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
                    </button>

                    {resendMessage && (
                        <p className={`small ${resendStatus === 'error' ? 'text-danger' : 'text-success'}`}>
                            {resendMessage}
                        </p>
                    )}

                    <Link to="/login" className="btn btn-link link-secondary text-decoration-none">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailSent;
