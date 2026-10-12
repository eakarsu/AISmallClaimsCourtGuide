import FormattedAIReport from "../components/FormattedAIReport";
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  header: { marginBottom: 20 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d' },
  card: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' },
  btn: { background: '#2b6cb0', color: 'white', padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  disclaimer: { fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: 8, marginTop: 12 },
};

export default function AppealAssessment() {
  const { id } = useParams();
  const [state, setState] = useState('');
  const [disputeType, setDisputeType] = useState('');
  const [judgmentAmount, setJudgmentAmount] = useState('');
  const [rulingSummary, setRulingSummary] = useState('');
  const [allegedErrors, setAllegedErrors] = useState('');
  const [deadlineKnown, setDeadlineKnown] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const presets = [
    { label: 'Security deposit appeal', fill: () => { setState('California'); setDisputeType('Security deposit'); setJudgmentAmount('1850'); setRulingSummary('The court entered judgment for the landlord after declining to consider the dated move-out photographs and itemized deposit statement.'); setAllegedErrors('The photographs were offered at the hearing but excluded without an explanation.'); setDeadlineKnown('Confirm the appeal deadline on the written judgment and with the court clerk.'); } },
    { label: 'Repair dispute appeal', fill: () => { setState('New York'); setDisputeType('Vehicle repair'); setJudgmentAmount('3200'); setRulingSummary('The court dismissed the claim despite a signed estimate and receipts showing payment for work that was not completed.'); setAllegedErrors('The ruling did not address the signed estimate or the mechanic’s written admission.'); setDeadlineKnown('Unknown; obtain the judgment date and confirm the local deadline.'); } },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!state || !rulingSummary) { setError('State and ruling summary are required.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/appeal-assessment', {
        case_id: id,
        state,
        dispute_type: disputeType,
        judgment_amount: judgmentAmount ? Number(judgmentAmount) : undefined,
        ruling_summary: rulingSummary,
        alleged_errors: allegedErrors,
        deadline_known: deadlineKnown,
      });
      setResult(res.data?.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={id ? `/cases/${id}` : '/'} style={s.back}>← Back</Link>
      <div style={s.header}>
        <h1 style={s.h1}>Appeal Assessment</h1>
        <p style={{ color: '#4a5568' }}>Informational evaluation of whether an appeal is realistic. Verify deadlines with your local clerk.</p>
      </div>

      <form onSubmit={handleSubmit} style={s.card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }} aria-label="Sample scenarios">
          {presets.map(({ label, fill }) => <button key={label} type="button" style={{ ...s.btn, background: '#edf2f7', color: '#1a365d' }} onClick={fill}>{label}</button>)}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>State *</label>
          <input style={s.input} value={state} onChange={e => setState(e.target.value)} placeholder="e.g. CA, TX" required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Dispute type</label>
          <input style={s.input} value={disputeType} onChange={e => setDisputeType(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Judgment amount ($)</label>
          <input type="number" min="0" step="0.01" style={s.input} value={judgmentAmount} onChange={e => setJudgmentAmount(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Ruling summary *</label>
          <textarea style={s.textarea} rows={4} value={rulingSummary} onChange={e => setRulingSummary(e.target.value)} placeholder="Summary of the ruling you wish to appeal" required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Alleged errors</label>
          <textarea style={s.textarea} rows={3} value={allegedErrors} onChange={e => setAllegedErrors(e.target.value)} placeholder="Why you believe the ruling was wrong (legal/factual)" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Deadline already known?</label>
          <input style={s.input} value={deadlineKnown} onChange={e => setDeadlineKnown(e.target.value)} placeholder="e.g. 30 days, unknown" />
        </div>

        {error && <div style={s.err}>{error}</div>}

        <button type="submit" style={s.btn} disabled={loading}>
          {loading ? 'Assessing...' : 'Assess Appeal Viability'}
        </button>
      </form>

      {result && (
        <div style={s.card}>
          <h2>Appeal Assessment</h2>
          {result.disclaimer && <div style={s.disclaimer}>{result.disclaimer}</div>}
          <FormattedAIReport response={result} />
        </div>
      )}
    </Layout>
  );
}
