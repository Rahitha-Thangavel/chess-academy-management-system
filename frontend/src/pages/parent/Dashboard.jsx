import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/analytics/reports/dashboard_stats/');
        setStatsData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-5 text-center">Loading dashboard...</div>;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await axios.post(`/api/notifications/${notif.id}/mark_read/`);
      }
      if (notif.target_url) navigate(notif.target_url);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (notif.target_url) navigate(notif.target_url);
    }
  };

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4 text-success" style={{ color: '#6c9343' }}>Welcome, {user?.username || 'Parent'}</h3>

      <div className="row g-4">
        {/* Stats Cards */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-success-subtle h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/children')}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-success fw-bold d-block mb-1">Your Students</small>
                <h3 className="fw-bold m-0 text-success">{statsData?.total_students || 0}</h3>
              </div>
              <i className="bi bi-people fs-1 text-success opacity-25"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-warning-subtle h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/payments')}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-warning fw-bold d-block mb-1">Pending Payments</small>
                <h3 className="fw-bold m-0 text-warning">{statsData?.pending_payments || 0}</h3>
              </div>
              <i className="bi bi-currency-dollar fs-1 text-warning opacity-25"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-primary-subtle h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-primary fw-bold d-block mb-1">New Notifications</small>
                <h3 className="fw-bold m-0 text-primary">{statsData?.notifications || 0}</h3>
              </div>
              <i className="bi bi-bell fs-1 text-primary opacity-25"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-lg-8">
          {/* Recent Notifications Card */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-3">
            <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Recent Notifications</h6>
            </div>
            <div className="list-group list-group-flush">
              {!statsData?.recent_notifications || statsData.recent_notifications.length === 0 ? (
                <div className="p-4 text-center text-muted">No notifications yet.</div>
              ) : (
                statsData.recent_notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`list-group-item list-group-item-action p-3 border-start border-4 ${!notif.is_read ? 'border-success bg-light' : 'border-transparent'}`}
                    onClick={() => handleNotificationClick(notif)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-start">
                      <strong className="small text-dark">{notif.title}</strong>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="mb-0 small text-secondary mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <h5 className="fw-bold mb-3 mt-4">Quick Links</h5>
          <div className="d-grid gap-3">
            <div className="p-3 bg-white rounded-3 shadow-sm border" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/children')}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-plus-circle text-success fs-5"></i>
                <div>
                  <h6 className="m-0 fw-bold">Register Student</h6>
                  <small className="text-muted">Add another child</small>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-3 shadow-sm border" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/tournaments')}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-trophy text-primary fs-5"></i>
                <div>
                  <h6 className="m-0 fw-bold">Tournaments</h6>
                  <small className="text-muted">View & Register</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;