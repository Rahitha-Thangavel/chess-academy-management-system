import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [stats, setStats] = useState({ pending_students: 0, pending_reschedules: 0 });
    const profileMenuRef = useRef(null);

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
                <div className="p-4 mb-2">
                    <h5 className="fw-bold text-success m-0" style={{ color: '#6c9343' }}>CAMS Admin</h5>
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
                            to="/admin/schedule"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-clock-fill"></i>
                            Class Schedule
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
                <header className="border-bottom py-3 px-4 d-flex justify-content-between align-items-center sticky-top bg-white">
                    <h5 className="m-0 fw-bold text-secondary">Chess Academy Management System</h5>

                    <div className="d-flex align-items-center gap-4">
                        <Link to="/notifications" className="text-dark bg-transparent border-0 position-relative">
                            <i className="bi bi-bell fs-5 text-secondary"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: '0.6rem' }}>
                                8
                            </span>
                        </Link>
                        <i className="bi bi-gear fs-5 text-secondary"></i>

                        <div className="position-relative" ref={profileMenuRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 text-dark border-0 bg-transparent"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                    style={{ width: '35px', height: '35px', backgroundColor: '#6c9343' }}>
                                    {user?.first_name?.charAt(0) || 'A'}
                                </div>
                                <span className="d-none d-md-block small fw-bold">{user?.first_name || 'Admin'}</span>
                            </button>

                            {showProfileMenu && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm py-2" style={{ minWidth: '200px', top: '100%', right: 0, zIndex: 1050 }}>
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <p className="m-0 fw-bold">{user?.first_name} {user?.last_name}</p>
                                        <small className="text-secondary">{user?.email}</small>
                                    </div>
                                    <button className="dropdown-item px-3 py-2 text-secondary d-flex align-items-center gap-2">
                                        <i className="bi bi-person"></i> View Profile
                                    </button>
                                    <button className="dropdown-item px-3 py-2 text-secondary d-flex align-items-center gap-2">
                                        <i className="bi bi-gear"></i> Settings
                                    </button>
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
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
