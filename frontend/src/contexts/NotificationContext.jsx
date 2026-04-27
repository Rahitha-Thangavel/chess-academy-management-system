/**
 * Frontend module: frontend/src/contexts/NotificationContext.jsx.
 * 
 * Part of the chess academy management system UI.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from './AuthContext';
import { normalizeNotificationTarget } from '../utils/notificationRoutes';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastFetchedAt, setLastFetchedAt] = useState(null);

    const fetchNotifications = async () => {
        if (!user) {
            setNotifications([]);
            return [];
        }

        setLoading(true);
        try {
            const response = await axios.get('/notifications/');
            const rows = Array.isArray(response.data)
                ? response.data
                    .map((item) => ({ ...item, target_url: normalizeNotificationTarget(item.target_url) }))
                    .filter((item) => !item.is_read)
                : [];
            setNotifications(rows);
            setLastFetchedAt(Date.now());
            return rows;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return undefined;
        }

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const markRead = async (notificationId) => {
        await axios.post(`/notifications/${notificationId}/mark_read/`);
        setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
    };

    const markAllRead = async () => {
        await axios.post('/notifications/mark_all_read/');
        setNotifications([]);
    };

    const unreadNotifications = useMemo(
        () => notifications.filter((item) => !item.is_read),
        [notifications],
    );

    const value = useMemo(() => ({
        notifications,
        unreadNotifications,
        unreadCount: unreadNotifications.length,
        loading,
        lastFetchedAt,
        fetchNotifications,
        markRead,
        markAllRead,
    }), [notifications, unreadNotifications, loading, lastFetchedAt]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
