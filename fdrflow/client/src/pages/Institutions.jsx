import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import api from '../api/client';

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/institutions')
      .then(r => setInstitutions(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { approved: 'var(--success)', pending: 'var(--warning)', suspended: 'var(--danger)' };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Institutions</h1>
          <p className="text-muted text-sm">{institutions.length} registered institutions</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {institutions.map(inst => {
            const totalFDRs = inst.FDRRecords?.length || 0;
            const activeFDRs = inst.FDRRecords?.filter(f => !['released', 'expired'].includes(f.status)).length || 0;
            return (
              <div key={inst.id} className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    🏛️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 700, background: `${statusColor[inst.approved_status]}20`, color: statusColor[inst.approved_status] }}>
                      {inst.approved_status}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  📧 {inst.contact_email} · 📞 {inst.phone}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, background: 'var(--bg-dark)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{totalFDRs}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total FDRs</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-dark)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{activeFDRs}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
