import React, { useEffect, useState } from 'react';
import FormattedAIReport from '../components/FormattedAIReport.jsx';
import api from '../api.js';

export default function JudgmentCollectionTracker() {
  const [data, setData] = useState({ summary: {}, judgments: [] });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/judgment-collection-tracker')
      .then(({ data: payload }) => {
        if (!Array.isArray(payload?.judgments) || !payload.summary || typeof payload.summary !== 'object') throw new Error('Judgment list returned an invalid response.');
        setData(payload);
      })
      .catch((err) => setError(err.message));
  }, []);

  const nextStep = async (id) => {
    try {
      const res = await api.post('/judgment-collection-tracker/next-step', { id });
      setResult(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not plan the next step.');
    }
  };

  return (
    <div className="page">
      <h1>Judgment Collection Tracker</h1>
      <p>Track post-judgment collection windows, enforcement readiness, and packet requirements.</p>
      {error && <p role="alert">{error}</p>}
      {Object.entries(data.summary).map(([key, value]) => <div className="card" key={key}><strong>{value}</strong> {key}</div>)}
      {data.judgments.map((item) => (
        <div className="card" key={item.id}>
          <h3>{item.id} - {item.debtor}</h3>
          <p>${item.amount} - {item.daysSinceJudgment} days since judgment - {item.status}</p>
          <button onClick={() => nextStep(item.id)}>Plan next step</button>
        </div>
      ))}
      {result && <FormattedAIReport response={result} />}
    </div>
  );
}
