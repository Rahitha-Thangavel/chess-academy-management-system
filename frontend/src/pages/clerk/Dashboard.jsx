import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/analytics/reports/dashboard_stats/');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  const stats = [
    { label: "Today's payments", value: `LKR ${data?.today_payments?.toLocaleString() || 0}`, color: 'success' },
    { label: 'Attendance to record', value: `${data?.todays_classes || 0} classes`, color: 'success' }
  ];

  const tasks = [
    { title: 'Payments to record', count: data?.unpaid_students_count || 0, icon: 'bi-cash' },
    { title: 'Attendance to update', count: data?.todays_classes || 0, icon: 'bi-calendar-check' },
  ];

  const overview = [
    { label: 'Classes scheduled today', value: data?.todays_classes || 0 },
    { label: 'Expected payments (Monthly)', value: `LKR ${(data?.unpaid_students_count * 2000)?.toLocaleString()}` }, // Rough estimate
    { label: 'Upcoming tournaments', value: data?.upcoming_tournaments_count || 0 },
  ];

  const activity = data?.recent_registrations || [];

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4">Dashboard</h3>

      {/* Top Stats */}
      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-md-6">
            <div className="p-3 bg-success-subtle rounded-3 h-100">
              <small className="text-secondary fw-bold" style={{ fontSize: '0.8rem' }}>{stat.label}:</small>
              <h4 className="fw-bold text-success m-0 mt-1">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 d-flex align-items-stretch">
        {/* Col 1: Pending Tasks */}
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
            <div className="d-flex align-items-center gap-2 mb-4 text-success">
              <i className="bi bi-clipboard-check h5 m-0"></i>
              <h5 className="fw-bold m-0 text-dark">Pending Tasks</h5>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
              {tasks.map((task, idx) => (
                <div key={idx} className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <span className="small fw-bold text-dark w-75">{task.title}</span>
                  <span className="fw-bold h5 m-0">{task.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto p-3 bg-danger-subtle rounded-3 d-flex align-items-center gap-3 border border-danger-subtle">
              <div className="bg-white text-danger rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>{data?.notifications || 0}</div>
              <span className="fw-bold text-dark">Urgent notifications</span>
              <span className="text-danger fw-bold ms-auto">{data?.notifications || 0}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Today's Overview */}
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
            <div className="d-flex align-items-center gap-2 mb-4 text-success">
              <i className="bi bi-calendar-event h5 m-0"></i>
              <h5 className="fw-bold m-0 text-dark">Today's Overview</h5>
            </div>

            <div className="d-flex flex-column gap-3">
              {overview.map((item, idx) => (
                <div key={idx} className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-start">
                  <span className="small fw-bold text-secondary w-50">{item.label}</span>
                  <span className="fw-bold text-dark text-end w-50 small">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Recent Activity */}
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
            <div className="d-flex align-items-center gap-2 mb-4 text-success">
              <i className="bi bi-activity h5 m-0"></i>
              <h5 className="fw-bold m-0 text-dark">Recent Activity</h5>
            </div>

            <div className="mb-4">
              <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Last 5 Student Registrations</small>
              <div className="d-flex flex-column gap-3 mt-3">
                {activity.map((act, idx) => (
                  <div key={idx} className="d-flex justify-content-between">
                    <span className="fw-bold text-dark">{act.name}</span>
                    <span className="text-secondary small">{act.detail}</span>
                  </div>
                ))}
                {activity.length === 0 && <p className="text-muted small">No recent registrations.</p>}
              </div>
            </div>

            <div className="mt-auto d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">Today's payments processed</span>
                <span className="fw-bold">{data?.today_payments_count || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">Expected classes today</span>
                <span className="fw-bold">{data?.todays_classes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;