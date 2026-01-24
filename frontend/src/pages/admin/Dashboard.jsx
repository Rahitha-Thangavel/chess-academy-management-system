import React from 'react';

const AdminDashboard = () => {
  // Mock Data
  const stats = [
    { label: 'Total Students', value: '127', icon: 'bi-people', bg: 'bg-light text-success' },
    { label: 'Active Coaches', value: '8', icon: 'bi-person-badge', bg: 'bg-light text-success' },
    { label: 'Pending Actions', value: '15', icon: 'bi-exclamation-triangle', bg: 'bg-warning-subtle text-warning' },
    { label: 'Notifications', value: '8', icon: 'bi-bell', bg: 'bg-light text-success' },
    { label: "Today's Classes", value: '12', icon: 'bi-calendar-event', bg: 'bg-light text-success' },
    { label: 'Payments Due', value: 'LKR 68,200', icon: 'bi-currency-dollar', bg: 'bg-light text-success' }
  ];

  const timeline = [
    { time: '8:30 AM', title: 'Beginner A', coach: 'Coach Ravi', students: '18 students', class: 'bg-light' },
    { time: '10:00 AM', title: 'Intermediate B', coach: 'Coach Malini', students: '15 students', class: 'bg-light' },
    { time: '11:30 AM', title: 'Starter Class', coach: 'Coach Rajesh', students: '12 students', class: 'bg-light' },
  ];

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-2 text-success" style={{ color: '#6c9343' }}>Welcome, Admin</h3>

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
                <h4 className="fw-bold m-0">8</h4>
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
              {timeline.map((item, idx) => (
                <div key={idx} className="p-3 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold m-0 d-flex justify-content-between">
                    {item.time}
                    <span className="text-secondary fw-normal" style={{ fontSize: '0.9rem' }}>{item.title}</span>
                  </h6>
                  <div className="text-secondary small mt-1">({item.coach})</div>
                  <div className="text-secondary small mt-1">{item.students}</div>
                </div>
              ))}
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
                <span className="fw-bold text-success">LKR 243,500</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary fw-bold">Pending Payments</span>
                <span className="fw-bold text-warning">LKR 47,800</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="text-secondary fw-bold">Coach Salaries</span>
                <span className="fw-bold text-danger">LKR 125,000</span>
              </div>

              <div className="progress" style={{ height: '6px' }}>
                <div className="progress-bar" role="progressbar" style={{ width: '65%', backgroundColor: '#6c9343' }} aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <small className="text-secondary d-block mt-2">65% of monthly target reached</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;