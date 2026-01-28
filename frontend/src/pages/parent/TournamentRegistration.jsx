import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const TournamentRegistration = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournament();
        fetchChildren();
    }, [id]);

    const fetchTournament = async () => {
        try {
            const response = await axios.get(`/tournaments/${id}/`);
            setTournament(response.data);
        } catch (error) {
            console.error('Error fetching tournament:', error);
        }
    };

    const fetchChildren = async () => {
        try {
            // Need an endpoint for parent's children. Assuming /students/ handles it or filter by parent.
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
            await axios.post('/registrations/', {
                tournament: id,
                student: selectedChild
            });
            alert('Registration successful!');
            navigate('/parent/tournaments');
        } catch (error) {
            console.error('Error registering:', error);
            alert('Registration failed. Already registered?');
        }
    };

    if (loading || !tournament) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h3 className="fw-bold m-0">Tournament Registration</h3>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4 bg-success text-white" style={{ backgroundColor: '#6c9343 !important' }}>
                    <h5 className="fw-bold m-0">{tournament.tournament_name}</h5>
                    <p className="m-0 small opacity-75">{new Date(tournament.tournament_date).toLocaleDateString()} | {tournament.venue}</p>
                </div>

                <div className="p-5 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">Select Child</label>
                            <select
                                className="form-select bg-light border-0 py-2"
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                required
                            >
                                <option value="">Choose a student...</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>{child.first_name} {child.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="alert alert-light border rounded-3 text-secondary small">
                            <i className="bi bi-info-circle me-2"></i>
                            Registration Fee: <span className="fw-bold text-dark">LKR {tournament.entry_fee}</span>.
                            This fee will be recorded for payment.
                        </div>

                        <div className="mt-5 d-flex justify-content-end gap-3">
                            <button type="button" className="btn btn-light fw-bold px-4" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn text-white fw-bold px-5 shadow-sm" style={{ backgroundColor: '#6c9343', border: 'none' }}>
                                Confirm Registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TournamentRegistration;
