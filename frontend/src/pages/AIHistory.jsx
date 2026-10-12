import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import FormattedAIReport, { readableLabel } from '../components/FormattedAIReport.jsx';
import api from '../api.js';

export default function AIHistory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/ai/history').then(({ data }) => {
      if (!Array.isArray(data?.items)) throw new Error('Invalid saved report list.');
      setItems(data.items);
    })
      .catch(() => setError('Could not load saved reports.'));
  }, []);
  return <Layout>
    <h1>Saved AI reports</h1>
    <p>Your most recent 100 saved reports.</p>
    {error && <p role="alert">{error}</p>}
    {!error && items.length === 0 && <p>No saved reports yet.</p>}
    {items.map(item => <details key={item.id} className="ai-history" style={{ marginBottom: 16 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
        {readableLabel(item.endpoint)} — {new Date(item.created_at).toLocaleString()}
      </summary>
      <FormattedAIReport response={item.result} title={readableLabel(item.endpoint)} />
    </details>)}
  </Layout>;
}
