import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from './api/axios';
import NotesModal from './NotesModal';
import ExportModal from './ExportModal';
import TimelineView from './TimelineView';

// Predefined status options with colors
const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: '#3498db' },
  { value: 'interview', label: 'Interview', color: '#f39c12' },
  { value: 'offer', label: 'Offer', color: '#27ae60' },
  { value: 'rejected', label: 'Rejected', color: '#e74c3c' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#95a5a6' },
  { value: 'pending', label: 'Pending', color: '#9b59b6' }
];

export default function Dashboard({ toggleTheme, theme }) {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ company: '', position: '', resume_used: '', date_applied: '', status: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, jobId: null, jobTitle: '' });
  
  // New state for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_applied');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // New state for modals
  const [notesModal, setNotesModal] = useState({ isOpen: false, job: null });
  const [exportModal, setExportModal] = useState({ isOpen: false });
  
  // View state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching jobs...');
        const res = await axiosInstance.get('/api/jobs/');
        console.log('Jobs response:', res.data);
        const jobsData = res.data?.jobs || res.data;
        if (Array.isArray(jobsData)) {
          setJobs(jobsData);
        } else {
          console.warn('Unexpected jobs data format:', jobsData);
          setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Filter and sort jobs
  useEffect(() => {
    if (!jobs || !Array.isArray(jobs)) {
      setFilteredJobs([]);
      return;
    }
    
    let filtered = [...jobs];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.resume_used?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'date_applied') {
        try {
          aValue = new Date(aValue || '1900-01-01');
          bValue = new Date(bValue || '1900-01-01');
        } catch (error) {
          aValue = new Date('1900-01-01');
          bValue = new Date('1900-01-01');
        }
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, sortBy, sortOrder]);

  // Calculate analytics
  const analytics = {
    total: jobs?.length || 0,
    byStatus: STATUS_OPTIONS.reduce((acc, status) => {
      acc[status.value] = jobs?.filter(job => job.status === status.value).length || 0;
      return acc;
    }, {}),
    recentApplications: jobs?.filter(job => {
      if (!job.date_applied) return false;
      try {
        const jobDate = new Date(job.date_applied);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return jobDate >= thirtyDaysAgo;
      } catch (error) {
        return false;
      }
    }).length || 0
  };

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

  function showDeleteConfirmation(job) {
    setDeleteConfirmation({
      show: true,
      jobId: job.id,
      jobTitle: `${job.position} at ${job.company}`
    });
  }

  function cancelDelete() {
    setDeleteConfirmation({ show: false, jobId: null, jobTitle: '' });
  }

  async function confirmDelete() {
    const { jobId } = deleteConfirmation;
    setError(null);
    try {
      await axiosInstance.delete(`/api/jobs/${jobId}`);
      setJobs(jobs => jobs.filter(job => job.id !== jobId));
      setDeleteConfirmation({ show: false, jobId: null, jobTitle: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleSaveNotes(notesData) {
    if (!notesModal.job?.id) {
      console.error('No job selected for notes');
      return;
    }
    
    setError(null);
    try {
      await axiosInstance.put(`/api/jobs/${notesModal.job.id}`, notesData);
      setJobs(jobs => jobs.map(job => 
        job.id === notesModal.job.id 
          ? { ...job, ...notesData }
          : job
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  // Add error boundary for the entire component
  if (error) {
    return (
      <div className="app-container">
        <div className="header">Current Applications</div>
        <div className="card">
          <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">Current Applications</div>
      
      {/* Analytics Section */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📊 Application Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--color-input-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{analytics.total}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Total Applications</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--color-input-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>{analytics.recentApplications}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Last 30 Days</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--color-input-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>{analytics.byStatus.interview || 0}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Interviews</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--color-input-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>{analytics.byStatus.rejected || 0}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Rejections</div>
          </div>
        </div>
        
        {/* Status Distribution */}
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Status Distribution</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(status => (
              <div key={status.value} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: status.color + '20',
                color: status.color,
                borderRadius: '4px',
                fontSize: '0.8rem',
                border: `1px solid ${status.color}40`
              }}>
                <span>{status.label}</span>
                <span style={{ fontWeight: 'bold' }}>{analytics.byStatus[status.value] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>Hello, {user?.username || user?.email || 'User'}!</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}
              style={{ 
                background: 'var(--color-input-bg)', 
                color: 'var(--color-text)',
                border: '1px solid var(--color-input-border)',
                fontSize: '0.9rem'
              }}
            >
              {viewMode === 'list' ? '📅 Timeline' : '📋 List'}
            </button>
            <button 
              onClick={() => setExportModal({ isOpen: true })}
              style={{ 
                background: 'var(--color-input-bg)', 
                color: 'var(--color-text)',
                border: '1px solid var(--color-input-border)',
                fontSize: '0.9rem'
              }}
            >
              📤 Export
            </button>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-input-bg)', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Search by company, position, or resume..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-input-border)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                📊 Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-input-border)' }}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                📅 Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-input-border)' }}
              >
                <option value="date_applied">Date Applied</option>
                <option value="company">Company</option>
                <option value="position">Position</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Order
              </label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  borderRadius: '4px', 
                  border: '1px solid var(--color-input-border)',
                  background: 'var(--color-button-bg)',
                  color: 'var(--color-button-text)',
                  cursor: 'pointer'
                }}
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>
          
          {(searchTerm || statusFilter) && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Showing {filteredJobs.length} of {jobs.length} applications
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '0.8rem',
                  background: 'var(--color-input-bg)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading applications...</div>
            <div style={{ fontSize: '0.9rem' }}>Please wait while we fetch your data</div>
          </div>
        ) : jobs?.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic', margin: '1.5em 0' }}>No applications yet...</div>
        ) : viewMode === 'timeline' ? (
          <TimelineView 
            jobs={filteredJobs} 
            onJobClick={(job) => {
              if (job && job.id) {
                setNotesModal({ isOpen: true, job });
              }
            }}
          />
        ) : (
          <ul className="job-list">
            {filteredJobs.map(job => (
              <li key={job.id}>
                {editingId === job.id ? (
                  <form onSubmit={handleEditJob} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    <input name="company" placeholder="Company" value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} required />
                    <input name="position" placeholder="Position" value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} required />
                    <input name="resume_used" placeholder="Resume Used" value={editForm.resume_used} onChange={e => setEditForm(f => ({ ...f, resume_used: e.target.value }))} />
                    <input name="date_applied" type="date" placeholder="Date Applied" value={editForm.date_applied} onChange={e => setEditForm(f => ({ ...f, date_applied: e.target.value }))} />
                    <select name="status" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-input-border)' }}>
                      <option value="">Select Status</option>
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <b style={{ fontSize: '1.1rem' }}>{job.position}</b>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>at {job.company}</div>
                      </div>
                      <div style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: STATUS_OPTIONS.find(s => s.value === job.status)?.color + '20' || '#95a5a620',
                        color: STATUS_OPTIONS.find(s => s.value === job.status)?.color || '#95a5a6',
                        border: `1px solid ${STATUS_OPTIONS.find(s => s.value === job.status)?.color + '40' || '#95a5a640'}`
                      }}>
                        {STATUS_OPTIONS.find(s => s.value === job.status)?.label || job.status || 'Unknown'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {job.date_applied && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          📅 Applied: {(() => {
                            try {
                              return new Date(job.date_applied).toLocaleDateString();
                            } catch (error) {
                              return job.date_applied;
                            }
                          })()}
                        </div>
                      )}
                      {job.resume_used && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          📄 Resume: {job.resume_used}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (job && job.id) {
                            setNotesModal({ isOpen: true, job });
                          }
                        }}
                        style={{ fontSize: '0.9rem', background: 'var(--color-input-bg)', color: 'var(--color-text)', border: '1px solid var(--color-input-border)' }}
                      >
                        📝 Notes
                      </button>
                      <button type="button" onClick={() => startEdit(job)} style={{ fontSize: '0.9rem' }}>✏️ Edit</button>
                      <button type="button" onClick={() => showDeleteConfirmation(job)} style={{ background: '#e74c3c', fontSize: '0.9rem' }}>🗑️ Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {/* Add New Job Section */}
        <div style={{ marginTop: 32 }}>
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} style={{ minWidth: 160 }}>
              Add New Job
            </button>
          ) : (
            <form
              onSubmit={async e => {
                await handleAddJob(e);
                setShowAddForm(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}
            >
              <input name="company" placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
              <input name="position" placeholder="Position" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} required />
              <input name="resume_used" placeholder="Resume Used" value={form.resume_used} onChange={e => setForm(f => ({ ...f, resume_used: e.target.value }))} />
              <input name="date_applied" type="date" placeholder="Date Applied" value={form.date_applied} onChange={e => setForm(f => ({ ...f, date_applied: e.target.value }))} />
              <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-input-border)' }}>
                <option value="">Select Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={adding}>Add Job</button>
                <button type="button" onClick={() => setShowAddForm(false)} disabled={adding}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--color-input-border)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>
              Are you sure you want to delete <strong>{deleteConfirmation.jobTitle}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={cancelDelete}
                style={{ 
                  background: 'var(--color-input-bg)', 
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-input-border)'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ background: '#e74c3c' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notes Modal */}
      <NotesModal
        job={notesModal.job}
        isOpen={notesModal.isOpen}
        onClose={() => setNotesModal({ isOpen: false, job: null })}
        onSave={handleSaveNotes}
      />
      
      {/* Export Modal */}
      <ExportModal
        jobs={jobs}
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false })}
      />
    </div>
  );
} 