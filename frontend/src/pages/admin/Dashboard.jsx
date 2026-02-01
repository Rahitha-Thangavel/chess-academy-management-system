import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/analytics/reports/dashboard_stats/');
        setStatsData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-5 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-5 text-center text-danger">Error: {error}</div>;

  const stats = [
    { label: 'Total Students', value: statsData.total_students, icon: 'bi-people', bg: 'bg-light text-success' },
    { label: 'Active Coaches', value: statsData.active_coaches, icon: 'bi-person-badge', bg: 'bg-light text-success' },
    { label: 'Pending Actions', value: statsData.pending_actions, icon: 'bi-exclamation-triangle', bg: 'bg-warning-subtle text-warning' },
    { label: 'Notifications', value: statsData.notifications, icon: 'bi-bell', bg: 'bg-light text-success' },
    { label: "Today's Classes", value: statsData.todays_classes, icon: 'bi-calendar-event', bg: 'bg-light text-success' },
    { label: 'Payments Due', value: `LKR ${Number(statsData.payments_due).toLocaleString()}`, icon: 'bi-currency-dollar', bg: 'bg-light text-success' }
  ];

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-2 text-success" style={{ color: '#6c9343' }}>Welcome, {user?.username || 'Admin'}</h3>

      <div className="row g-4 mt-2">
        {/* Left Column: Stats & Notifications */}
        <div className="col-lg-8">
          {/* Stats Grid */}
          <div className="row g-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="col-md-6">
                <div className="card border-0 shadow-sm p-3 h-100 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center ${stat.label === 'Pending Actions' ? 'text-warning' : 'text-success'}`}
                      style={{ width: '50px', height: '50px', backgroundColor: 'white' }}>
                      <i className={`bi ${stat.icon} fs-4`}></i>
                    </div>
                    <div>
                      <small className="text-secondary fw-bold d-block">{stat.label}</small>
                      <h4 className="fw-bold m-0">{stat.value}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Wide Notification Card */}
          <div className="card border-0 shadow-sm p-3 mt-3 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-3 d-flex align-items-center justify-content-center text-success"
                style={{ width: '50px', height: '50px', backgroundColor: 'white' }}>
                <i className="bi bi-bell fs-4"></i>
              </div>
              <div>
                <small className="text-secondary fw-bold d-block">Notifications</small>
                <h4 className="fw-bold m-0">{statsData.notifications}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Finance */}
        <div className="col-lg-4">
          {/* Today's Schedule */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
              <h6 className="fw-bold m-0">Today's Schedule</h6>
            </div>
            <div className="p-3 d-flex flex-column gap-3">
              {statsData.todays_schedule.length === 0 ? (
                <div className="text-center text-secondary py-3">No classes scheduled today.</div>
              ) : (
                statsData.todays_schedule.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="fw-bold m-0 d-flex justify-content-between">
                      {item.time}
                      <span className="text-secondary fw-normal" style={{ fontSize: '0.9rem' }}>{item.title}</span>
                    </h6>
                    <div className="text-secondary small mt-1">({item.coach})</div>
                    <div className="text-secondary small mt-1">{item.students}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Overview */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
              <h6 className="fw-bold m-0">Financial Overview</h6>
            </div>
            <div className="p-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary fw-bold">Monthly Revenue</span>
                <span className="fw-bold text-success">LKR {Number(statsData.monthly_revenue).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary fw-bold">Pending Payments</span>
                <span className="fw-bold text-warning">LKR {Number(statsData.payments_due).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;