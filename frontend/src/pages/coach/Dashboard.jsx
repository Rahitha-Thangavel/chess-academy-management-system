import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axiosInstance';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
    fetchTodayAttendance();
  }, []);

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

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/coach-attendance/');
      // Find today's record for this coach
      const today = new Date().toISOString().split('T')[0];
      const record = response.data.find(r => r.date === today);
      setTodayAttendance(record);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleClockIn = async (batchId) => {
    try {
      await axios.post('/coach-attendance/clock_in/', { batch_id: batchId });
      alert('Clocked in successfully!');
      fetchTodayAttendance();
    } catch (error) {
      alert('Failed to clock in.');
    }
  };

  const handleClockOut = async (batchId) => {
    try {
      await axios.post('/coach-attendance/clock_out/', { batch_id: batchId });
      alert('Clocked out successfully!');
      fetchTodayAttendance();
    } catch (error) {
      alert('Failed to clock out.');
    }
  };

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4">Welcome, Coach {user?.first_name || 'User'}</h3>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-success-subtle rounded-4">
            <small className="text-secondary fw-bold d-block mb-1">Your Batches</small>
            <h3 className="fw-bold m-0 text-success">{batches.length}</h3>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card border-0 shadow-sm p-4 bg-light rounded-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-secondary fw-bold d-block mb-1">Clock Session Status</small>
                <h5 className={`fw-bold m-0 ${todayAttendance?.clock_in_time ? 'text-success' : 'text-danger'}`}>
                  {todayAttendance?.clock_in_time ?
                    `Clocked In at ${new Date(todayAttendance.clock_in_time).toLocaleTimeString()}` :
                    'Not Clocked In'}
                  {todayAttendance?.clock_out_time && ` - Clocked Out at ${new Date(todayAttendance.clock_out_time).toLocaleTimeString()}`}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <h5 className="fw-bold mb-4">Your Batch Sessions</h5>
            <div className="d-flex flex-column gap-3">
              {batches.length === 0 ? (
                <div className="text-center text-muted border py-4 rounded bg-light">No batches assigned to you.</div>
              ) : (
                batches.map((batch) => (
                  <div key={batch.id} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold m-0">{batch.batch_name}</h6>
                      <small className="text-secondary">{batch.schedule_day}s, {batch.start_time} - {batch.end_time}</small>
                    </div>
                    <div className="d-flex gap-2">
                      {!todayAttendance?.clock_in_time && (
                        <button className="btn btn-success btn-sm px-3" onClick={() => handleClockIn(batch.id)} style={{ backgroundColor: '#6c9343', border: 'none' }}>Clock In</button>
                      )}
                      {todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time && (
                        <button className="btn btn-danger btn-sm px-3" onClick={() => handleClockOut(batch.id)}>Clock Out</button>
                      )}
                      <button className="btn btn-primary btn-sm px-3" onClick={() => navigate('/coach/mark-attendance')}>Mark Student Attendance</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4 overflow-hidden">
            <h5 className="fw-bold mb-4">Quick Links</h5>
            <div className="list-group list-group-flush">
              <button className="list-group-item list-group-item-action border-0 px-0 py-3 d-flex align-items-center gap-3" onClick={() => navigate('/coach/salary')}>
                <i className="bi bi-wallet2 text-success h5 m-0"></i>
                <span>View Salary Summaries</span>
              </button>
              <button className="list-group-item list-group-item-action border-0 px-0 py-3 d-flex align-items-center gap-3" onClick={() => navigate('/coach/schedule')}>
                <i className="bi bi-calendar-check text-success h5 m-0"></i>
                <span>Set Your Availability</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;