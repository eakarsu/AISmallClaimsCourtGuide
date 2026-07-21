const STAGES = Object.freeze(['intake','jurisdiction_validated','evidence_ready','human_review','user_approved','filing_pending','filed','hearing','judgment','collection','closed','corrected']);
const acknowledged = (receipt) => Boolean(receipt && receipt.provider && receipt.receipt_id && receipt.status === 'acknowledged' && !Number.isNaN(new Date(receipt.acknowledged_at).valueOf()));

function validateJurisdiction(input) {
  for (const field of ['court_ref','jurisdiction','fee_schedule_version','source_url','effective_at','verified_at']) if (!input[field]) throw new Error(`${field} is required`);
  const effectiveAt = new Date(input.effective_at);
  const verifiedAt = new Date(input.verified_at);
  if (Number.isNaN(effectiveAt.valueOf()) || Number.isNaN(verifiedAt.valueOf())) throw new Error('valid effective and verification dates required');
  const filingFee = Number(input.filing_fee);
  if (!Number.isFinite(filingFee) || filingFee < 0) throw new Error('valid filing fee required');
  return { filing_fee: filingFee, effective_at: effectiveAt.toISOString(), verified_at: verifiedAt.toISOString(), informational_only: true };
}

function validateTransition(from, to, context = {}) {
  const allowed = { intake:['jurisdiction_validated','corrected'], jurisdiction_validated:['evidence_ready','corrected'], evidence_ready:['human_review','corrected'], human_review:['evidence_ready','user_approved'], user_approved:['filing_pending','corrected'], filing_pending:['filed','corrected'], filed:['hearing','corrected'], hearing:['judgment','corrected'], judgment:['collection','closed','corrected'], collection:['closed','corrected'], closed:['corrected'], corrected:['jurisdiction_validated'] };
  if (!allowed[from]?.includes(to)) throw new Error('invalid claim guide transition');
  if (to === 'user_approved' && (!context.explanation || !context.disclaimerAccepted || context.actorId !== context.ownerId)) throw new Error('owner explanation and disclaimer approval required');
  if (to === 'filing_pending' && (!['claimant','authorized_helper','admin'].includes(context.role) || !context.explicitFilingApproval)) throw new Error('explicit filing approval required');
  if (to === 'filed' && (!acknowledged(context.providerReceipt) || !context.clerkVerification)) throw new Error('acknowledged court provider and clerk verification required');
  if (to === 'closed' && !context.outcomeEvidence) throw new Error('outcome evidence required');
  return true;
}

module.exports = { STAGES, validateJurisdiction, validateTransition };
