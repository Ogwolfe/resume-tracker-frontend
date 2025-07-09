import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: '#3498db' },
  { value: 'interview', label: 'Interview', color: '#f39c12' },
  { value: 'offer', label: 'Offer', color: '#27ae60' },
  { value: 'rejected', label: 'Rejected', color: '#e74c3c' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#95a5a6' },
  { value: 'pending', label: 'Pending', color: '#9b59b6' }
];

export default function TimelineView({ jobs, onJobClick }) {
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Ensure jobs is an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  // Group jobs by month
  const jobsByMonth = safeJobs.reduce((acc, job) => {
    if (!job.date_applied) return acc;
    
    try {
      const date = new Date(job.date_applied);
      if (isNaN(date.getTime())) return acc; // Invalid date
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, jobs: [] };
      }
      acc[monthKey].jobs.push(job);
    } catch (error) {
      // Skip jobs with invalid dates
      console.warn('Invalid date for job:', job);
    }
    return acc;
  }, {});

  const months = Object.keys(jobsByMonth).sort().reverse();

  const filteredJobs = selectedMonth === 'all' 
    ? safeJobs 
    : jobsByMonth[selectedMonth]?.jobs || [];

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      {/* Month Filter */}
      <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-input-bg)', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          📅 Filter by Month
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-input-border)',
            background: 'var(--color-input-bg)',
            color: 'var(--color-text)'
          }}
        >
          <option value="all">All Months</option>
          {months.map(monthKey => (
            <option key={monthKey} value={monthKey}>
              {jobsByMonth[monthKey].label} ({jobsByMonth[monthKey].jobs.length})
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'var(--color-input-border)',
          zIndex: 1
        }} />

        {filteredJobs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic'
          }}>
            No applications found for the selected period
          </div>
        ) : (
          filteredJobs.map((job, index) => {
            let date;
            try {
              date = job.date_applied ? new Date(job.date_applied) : null;
              if (date && isNaN(date.getTime())) date = null;
            } catch (error) {
              date = null;
            }
            const status = STATUS_OPTIONS.find(s => s.value === job.status);
            
            return (
              <div key={job.id} style={{ 
                position: 'relative', 
                marginBottom: '2rem',
                paddingLeft: '60px'
              }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: status?.color || '#95a5a6',
                  border: '3px solid var(--color-card-bg)',
                  zIndex: 2,
                  boxShadow: '0 0 0 2px var(--color-input-border)'
                }} />

                {/* Job card */}
                <div style={{
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onClick={() => onJobClick(job)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text)' }}>
                        {job.position}
                      </h4>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        {job.company}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      background: status?.color + '20' || '#95a5a620',
                      color: status?.color || '#95a5a6',
                      border: `1px solid ${status?.color + '40' || '#95a5a640'}`
                    }}>
                      {status?.label || job.status || 'Unknown'}
                    </div>
                  </div>

                                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                     {date && (
                       <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                         📅 {date.toLocaleDateString()}
                       </div>
                     )}
                    {job.resume_used && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        📄 {job.resume_used}
                      </div>
                    )}
                  </div>

                  {job.notes && (
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-input-bg)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      marginTop: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      💬 {job.notes.length > 100 ? job.notes.substring(0, 100) + '...' : job.notes}
                    </div>
                  )}

                                     {job.reminder_date && job.reminder_text && (
                     <div style={{ 
                       fontSize: '0.85rem', 
                       color: '#f39c12',
                       background: '#f39c1220',
                       padding: '0.5rem',
                       borderRadius: '4px',
                       marginTop: '0.5rem',
                       border: '1px solid #f39c1240'
                     }}>
                       ⏰ {(() => {
                         try {
                           return new Date(job.reminder_date).toLocaleDateString();
                         } catch (error) {
                           return job.reminder_date;
                         }
                       })()}: {job.reminder_text}
                     </div>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 