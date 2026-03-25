import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';
import NotificationTray from '../NotificationTray';
import MarkAttendanceAlert from '../MarkAttendanceAlert';
import NotificationAlert from '../NotificationAlert';

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [stats, setStats] = useState({ pending_students: 0, pending_reschedules: 0 });
    const profileMenuRef = useRef(null);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchStats();
        // Optional: Poll for stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/analytics/reports/dashboard_stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    return (
        <div className="d-flex bg-light" style={{ minHeight: '100vh', width: '100%' }}>
            {/* Sidebar */}
            <div className="bg-white" style={{ width: '280px', minHeight: '100vh', position: 'fixed', zIndex: 1000 }}>
                <div className="p-4 mb-2 text-center" style={{ backgroundColor: '#6c9343', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h5 className="fw-bold m-0 text-white">AAA Grand Master</h5>
                </div>

                <ul className="nav flex-column gap-2 px-2">
                    <li className="nav-item">
                        <NavLink
                            to="/admin/dashboard"
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
                            to="/admin/students"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <div className="d-flex align-items-center w-100 justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-people-fill"></i>
                                    <span className="text-truncate">Student Management</span>
                                </div>
                                {stats.pending_students > 0 && (
                                    <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: '0.7rem' }}>{stats.pending_students}</span>
                                )}
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/admin/coaches"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <div className="d-flex align-items-center w-100 justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-person-badge-fill"></i>
                                    <span className="text-truncate">Coach Management</span>
                                </div>
                                {/* Removed badge as requested */}
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/admin/attendance"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-calendar-check-fill"></i>
                            Attendance
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/admin/batches"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-collection-fill"></i>
                            Batches
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/admin/payments"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-currency-dollar"></i>
                            Payments & Finance
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/admin/tournaments"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-trophy-fill"></i>
                            Tournaments
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/admin/reschedule-requests"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <div className="d-flex align-items-center w-100 justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <span style={{ lineHeight: '1.2' }}>Reschedule<br />Approval</span>
                                </div>
                                {stats.pending_reschedules > 0 && (
                                    <span className="badge bg-success rounded-pill" style={{ fontSize: '0.7rem' }}>{stats.pending_reschedules}</span>
                                )}
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/admin/reports"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-bar-chart-fill"></i>
                            Reports
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
                {/* Header */}
                <header className="border-bottom py-3 px-4 d-flex justify-content-between align-items-center sticky-top" style={{ backgroundColor: '#6c9343', color: 'white' }}>
                    <div></div>

                    <div className="d-flex align-items-center gap-4">
                        <NotificationTray />

                        <div className="position-relative" ref={profileMenuRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 text-white border-0 bg-transparent"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                    style={{ width: '32px', height: '32px' }}>
                                    {user?.username?.charAt(0) || 'A'}
                                </div>
                                <span className="text-white fw-bold">{user?.username || 'Admin'}</span>
                                <i className="bi bi-chevron-down small text-white"></i>
                            </button>

                            {showProfileMenu && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm py-2" style={{ minWidth: '200px', top: '100%', right: 0, zIndex: 1050 }}>
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <p className="m-0 fw-bold text-dark">{user?.username}</p>
                                        <small className="text-muted">{user?.email}</small>
                                    </div>
                                    <Link to="/admin/profile" className="dropdown-item px-3 py-2 text-dark d-flex align-items-center gap-2">
                                        <i className="bi bi-person"></i> View Profile
                                    </Link>
                                    <div className="dropdown-divider my-2"></div>
                                    <button onClick={logout} className="dropdown-item px-3 py-2 text-danger d-flex align-items-center gap-2">
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-4 flex-grow-1">
                    <NotificationAlert />
                    <MarkAttendanceAlert />
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
