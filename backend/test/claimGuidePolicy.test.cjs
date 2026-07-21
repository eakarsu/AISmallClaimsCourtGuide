const test=require('node:test');const assert=require('node:assert/strict');const p=require('../domain/claimGuidePolicy');
const jurisdiction={court_ref:'c1',jurisdiction:'NY-Kings',fee_schedule_version:'2026-1',source_url:'https://court.example',effective_at:'2026-01-01',verified_at:'2026-07-19',filing_fee:20};
test('validates versioned informational fee evidence',()=>assert.equal(p.validateJurisdiction(jurisdiction).informational_only,true));
test('rejects invalid fee evidence',()=>assert.throws(()=>p.validateJurisdiction({...jurisdiction,filing_fee:-1}),/fee/));
test('owner must approve disclaimer and explanation',()=>assert.throws(()=>p.validateTransition('human_review','user_approved',{actorId:'u2',ownerId:'u1',explanation:'reviewed',disclaimerAccepted:true}),/owner/));
test('filing requires explicit authorized approval',()=>assert.throws(()=>p.validateTransition('user_approved','filing_pending',{role:'claimant'}),/explicit/));
test('filed state requires provider and clerk verification',()=>assert.throws(()=>p.validateTransition('filing_pending','filed',{providerReceipt:'x'}),/clerk/));
test('closure requires real outcome evidence',()=>assert.throws(()=>p.validateTransition('judgment','closed',{}),/outcome/));

