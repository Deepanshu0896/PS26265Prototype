import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const STATUSES = ['', 'submitted', 'under_verification', 'maturity_pending', 'renewal_requested', 'release_requested', 'released', 'expired'];

export default function FDRList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fdrs, setFDRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });

  const fetchFDRs = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/fdrs', {
        params: { page, limit: 10, status: filters.status || undefined, search: filters.search || undefined },
      });
      setFDRs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFDRs(1); }, [filters]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>FDR Records</h1>
          <p className="text-muted text-sm">{pagination.total} total records · Sample prototype data</p>
        </div>
        {(user?.role === 'institution_admin' || user?.role === 'aicte_officer') && (
          <button className="btn btn-primary" onClick={() => navigate('/fdrs/new')}>
            <Plus size={16} /> Submit FDR
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search />
            <input
              id="fdr-search"
              type="text"
              className="form-input"
              placeholder="Search by instrument ref or bank..."
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              id="fdr-status-filter"
              className="form-select"
              style={{ width: 200 }}
              value={filters.status}
              onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : fdrs.length === 0 ? (
            <div className="empty-state">
              <FileIcon />
              <p>No FDR records found</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/fdrs/new')}>Submit First FDR</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Instrument Ref</th>
                  <th>Institution</th>
                  <th>Bank</th>
                  <th>Amount (₹)</th>
                  <th>Maturity Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fdrs.map(fdr => {
                  const daysToMaturity = Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={fdr.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{fdr.instrument_ref}</td>
                      <td>{fdr.Institution?.name || '-'}</td>
                      <td>{fdr.bank_name}{fdr.branch_name ? ` · ${fdr.branch_name}` : ''}</td>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                        {Number(fdr.amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div>{fdr.maturity_date ? format(new Date(fdr.maturity_date), 'dd MMM yyyy') : '-'}</div>
                        {daysToMaturity > 0 && daysToMaturity <= 90 && !['released','expired'].includes(fdr.status) && (
                          <div style={{ fontSize: 11, color: daysToMaturity <= 30 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                            {daysToMaturity}d remaining
                          </div>
                        )}
                      </td>
                      <td><StatusBadge status={fdr.status} /></td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/fdrs/${fdr.id}`)}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div className="pagination">
              <span className="text-sm text-muted">
                Page {pagination.page} of {pagination.pages} ({pagination.total} records)
              </span>
              <button className="page-btn" disabled={pagination.page === 1} onClick={() => fetchFDRs(pagination.page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetchFDRs(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchFDRs(pagination.page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
