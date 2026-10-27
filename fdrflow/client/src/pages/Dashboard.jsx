import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, Activity } from 'lucide-react';
import api from '../api/client';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '../components/StatusBadge';

const PIE_COLORS = { submitted: '#94a3b8', under_verification: '#f59e0b', maturity_pending: '#ef4444', renewal_requested: '#8b5cf6', release_requested: '#06b6d4', released: '#10b981', expired: '#dc2626' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/fdrs/dashboard')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const { kpis, statusBreakdown, monthlyData, recentActivity } = stats || {};

  const kpiCards = [
    { label: 'Total FDRs', value: kpis?.totalFDRs || 0, icon: '📋', color: 'var(--primary)', sub: 'All records' },
    { label: 'Active FDRs', value: kpis?.activeFDRs || 0, icon: '✅', color: 'var(--success)', sub: 'Not released/expired' },
    { label: 'Expiring in 30d', value: kpis?.expiringSoon || 0, icon: '⏰', color: 'var(--warning)', sub: 'Need action soon' },
    { label: 'Pending Verification', value: kpis?.pendingVerification || 0, icon: '🔍', color: 'var(--purple)', sub: 'Awaiting officer review' },
    { label: 'Release Requests', value: kpis?.releaseRequests || 0, icon: '📤', color: 'var(--accent)', sub: 'Awaiting approval' },
  ];

  const pieData = (statusBreakdown || []).map(s => ({ name: s.status, value: parseInt(s.count) }));

  const barData = (monthlyData || []).map(m => ({
    month: m.month,
    count: parseInt(m.count),
    amount: parseFloat(m.total_amount || 0) / 100000, // in lakhs
  }));

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p className="text-muted text-sm">FDR lifecycle overview · Sample seed data for prototype</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/fdrs/new')}>
          <span>+</span> Submit New FDR
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((k, i) => (
          <div key={i} className="kpi-card" style={{ '--card-accent': k.color }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
            <div className="kpi-icon">{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Status Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v.replace(/_/g, ' ')}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data available</p></div>}
        </div>

        {/* Monthly FDRs */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Monthly Submissions</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="FDRs" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No monthly data</p></div>}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700 }}>Recent Activity</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/audit')}>View All</button>
        </div>
        {recentActivity?.length > 0 ? (
          <div className="timeline">
            {recentActivity.slice(0, 8).map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ background: item.action === 'STATUS_CHANGE' ? 'var(--primary)' : item.action === 'FDR_CREATED' ? 'var(--success)' : 'var(--text-muted)' }} />
                <div className="timeline-content">
                  <span className="timeline-action">
                    {item.FDRRecord ? `[${item.FDRRecord.instrument_ref}] ` : ''}{item.action.replace(/_/g, ' ')}
                  </span>
                  {item.new_status && (
                    <span> → <StatusBadge status={item.new_status} /></span>
                  )}
                  <div className="timeline-meta">
                    by {item.Actor?.name || 'System'} · {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : ''}
                  </div>
                  {item.notes && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{item.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state"><p>No recent activity</p></div>}
      </div>
    </div>
  );
}
