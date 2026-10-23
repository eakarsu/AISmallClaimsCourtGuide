// Deterministic feature-pack logic (wave 44C). No provider calls: AI helpers always
// return labelled deterministic fallback with aiGenerated:false.
const STATUSES=['todo','in_progress','done']; const PRIORITIES=['low','medium','high','critical'];
let tasks=[]; let nextId=1;
function resetStore(seed=[]){ tasks=[]; nextId=1; seed.forEach(t=>createTask(t,t.ownerId||'system')); return tasks; }
function getTasks(){ return tasks.slice(); }
function createTask(input={},ownerId='system'){
  if(!input.title||!String(input.title).trim()){ const e=new Error('title is required'); e.status=400; throw e; }
  const t={ id:nextId++, ownerId:String(ownerId), title:String(input.title).trim(),
    description: input.description!==undefined?String(input.description):'', status: STATUSES.includes(input.status)?input.status:'todo',
    priority: PRIORITIES.includes(input.priority)?input.priority:'medium', category: input.category!==undefined?String(input.category):'',
    dueDate: input.dueDate!==undefined?input.dueDate:null, completed: input.completed!==undefined?Boolean(input.completed):false,
    estimateHours: input.estimateHours!==undefined?Number(input.estimateHours)||0:0, createdAt:new Date(0).toISOString(), updatedAt:new Date(0).toISOString() };
  tasks.push(t); return t; }
function updateTask(id,patch={}){ const t=tasks.find(x=>x.id===Number(id)); if(!t) return null;
  if(Object.prototype.hasOwnProperty.call(patch,'title')) t.title=String(patch.title);
  if(Object.prototype.hasOwnProperty.call(patch,'description')) t.description=String(patch.description);
  if(Object.prototype.hasOwnProperty.call(patch,'status')&&STATUSES.includes(patch.status)) t.status=patch.status;
  if(Object.prototype.hasOwnProperty.call(patch,'priority')&&PRIORITIES.includes(patch.priority)) t.priority=patch.priority;
  if(Object.prototype.hasOwnProperty.call(patch,'category')) t.category=String(patch.category);
  if(Object.prototype.hasOwnProperty.call(patch,'dueDate')) t.dueDate=patch.dueDate;
  if(Object.prototype.hasOwnProperty.call(patch,'completed')) t.completed=Boolean(patch.completed);
  if(Object.prototype.hasOwnProperty.call(patch,'estimateHours')) t.estimateHours=Number(patch.estimateHours)||0;
  return t; }
function listTasks(all=tasks, q={}){ const search=String(q.search||q.q||'').toLowerCase();
  return all.filter(t=>{ if(search&&!`${t.title} ${t.description} ${t.category}`.toLowerCase().includes(search)) return false;
    if(q.status&&t.status!==q.status) return false; if(q.priority&&t.priority!==q.priority) return false; if(q.category&&t.category!==q.category) return false; return true; }); }
function searchRecords(all,q){ return listTasks(all,q||{}); }
function esc(v){ const s=v===null||v===undefined?'':String(v); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
function toCSV(records){ const h=['id','title','description','status','priority','category','dueDate','completed','estimateHours'];
  return [h.join(','), ...records.map(r=>h.map(k=>esc(r[k])).join(','))].join('\n'); }
function toJSONExport(records){ return { count:records.length, records }; }
function formatValue(v){ if(v===false) return 'false'; if(v===0) return '0'; if(v===''||v===null||v===undefined) return '(empty)'; return String(v); }
function buildSections(r={}){ return [ {label:'Title',value:formatValue(r.title)}, {label:'Description',value:formatValue(r.description)},
  {label:'Status',value:formatValue(r.status)}, {label:'Priority',value:formatValue(r.priority)}, {label:'Category',value:formatValue(r.category)},
  {label:'Completed',value:formatValue(r.completed)}, {label:'Estimate (hours)',value:formatValue(r.estimateHours)}, {label:'Due date',value:formatValue(r.dueDate)} ]; }
function base(feature,summary,score,recommendations){ return { aiGenerated:false, source:'deterministic-fallback', label:'Deterministic fallback (no AI provider called)', feature, summary, score, recommendations }; }
function counts(records){ const open=records.filter(r=>r.status!=='done'); return { total:records.length, open:open.length, done:records.length-open.length,
  high:records.filter(r=>['high','critical'].includes(r.priority)).length, hours:records.reduce((s,r)=>s+(Number(r.estimateHours)||0),0) }; }
function caseStrength(records=getTasks()){ const c=counts(records); const score=c.total?Math.round((c.done/c.total)*100):0; return base('case-strength', `Case preparation ${score}% complete (${c.done}/${c.total} done).`, score, score<50?['Complete more preparation tasks and evidence']:['Case preparation is well advanced']); }
function settlementEstimate(records=getTasks()){ const c=counts(records); const amount=c.hours*150; return base('settlement-estimate', `Indicative settlement effort value $${amount} (hours x $150).`, amount, amount===0?['Add estimated hours to improve the estimate']:['Use as a starting point, not legal advice']); }
function deadlineRisk(records=getTasks()){ const now=Date.now(); const overdue=records.filter(r=>r.dueDate&&r.status!=='done'&&new Date(r.dueDate).getTime()<now); return base('deadline-risk', overdue.length?`${overdue.length} overdue task(s).`:'No overdue tasks.', overdue.length, overdue.slice(0,3).map(r=>`Overdue: ${r.title}`)); }
module.exports={ STATUSES,PRIORITIES,resetStore,getTasks,createTask,updateTask,listTasks,searchRecords,toCSV,toJSONExport,formatValue,buildSections, caseStrength, settlementEstimate, deadlineRisk };
