import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css';

const ParentLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const profileMenuRef = useRef(null);
    const notificationsRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/api/notifications/unread_count/');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/api/notifications/mark_all_read/');
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
            {/* Sidebar */}
            <div className="bg-white" style={{ width: '280px', minHeight: '100vh', position: 'fixed', zIndex: 1000 }}>
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}> {/* Greenish header match */}
                    <Link to="/parent/dashboard" className="text-white text-decoration-none h5 fw-bold">
                        AAA Grand Master
                    </Link>
                </div>

                <div className="py-4 border-end h-100">
                    <ul className="nav flex-column gap-2 px-2">
                        <li className="nav-item">
                            <NavLink
                                to="/parent/dashboard"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-grid-fill"></i>
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/parent/children"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-people-fill"></i>
                                My Children
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/parent/attendance"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-calendar-event"></i>
                                Attendance
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/parent/payments"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-credit-card"></i>
                                Payments
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/parent/tournaments"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-trophy"></i>
                                Tournaments
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/parent/reschedule"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-clock-history"></i>
                                Rescheduled Request
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
                {/* Header */}
                <header className="border-bottom py-3 px-4 d-flex justify-content-between align-items-center sticky-top" style={{ backgroundColor: '#6c9343', color: 'white' }}>
                    <h4 className="m-0 fw-bold"> </h4> {/* Placeholder to balance flex */}
                    <div className="d-flex align-items-center gap-4">
                        <div className="position-relative" ref={notificationsRef}>
                            <button
                                className="btn text-white bg-transparent border-0 position-relative p-0"
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) fetchNotifications();
                                }}
                            >
                                <i className="bi bi-bell fs-5"></i>
                                {unreadCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 1050 }}>
                                    <div className="p-2 border-bottom d-flex justify-content-between align-items-center bg-light">
                                        <h6 className="m-0 fw-bold small text-secondary">Notifications</h6>
                                        <button className="btn btn-link btn-sm text-decoration-none p-0" style={{ fontSize: '0.75rem' }} onClick={markAllRead}>Mark all read</button>
                                    </div>
                                    <div className="list-group list-group-flush">
                                        {notifications.length === 0 ? (
                                            <div className="p-3 text-center text-muted small">No notifications</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} className={`list-group-item list-group-item-action p-2 ${!notif.is_read ? 'bg-light' : ''}`}>
                                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                                        <strong className="mb-1 small text-dark d-block">{notif.title}</strong>
                                                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>{new Date(notif.created_at).toLocaleDateString()}</small>
                                                    </div>
                                                    <p className="mb-1 small text-secondary text-truncate" style={{ fontSize: '0.8rem' }}>{notif.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="position-relative" ref={profileMenuRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 text-white border-0 bg-transparent"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                    style={{ width: '32px', height: '32px' }}>
                                    {user?.first_name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-white">{user?.first_name || 'User'}</span>
                                <i className="bi bi-chevron-down small text-white"></i>
                            </button>

                            {showProfileMenu && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm py-2" style={{ minWidth: '200px', top: '100%', right: 0, zIndex: 1050 }}>
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <p className="m-0 fw-bold text-dark">{user?.first_name} {user?.last_name}</p>
                                        <small className="text-muted">{user?.email}</small>
                                    </div>
                                    <Link to="/parent/profile" className="dropdown-item px-3 py-2 text-dark d-flex align-items-center gap-2">
                                        <i className="bi bi-person"></i> View Profile
                                    </Link>
                                    <button
                                        className="dropdown-item px-3 py-2 text-danger d-flex align-items-center gap-2"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 flex-grow-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ParentLayout;
