
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClerkLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
            {/* Sidebar */}
            <div className="bg-white" style={{ width: '280px', minHeight: '100vh', position: 'fixed', zIndex: 1000 }}>
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}>
                    <Link to="/clerk/dashboard" className="text-white text-decoration-none h5 fw-bold">
                        CAMS
                        <span className="d-block small fw-normal opacity-75" style={{ fontSize: '0.8rem' }}>Chess Academy Management</span>
                    </Link>
                </div>

                <div className="py-4 border-end h-100">
                    <ul className="nav flex-column gap-2 px-2">
                        <li className="nav-item">
                            <NavLink
                                to="/clerk/dashboard"
                                className={({ isActive }) =>
                                    `nav - link d - flex align - items - center gap - 3 px - 3 py - 2 rounded - 2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'} `
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-grid-fill"></i>
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/clerk/students"
                                className={({ isActive }) =>
                                    `nav - link d - flex align - items - center gap - 3 px - 3 py - 2 rounded - 2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'} `
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-people-fill"></i>
                                Students
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/clerk/attendance"
                                className={({ isActive }) =>
                                    `nav - link d - flex align - items - center gap - 3 px - 3 py - 2 rounded - 2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'} `
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-calendar-check-fill"></i>
                                Attendance
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/clerk/payments"
                                className={({ isActive }) =>
                                    `nav - link d - flex align - items - center gap - 3 px - 3 py - 2 rounded - 2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'} `
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-cash-stack"></i>
                                Payments
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/clerk/tournaments"
                                className={({ isActive }) =>
                                    `nav - link d - flex align - items - center gap - 3 px - 3 py - 2 rounded - 2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'} `
                                }
                                style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                            >
                                <i className="bi bi-trophy-fill"></i>
                                Tournaments
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
                {/* Header */}
                <header className="border-bottom py-3 px-4 d-flex justify-content-between align-items-center sticky-top bg-white">
                    <h5 className="m-0 fw-bold text-secondary">Chess Academy Management System</h5>

                    <div className="d-flex align-items-center gap-4">
                        <div className="input-group d-none d-md-flex" style={{ width: '300px' }}>
                            <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
                            <input type="text" className="form-control bg-light border-0" placeholder="Search students, payments..." />
                        </div>

                        <Link to="/notifications" className="text-dark bg-transparent border-0 position-relative">
                            <i className="bi bi-bell fs-5 text-secondary"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                5
                            </span>
                        </Link>

                        <div className="position-relative" ref={profileMenuRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 text-dark border-0 bg-transparent"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                    style={{ width: '35px', height: '35px' }}>
                                    {user?.first_name ? user.first_name.charAt(0) : 'S'}
                                </div>
                                <div className="d-flex flex-column align-items-start" style={{ lineHeight: '1.2' }}>
                                    <span className="fw-bold small">{user?.first_name || 'Sivapalan'}</span>
                                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Clerk</span>
                                </div>
                                <i className="bi bi-chevron-down small text-secondary"></i>
                            </button>

                            {showProfileMenu && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm py-2" style={{ minWidth: '200px', top: '100%', right: 0, zIndex: 1050 }}>
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <p className="m-0 fw-bold text-dark">{user?.first_name} {user?.last_name}</p>
                                        <small className="text-muted">{user?.email}</small>
                                    </div>
                                    <button className="dropdown-item px-3 py-2 text-dark d-flex align-items-center gap-2">
                                        <i className="bi bi-person"></i> View Profile
                                    </button>
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

export default ClerkLayout;
