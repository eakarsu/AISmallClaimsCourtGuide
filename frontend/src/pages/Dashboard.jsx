import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import RecordDialog from '../components/RecordDialog.jsx';
import api from '../api.js';

const STATUS_COLORS = { draft: '#a0aec0', active: '#3182ce', filed: '#38a169', closed: '#718096' };

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  h1: { fontSize: 28, fontWeight: 700, color: '#1a365d' },
  newBtn: { background: '#2b6cb0', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  card: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: 'inherit', display: 'block', transition: 'box-shadow 0.2s', cursor: 'pointer', textAlign: 'left', border: '1px solid transparent' },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1a365d' },
  meta: { fontSize: 13, color: '#718096', marginBottom: 4 },
  badge: { display: 'inline-block', padding: '2px 10px', borderRadius: 20, color: 'white', fontSize: 12, fontWeight: 600, marginTop: 10 },
  amount: { fontSize: 20, fontWeight: 700, color: '#2b6cb0', marginBottom: 4 },
  empty: { textAlign: 'center', padding: '80px 20px', color: '#718096' },
};

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);
  const [error, setError] = useState('');

  const loadCases = useCallback(() => (
    api.get(`/cases?page=${page}&limit=20`)
      .then(r => {
        if (!Array.isArray(r.data?.data)) throw new Error('Case list returned an invalid response.');
        setCases(r.data.data);
        setPagination(r.data.pagination || {});
        setError('');
      })
      .catch(err => { setCases([]); setError(err.message || 'Could not load cases.'); })
      .finally(() => setLoading(false))
  ), [page]);

  useEffect(() => { loadCases(); }, [loadCases]);

  const refresh = () => loadCases();

  return (
    <Layout>
      <div style={s.header}>
        <h1 style={s.h1}>My Cases</h1>
        <Link to="/cases/new" style={s.newBtn}>+ New Case</Link>
      </div>

      {error && <p role="alert">{error}</p>}
      {loading ? <p>Loading...</p> : error ? null : cases.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚖️</p>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No cases yet</p>
          <p>Start by creating your first case to get AI-powered guidance.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {cases.map(c => (
            <div
              key={c.id}
              style={s.card}
              role="button"
              tabIndex={0}
              aria-label={`Open details for ${c.dispute_type} case`}
              onClick={() => setSelectedCase(c.id)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedCase(c.id); } }}
            >
              <div style={s.amount}>${Number(c.claim_amount).toLocaleString()}</div>
              <div style={s.cardTitle}>{c.dispute_type}</div>
              <div style={s.meta}>vs. {c.opposing_party || 'Unknown party'}</div>
              <div style={s.meta}>{c.jurisdiction_state} {c.jurisdiction_county ? `— ${c.jurisdiction_county}` : ''}</div>
              <div style={{ ...s.badge, background: STATUS_COLORS[c.status] || '#a0aec0' }}>{c.status}</div>
              <div style={{ marginTop: 12 }}>
                <Link to={`/cases/${c.id}`} onClick={(event) => event.stopPropagation()} style={{ color: '#2b6cb0', fontSize: 13, fontWeight: 600 }}>Open workspace →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}>Previous</button>
          <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={cases.length < pagination.limit} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}>Next</button>
        </div>
      )}

      {selectedCase && (
        <RecordDialog caseId={selectedCase} onClose={() => setSelectedCase(null)} onChanged={refresh} />
      )}
    </Layout>
  );
}
