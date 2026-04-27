/**
 * Page component: Markattendance.
 * 
 * Defines a route/page-level React component.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useAppUI } from '../../contexts/AppUIContext';

const MarkAttendance = () => {
    const { notifyError } = useAppUI();
    const navigate = useNavigate();
    const location = useLocation();
    const initialState = location.state || {};

    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionBatchId, setSessionBatchId] = useState(initialState.batchId || null);
    const [sessionBatchName, setSessionBatchName] = useState(initialState.batchName || '');

    useEffect(() => {
        checkStatus();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const checkStatus = async () => {
        try {
            const res = await axios.get('/coaches/');
            const today = new Date().toISOString().split('T')[0];
            const record = sessionBatchId
                ? res.data.find(r => r.date === today && r.batch === sessionBatchId)
                : res.data.find(r => r.date === today && r.clock_in_time && !r.clock_out_time);

            if (!record && !sessionBatchId) {
                notifyError('No running class found. Please start from your dashboard.');
                navigate('/coach/dashboard');
                return;
            }

            if (record) {
                setSessionBatchId(record.batch);
                setSessionBatchName(record.batch_name || initialState.batchName || '');
            }

            setIsTimerRunning(false);
            setAttendanceMarked(false);
            setStartTime(null);
            setEndTime(null);
            setSeconds(0);

            if (record) {
                if (record.clock_in_time && !record.clock_out_time) {
                    setIsTimerRunning(true);
                    setStartTime(new Date(record.clock_in_time).toLocaleTimeString());
                    // Calculate elapsed seconds
                    const start = new Date(record.clock_in_time);
                    const now = new Date();
                    const diff = Math.floor((now - start) / 1000);
                    setSeconds(diff > 0 ? diff : 0);
                } else if (record.clock_out_time) {
                    setIsTimerRunning(false);
                    setAttendanceMarked(true);
                    setStartTime(new Date(record.clock_in_time).toLocaleTimeString());
                    setEndTime(new Date(record.clock_out_time).toLocaleTimeString());

                    // Fixed duration calc
                    const start = new Date(record.clock_in_time);
                    const end = new Date(record.clock_out_time);
                    const diff = Math.floor((end - start) / 1000);
                    setSeconds(diff);
                }
            }
            if (!record && sessionBatchId) {
                setSessionBatchId(initialState.batchId || null);
                setSessionBatchName(initialState.batchName || '');
            }
        } catch (err) {
            console.error(err);
            notifyError('Unable to load class timer.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartClass = async () => {
        try {
            if (!sessionBatchId) {
                notifyError('No batch selected.');
                navigate('/coach/dashboard');
                return;
            }
            await axios.post('/coaches/clock_in/', { batch_id: sessionBatchId });
            checkStatus(); // Refresh to sync time
        } catch (err) {
            notifyError(err.response?.data?.error || 'Failed to start class.');
        }
    };

    const handleEndClass = async () => {
        try {
            await axios.post('/coaches/clock_out/', { batch_id: sessionBatchId });
            checkStatus();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Failed to end class.');
        }
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="container-fluid p-0">
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <div>
                    <h3 className="fw-bold m-0">Mark Attendance</h3>
                    <small className="text-secondary">{sessionBatchName || 'Coach session timer'}</small>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                        <h5 className="text-secondary fw-bold mb-4">Class Session Timer</h5>

                        <div className="display-1 fw-bold mb-5" style={{ color: isTimerRunning ? '#6c9343' : '#6c757d', fontFamily: 'monospace' }}>
                            {formatTime(seconds)}
                        </div>

                        <div className="d-flex justify-content-center gap-3 mb-5">
                            {!isTimerRunning && !attendanceMarked ? (
                                <button
                                    className="btn btn-success btn-lg px-5 py-3 fw-bold shadow"
                                    style={{ backgroundColor: '#6c9343' }}
                                    onClick={handleStartClass}
                                >
                                    <i className="bi bi-play-fill me-2"></i> Start Class
                                </button>
                            ) : isTimerRunning ? (
                                <button
                                    className="btn btn-danger btn-lg px-5 py-3 fw-bold shadow"
                                    onClick={handleEndClass}
                                >
                                    <i className="bi bi-stop-fill me-2"></i> End Class
                                </button>
                            ) : (
                                <div className="alert alert-success border-success w-100">
                                    <h5 className="alert-heading fw-bold"><i className="bi bi-check-circle-fill me-2"></i> Session Recorded!</h5>
                                    <hr />
                                    <div className="d-flex justify-content-between px-5">
                                        <div>Start: <strong>{startTime}</strong></div>
                                        <div>End: <strong>{endTime}</strong></div>
                                    </div>
                                    <div className="mt-2">Duration: <strong>{formatTime(seconds)}</strong></div>

                                    <button
                                        className="btn btn-sm btn-secondary mt-3 fw-bold"
                                        onClick={() => navigate('/coach/dashboard')}
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>

                        {!attendanceMarked && (
                            <p className="text-muted small">
                                Click "Start Class" when you begin the session. The system will automatically record your attendance timestamp.
                                Click "End Class" to stop the timer and save the record.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
