import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            // GET /batches/ is now filtered by backend to return only assigned batches for the coach
            const res = await axios.get('/batches/');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">My Classes</h3>

            <div className="card shadow-sm border-0">
                <Table hover responsive className="m-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Batch Name</th>
                            <th>Schedule</th>
                            <th>Students</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr>
                        ) : batches.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-muted">
                                    You don't have any assigned classes yet.
                                    <Button variant="link" onClick={() => navigate('/coach/batch-applications')}>View Opportunities</Button>
                                </td>
                            </tr>
                        ) : (
                            batches.map(batch => (
                                <tr key={batch.id}>
                                    <td className="fw-bold">{batch.batch_name}</td>
                                    <td>
                                        <Badge bg="info" className="me-2">{batch.schedule_day}</Badge>
                                        {batch.start_time} - {batch.end_time}
                                    </td>
                                    <td>{batch.current_students}/{batch.max_students}</td>
                                    <td><Badge bg="success">Active</Badge></td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => navigate('/coach/mark-attendance', {
                                                state: {
                                                    batchId: batch.id,
                                                    batchName: batch.batch_name,
                                                },
                                            })}
                                        >
                                            Mark Attendance
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default MyBatches;
