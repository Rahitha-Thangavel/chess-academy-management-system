import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const NewRescheduleRequest = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [originalDate, setOriginalDate] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await axios.get('/students/');
            setChildren(response.data);
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/reschedule-requests/', {
                student: selectedChild,
                original_date: originalDate,
                preferred_date: preferredDate,
                reason: reason
            });
            alert('Reschedule request submitted successfully!');
            navigate('/parent/reschedule');
        } catch (error) {
            console.error('Error submitting request:', error.response?.data || error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to submit request. Please ensure all fields are filled correctly.';
            alert(`Error: ${errorMsg}`);
        }
    };

    if (loading) return <div className="p-5 text-center">Loading children...</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0" style={{ color: '#4a3f35' }}>New Reschedule Request</h3>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: '#6c9343' }}>
                    <h5 className="fw-bold text-white m-0">Request Details</h5>
                    <p className="text-white-50 m-0 small">Submit a request to change a class timing.</p>
                </div>

                <div className="p-5 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">Select Child</label>
                            <select className="form-select bg-light border-0 py-2" value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} required>
                                <option value="">Choose Student...</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>{child.first_name} {child.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Date to Reschedule (Old)</label>
                                <input type="date" className="form-control bg-light border-0 py-2" value={originalDate} onChange={(e) => setOriginalDate(e.target.value)} required />
                                <small className="text-muted">The date of the class you will miss.</small>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">Preferred Make-up Date (New)</label>
                                <input type="date" className="form-control bg-light border-0 py-2" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} required />
                                <small className="text-muted">When you would like the make-up class.</small>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">Reason for Rescheduling</label>
                            <textarea className="form-control bg-light border-0" rows="3" placeholder="e.g., Medical appointment, Family function..." value={reason} onChange={(e) => setReason(e.target.value)} required></textarea>
                        </div>

                        <div className="mt-5 d-flex justify-content-end gap-3">
                            <button type="button" className="btn btn-light fw-bold px-4" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn text-white fw-bold px-5 shadow-sm" style={{ backgroundColor: '#6c9343', border: 'none' }}>
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewRescheduleRequest;
