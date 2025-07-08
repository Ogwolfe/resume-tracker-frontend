import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(form);
    } catch {}
  };

  return (
    <div className="app-container">
      <div className="header">Resume Tracker</div>
      <div className="form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading}>Login</button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
        <p style={{ marginTop: 16 }}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
} 