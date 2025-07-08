import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from './api/axios';

export default function Dashboard({ toggleTheme, theme }) {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ company: '', position: '', resume_used: '', date_applied: '', status: '' });

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/api/jobs/');
        setJobs(res.data.jobs || res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  async function handleAddJob(e) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await axiosInstance.post('/api/jobs/', form);
      // Fetch the updated jobs list
      const res = await axiosInstance.get('/api/jobs/');
      setJobs(res.data.jobs || res.data);
      setForm({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setAdding(false);
    }
  }

  function startEdit(job) {
    setEditingId(job.id);
    setEditForm({
      company: job.company || '',
      position: job.position || '',
      resume_used: job.resume_used || '',
      date_applied: job.date_applied ? job.date_applied.slice(0, 10) : '',
      status: job.status || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
  }

  async function handleEditJob(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await axiosInstance.put(`/api/jobs/${editingId}`, editForm);
      setJobs(jobs => jobs.map(job => job.id === editingId ? { ...job, ...editForm } : job));
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleDeleteJob(id) {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setError(null);
    try {
      await axiosInstance.delete(`/api/jobs/${id}`);
      setJobs(jobs => jobs.filter(job => job.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>Hello, {user?.username || user?.email || 'User'}!</div>
          <button onClick={logout}>Logout</button>
        </div>
        <h3>Job Applications</h3>
        {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
          <ul className="job-list">
            {jobs.map(job => (
              <li key={job.id}>
                {editingId === job.id ? (
                  <form onSubmit={handleEditJob} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    <input name="company" placeholder="Company" value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} required />
                    <input name="position" placeholder="Position" value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} required />
                    <input name="resume_used" placeholder="Resume Used" value={editForm.resume_used} onChange={e => setEditForm(f => ({ ...f, resume_used: e.target.value }))} />
                    <input name="date_applied" type="date" placeholder="Date Applied" value={editForm.date_applied} onChange={e => setEditForm(f => ({ ...f, date_applied: e.target.value }))} />
                    <input name="status" placeholder="Status (e.g. applied, interview)" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <b>{job.position}</b> at {job.company} <span style={{ color: '#646cff', fontWeight: 500 }}>({job.status || 'unknown'})</span>
                    {job.date_applied && <div style={{ fontSize: '0.95em', color: '#888' }}>Applied: {job.date_applied}</div>}
                    {job.resume_used && <div style={{ fontSize: '0.95em', color: '#888' }}>Resume: {job.resume_used}</div>}
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => startEdit(job)}>Edit</button>
                      <button type="button" onClick={() => handleDeleteJob(job.id)} style={{ background: '#e74c3c' }}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <h3 style={{ marginTop: 32 }}>Add New Job</h3>
        <form onSubmit={handleAddJob} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input name="company" placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
          <input name="position" placeholder="Position" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} required />
          <input name="resume_used" placeholder="Resume Used" value={form.resume_used} onChange={e => setForm(f => ({ ...f, resume_used: e.target.value }))} />
          <input name="date_applied" type="date" placeholder="Date Applied" value={form.date_applied} onChange={e => setForm(f => ({ ...f, date_applied: e.target.value }))} />
          <input name="status" placeholder="Status (e.g. applied, interview)" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
          <button type="submit" disabled={adding}>Add Job</button>
        </form>
      </div>
    </div>
  );
} 