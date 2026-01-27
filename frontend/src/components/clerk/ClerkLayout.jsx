
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
                <div className="p-4 mb-2">
                    <h5 className="fw-bold text-success m-0" style={{ color: '#6c9343' }}>AAA Grand Master</h5>
                </div>

                <ul className="nav flex-column gap-2 px-2">
                    <li className="nav-item">
                        <NavLink
                            to="/clerk/dashboard"
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
                            to="/clerk/students"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <div className="d-flex align-items-center w-100 justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-people-fill"></i>
                                    <span>Students</span>
                                </div>
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/clerk/attendance"
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
                            to="/clerk/payments"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-currency-dollar"></i>
                            Payments
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/clerk/tournaments"
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive ? 'bg-success text-white' : 'text-secondary hover-bg-light'}`
                            }
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#6c9343' : '' })}
                        >
                            <i className="bi bi-trophy-fill"></i>
                            Tournaments
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
                {/* Header */}
                <header className="border-bottom py-3 px-4 d-flex justify-content-between align-items-center sticky-top bg-white">
                    <h5 className="m-0 fw-bold text-secondary">Clerk Dashboard</h5>

                    <div className="d-flex align-items-center gap-4">
                        <Link to="/clerk/notifications" className="text-dark bg-transparent border-0 position-relative">
                            <i className="bi bi-bell fs-5 text-secondary"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: '0.6rem' }}>
                                5
                            </span>
                        </Link>

                        <div className="position-relative" ref={profileMenuRef}>
                            <button
                                className="btn d-flex align-items-center gap-2 text-dark border-0 bg-transparent"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                    style={{ width: '35px', height: '35px', backgroundColor: '#6c9343' }}>
                                    {user?.first_name ? user.first_name.charAt(0) : 'C'}
                                </div>
                                <span className="d-none d-md-block small fw-bold">{user?.first_name || 'Clerk'}</span>
                            </button>

                            {showProfileMenu && (
                                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm py-2" style={{ minWidth: '200px', top: '100%', right: 0, zIndex: 1050 }}>
                                    <div className="px-3 py-2 border-bottom mb-2">
                                        <p className="m-0 fw-bold text-dark">{user?.first_name} {user?.last_name}</p>
                                        <small className="text-muted">{user?.email}</small>
                                    </div>
                                    <Link to="/clerk/profile" className="dropdown-item px-3 py-2 text-dark d-flex align-items-center gap-2">
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

export default ClerkLayout;
