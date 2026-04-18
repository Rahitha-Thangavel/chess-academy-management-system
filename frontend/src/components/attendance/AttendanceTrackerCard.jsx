import React, { useEffect, useMemo, useRef, useState } from 'react';

const DAY_CODE_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PRE_START_ALERT_MS = 10 * 60 * 1000;

const buildDateTime = (date, timeString = '00:00:00') => {
    const [hours = 0, minutes = 0, seconds = 0] = timeString.split(':').map(Number);
    const value = new Date(date);
    value.setHours(hours, minutes, seconds || 0, 0);
    return value;
};

const isScheduledForToday = (batch, today) => {
    if (batch.batch_type === 'ONE_TIME' && batch.exact_date) {
        return batch.exact_date === today.toISOString().split('T')[0];
    }
    return batch.schedule_day === DAY_CODE_MAP[today.getDay()];
};

const formatRelativeDuration = (milliseconds) => {
    if (milliseconds <= 0) {
        return 'now';
    }

    const totalMinutes = Math.ceil(milliseconds / 60000);
    if (totalMinutes < 60) {
        return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }

    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
};

const formatCountdown = (milliseconds) => {
    const safeValue = Math.max(0, milliseconds);
    const totalSeconds = Math.ceil(safeValue / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatTimeLabel = (timeValue) => (timeValue || '').slice(0, 5);

const AttendanceTrackerCard = ({ batches = [], recordedBatchIds = [], onOpenBatch, notifyInfo }) => {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const preStartAlerts = useRef(new Set());
    const recordedSet = useMemo(() => new Set(recordedBatchIds), [recordedBatchIds]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const todaysBatches = useMemo(() => {
        return batches
            .filter((batch) => isScheduledForToday(batch, currentTime))
            .map((batch) => {
                const startAt = buildDateTime(currentTime, batch.start_time);
                const endAt = buildDateTime(currentTime, batch.end_time);
                return {
                    ...batch,
                    startAt,
                    endAt,
                    attendanceOpensAt: startAt,
                };
            })
            .sort((left, right) => left.startAt - right.startAt);
    }, [batches, currentTime]);

    const nextUpcomingBatch = useMemo(
        () => todaysBatches.find((batch) => batch.startAt > currentTime) || null,
        [todaysBatches, currentTime],
    );

    const nextUpcomingBatches = useMemo(() => {
        if (!nextUpcomingBatch) {
            return [];
        }
        return todaysBatches.filter((batch) => batch.startAt.getTime() === nextUpcomingBatch.startAt.getTime());
    }, [todaysBatches, nextUpcomingBatch]);

    const currentBatches = useMemo(
        () => todaysBatches.filter((batch) => currentTime >= batch.startAt && currentTime <= batch.endAt),
        [todaysBatches, currentTime],
    );

    const currentBatch = currentBatches[0] || null;

    const attendanceReady = currentBatch && currentTime >= currentBatch.attendanceOpensAt;
    const attendanceAlreadyRecorded = currentBatch ? recordedSet.has(currentBatch.id) : false;
    const attendanceCountdown = currentBatch ? Math.max(0, currentBatch.attendanceOpensAt - currentTime) : 0;

    useEffect(() => {
        if (nextUpcomingBatches.length === 0 || !notifyInfo) {
            return;
        }
        nextUpcomingBatches.forEach((batch) => {
            const millisecondsUntilStart = batch.startAt - currentTime;
            const alertKey = `${batch.id}-${batch.startAt.toISOString()}`;

            if (
                millisecondsUntilStart > 0 &&
                millisecondsUntilStart <= PRE_START_ALERT_MS &&
                !preStartAlerts.current.has(alertKey)
            ) {
                preStartAlerts.current.add(alertKey);
                notifyInfo(`${batch.batch_name} is going to start in ${formatRelativeDuration(millisecondsUntilStart)}.`);
            }
        });
    }, [nextUpcomingBatches, currentTime, notifyInfo]);

    const headlineBatches = currentBatches.length > 0 ? currentBatches : nextUpcomingBatches;

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                <h5 className="fw-bold m-0">Today&apos;s Attendance Tracker</h5>
            </div>
            <div className="p-4">
                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="rounded-4 p-4 h-100" style={{ background: 'linear-gradient(135deg, #f5faef 0%, #eef6e2 100%)' }}>
                            <small className="text-uppercase fw-bold text-success d-block mb-2">Next Class</small>
                            {headlineBatches.length === 0 ? (
                                <h4 className="fw-bold mb-2">No class scheduled</h4>
                            ) : (
                                <div className="d-flex flex-column gap-2 mb-2">
                                    {headlineBatches.map((batch) => (
                                        <div key={batch.id} className="d-flex justify-content-between align-items-center border rounded-3 px-3 py-2 bg-white">
                                            <div>
                                                <div className="fw-bold">{batch.batch_name}</div>
                                                <div className="small text-muted">{batch.start_time} - {batch.end_time}</div>
                                            </div>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                {currentBatches.length > 0 ? 'Live' : 'Upcoming'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-secondary mb-3">
                                {currentBatches.length > 0
                                    ? `${currentBatches.length} class${currentBatches.length === 1 ? '' : 'es'} ${currentBatches.length === 1 ? 'is' : 'are'} currently in progress.`
                                    : nextUpcomingBatch
                                        ? `The next class will start in ${formatRelativeDuration(nextUpcomingBatch.startAt - currentTime)}.`
                                        : 'There are no more classes scheduled for today.'}
                            </p>
                            {headlineBatches.length > 0 && (
                                <div className="d-flex flex-wrap gap-3 text-secondary small">
                                    <span>
                                        <i className="bi bi-calendar-event me-2 text-success"></i>
                                        {headlineBatches[0].schedule_day || 'Today'}
                                    </span>
                                    <span>
                                        <i className="bi bi-clock me-2 text-success"></i>
                                        {headlineBatches[0].start_time} - {headlineBatches[0].end_time}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="rounded-4 border p-4 h-100 bg-white">
                            {!currentBatch ? (
                                <>
                                    <small className="text-uppercase fw-bold text-primary d-block mb-2">Attendance Status</small>
                                    <h6 className="fw-bold mb-2">Waiting for class to begin</h6>
                                    <p className="text-muted mb-0">
                                        {nextUpcomingBatches.length > 0
                                            ? `Opens at ${formatTimeLabel(nextUpcomingBatches[0].start_time)}.`
                                            : 'A live attendance countdown will appear here when a class is scheduled for today.'}
                                    </p>
                                </>
                            ) : attendanceAlreadyRecorded ? (
                                <>
                                    <small className="text-uppercase fw-bold text-success d-block mb-2">Attendance Status</small>
                                    <h6 className="fw-bold mb-2">Attendance already recorded</h6>
                                    <p className="text-muted mb-3">
                                        Open now. Attendance for {currentBatch.batch_name} has already been recorded today.
                                    </p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {currentBatches.map((batch) => (
                                            <button key={batch.id} className="btn btn-outline-success fw-bold px-4" onClick={() => onOpenBatch?.(batch)}>
                                                View {batch.batch_name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : attendanceReady ? (
                                <>
                                    <small className="text-uppercase fw-bold text-success d-block mb-2">Attendance Status</small>
                                    <h6 className="fw-bold mb-2">Open now</h6>
                                    <p className="text-muted mb-3">
                                        Attendance is available until {formatTimeLabel(currentBatch.end_time)}.
                                    </p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {currentBatches.map((batch) => (
                                            <button key={batch.id} className="btn btn-success fw-bold px-4" onClick={() => onOpenBatch?.(batch)}>
                                                Record {batch.batch_name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <small className="text-uppercase fw-bold text-warning d-block mb-2">Attendance Status</small>
                                    <h6 className="fw-bold mb-2">Opens at {formatTimeLabel(currentBatch.start_time)}</h6>
                                    <div className="display-6 fw-bold text-warning mb-2">{formatCountdown(attendanceCountdown)}</div>
                                    <p className="text-muted mb-0">
                                        Attendance will be available when the class begins.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTrackerCard;
