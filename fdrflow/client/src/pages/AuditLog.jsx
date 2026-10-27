import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow, format } from 'date-fns';

const ACTION_COLORS = {
  FDR_CREATED: 'var(--success)',
  STATUS_CHANGE: 'var(--primary)',
  USER_LOGIN: 'var(--text-muted)',
  VERIFICATION_COMPLETE: 'var(--accent)',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/institutions/audit', { params: { page, limit: 20 } });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(1); }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Audit Trail</h1>
          <p className="text-muted text-sm">{pagination.total} total log entries · Complete action history</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <ScrollText size={60} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <p>No audit logs found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>FDR</th>
                  <th>Status Change</th>
                  <th>Performed By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 13 }}>{log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy') : '-'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.created_at ? format(new Date(log.created_at), 'HH:mm:ss') : ''}</div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: `${ACTION_COLORS[log.action] || 'var(--text-muted)'}20`,
                        color: ACTION_COLORS[log.action] || 'var(--text-muted)',
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                      }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                      {log.FDRRecord ? `${log.FDRRecord.instrument_ref}` : '-'}
                    </td>
                    <td>
                      {log.new_status ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {log.old_status && <><StatusBadge status={log.old_status} /> <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span></>}
                          <StatusBadge status={log.new_status} />
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{log.Actor?.name || 'System'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {log.Actor?.role?.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.notes || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div className="pagination">
              <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
              <button className="page-btn" disabled={pagination.page === 1} onClick={() => fetchLogs(pagination.page - 1)}>
                <ChevronLeft size={14} />
              </button>
              <button className="page-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchLogs(pagination.page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
