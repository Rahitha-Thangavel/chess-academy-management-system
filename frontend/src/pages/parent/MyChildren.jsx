import React from 'react';

const MyChildren = () => {
    // Mock Data
    const children = [
        {
            id: 1,
            initial: 'A',
            name: 'Arjun',
            age: 8,
            batch: 'Beginner Batch',
            coach: 'Ravi',
            joined: 'Jan 2024',
            status: 'Active',
            color: '#6c9343' // Greenish
        },
        {
            id: 2,
            initial: 'P',
            name: 'Priya',
            age: 10,
            batch: 'Intermediate Batch',
            coach: 'Malini',
            joined: 'Mar 2023',
            status: 'Active',
            color: '#6c9343'
        },
        {
            id: 3,
            initial: 'G',
            name: 'Gautam',
            age: 7,
            batch: 'Starter Batch',
            coach: 'Rajesh',
            joined: 'Jun 2024',
            status: 'Active',
            color: '#6c9343'
        }
    ];

    return (
        <div>
            <h3 className="fw-bold mb-4">My Children</h3>

            <div className="d-grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {children.map((child) => (
                    <div key={child.id} className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold h4 m-0"
                                style={{ width: '60px', height: '60px', backgroundColor: '#6c9343' }}
                            >
                                {child.initial}
                            </div>
                            <div className="badge rounded-pill d-flex align-items-center gap-2 px-3 py-2" style={{ backgroundColor: '#e6f4ea', color: '#1e7e34' }}>
                                Active <i className="bi bi-check-square-fill"></i>
                            </div>
                        </div>

                        <h5 className="fw-bold mb-1">{child.name}</h5>
                        <p className="text-muted mb-4">Age {child.age}, {child.batch}</p>

                        <div className="d-flex flex-column gap-3 mb-4">
                            <div className="d-flex align-items-center gap-3 text-secondary">
                                <i className="bi bi-person"></i>
                                <span>Coach: {child.coach}</span>
                            </div>
                            <div className="d-flex align-items-center gap-3 text-secondary">
                                <i className="bi bi-calendar"></i>
                                <span>Joined: {child.joined}</span>
                            </div>
                            <div className="d-flex align-items-center gap-3 text-secondary">
                                <i className="bi bi-award"></i>
                                <span>Status: {child.status}</span>
                            </div>
                        </div>

                        <button className="btn text-white w-100 py-2 rounded-2" style={{ backgroundColor: '#6c9343' }}>
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyChildren;
