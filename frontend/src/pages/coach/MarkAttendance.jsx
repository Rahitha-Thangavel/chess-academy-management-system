import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MarkAttendance = () => {
    const navigate = useNavigate();
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    useEffect(() => {
        let interval = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isTimerRunning && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, seconds]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartClass = () => {
        setIsTimerRunning(true);
        setStartTime(new Date().toLocaleTimeString());
        setAttendanceMarked(false);
    };

    const handleEndClass = () => {
        setIsTimerRunning(false);
        setEndTime(new Date().toLocaleTimeString());
        setAttendanceMarked(true);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0">Mark Coach Attendance</h3>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                        <h5 className="text-secondary fw-bold mb-4">Class Session Timer</h5>

                        <div className="display-1 fw-bold mb-5" style={{ color: '#6c9343', fontFamily: 'monospace' }}>
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
                                        <span>Start: <strong>{startTime}</strong></span>
                                        <span>End: <strong>{endTime}</strong></span>
                                        <span>Duration: <strong>{formatTime(seconds)}</strong></span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-success mt-3 fw-bold"
                                        onClick={() => {
                                            setSeconds(0);
                                            setAttendanceMarked(false);
                                            setStartTime(null);
                                            setEndTime(null);
                                        }}
                                    >
                                        Start New Session
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
