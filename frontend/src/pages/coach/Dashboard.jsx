import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [batches, setBatches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchBatches();
    fetchAvailableBatches();
    fetchTodayAttendance();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/analytics/reports/dashboard_stats/');
      setStatsData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get('/batches/');
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBatches = async () => {
    try {
      const response = await axios.get('/batches/unassigned/');
      setAvailableBatches(response.data);
    } catch (error) {
      console.error('Error fetching available batches:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/coaches/');
      const today = new Date().toISOString().split('T')[0];
      const record = response.data.find(r => r.date === today);
      setTodayAttendance(record);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleClockIn = async (batchId) => {
    try {
      await axios.post('/coaches/clock_in/', { batch_id: batchId });
      alert('Clocked in successfully!');
      fetchTodayAttendance();
    } catch (error) {
      alert('Failed to clock in.');
    }
  };

  const handleClockOut = async (batchId) => {
    try {
      await axios.post('/coaches/clock_out/', { batch_id: batchId });
      alert('Clocked out successfully!');
      fetchTodayAttendance();
    } catch (error) {
      alert('Failed to clock out.');
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await axios.post(`/api/notifications/${notif.id}/mark_read/`);
      }
      if (notif.target_url) window.location.href = notif.target_url;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (notif.target_url) window.location.href = notif.target_url;
    }
  };

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4">Welcome, {user?.username || 'Coach'}</h3>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-success-subtle rounded-4">
            <small className="text-secondary fw-bold d-block mb-1">Your Batches</small>
            <h3 className="fw-bold m-0 text-success">{batches.length}</h3>
          </div>
        </div>

        {/* New Widget for Batch Opportunities */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-primary-subtle rounded-4 h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/coach/batch-applications')}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-primary fw-bold d-block mb-1">Open Opportunities</small>
                <h3 className="fw-bold m-0 text-primary">{availableBatches.length}</h3>
              </div>
              <i className="bi bi-briefcase fs-1 text-primary opacity-25"></i>
            </div>
            <small className="text-primary mt-2 d-block">Click to view & apply</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-light rounded-4 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-secondary fw-bold d-block mb-1">Total Hours</small>
                <h3 className="fw-bold m-0 text-secondary">--</h3>
              </div>
              <i className="bi bi-clock-history fs-1 text-secondary opacity-25"></i>
            </div>
            <small className="text-secondary mt-2 d-block">View History</small>
          </div>
        </div>

      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <h5 className="fw-bold mb-3">Your Batch Sessions</h5>
          {batches.map(batch => (
            <div key={batch.id} className="card border-0 shadow-sm p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold m-0">{batch.batch_name}</h6>
                  <small className="text-muted">{batch.schedule_day}s, {batch.start_time} - {batch.end_time}</small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => navigate('/coach/mark-attendance', {
                      state: {
                        batchId: batch.id,
                        batchName: batch.batch_name
                      }
                    })}
                  >
                    Mark My Attendance
                  </button>
                </div>
              </div>
            </div>
          ))}
          {batches.length === 0 && <p className="text-muted">No active batches.</p>}
        </div>

        <div className="col-md-4">
          <h5 className="fw-bold mb-3">Quick Actions</h5>
          <div className="d-grid gap-3">
            <div className="p-3 bg-white rounded-3 shadow-sm border" style={{ cursor: 'pointer' }} onClick={() => navigate('/coach/batch-applications')}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-briefcase text-success fs-5"></i>
                <div>
                  <h6 className="m-0 fw-bold">Apply for Batches</h6>
                  <small className="text-muted">View available slots</small>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-3 shadow-sm border" style={{ cursor: 'pointer' }} onClick={() => navigate('/coach/attendance')}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-clock-history text-success fs-5"></i>
                <div>
                  <h6 className="m-0 fw-bold">View Attendance</h6>
                  <small className="text-muted">Check your history</small>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-3 shadow-sm border" style={{ cursor: 'pointer' }} onClick={() => navigate('/coach/salary')}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-cash-coin text-warning fs-5"></i>
                <div>
                  <h6 className="m-0 fw-bold">Salary History</h6>
                  <small className="text-muted">View payments</small>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications Card */}
          <div className="card border-0 shadow-sm rounded-4 mt-4 overflow-hidden">
            <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0" style={{ color: '#6c9343' }}>Recent Notifications</h6>
              <span className="badge rounded-pill bg-success" style={{ backgroundColor: '#6c9343' }}>{statsData?.notifications || 0} New</span>
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
      </div>
    </div>
  );
};

export default Dashboard;