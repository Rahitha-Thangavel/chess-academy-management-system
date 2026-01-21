import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Chess Academy - Admin Dashboard</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Welcome, {user?.first_name}!</span>
            <button className="btn btn-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h2>Admin Dashboard</h2>
        <div className="row mt-4">
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <h5 className="card-title">Students</h5>
                <p className="card-text">Manage student registrations and profiles</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-success">
              <div className="card-body">
                <h5 className="card-title">Attendance</h5>
                <p className="card-text">Record and view attendance</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-warning">
              <div className="card-body">
                <h5 className="card-title">Payments</h5>
                <p className="card-text">Manage fees and payments</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <h5 className="card-title">Reports</h5>
                <p className="card-text">Generate reports and analytics</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-dark" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/admin/create-admin'}>
              <div className="card-body">
                <h5 className="card-title">Create Admin</h5>
                <p className="card-text">Create new administrator account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;