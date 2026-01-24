import React from 'react';

const Dashboard = () => {
  // Mock Data
  const stats = [
    { label: 'Pending registrations', value: 5, color: 'success' },
    { label: "Today's payments", value: 'LKR 12,400', color: 'success' },
    { label: 'Attendance to record', value: '3 classes', color: 'success' }
  ];

  const tasks = [
    { title: 'Registration approvals needed', count: 5, icon: 'bi-file-earmark-person' },
    { title: 'Payments to record', count: 8, icon: 'bi-cash' },
    { title: 'Attendance to update', count: 3, icon: 'bi-calendar-check' },
  ];

  const overview = [
    { label: 'Classes scheduled today', value: '6' },
    { label: 'Expected payments', value: 'LKR 15,200' },
    { label: 'Coach assignments', value: 'Ravi (3), Malini (2), Rajesh (1)' },
    { label: 'Upcoming tournaments', value: '2' },
  ];

  const activity = [
    { name: 'Liam', detail: 'Beginner | Dec 1', type: 'registration' },
    { name: 'Emma', detail: 'Intermediate | Dec 2', type: 'registration' },
    { name: 'Noah', detail: 'Starter | Dec 2', type: 'registration' },
    { name: 'Olivia', detail: 'Beginner | Dec 3', type: 'registration' },
    { name: 'William', detail: 'Advanced | Dec 3', type: 'registration' },
  ];

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4">Dashboard</h3>

      {/* Top Stats */}
      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-md-4">
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
              <div className="bg-white text-danger rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>0</div>
              <span className="fw-bold text-dark">Urgent notifications</span>
              <span className="text-danger fw-bold ms-auto">2</span>
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
              </div>
            </div>

            <div className="mt-auto d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">Recent payments processed</span>
                <span className="fw-bold">12</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">Attendance records updated</span>
                <span className="fw-bold">45</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">System notifications</span>
                <span className="fw-bold">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;