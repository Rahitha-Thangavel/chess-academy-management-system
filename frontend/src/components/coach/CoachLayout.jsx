import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';
import NotificationTray from '../NotificationTray';
import NotificationAlert from '../NotificationAlert';
import 'bootstrap/dist/css/bootstrap.min.css';

const CoachLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [stats, setStats] = useState({ pending_attendance: 0 });
    const profileMenuRef = useRef(null);

    useEffect(() => {
        fetchStats();
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
            {/* Sidebar */}
            <div className="bg-white" style={{ width: '280px', minHeight: '100vh', position: 'fixed', zIndex: 1000 }}>
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}>
                    <Link to="/coach/dashboard" className="text-white text-decoration-none h5 fw-bold">
                        AAA Grand Master
                    </Link>
                </div>

                <div className="py-4 border-end h-100">
                    <ul className="nav flex-column gap-2 px-2">
                        <li className="nav-item">
                            <NavLink
                                to="/coach/dashboard"
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
                                to="/coach/classes"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-ui-checks-grid"></i>
                                My Classes
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/coach/attendance"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <div className="d-flex align-items-center w-100 justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <i className="bi bi-check-square"></i>
                                        <span>Attendance</span>
                                    </div>
                                    {stats.pending_attendance > 0 && (
                                        <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>{stats.pending_attendance}</span>
                                    )}
                                </div>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/coach/batch-applications"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-briefcase"></i>
                                Batch Opportunities
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/coach/salary"
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-currency-dollar"></i>
                                Salary
                            </NavLink>
                        </li>
                        {/* Profile link is REMOVED from sidebar as requested */}
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
                {/* Header */}
                <header className="border-bottom py-3 px-4 d-flex justify-content-between align-items-center sticky-top shadow-sm" style={{ backgroundColor: '#6c9343', color: 'white' }}>
                    <h4 className="m-0 fw-bold text-white"></h4>
                    <div className="d-flex align-items-center gap-4">
                        <NotificationTray />

                        <div className="position-relative" ref={profileMenuRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 text-white border-0 bg-transparent"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                    style={{ width: '32px', height: '32px' }}>
                                    {user?.username?.charAt(0) || 'C'}
                                </div>
                                <span className="text-white">{user?.username || 'Coach'}</span>
                                <i className="bi bi-chevron-down small text-white"></i>
                            </button>

                            {showProfileMenu && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm py-2" style={{ minWidth: '200px', top: '100%', right: 0, zIndex: 1050 }}>
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <p className="m-0 fw-bold text-dark">{user?.username}</p>
                                        <small className="text-muted">{user?.email}</small>
                                    </div>
                                    <Link to="/coach/profile" className="dropdown-item px-3 py-2 text-dark d-flex align-items-center gap-2">
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
                    <NotificationAlert />
                    {children}
                </main>
            </div>
        </div>
    );
};

export default CoachLayout;
