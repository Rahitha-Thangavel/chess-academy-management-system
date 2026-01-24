import React, { useState } from 'react';

const Schedule = () => {
    const [view, setView] = useState('weekly');

    const schedule = {
        Monday: [
            { time: '8:30-10:00 AM', class: 'Beginner A', coach: 'Ravi', room: 'Room 1' },
            { time: '10:00-11:30 AM', class: 'Intermediate B', coach: 'Malini', room: 'Room 2' },
            { time: '11:30-1:00 PM', class: 'Starter A', coach: 'Rajesh', room: 'Room 1' },
        ],
        Tuesday: [
            { time: '8:30-10:00 AM', class: 'Beginner B', coach: 'Ravi', room: 'Room 1' },
            { time: '10:00-11:30 AM', class: 'Intermediate A', coach: 'Malini', room: 'Room 2' },
            { time: '4:00-5:30 PM', class: 'Advanced', coach: 'Kumar', room: 'Room 1' },
        ],
        Wednesday: [
            { time: '8:30-10:00 AM', class: 'Beginner A', coach: 'Ravi', room: 'Room 1' },
            { time: '10:00-11:30 AM', class: 'Intermediate B', coach: 'Malini', room: 'Room 2' },
        ],
        Thursday: [
            { time: '8:30-10:00 AM', class: 'Beginner B', coach: 'Ravi', room: 'Room 1' },
            { time: '10:00-11:30 AM', class: 'Intermediate A', coach: 'Malini', room: 'Room 3' },
        ],
        Friday: [
            { time: '8:30-10:00 AM', class: 'Beginner A', coach: 'Ravi', room: 'Room 1' },
            { time: '10:00-11:30 AM', class: 'Intermediate B', coach: 'Malini', room: 'Room 2' },
            { time: '4:00-5:30 PM', class: 'Advanced', coach: 'Kumar', room: 'Room 1' },
        ],
        Saturday: [
            { time: '9:00-10:30 AM', class: 'Weekend Beginner', coach: 'Rajesh', room: 'Room 1' },
            { time: '10:30-12:00 PM', class: 'Weekend Intermediate', coach: 'Kumar', room: 'Room 2' },
        ]
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4 text-success" style={{ color: '#6c9343' }}>Class Schedule Management</h3>

            {/* View Toggle */}
            <div className="d-flex gap-2 mb-4">
                <button
                    className={`btn fw-bold px-4 ${view === 'weekly' ? 'text-white' : 'btn-light text-secondary'}`}
                    style={{ backgroundColor: view === 'weekly' ? '#6c9343' : '' }}
                    onClick={() => setView('weekly')}
                >
                    Weekly View
                </button>
                <button
                    className={`btn fw-bold px-4 ${view === 'monthly' ? 'text-white' : 'btn-light text-secondary'}`}
                    style={{ backgroundColor: view === 'monthly' ? '#6c9343' : '' }}
                    onClick={() => setView('monthly')}
                >
                    Monthly View
                </button>
            </div>

            {view === 'weekly' && (
                <div className="d-flex flex-column gap-4">
                    {Object.entries(schedule).map(([day, classes], idx) => (
                        <div key={idx}>
                            <div className="p-2 text-white px-3 rounded-top-3" style={{ backgroundColor: '#7da65d', width: 'fit-content', minWidth: '150px' }}>
                                <h6 className="fw-bold m-0">{day}</h6>
                            </div>
                            <div className="p-3 bg-light rounded-end-3 rounded-bottom-3 border-start border-5 border-success" style={{ borderColor: '#6c9343 !important' }}>
                                <div className="d-flex flex-column gap-2">
                                    {classes.map((cls, i) => (
                                        <div key={i} className="bg-white p-3 rounded-3 shadow-sm d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-4 flex-grow-1" style={{ maxWidth: '70%' }}>
                                                <div className="text-secondary small fw-bold" style={{ minWidth: '120px' }}>{cls.time}</div>
                                                <div className="fw-bold text-dark flex-grow-1">{cls.class}</div>
                                                <div className="text-secondary small">Coach: {cls.coach}</div>
                                            </div>
                                            <span className="badge rounded-pill text-white px-3" style={{ backgroundColor: '#4a8bbe' }}>{cls.room}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Schedule;
