import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ParentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-info">
        <div className="container">
          <span className="navbar-brand">Chess Academy - Parent Dashboard</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Welcome, {user?.first_name}!</span>
            <button className="btn btn-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h2>Parent Dashboard</h2>
        <p>You can view your children's attendance, payments, and register for tournaments.</p>
      </div>
    </div>
  );
};

export default ParentDashboard;