import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(form);
    } catch {}
  };

  return (
    <div className="app-container">
      <div className="header">Resume Tracker</div>
      <div className="form-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading}>Register</button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
        <p style={{ marginTop: 16 }}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
} 