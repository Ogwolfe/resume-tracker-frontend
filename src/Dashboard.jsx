import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from './api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
  const [adding, setAdding] = useState(false);

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
      const res = await axiosInstance.post('/api/jobs/', form);
      const newJob = res.data.job || res.data;
      setJobs(jobs => [...jobs, newJob]);
      setForm({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="app-container">
      <div className="header">Resume Tracker</div>
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
                <b>{job.position}</b> at {job.company} <span style={{ color: '#646cff', fontWeight: 500 }}>({job.status || 'unknown'})</span>
                {job.date_applied && <div style={{ fontSize: '0.95em', color: '#888' }}>Applied: {job.date_applied}</div>}
                {job.resume_used && <div style={{ fontSize: '0.95em', color: '#888' }}>Resume: {job.resume_used}</div>}
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