import React, { useState } from 'react';

const Schedule = () => {
    // Mock Data for a Weekly View
    const weekStart = "October 13";
    const weekEnd = "October 19, 2025";

    // Simple mock structure for the calendar visual
    const timeSlots = [
        "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
    ];

    const classes = [
        { day: 'Mon', time: '9:00 AM', duration: 1, title: 'Beginner Batch', room: 'Room 1' },
        { day: 'Wed', time: '9:00 AM', duration: 1, title: 'Beginner Batch', room: 'Room 1' },
        { day: 'Fri', time: '9:00 AM', duration: 1, title: 'Beginner Batch', room: 'Room 1' },

        { day: 'Tue', time: '11:00 AM', duration: 1, title: 'Intermediate Batch', room: 'Room 1' },
        { day: 'Thu', time: '11:00 AM', duration: 1, title: 'Intermediate Batch', room: 'Room 1' },

        { day: 'Mon', time: '2:00 PM', duration: 1, title: 'Advanced Batch', room: 'Room 2' },
        { day: 'Wed', time: '2:00 PM', duration: 1, title: 'Advanced Batch', room: 'Room 2' },
        { day: 'Fri', time: '2:00 PM', duration: 1, title: 'Advanced Batch', room: 'Room 2' },

        { day: 'Tue', time: '4:00 PM', duration: 1, title: 'Competition Prep', room: 'Room 2' },
        { day: 'Thu', time: '4:00 PM', duration: 1, title: 'Competition Prep', room: 'Room 2' },
    ];

    const getEvent = (day, time) => {
        return classes.find(c => c.day === day && c.time === time);
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Schedule</h3>

            {/* Calendar Controls */}
            <div className="bg-white p-3 rounded-3 shadow-sm d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-light rounded-circle"><i className="bi bi-chevron-left"></i></button>
                <div className="text-center">
                    <h5 className="fw-bold m-0">{weekStart} - {weekEnd}</h5>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-light rounded-circle"><i className="bi bi-chevron-right"></i></button>
                    <div className="btn-group ms-3">
                        <button className="btn btn-outline-success btn-sm active" style={{ backgroundColor: '#6c9343', color: 'white' }}>Week</button>
                        <button className="btn btn-outline-secondary btn-sm">Month</button>
                    </div>
                </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '12px', overflowX: 'auto' }}>
                <div style={{ minWidth: '800px' }}>
                    <div className="d-flex border-bottom pb-2 mb-2">
                        <div style={{ width: '10%' }} className="fw-bold small text-secondary">Time</div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} style={{ width: '12.8%' }} className="fw-bold small text-secondary text-center">{day}</div>
                        ))}
                    </div>

                    <div className="d-flex flex-column gap-2">
                        {timeSlots.map(time => (
                            <div key={time} className="d-flex" style={{ height: '80px' }}>
                                <div style={{ width: '10%' }} className="small text-muted pt-1 border-end pe-2 text-end">{time}</div>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                    const event = getEvent(day, time);
                                    return (
                                        <div key={day} style={{ width: '12.8%' }} className="border-bottom border-end p-1">
                                            {event && (
                                                <div className="bg-success-subtle p-2 rounded-2 h-100 border-start border-4 border-success">
                                                    <div className="fw-bold small text-dark" style={{ fontSize: '0.8rem' }}>{event.title}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{event.room}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Availability Settings */}
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold mb-4">Set Availability</h5>

                <div className="table-responsive mb-4">
                    <table className="table table-borderless align-middle">
                        <thead>
                            <tr className="text-secondary small">
                                <th></th>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <th key={d} className="fw-bold">{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="fw-bold small text-secondary">Available</td>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, i) => (
                                    <td key={d}>
                                        <div className="form-check d-flex justify-content-center">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                defaultChecked={i < 6}
                                                style={{ backgroundColor: i < 6 ? '#0d6efd' : '', borderColor: '#0d6efd' }}
                                            />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="fw-bold small text-secondary">Timing</td>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, i) => (
                                    <td key={d} className="small text-muted text-center">
                                        {i < 6 ? '8:00 AM - 6:00 PM' : '-'}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-end">
                    <button className="btn text-white px-4 py-2 fw-bold" style={{ backgroundColor: '#6c9343' }}>Save Availability</button>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
