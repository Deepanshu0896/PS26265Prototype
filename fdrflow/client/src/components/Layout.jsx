import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Building2, ScrollText, LogOut, Plus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'MAIN' },
  { to: '/fdrs', icon: FileText, label: 'FDR Records', section: 'MAIN' },
  { to: '/institutions', icon: Building2, label: 'Institutions', section: 'MANAGEMENT', roles: ['aicte_officer', 'auditor'] },
  { to: '/audit', icon: ScrollText, label: 'Audit Trail', section: 'MANAGEMENT' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(user?.role));
  const sections = [...new Set(filteredNav.map(i => i.section))];

  const roleLabel = {
    aicte_officer: 'AICTE Officer',
    institution_admin: 'Institution Admin',
    auditor: 'Auditor',
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">🏦</div>
            <div>
              <div className="logo-text">FDRFlow</div>
              <div className="logo-sub">SIH 2026 · PS 26265</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section} className="nav-section">
              <div className="nav-section-label">{section}</div>
              {filteredNav.filter(i => i.section === section).map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Icon /> {label}
                </NavLink>
              ))}
            </div>
          ))}

          {(user?.role === 'institution_admin' || user?.role === 'aicte_officer') && (
            <div className="nav-section">
              <div className="nav-section-label">ACTIONS</div>
              <div className="nav-item" onClick={() => navigate('/fdrs/new')} style={{ cursor: 'pointer' }}>
                <Plus /> Submit FDR
              </div>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{roleLabel[user?.role]}</div>
            </div>
            <button onClick={handleLogout} title="Logout"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="header">
        <div className="header-title">
          {user?.institution_name ? `${user.institution_name}` : 'AICTE · FDRFlow Portal'}
        </div>
        <div className="header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(14,165,233,0.08)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <Shield size={14} color="var(--primary)" />
            <span style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>{roleLabel[user?.role]}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="page-content page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
