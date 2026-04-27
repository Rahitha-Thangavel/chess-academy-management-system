/**
 * Page component: Dashboard.
 * 
 * Defines a route/page-level React component.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationContext';
import { normalizeNotificationTarget } from '../../utils/notificationRoutes';

const getSessionStatus = (session) => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T${session.start_time}`);
    const end = new Date(`${today}T${session.end_time}`);
    const clockInOpens = new Date(start.getTime() - 10 * 60 * 1000);
    const clockInCloses = new Date(start.getTime() + 10 * 60 * 1000);

    if (now < clockInOpens) {
        const diffMinutes = Math.max(Math.ceil((clockInOpens - now) / 60000), 1);
        return { label: `Opens in ${diffMinutes} min`, tone: 'text-primary', buttonLabel: 'Not Open Yet', canStart: false };
    }
    if (now >= clockInOpens && now <= clockInCloses) {
        return { label: 'Start window open', tone: 'text-success', buttonLabel: 'Start Class', canStart: true };
    }
    if (now > clockInCloses && now < end) {
        return { label: 'Start window missed', tone: 'text-danger', buttonLabel: 'Window Closed', canStart: false };
    }
    return { label: 'Class finished or closing', tone: 'text-secondary', buttonLabel: 'Closed', canStart: false };
};

const Dashboard = () => {
    const { user } = useAuth();
    const { markRead } = useNotifications();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [batches, setBatches] = useState([]);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, batchesRes, availableRes] = await Promise.all([
                    axios.get('/analytics/reports/dashboard_stats/'),
                    axios.get('/batches/'),
                    axios.get('/batches/unassigned/'),
                ]);

                setStatsData(statsRes.data);
                setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : []);
                setAvailableBatches(Array.isArray(availableRes.data) ? availableRes.data : []);
            } catch (error) {
                console.error('Error loading coach dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const todaysSchedule = useMemo(() => {
        const items = Array.isArray(statsData?.todays_schedule) ? statsData.todays_schedule : [];
        return items.map((item) => ({
            ...item,
            sessionStatus: getSessionStatus(item),
        }));
    }, [statsData]);

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.is_read) {
                await markRead(notif.id);
            }
            const targetUrl = normalizeNotificationTarget(notif.target_url);
            if (targetUrl) navigate(targetUrl);
        } catch (err) {
            console.error('Error marking notification as read:', err);
            const targetUrl = normalizeNotificationTarget(notif.target_url);
            if (targetUrl) navigate(targetUrl);
        }
    };

    if (loading) {
        return <div className="p-5 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-1">Welcome, {user?.username || 'Coach'}</h3>
                    <div className="text-muted">Review today&apos;s classes, open opportunities, and recent notifications.</div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-secondary fw-bold d-block mb-2">Approved Classes</small>
                            <h3 className="fw-bold text-success m-0">{batches.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-secondary fw-bold d-block mb-2">Today&apos;s Schedule</small>
                            <h3 className="fw-bold text-primary m-0">{todaysSchedule.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div
                        className="card border-0 shadow-sm rounded-4 h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/coach/batch-applications')}
                    >
                        <div className="card-body p-4">
                            <small className="text-secondary fw-bold d-block mb-2">Available Batches</small>
                            <h3 className="fw-bold text-warning m-0">{availableBatches.length}</h3>
                            <div className="small text-muted mt-2">View and apply for open classes</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 bg-light border-bottom">
                            <h6 className="fw-bold m-0">Today&apos;s Schedule</h6>
                        </div>
                        <div className="p-4 d-flex flex-column gap-3">
                            {todaysSchedule.length === 0 ? (
                                <div className="text-center text-muted py-4">No classes assigned for today.</div>
                            ) : (
                                todaysSchedule.map((session) => (
                                    <div key={session.batch_id} className="border rounded-4 p-3 bg-light">
                                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                                            <div>
                                                <div className="fw-bold">{session.title}</div>
                                                <div className="small text-muted mt-1">{session.time}</div>
                                                <div className={`small fw-semibold mt-2 ${session.sessionStatus.tone}`}>
                                                    {session.sessionStatus.label}
                                                </div>
                                            </div>
                                            <button
                                                className={`btn btn-sm fw-bold ${session.sessionStatus.canStart ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                                style={session.sessionStatus.canStart ? { backgroundColor: '#6c9343', border: 'none' } : {}}
                                                disabled={!session.sessionStatus.canStart}
                                                onClick={() => navigate('/coach/mark-attendance', {
                                                    state: {
                                                        batchId: session.batch_id,
                                                        batchName: session.title,
                                                    },
                                                })}
                                            >
                                                {session.sessionStatus.buttonLabel}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-4">
                        <div className="p-3 bg-light border-bottom">
                            <h6 className="fw-bold m-0">My Approved Classes</h6>
                        </div>
                        <div className="p-4 d-flex flex-column gap-3">
                            {batches.length === 0 ? (
                                <div className="text-center text-muted py-4">You don&apos;t have any approved classes yet.</div>
                            ) : (
                                batches.map((batch) => (
                                    <div key={batch.id} className="border rounded-4 p-3 bg-light d-flex justify-content-between align-items-center gap-3">
                                        <div>
                                            <div className="fw-bold">{batch.batch_name}</div>
                                            <div className="small text-muted">{batch.schedule_day || batch.exact_date} | {batch.start_time} - {batch.end_time}</div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-success fw-bold"
                                            onClick={() => navigate('/coach/classes')}
                                        >
                                            View Class
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Recent Notifications</h6>
                            <span className="badge rounded-pill bg-success" style={{ backgroundColor: '#6c9343' }}>{statsData?.notifications || 0} New</span>
                        </div>
                        <div className="list-group list-group-flush">
                            {!statsData?.recent_notifications || statsData.recent_notifications.length === 0 ? (
                                <div className="p-4 text-center text-muted">No notifications yet.</div>
                            ) : (
                                statsData.recent_notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`list-group-item list-group-item-action p-3 border-start border-4 ${!notif.is_read ? 'border-success bg-light' : 'border-transparent'}`}
                                        onClick={() => handleNotificationClick(notif)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex w-100 justify-content-between align-items-start">
                                            <strong className="small text-dark">{notif.title}</strong>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <p className="mb-0 small text-secondary mt-1">{notif.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
