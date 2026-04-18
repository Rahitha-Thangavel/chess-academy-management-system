import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useAppUI } from '../../contexts/AppUIContext';

const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const dayLabels = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday',
};

const Schedule = () => {
    const { notifySuccess, notifyError } = useAppUI();
    const [batches, setBatches] = useState([]);
    const [formState, setFormState] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [batchesRes, availabilityRes] = await Promise.all([
                    axios.get('/batches/'),
                    axios.get('/availability/'),
                ]);

                setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : []);

                const initialState = {};
                (Array.isArray(availabilityRes.data) ? availabilityRes.data : []).forEach((slot) => {
                    initialState[slot.day_of_week] = {
                        id: slot.id,
                        enabled: true,
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                    };
                });
                dayOrder.forEach((day) => {
                    if (!initialState[day]) {
                        initialState[day] = { id: null, enabled: false, start_time: '09:00', end_time: '17:00' };
                    }
                });
                setFormState(initialState);
            } catch (error) {
                console.error('Failed to load schedule data:', error);
            }
        };

        fetchData();
    }, []);

    const groupedBatches = useMemo(() => {
        const groups = {};
        dayOrder.forEach((day) => {
            groups[day] = batches.filter((batch) => batch.schedule_day === day);
        });
        return groups;
    }, [batches]);

    const handleSaveAvailability = async () => {
        try {
            for (const day of dayOrder) {
                const value = formState[day];
                if (!value) continue;

                if (value.enabled && value.id) {
                    await axios.put(`/availability/${value.id}/`, {
                        day_of_week: day,
                        start_time: value.start_time,
                        end_time: value.end_time,
                    });
                } else if (value.enabled && !value.id) {
                    await axios.post('/availability/', {
                        day_of_week: day,
                        start_time: value.start_time,
                        end_time: value.end_time,
                    });
                } else if (!value.enabled && value.id) {
                    await axios.delete(`/availability/${value.id}/`);
                }
            }

            notifySuccess('Availability updated successfully.');
        } catch (error) {
            console.error('Failed to save availability:', error);
            notifyError('Failed to save availability.');
        }
    };

    return (
        <div className="container-fluid p-0">
            <h3 className="fw-bold mb-4">Schedule</h3>

            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-bold m-0">My Assigned Classes</h6>
                </div>
                <div className="p-4">
                    {batches.length === 0 ? (
                        <div className="text-center text-muted py-3">No classes assigned yet.</div>
                    ) : (
                        <div className="row g-3">
                            {dayOrder.map((day) => (
                                groupedBatches[day]?.length > 0 && (
                                    <div key={day} className="col-md-6 col-xl-4">
                                        <div className="border rounded-4 h-100 p-3 bg-light">
                                            <div className="fw-bold text-success mb-3">{dayLabels[day]}</div>
                                            <div className="d-flex flex-column gap-2">
                                                {groupedBatches[day].map((batch) => (
                                                    <div key={batch.id} className="bg-white border rounded-3 p-3">
                                                        <div className="fw-bold">{batch.batch_name}</div>
                                                        <div className="small text-muted">{batch.start_time} - {batch.end_time}</div>
                                                        <div className="small text-muted">{batch.batch_type?.replace('_', ' ') || 'Recurring batch'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="card border-0 shadow-sm p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">Set Availability</h5>
                        <p className="text-muted small m-0">Admins can assign you only within these declared time slots.</p>
                    </div>
                    <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#6c9343' }} onClick={handleSaveAvailability}>
                        Save Availability
                    </button>
                </div>

                <div className="row g-3">
                    {dayOrder.map((day) => (
                        <div key={day} className="col-md-6">
                            <div className="border rounded-4 p-3 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="fw-bold">{dayLabels[day]}</div>
                                    <div className="form-check form-switch m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={!!formState[day]?.enabled}
                                            onChange={(e) => setFormState({
                                                ...formState,
                                                [day]: { ...formState[day], enabled: e.target.checked },
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small text-muted">Start</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formState[day]?.start_time || '09:00'}
                                            disabled={!formState[day]?.enabled}
                                            onChange={(e) => setFormState({
                                                ...formState,
                                                [day]: { ...formState[day], start_time: e.target.value },
                                            })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted">End</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formState[day]?.end_time || '17:00'}
                                            disabled={!formState[day]?.enabled}
                                            onChange={(e) => setFormState({
                                                ...formState,
                                                [day]: { ...formState[day], end_time: e.target.value },
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
