import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const STATIC_LINKS = [
  { to: '/insights/timeline', label: 'Timeline View', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/cases/new', label: 'New Case', group: 'Workspace' },
  { to: '/evidence-organizer', label: 'Evidence Organizer', group: 'Workspace' },
  { to: '/settlement-calculator', label: 'Settlement Calculator', group: 'Workspace' },
  { to: '/court-procedure-checklist', label: 'Court Procedure Checklist', group: 'Workspace' },
  { to: '/witness-statement-guide', label: 'Witness Statement Guide', group: 'Workspace' },
  { to: '/appeal-assessment', label: 'Appeal Assessment', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
  { to: '/judgment-collection-tracker', label: 'Judgment Collection Tracker', group: 'Workspace' },
  { to: '/cf-case-evaluation-settlement-guidance', label: 'Cf Case Evaluation Settlement Guidance', group: 'Workspace' },
  { to: '/cf-jurisdictionspecific-playbook', label: 'Cf Jurisdictionspecific Playbook', group: 'Workspace' },
  { to: '/cf-evidence-presentation-optimizer', label: 'Cf Evidence Presentation Optimizer', group: 'Workspace' },
  { to: '/cf-opponent-research', label: 'Cf Opponent Research', group: 'Workspace' },
  { to: '/cf-pro-se-litigant-coaching', label: 'Cf Pro Se Litigant Coaching', group: 'Workspace' },
  { to: '/cf-postjudgment-collection-guidance', label: 'Cf Postjudgment Collection Guidance', group: 'Workspace' },
  { to: '/gap-no-evidenceorganizer', label: 'Gap No Evidenceorganizer', group: 'Workspace' },
  { to: '/gap-no-witnessstatementguide', label: 'Gap No Witnessstatementguide', group: 'Workspace' },
  { to: '/gap-no-settlementcalculator-casevalue-estimator', label: 'Gap No Settlementcalculator Casevalue Estimator', group: 'Workspace' },
  { to: '/gap-no-courtprocedurechecklist-perjurisdiction', label: 'Gap No Courtprocedurechecklist Perjurisdiction', group: 'Workspace' },
  { to: '/gap-no-appealassessment', label: 'Gap No Appealassessment', group: 'Workspace' },
  { to: '/gap-no-case-tracking-beyond-crud-no-hearing-remi', label: 'Gap No Case Tracking Beyond Crud No Hearing Remi', group: 'Workspace' },
  { to: '/gap-no-fee-schedule-lookup-filing-fees-by-court', label: 'Gap No Fee Schedule Lookup Filing Fees By Court', group: 'Workspace' },
  { to: '/gap-no-statute-of-limitations-checker', label: 'Gap No Statute Of Limitations Checker', group: 'Workspace' },
  { to: '/gap-no-legal-citation-library', label: 'Gap No Legal Citation Library', group: 'Workspace' },
  { to: '/gap-no-efiling-integration-tyler-efiletexas', label: 'Gap No Efiling Integration Tyler Efiletexas', group: 'Workspace' },
  { to: '/gap-no-notificationscalendar-reminders', label: 'Gap No Notificationscalendar Reminders', group: 'Workspace' },
  { to: '/gap-no-payment-processing-for-court-fees', label: 'Gap No Payment Processing For Court Fees', group: 'Workspace' },
  { to: '/gap-no-audit-log-rbac', label: 'Gap No Audit Log Rbac', group: 'Workspace' },
];

export default function AppSidebar({ extraLinks = [] }) {
  const LINKS = [...STATIC_LINKS, ...extraLinks];
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AISmall Claims Court Guide</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
