import React from 'react';

const MyClasses = () => {
    // Mock Data
    const classes = [
        {
            id: 1,
            batch: 'Beginner Batch',
            days: 'Mon, Wed, Fri - 9:00 AM',
            students: 12,
            room: 'Room 1'
        },
        {
            id: 2,
            batch: 'Intermediate Batch',
            days: 'Tue, Thu, Sat - 11:00 AM',
            students: 10,
            room: 'Room 1'
        },
        {
            id: 3,
            batch: 'Advanced Batch',
            days: 'Mon, Wed, Fri - 2:00 PM',
            students: 8,
            room: 'Room 2'
        },
        {
            id: 4,
            batch: 'Competition Prep',
            days: 'Tue, Thu - 4:00 PM',
            students: 6,
            room: 'Room 2'
        }
    ];

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">My Classes</h3>

            <div className="row g-4">
                {classes.map((cls) => (
                    <div key={cls.id} className="col-md-6 col-xl-4">
                        <div className="card border-0 shadow-sm p-0 overflow-hidden h-100" style={{ borderRadius: '12px' }}>
                            <div className="h-1 bg-success" style={{ height: '8px' }}></div>
                            <div className="p-4">
                                <h5 className="fw-bold mb-3">{cls.batch}</h5>

                                <div className="d-flex flex-column gap-3 mb-4">
                                    <div className="d-flex align-items-center gap-3 text-secondary">
                                        <i className="bi bi-clock-history"></i>
                                        <span>{cls.days}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 text-secondary">
                                        <i className="bi bi-people"></i>
                                        <span>{cls.students} Students</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 text-secondary">
                                        <i className="bi bi-geo-alt"></i>
                                        <span>{cls.room}</span>
                                    </div>
                                </div>

                                <div className="text-end">
                                    <button className="btn btn-link text-success text-decoration-none fw-bold p-0">
                                        View Details <i className="bi bi-chevron-right small"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyClasses;
