import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const WORKFLOW = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_verification', label: 'Verification' },
  { key: 'maturity_pending', label: 'Maturity' },
  { key: 'renewal_requested', label: 'Renewal/Release' },
  { key: 'released', label: 'Closed' },
];

const STATUS_ORDER = ['submitted', 'under_verification', 'maturity_pending', 'renewal_requested', 'released'];

export default function FDRDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fdr, setFDR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
  const [verifyForm, setVerifyForm] = useState({ verification_status: '', evidence_notes: '' });

  const fetchFDR = async () => {
    try {
      const { data } = await api.get(`/fdrs/${id}`);
      setFDR(data.data);
    } catch (err) {
      toast.error('Failed to load FDR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFDR(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!statusForm.status) return toast.error('Select a status');
    setUpdating(true);
    try {
      await api.patch(`/fdrs/${id}/status`, statusForm);
      toast.success('Status updated successfully');
      fetchFDR();
      setStatusForm({ status: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyForm.verification_status) return toast.error('Select verification status');
    setUpdating(true);
    try {
      await api.post(`/fdrs/${id}/verify`, verifyForm);
      toast.success('Verification recorded');
      fetchFDR();
      setVerifyForm({ verification_status: '', evidence_notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!fdr) return <div className="empty-state"><p>FDR not found</p></div>;

  const currentStepIdx = STATUS_ORDER.indexOf(fdr.status);
  const daysToMaturity = Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/fdrs')}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>
            {fdr.instrument_ref}
          </h1>
          <p className="text-muted text-sm">{fdr.bank_name} · {fdr.Institution?.name}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={fdr.status} />
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="card mb-4">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Workflow Progress</h3>
        <div className="workflow-steps">
          {WORKFLOW.map((step, i) => {
            const stepIdx = STATUS_ORDER.indexOf(step.key);
            const isDone = currentStepIdx > stepIdx || fdr.status === 'released';
            const isActive = fdr.status === step.key;
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < WORKFLOW.length - 1 ? '1' : 'none' }}>
                <div className={`workflow-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                  <div className="step-circle">{isDone ? '✓' : i + 1}</div>
                  <span style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{step.label}</span>
                </div>
                {i < WORKFLOW.length - 1 && <div className={`step-connector ${isDone ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* FDR Details */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>FDR Details</h3>
          {[
            ['Institution', fdr.Institution?.name],
            ['Bank Name', fdr.bank_name],
            ['Branch', fdr.branch_name || '-'],
            ['Instrument Ref', fdr.instrument_ref],
            ['Amount', `₹${Number(fdr.amount).toLocaleString('en-IN')}`],
            ['Interest Rate', fdr.interest_rate ? `${fdr.interest_rate}%` : '-'],
            ['Issue Date', fdr.issue_date ? format(new Date(fdr.issue_date), 'dd MMM yyyy') : '-'],
            ['Maturity Date', fdr.maturity_date ? format(new Date(fdr.maturity_date), 'dd MMM yyyy') : '-'],
            ['Days to Maturity', daysToMaturity > 0 ? (
              <span style={{ color: daysToMaturity <= 30 ? 'var(--danger)' : daysToMaturity <= 90 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>
                {daysToMaturity} days
              </span>
            ) : <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Matured / Expired</span>],
            ['Notes', fdr.submission_notes || '-'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14 }}>
              <span style={{ minWidth: 140, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--text-primary)', flex: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Actions Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status Update (Officer) */}
          {(user?.role === 'aicte_officer' || user?.role === 'institution_admin') && fdr.status !== 'released' && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Update Status</h3>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select id="status-update-select" className="form-select" value={statusForm.status}
                  onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="">Select status...</option>
                  <option value="under_verification">Under Verification</option>
                  <option value="maturity_pending">Maturity Pending</option>
                  <option value="renewal_requested">Renewal Requested</option>
                  <option value="release_requested">Release Requested</option>
                  <option value="released">Released</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }}
                  placeholder="Add notes for this status change..."
                  value={statusForm.notes}
                  onChange={e => setStatusForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button id="status-update-btn" className="btn btn-primary" onClick={handleStatusUpdate} disabled={updating}>
                {updating ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <CheckCircle size={16} />}
                Update Status
              </button>
            </div>
          )}

          {/* Verification Panel (AICTE Officer only) */}
          {user?.role === 'aicte_officer' && fdr.status === 'under_verification' && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Submit Verification</h3>
              <div className="form-group">
                <label className="form-label">Verification Result</label>
                <select id="verify-status-select" className="form-select" value={verifyForm.verification_status}
                  onChange={e => setVerifyForm(p => ({ ...p, verification_status: e.target.value }))}>
                  <option value="">Select result...</option>
                  <option value="verified">✅ Verified</option>
                  <option value="discrepancy_found">⚠️ Discrepancy Found</option>
                  <option value="manual_review">🔍 Manual Review Required</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Evidence / Notes</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }}
                  placeholder="Describe verification evidence or discrepancy..."
                  value={verifyForm.evidence_notes}
                  onChange={e => setVerifyForm(p => ({ ...p, evidence_notes: e.target.value }))} />
              </div>
              <button id="verify-submit-btn" className="btn btn-primary" onClick={handleVerify} disabled={updating}>
                <CheckCircle size={16} /> Submit Verification
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="card mt-4">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Activity History</h3>
        {fdr.AuditTrails?.length > 0 ? (
          <div className="timeline">
            {fdr.AuditTrails.map((entry, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ background: entry.action === 'STATUS_CHANGE' ? 'var(--primary)' : 'var(--success)' }} />
                <div className="timeline-content">
                  <span className="timeline-action">{entry.action.replace(/_/g, ' ')}</span>
                  {entry.new_status && <span style={{ marginLeft: 8 }}><StatusBadge status={entry.new_status} /></span>}
                  <div className="timeline-meta">
                    by {entry.Actor?.name} ({entry.Actor?.role?.replace(/_/g, ' ')}) ·{' '}
                    {entry.created_at ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: true }) : ''}
                  </div>
                  {entry.notes && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>"{entry.notes}"</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">No activity recorded yet</p>
        )}
      </div>
    </div>
  );
}
