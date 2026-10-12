import React, { useEffect, useRef, useState } from 'react';
import api from '../api.js';

const titleCase = (key) => String(key).replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase());

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const panelStyle = { background: '#fff', borderRadius: 12, width: '92%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', textAlign: 'left' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #e2e8f0' };
const bodyStyle = { padding: '16px 20px' };
const actionsStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' };
const btn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1a365d', fontWeight: 600, cursor: 'pointer' };
const btnPrimary = { ...btn, background: '#2b6cb0', color: '#fff', borderColor: 'transparent' };
const btnDanger = { ...btn, background: '#fff5f5', color: '#e53e3e', borderColor: '#fed7d7' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box', fontFamily: 'inherit' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 };

export const CASE_FIELDS = [
  { key: 'dispute_type', label: 'Dispute type', required: true },
  { key: 'opposing_party', label: 'Opposing party' },
  { key: 'claim_amount', label: 'Claim amount', type: 'number', step: '0.01', min: 0, required: true },
  { key: 'jurisdiction_state', label: 'State', required: true },
  { key: 'jurisdiction_county', label: 'County' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'filed', 'closed'] },
  { key: 'facts', label: 'Facts', type: 'textarea' },
];

function RecordValue({ value }) {
  if (value === null || value === undefined || value === '') return <span style={{ color: '#718096' }}>Not provided</span>;
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>;
  if (Array.isArray(value)) return <ul style={{ margin: 0, paddingLeft: 18 }}>{value.map((item, index) => <li key={index}><RecordValue value={item} /></li>)}</ul>;
  if (typeof value === 'object') return <dl style={{ margin: 0 }}>{Object.entries(value).map(([key, item]) => <div key={key}><dt style={{ fontWeight: 600 }}>{titleCase(key)}</dt><dd style={{ margin: '0 0 6px' }}><RecordValue value={item} /></dd></div>)}</dl>;
  return <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{String(value)}</span>;
}

/**
 * Case record dialog — details view with Edit, Delete (with confirmation) and Cancel.
 * Modeled on ai-340b-contract-pharmacy-audit-recovery/frontend/src/RecordDialog.jsx.
 */
export default function RecordDialog({ caseId, onClose, onChanged }) {
  const [record, setRecord] = useState(null);
  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const box = useRef(null);
  const writing = useRef(busy);
  writing.current = busy;

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api.get(`/cases/${caseId}`)
      .then((response) => { if (alive) { const data = response.data.case || response.data; setRecord(data); setDraft({ ...data }); setEditing(false); setConfirmDelete(false); } })
      .catch((failure) => { if (alive) setError(failure.response?.data?.error || failure.message || 'The case could not be loaded.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [caseId]);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    box.current?.querySelector('button')?.focus();
    const onKey = (event) => { if (event.key === 'Escape' && !writing.current) { event.preventDefault(); onClose(); } };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, [onClose]);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const payload = { ...draft, claim_amount: draft.claim_amount === '' || draft.claim_amount === undefined ? draft.claim_amount : Number(draft.claim_amount) };
      const response = await api.put(`/cases/${caseId}`, payload);
      setRecord(response.data?.case || response.data || payload);
      setEditing(false);
      await onChanged?.();
    } catch (failure) {
      setError(failure.response?.data?.error || failure.message || 'The case could not be updated.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      await api.delete(`/cases/${caseId}`);
      await onChanged?.();
      onClose();
    } catch (failure) {
      setError(failure.response?.data?.error || failure.message || 'The case could not be deleted.');
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={overlayStyle} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div style={panelStyle} ref={box} role="dialog" aria-modal="true" aria-label="Case details">
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#1a365d' }}>{editing ? 'Edit case' : 'Case details'}</h2>
          <button type="button" aria-label="Cancel case dialog" disabled={busy} onClick={onClose} style={{ ...btn, padding: '4px 10px' }}>×</button>
        </div>
        {loading && <div style={bodyStyle} role="status"><p style={{ color: '#718096' }}>Loading the case…</p></div>}
        {!loading && error && <div style={bodyStyle}><div style={{ background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8 }} role="alert">{error}</div></div>}
        {!loading && record && (
          editing ? (
            <form onSubmit={save}>
              <div style={{ ...bodyStyle, display: 'grid', gap: 12 }}>
                {CASE_FIELDS.map((field) => (
                  <label key={field.key}>
                    <span style={labelStyle}>{field.label}{field.required ? ' *' : ''}</span>
                    {field.type === 'select' ? (
                      <select style={inputStyle} required={field.required} disabled={busy} value={draft[field.key] ?? ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}>
                        <option value="">Select…</option>
                        {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea style={inputStyle} rows={4} required={field.required} disabled={busy} value={draft[field.key] ?? ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />
                    ) : (
                      <input style={inputStyle} type={field.type || 'text'} step={field.step} min={field.min} required={field.required} disabled={busy} value={draft[field.key] ?? ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />
                    )}
                  </label>
                ))}
              </div>
              <div style={actionsStyle}>
                <button type="button" style={btn} disabled={busy} onClick={() => { setDraft({ ...record }); setEditing(false); setConfirmDelete(false); }}>Cancel</button>
                <button type="submit" style={btnPrimary} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          ) : (
            <>
              <div style={bodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                  {Object.entries(record).filter(([key]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(key)).map(([key, value]) => (
                    <div key={key} style={key === 'facts' ? { gridColumn: '1 / -1' } : undefined}>
                      <div style={{ ...labelStyle, marginBottom: 4 }}>{titleCase(key)}</div>
                      <RecordValue value={value} />
                    </div>
                  ))}
                </div>
                {confirmDelete && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8 }} role="alert">
                    <strong>Delete this case?</strong>
                    <p style={{ margin: '6px 0 10px' }}>This cannot be undone.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" style={btnDanger} disabled={busy} onClick={remove}>Delete case</button>
                      <button type="button" style={btn} disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel deletion</button>
                    </div>
                  </div>
                )}
              </div>
              <div style={actionsStyle}>
                <button type="button" style={btnDanger} disabled={busy} onClick={() => setConfirmDelete(true)}>Delete</button>
                <button type="button" style={btnPrimary} disabled={busy} onClick={() => { setDraft({ ...record }); setEditing(true); setConfirmDelete(false); }}>Edit</button>
                <button type="button" style={btn} disabled={busy} onClick={onClose}>Cancel</button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
