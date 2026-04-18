const LEGACY_ROUTE_MAP = {
    '/parent/students': '/parent/children',
    '/admin/batches': '/admin/schedule',
    '/coach/batches': '/coach/batch-applications',
    '/admin/reschedule': '/admin/reschedule-requests',
};

export const normalizeNotificationTarget = (targetUrl) => {
    if (!targetUrl) {
        return null;
    }

    const cleanTarget = targetUrl.startsWith('/') ? targetUrl.replace(/\/+$/, '') : `/${targetUrl.replace(/\/+$/, '')}`;
    return LEGACY_ROUTE_MAP[cleanTarget] || cleanTarget;
};
