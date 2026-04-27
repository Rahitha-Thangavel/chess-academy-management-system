/**
 * UI component: Notificationalert.
 * 
 * Reusable React UI component used across the app.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { normalizeNotificationTarget } from '../utils/notificationRoutes';

const NotificationAlert = () => {
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [lastCheckedCount, setLastCheckedCount] = useState(0);
    const { user } = useAuth();
    const { unreadNotifications: sharedUnread, fetchNotifications, markRead } = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            checkNotifications();
            const interval = setInterval(checkNotifications, 30000); // Check every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const checkNotifications = async () => {
        try {
            const fetched = await fetchNotifications();
            const unread = (fetched || []).filter(n => !n.is_read);

            if (unread.length > 0 && unread.length > lastCheckedCount) {
                setUnreadNotifications(unread);
                setShowModal(true);
            }
            setLastCheckedCount(unread.length);
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    };

    useEffect(() => {
        if (sharedUnread.length === 0) {
            setUnreadNotifications([]);
            setShowModal(false);
        }
    }, [sharedUnread]);

    const handleAction = async (notif) => {
        setShowModal(false);
        if (notif?.id) {
            await markRead(notif.id);
        }
        const targetUrl = normalizeNotificationTarget(notif?.target_url);
        if (targetUrl) {
            navigate(targetUrl);
        }
    };

    const closeAlert = () => {
        setShowModal(false);
    };

    if (!showModal || unreadNotifications.length === 0) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0 bg-success text-white">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-bell-fill me-2"></i>
                            Notifications
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={closeAlert}></button>
                    </div>
                    <div className="modal-body p-4 text-center">
                        {unreadNotifications.length === 1 ? (
                            <>
                                <h6 className="fw-bold mb-3">{unreadNotifications[0].title}</h6>
                                <p className="text-secondary mb-4">{unreadNotifications[0].message}</p>
                                <button
                                    className="btn btn-success px-4 py-2 fw-bold"
                                    onClick={() => handleAction(unreadNotifications[0])}
                                >
                                    View Details
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <span className="display-4 fw-bold text-success">{unreadNotifications.length}</span>
                                </div>
                                <h6 className="fw-bold mb-3">You have {unreadNotifications.length} unread notifications</h6>
                                <p className="text-secondary mb-4">Check your notification tray for details about recent updates.</p>
                                <button
                                    className="btn btn-success px-4 py-2 fw-bold"
                                    onClick={() => setShowModal(false)}
                                >
                                    Got it
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationAlert;
