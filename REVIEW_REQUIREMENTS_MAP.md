# Completeness review mapping

| Review requirement | Implementation |
|---|---|
| 1 | `claimWorkflow` provides owned, versioned intake through jurisdiction, evidence, human review, explicit filing approval, clerk acknowledgement, hearing, judgment, collection and correction. |
| 2 | Effective-dated authoritative sources and typed filing deliveries persist idempotency, retries, receipts, reconciliation and dead-letter failure state. |
| 3 | `claim_guide_evaluations` captures jurisdiction, form acceptance, fee/deadline accuracy and unauthorized filings against versioned fixtures. |
| 4 | JWT-derived claimant tenancy, consent/disclaimer records, explicit claimant approval, role gates, clerk verification, privacy-aware storage and append-only audit keep guidance informational and controlled. |
| 5 | Generated fee-schedule/direct AI/gap routes are quarantined; effective-dated source validation feeds the canonical informational workflow. |
| 6 | Pure tests, CI, base/additive migrations, read-only schema verification and safe explicit launch/migration commands provide repeatability without legal validation claims. |
