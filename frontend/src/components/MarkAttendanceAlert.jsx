import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

const MarkAttendanceAlert = () => {
    const [happeningBatches, setHappeningBatches] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && (user.role === 'ADMIN' || user.role === 'CLERK')) {
            fetchHappeningBatches();
            const interval = setInterval(fetchHappeningBatches, 300000); // Check every 5 minutes
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchHappeningBatches = async () => {
        try {
            const response = await axios.get('/api/batches/happening_now/');
            setHappeningBatches(response.data);
        } catch (error) {
            console.error('Error fetching happening batches:', error);
        }
    };

    if (happeningBatches.length === 0) return null;

    return (
        <div className="alert alert-warning border-0 shadow-sm mb-3 d-flex align-items-center justify-content-between py-2 px-3 fade show" role="alert">
            <div className="d-flex align-items-center gap-3">
                <i className="bi bi-calendar-event-fill fs-4 text-warning"></i>
                <div>
                    <strong className="d-block mb-0" style={{ fontSize: '0.9rem' }}>Classes Happening Now</strong>
                    <p className="mb-0 small text-dark" style={{ fontSize: '0.8rem' }}>
                        {happeningBatches.length} {happeningBatches.length === 1 ? 'class is' : 'classes are'} currently in session. Please mark attendance.
                    </p>
                </div>
            </div>
            <button
                className="btn btn-warning btn-sm fw-bold px-3"
                onClick={() => navigate(user.role === 'ADMIN' ? '/admin/attendance' : '/clerk/attendance')}
            >
                Mark Now
            </button>
        </div>
    );
};

export default MarkAttendanceAlert;
