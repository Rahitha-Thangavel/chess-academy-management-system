/**
 * UI component: Notificationtray.
 * 
 * Reusable React UI component used across the app.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { normalizeNotificationTarget } from '../utils/notificationRoutes';

const NotificationTray = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
    } = useNotifications();

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.is_read) {
                await markRead(notif.id);
            }
            setShowDropdown(false);
            const targetUrl = normalizeNotificationTarget(notif.target_url);
            if (targetUrl) {
                navigate(targetUrl);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="btn text-white bg-transparent border-0 position-relative p-0 d-flex align-items-center gap-2"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <div className="position-relative">
                    <i className="bi bi-bell fs-5"></i>
                    {unreadCount > 0 && (
                        <span className="position-absolute translate-middle badge rounded-circle bg-danger d-flex align-items-center justify-content-center shadow-sm"
                            style={{
                                top: '0',
                                left: '100%',
                                fontSize: '0.75rem',
                                minWidth: '19px',
                                height: '19px',
                                padding: '2px',
                                border: '1.5px solid #6c9343', // Match header green
                                fontWeight: 'bold'
                            }}>
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <span className="d-none d-md-inline small fw-bold" style={{ fontSize: '0.8rem' }}>
                        You have {unreadCount} {unreadCount === 1 ? 'notification' : 'notifications'}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg" style={{ width: '350px', maxHeight: '450px', overflowY: 'auto', zIndex: 1050 }}>
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light sticky-top">
                        <h6 className="m-0 fw-bold text-dark">Notifications</h6>
                        {unreadCount > 0 && (
                            <button className="btn btn-link btn-sm text-decoration-none p-0 text-success fw-bold" style={{ fontSize: '0.75rem' }} onClick={() => markAllRead()}>
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="list-group list-group-flush">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                <i className="bi bi-bell-slash d-block fs-3 mb-2"></i>
                                <p className="small m-0">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`list-group-item list-group-item-action p-3 border-start border-4 ${!notif.is_read ? 'border-success bg-light' : 'border-transparent'}`}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                                        <strong className="small text-dark">{notif.title}</strong>
                                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <p className="mb-0 small text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                        {notif.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationTray;
