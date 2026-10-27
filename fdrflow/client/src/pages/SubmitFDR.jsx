import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SubmitFDR() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bank_name: '', branch_name: '', instrument_ref: '',
    amount: '', issue_date: '', maturity_date: '',
    interest_rate: '', submission_notes: '',
    institution_id: '',
  });

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bank_name || !form.instrument_ref || !form.amount || !form.issue_date || !form.maturity_date) {
      return toast.error('Please fill all required fields');
    }
    if (new Date(form.maturity_date) <= new Date(form.issue_date)) {
      return toast.error('Maturity date must be after issue date');
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/fdrs', form);
      toast.success('FDR submitted successfully!');
      navigate(`/fdrs/${data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/fdrs')}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Submit New FDR</h1>
          <p className="text-muted text-sm">Submit a new Security Deposit / Fixed Deposit Receipt</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              🏦 FDR Information
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <input id="fdr-bank-name" type="text" className="form-input" placeholder="e.g., State Bank of India" value={form.bank_name} onChange={set('bank_name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input id="fdr-branch-name" type="text" className="form-input" placeholder="e.g., Main Branch" value={form.branch_name} onChange={set('branch_name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Instrument Reference *</label>
                <input id="fdr-instrument-ref" type="text" className="form-input" placeholder="e.g., SBI/FDR/2024/001" value={form.instrument_ref} onChange={set('instrument_ref')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input id="fdr-amount" type="number" className="form-input" placeholder="e.g., 5000000" value={form.amount} onChange={set('amount')} min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Issue Date *</label>
                <input id="fdr-issue-date" type="date" className="form-input" value={form.issue_date} onChange={set('issue_date')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Maturity Date *</label>
                <input id="fdr-maturity-date" type="date" className="form-input" value={form.maturity_date} onChange={set('maturity_date')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input id="fdr-interest-rate" type="number" step="0.01" className="form-input" placeholder="e.g., 7.25" value={form.interest_rate} onChange={set('interest_rate')} />
              </div>
              {user?.role === 'aicte_officer' && (
                <div className="form-group">
                  <label className="form-label">Institution ID</label>
                  <input id="fdr-institution-id" type="number" className="form-input" placeholder="Institution ID" value={form.institution_id} onChange={set('institution_id')} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Submission Notes</label>
              <textarea id="fdr-notes" className="form-textarea" placeholder="Any additional notes or context for this FDR submission..." value={form.submission_notes} onChange={set('submission_notes')} />
            </div>

            <button id="fdr-submit-btn" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
              {submitting ? 'Submitting...' : 'Submit FDR'}
            </button>
          </div>
        </form>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--primary-light)' }}>📋 Submission Checklist</h4>
            {['Correct bank name and branch', 'Valid instrument reference number', 'Issue and maturity dates are accurate', 'Amount matches the FDR certificate', 'Supporting documents ready to upload'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--warning)' }}>⚠️ Important</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              All submitted data will be verified by an authorized AICTE officer. Ensure accuracy before submission. Incorrect data may lead to delays in verification.
            </p>
          </div>
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: 12 }}>🔄 What happens next?</h4>
            {['FDR record created with status "Submitted"', 'AICTE officer notified for verification', 'Verification evidence recorded', 'Alerts scheduled for maturity dates', 'Release workflow initiated when due'].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
