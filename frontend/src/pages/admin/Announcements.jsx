/**
 * Page component: Announcements.
 *
 * Small admin CRUD for notices.
 */

import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useAppUI } from '../../contexts/AppUIContext';

const emptyForm = { title: '', message: '', is_active: true };

export default function Announcements() {
  const { notifySuccess, notifyError } = useAppUI();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadItems = async () => {
    try {
      const res = await axios.get('/announcements/');
      setItems(res.data);
    } catch {
      notifyError('Failed to load announcements.');
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/announcements/${editingId}/`, form);
        notifySuccess('Announcement updated.');
      } else {
        await axios.post('/announcements/', form);
        notifySuccess('Announcement created.');
      }
      reset();
      loadItems();
    } catch (error) {
      notifyError(error.response?.data?.detail || 'Failed to save announcement.');
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, message: item.message, is_active: item.is_active });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/announcements/${id}/`);
      notifySuccess('Announcement deleted.');
      loadItems();
    } catch {
      notifyError('Failed to delete announcement.');
    }
  };

  return (
    <div className="container-fluid p-0">
      <h3 className="fw-bold mb-4" style={{ color: '#6c9343' }}>Announcements</h3>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold">{editingId ? 'Edit' : 'Create'} Announcement</h5>
              <form onSubmit={submit}>
                <input className="form-control mb-3" name="title" placeholder="Title" value={form.title} onChange={change} required />
                <textarea className="form-control mb-3" name="message" rows="5" placeholder="Message" value={form.message} onChange={change} required />
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="active" name="is_active" checked={form.is_active} onChange={change} />
                  <label className="form-check-label" htmlFor="active">Active</label>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn text-white fw-bold" style={{ backgroundColor: '#6c9343' }} type="submit">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  {editingId && <button className="btn btn-light fw-bold" type="button" onClick={reset}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">All Announcements</h5>
              {items.length === 0 ? (
                <div className="text-muted">No announcements yet.</div>
              ) : (
                <div className="d-grid gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between gap-3">
                        <div>
                          <div className="fw-bold">{item.title}</div>
                          <div className="text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>{item.message}</div>
                          <div className="small text-muted mt-2">
                            {item.created_by_name || 'System'} | {new Date(item.created_at).toLocaleString()}
                          </div>
                        </div>
                        <span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {item.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <div className="mt-3 d-flex gap-2">
                        <button className="btn btn-sm btn-outline-success fw-bold" onClick={() => editItem(item)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => remove(item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
