import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = [
    { label: 'Classes Today', value: 4, icon: 'bi-calendar-event', color: 'success' },
    { label: 'Students', value: 32, icon: 'bi-people', color: 'success' },
    { label: 'Pending Tasks', value: 2, icon: 'bi-clock-history', color: 'warning' }
  ];

  const todayClasses = [
    { time: '9:00 AM', batch: 'Beginner Batch', students: 12, status: 'Completed', color: 'success' },
    { time: '11:00 AM', batch: 'Intermediate Batch', students: 10, status: 'In Progress', color: 'primary' },
    { time: '2:00 PM', batch: 'Advanced Batch', students: 8, status: 'Upcoming', color: 'warning' },
    { time: '4:00 PM', batch: 'Competition Prep', students: 6, status: 'Upcoming', color: 'warning' }
  ];

  const schedule = {
    'Monday': ['9:00-10:30', '2:00-3:30'],
    'Tuesday': ['11:00-12:30', '4:00-5:30'],
    'Wednesday': ['9:00-10:30', '2:00-3:30'],
    'Thursday': ['11:00-12:30', '4:00-5:30'],
    'Friday': ['9:00-10:30', '2:00-3:30'],
    'Saturday': ['11:00-12:30'],
    'Sunday': []
  };

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4">Welcome, Coach {user?.first_name || 'User'}</h3>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-md-4">
            <div className={`card border-0 shadow-sm p-3 h-100 bg-${stat.color}-subtle`} style={{ borderRadius: '12px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className={`bg-white text-${stat.color} rounded-circle d-flex align-items-center justify-content-center p-3`} style={{ width: '50px', height: '50px' }}>
                  <i className={`bi ${stat.icon} h5 m-0`}></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0">{stat.value}</h5>
                  <small className="text-secondary">{stat.label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Today's Classes */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold mb-4">Today's Classes</h5>
            <div className="d-flex flex-column gap-4">
              {todayClasses.map((cls, idx) => (
                <div key={idx} className="border-bottom pb-3 last:border-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold m-0">{cls.time} : {cls.batch}</h6>
                      <small className="text-muted">{cls.students} students</small>
                    </div>
                    {cls.status === 'Completed' ? (
                      <span className="text-success small fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Completed</span>
                    ) : cls.status === 'In Progress' ? (
                      <span className="text-primary small fw-bold"><i className="bi bi-arrow-repeat me-1"></i> In Progress</span>
                    ) : (
                      <span className="text-warning small fw-bold"><i className="bi bi-clock me-1"></i> Upcoming</span>
                    )}
                  </div>

                  <div className="d-flex justify-content-end">
                    {cls.status === 'Completed' ? (
                      <button className="btn btn-light btn-sm text-secondary disabled" style={{ backgroundColor: '#f0f2f5' }}>Mark Attendance</button>
                    ) : (
                      <button
                        className="btn text-white btn-sm px-3"
                        style={{ backgroundColor: '#6c9343' }}
                        onClick={() => navigate('/coach/mark-attendance')}
                      >
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold mb-4">Upcoming Schedule</h5>
            <div className="row g-2">
              {Object.entries(schedule).slice(0, 3).map(([day, slots]) => (
                <div key={day} className="col-12 col-sm-4 col-lg-12 col-xl-4 mb-3">
                  <h6 className="small fw-bold text-secondary mb-2">{day}</h6>
                  {slots.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {slots.map((slot, i) => (
                        <div key={i} className="bg-light p-2 rounded-2 border small">
                          <div className="fw-bold">{slot}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Batch A - Room 1</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">No classes</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;