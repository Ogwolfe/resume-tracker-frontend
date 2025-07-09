import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    // Clear password error when user starts typing
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Check if password is not empty
    if (!form.password) {
      setPasswordError('Password is required');
      return;
    }
    
    try {
      await register(form);
    } catch {}
  };

  return (
    <div className="app-container">
      <div className="form-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading}>Register</button>
          {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
        <p style={{ marginTop: 16 }}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
} 