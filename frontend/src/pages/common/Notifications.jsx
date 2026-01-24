import React from 'react';

const Notifications = () => {
    // Mock Notifications
    const notifications = [
        {
            id: 1,
            title: 'Schedule Request Approved',
            message: 'Your request to reschedule the Beginner A class on Dec 5 has been approved.',
            time: '2 hours ago',
            type: 'success',
            icon: 'bi-check-circle-fill'
        },
        {
            id: 2,
            title: 'New Tournament Announced',
            message: 'Registration for the Junior Chess Championship 2024 is now open.',
            time: '5 hours ago',
            type: 'info',
            icon: 'bi-trophy-fill'
        },
        {
            id: 3,
            title: 'Payment Reminder',
            message: 'Monthly fee for November is due soon. Please clear your dues.',
            time: '1 day ago',
            type: 'warning',
            icon: 'bi-exclamation-circle-fill'
        },
        {
            id: 4,
            title: 'System Update',
            message: 'The system will be undergoing maintenance on Saturday at 2 AM.',
            time: '2 days ago',
            type: 'primary',
            icon: 'bi-info-circle-fill'
        }
    ];

    return (
        <div className="container mt-4">
            <h3 className="fw-bold mb-4">Notifications</h3>

            <div className="d-flex flex-column gap-3">
                {notifications.map((notif) => (
                    <div key={notif.id} className="card border-0 shadow-sm rounded-3 overflow-hidden">
                        <div className="card-body p-4 d-flex gap-3 align-items-start">
                            <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center text-${notif.type} bg-${notif.type}-subtle`}
                                style={{ width: '50px', height: '50px' }}>
                                <i className={`bi ${notif.icon} fs-4`}></i>
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="fw-bold m-0 text-dark">{notif.title}</h6>
                                    <small className="text-secondary">{notif.time}</small>
                                </div>
                                <p className="text-secondary m-0">{notif.message}</p>
                            </div>
                            <button className="btn btn-sm btn-light text-secondary rounded-circle" style={{ width: '32px', height: '32px' }}>
                                <i className="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-5 text-secondary">
                        <i className="bi bi-bell-slash fs-1 mb-3 d-block"></i>
                        <p>No new notifications</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-4">
                <button className="btn btn-link text-decoration-none text-secondary small">View Earlier Notifications</button>
            </div>
        </div>
    );
};

export default Notifications;
