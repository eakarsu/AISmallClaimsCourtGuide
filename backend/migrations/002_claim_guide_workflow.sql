BEGIN;
CREATE TABLE IF NOT EXISTS jurisdiction_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), jurisdiction_key TEXT NOT NULL, source_url TEXT NOT NULL, source_version TEXT NOT NULL,
  effective_from DATE NOT NULL, effective_to DATE, checksum TEXT NOT NULL, retrieved_at TIMESTAMPTZ NOT NULL, UNIQUE(jurisdiction_key,source_version,checksum)
);
CREATE TABLE IF NOT EXISTS claim_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, user_id UUID NOT NULL REFERENCES users(id), case_id UUID REFERENCES cases(id),
  idempotency_key TEXT NOT NULL, jurisdiction_source_id UUID NOT NULL REFERENCES jurisdiction_sources(id), stage TEXT NOT NULL DEFAULT 'intake',
  version INTEGER NOT NULL DEFAULT 1, owner_id TEXT NOT NULL, assigned_to TEXT, disclaimer_accepted_at TIMESTAMPTZ NOT NULL,
  consent JSONB NOT NULL, payload JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id,idempotency_key), CHECK(stage IN ('intake','jurisdiction_validated','evidence_ready','human_review','user_approved','filing_pending','filed','hearing','judgment','collection','closed','corrected'))
);
CREATE INDEX IF NOT EXISTS claim_guides_tenant_stage_idx ON claim_guides(tenant_id,stage,updated_at DESC);
CREATE TABLE IF NOT EXISTS claim_integration_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, guide_id UUID REFERENCES claim_guides(id), provider TEXT NOT NULL,
  operation TEXT NOT NULL, idempotency_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ, request JSONB NOT NULL DEFAULT '{}', receipt JSONB, last_error TEXT, UNIQUE(tenant_id,provider,idempotency_key),
  CHECK(status IN ('pending','sent','acknowledged','failed','dead_letter','reconciled'))
);
CREATE TABLE IF NOT EXISTS claim_guide_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, fixture_version TEXT NOT NULL, jurisdiction_accuracy NUMERIC NOT NULL,
  form_acceptance_rate NUMERIC NOT NULL, fee_accuracy NUMERIC NOT NULL, deadline_accuracy NUMERIC NOT NULL, unauthorized_filings INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL, details JSONB NOT NULL DEFAULT '{}', evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS claim_workflow_audit (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, guide_id UUID, actor_id TEXT NOT NULL, action TEXT NOT NULL,
  from_stage TEXT, to_stage TEXT, payload JSONB NOT NULL DEFAULT '{}', occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION claim_workflow_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'claim workflow audit is append-only'; END; $$;
DROP TRIGGER IF EXISTS claim_workflow_audit_no_mutation ON claim_workflow_audit;
CREATE TRIGGER claim_workflow_audit_no_mutation BEFORE UPDATE OR DELETE ON claim_workflow_audit FOR EACH ROW EXECUTE FUNCTION claim_workflow_audit_immutable();
COMMIT;
