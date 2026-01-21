import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    const verifyCalled = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (verifyCalled.current) return;
            verifyCalled.current = true;

            try {
                const response = await axiosInstance.get(`/auth/verify-email/${token}/`);
                setStatus('success');
                setMessage('Email verified! Please login');

                // Auto-redirect after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } catch (error) {
                // Only set error if we haven't already succeeded (though with strict mode return above, this shouldn't be race-conditioned easily)
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [token, navigate]);

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-5 text-center" style={{ maxWidth: '500px' }}>
                <div className="mb-4">
                    {status === 'verifying' && <div className="spinner-border text-primary" role="status"></div>}
                    {status === 'success' && <i className="bi bi-check-circle-fill text-success display-1"></i>}
                    {status === 'error' && <i className="bi bi-x-circle-fill text-danger display-1"></i>}
                </div>

                <h3 className="mb-3">
                    {status === 'verifying' && 'Verifying...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h3>

                {status === 'verifying' && <p className="text-muted">Please wait...</p>}

                {status === 'success' && (
                    <>
                        <p className="text-success lead">
                            ✓ Email verified! Please login
                        </p>
                        <p className="small text-muted mt-3">
                            Redirecting to login in 5 seconds...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <p className="text-danger mb-4">{message}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
