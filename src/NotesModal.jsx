import React, { useState, useEffect } from 'react';

export default function NotesModal({ job, isOpen, onClose, onSave }) {
  const [notes, setNotes] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderText, setReminderText] = useState('');

  // Update state when job changes
  useEffect(() => {
    if (job) {
      setNotes(job.notes || '');
      setReminderDate(job.reminder_date || '');
      setReminderText(job.reminder_text || '');
    }
  }, [job]);

  const handleSave = () => {
    onSave({
      notes,
      reminder_date: reminderDate,
      reminder_text: reminderText
    });
    onClose();
  };

  if (!isOpen || !job) return null;

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
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--color-input-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>📝 Notes & Reminders</h3>
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
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            {job?.position || 'Unknown Position'} at {job?.company || 'Unknown Company'}
          </h4>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            📝 Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this application, interview details, contact information, etc..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--color-input-border)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-text)',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            ⏰ Follow-up Reminder
          </label>
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-input-border)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-text)',
              marginBottom: '0.5rem'
            }}
          />
          <input
            type="text"
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
            placeholder="What should you follow up on? (e.g., 'Call HR about interview feedback')"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-input-border)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-text)'
            }}
          />
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
            onClick={handleSave}
            style={{ 
              background: 'var(--color-button-bg)', 
              color: 'var(--color-button-text)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
} 