import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ClerkDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
        <div className="container">
          <span className="navbar-brand">Chess Academy - Clerk Dashboard</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Welcome, {user?.first_name}!</span>
            <button className="btn btn-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h2>Clerk Dashboard</h2>
        <p>You can manage student registrations, record attendance, and handle payments.</p>
      </div>
    </div>
  );
};

export default ClerkDashboard;