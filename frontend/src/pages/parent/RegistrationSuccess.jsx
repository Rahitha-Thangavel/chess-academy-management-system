import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/parent/children');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="text-center p-5 rounded-4 shadow-sm bg-white" style={{ maxWidth: '500px' }}>
                <div className="mb-4 text-warning">
                    <i className="bi bi-hourglass-split" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#4a3f35' }}>Registration Submitted</h3>
                <p className="text-secondary mb-4">
                    Your student registration request has been submitted successfully.
                    Please wait for Admin approval. You will be notified once the application is processed.
                </p>

                <div className="progress mb-3" style={{ height: '4px' }}>
                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style={{ width: '100%' }}></div>
                </div>
                <small className="text-muted d-block">Redirecting to Dashboard in 5 seconds...</small>

                <button
                    onClick={() => navigate('/parent/children')}
                    className="btn btn-link text-secondary text-decoration-none mt-3 fw-bold small"
                >
                    Return immediately
                </button>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
