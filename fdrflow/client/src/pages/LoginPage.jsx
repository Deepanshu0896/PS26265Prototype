import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO_CREDS = [
  { role: 'AICTE Officer', email: 'officer@aicte.in', password: 'Admin@123' },
  { role: 'Auditor', email: 'auditor@aicte.in', password: 'Admin@123' },
  { role: 'Institution Admin', email: 'admin@iitd.ac.in', password: 'Admin@123' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome to FDRFlow!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const fillCreds = (email, password) => setForm({ email, password });

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="icon">🏦</div>
          <h1 className="login-title">FDRFlow</h1>
          <p className="login-subtitle">AICTE Security Deposit Management Portal</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            {['Secure', 'Trackable', 'Transparent'].map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(14,165,233,0.1)', color: 'var(--primary-light)', borderRadius: 20, border: '1px solid rgba(14,165,233,0.2)', fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : null}
            {loading ? 'Signing in...' : 'Sign In to FDRFlow'}
          </button>
        </form>

        <div className="demo-creds">
          <div style={{ fontWeight: 700, color: 'var(--primary-light)', marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            🧪 Demo Credentials (Sample Data)
          </div>
          {DEMO_CREDS.map(({ role, email, password }) => (
            <div key={email} className="demo-cred-item"
              style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: 4, transition: 'background 0.2s' }}
              onClick={() => fillCreds(email, password)}>
              <strong style={{ color: 'var(--text-secondary)' }}>{role}</strong>
              <span style={{ color: 'var(--text-muted)' }}>{email}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 11 }}>Password for all: <strong style={{ color: 'var(--primary-light)' }}>Admin@123</strong> · Click a role to auto-fill</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          SIH 2026 · PS 26265 · Smart Automation · Software
        </div>
      </div>
    </div>
  );
}
