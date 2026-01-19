import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CoachDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container">
          <span className="navbar-brand">Chess Academy - Coach Dashboard</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Welcome, Coach {user?.first_name}!</span>
            <button className="btn btn-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h2>Coach Dashboard</h2>
        <p>You can manage your batches, mark attendance, and view your schedule.</p>
      </div>
    </div>
  );
};

export default CoachDashboard;