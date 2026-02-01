import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">My Profile</h3>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="h-100 p-0 position-relative rounded-top-4" style={{ height: '120px', backgroundColor: '#6c9343' }}>
                            {/* Decorative Pattern or Gradient could go here */}
                        </div>
                        <div className="px-4 pb-4 position-relative text-center">
                            <div
                                className="rounded-circle bg-white p-1 position-absolute start-50 translate-middle"
                                style={{ width: '100px', height: '100px', top: '0' }}
                            >
                                <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center border border-3 border-light shadow-sm">
                                    <i className="bi bi-person-fill text-secondary" style={{ fontSize: '3.5rem' }}></i>
                                </div>
                            </div>

                            <div style={{ paddingTop: '60px' }}>
                                <h3 className="fw-bold m-0">@{user?.username || 'user'}</h3>
                                <p className="text-secondary mb-0">{user?.first_name} {user?.last_name}</p>
                                <div className="badge bg-success-subtle text-success mt-2 px-3 py-2 rounded-pill">
                                    {user?.role} Account
                                </div>
                            </div>
                        </div>

                        <div className="p-4 pt-0">
                            <hr className="mt-0" />
                            <h5 className="fw-bold mb-3">Personal Information</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="small text-secondary fw-bold">First Name</label>
                                    <div className="p-2 bg-light rounded border-0 fw-bold">{user?.first_name}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-secondary fw-bold">Last Name</label>
                                    <div className="p-2 bg-light rounded border-0 fw-bold">{user?.last_name}</div>
                                </div>
                                <div className="col-md-12">
                                    <label className="small text-secondary fw-bold">Username</label>
                                    <div className="p-2 bg-light rounded border-0 fw-bold">@{user?.username}</div>
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Email Address</label>
                                    <div className="p-2 bg-light border rounded text-dark fw-bold">
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>
                                {user?.role !== 'ADMIN' && (
                                    <div className="col-md-12">
                                        <label className="form-label text-muted small text-uppercase fw-bold">Role</label>
                                        <div className="p-2 bg-light border rounded text-dark fw-bold">
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                                                {user?.role || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">Account Settings</h5>
                        <div className="d-flex flex-column gap-2">
                            <button
                                className="btn btn-light text-start fw-bold text-secondary"
                                onClick={() => navigate('/forgot-password')}
                            >
                                <i className="bi bi-key me-2"></i> Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
