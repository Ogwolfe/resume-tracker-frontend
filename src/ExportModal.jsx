import { useState } from 'react';

export default function ExportModal({ jobs, isOpen, onClose }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeNotes, setIncludeNotes] = useState(true);

  const exportToCSV = () => {
    const headers = ['Company', 'Position', 'Date Applied', 'Status', 'Resume Used'];
    if (includeNotes) {
      headers.push('Notes', 'Reminder Date', 'Reminder Text');
    }

    const csvContent = [
      headers.join(','),
      ...jobs.map(job => {
        const row = [
          `"${job.company || ''}"`,
          `"${job.position || ''}"`,
          `"${job.date_applied || ''}"`,
          `"${job.status || ''}"`,
          `"${job.resume_used || ''}"`
        ];
        
        if (includeNotes) {
          row.push(
            `"${(job.notes || '').replace(/"/g, '""')}"`,
            `"${job.reminder_date || ''}"`,
            `"${(job.reminder_text || '').replace(/"/g, '""')}"`
          );
        }
        
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = jobs.map(job => ({
      company: job.company,
      position: job.position,
      date_applied: job.date_applied,
      status: job.status,
      resume_used: job.resume_used,
      ...(includeNotes && {
        notes: job.notes,
        reminder_date: job.reminder_date,
        reminder_text: job.reminder_text
      })
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job_applications_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>📤 Export Data</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: 'var(--color-text)'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            📄 Export Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-input-border)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-text)'
            }}
          >
            <option value="csv">CSV (Excel compatible)</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              style={{ margin: 0 }}
            />
            Include notes and reminders
          </label>
        </div>

        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-input-bg)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            📊 Exporting {jobs.length} job applications
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--color-input-bg)', 
              color: 'var(--color-text)',
              border: '1px solid var(--color-input-border)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            style={{ 
              background: 'var(--color-button-bg)', 
              color: 'var(--color-button-text)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
} 