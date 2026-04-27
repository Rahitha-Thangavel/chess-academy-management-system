/**
 * Page component: Verifyemail.
 * 
 * Defines a route/page-level React component.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    // Prevent double invocation in React Strict Mode
    const verifyCalled = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (verifyCalled.current) return;
            verifyCalled.current = true;

            try {
                // Sending request to backend
                const response = await axiosInstance.get(`/auth/verify-email/${token}/`);

                // If we get here, axios status is likely 2xx
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');

                // Auto redirect
                setTimeout(() => navigate('/login'), 5000);
            } catch (error) {
                console.error("Verification Error:", error);

                setStatus('error');
                if (error.response && error.response.data) {
                    // Try to get message from backend JSON
                    // If it returns HTML (e.g. 500 error page), avoid showing raw HTML
                    const data = error.response.data;
                    if (typeof data === 'string' && data.trim().startsWith('<')) {
                        setMessage('Server encountered an error. Please try again later.');
                    } else {
                        setMessage(data.message || data.error || 'Verification failed.');
                    }
                } else {
                    setMessage('Network error or server unreachable.');
                }
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
            setMessage('Invalid link.');
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

                <p className={status === 'error' ? 'text-danger' : 'text-muted'}>
                    {message}
                </p>

                {status === 'success' && (
                    <p className="small text-muted mt-3">Redirecting to login...</p>
                )}

                {status === 'error' && (
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
