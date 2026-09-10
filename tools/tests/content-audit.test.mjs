import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createAudit, parseAssignment, readPublicSources, runAudit } from '../audit-content.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
const bilingual = text => ({l:text,c:'Ћирилица '+text});
function fixture() {
  const q = id => ({id,cat:25,sub:id===1?91:92,pts:1,req:1,img:id===1?1:0,t:bilingual('Question '+id),ch:[{id:id*10,ok:1,t:bilingual('Correct')},{id:id*10+1,ok:0,t:bilingual('Incorrect')}]});
  return {
    expectedQuestionCount:2,
    quiz:{generated:'2026-09-10',cats:[{id:25,l:'Category',c:'Област'}],subs:{91:bilingual('Sub 91'),92:bilingual('Sub 92')},questions:[q(1),q(2)]},
    explain:{updated:'2026-09-10',cards:{shared:{t:bilingual('Title'),h:bilingual('<svg><text>Stop</text></svg>')}},byQ:{1:{x:bilingual('Why'),card:'shared',nocard:1},2:{x:bilingual('Other'),nocard:1}},bySub:{},atlas:{},situacije:{},zamke:{}},
    imageHashes:{'img/1.jpg':hash('image-one')},
    legalSources:[],
  };
}
function reviewed(record) {
  const r=structuredClone(record);
  r.status='reviewed';
  for(const key of Object.keys(r.checks)) if(r.checks[key]!=='not-applicable') r.checks[key]='reviewed';
  r.checks.legalSource='not-applicable';
  r.notApplicableReasons.legalSource='Synthetic fixture contains no legal assertion.';
  r.review={reviewer:'Synthetic test reviewer',date:'2026-09-10',evidence:'Compared both fixture scripts, options and supplied assets.',findings:'No issue in this synthetic fixture.',verification:'Re-read after comparison.'};
  return r;
}

test('initial records have complete ID coverage and never claim semantic review',()=>{
  const audit=createAudit(fixture());
  assert.deepEqual(audit.questions.map(r=>r.id),[1,2]);
  assert.deepEqual(audit.cards.map(r=>r.id),['shared']);
  assert.ok(audit.questions.every(r=>r.status==='unreviewed' && r.review===null));
  assert.equal(audit.questions[1].checks.image,'not-applicable');
  assert.ok(audit.questions[1].notApplicableReasons.image);
  assert.equal(audit.questions[0].checks.image,'unreviewed');
});

test('object-key ordering and repeated generation are deterministic',()=>{
  const f=fixture(),a=createAudit(f);
  const reordered=JSON.parse(JSON.stringify(f),(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).reverse()):v);
  assert.deepEqual(createAudit(reordered),a);
  assert.deepEqual(createAudit({...f,previousQuestions:a.questions,previousCards:a.cards}),a);
});

for(const [name,change] of [
  ['Latin question',f=>f.quiz.questions[0].t.l+=' changed'],
  ['Cyrillic answer',f=>f.quiz.questions[0].ch[0].t.c+=' промена'],
  ['answer order',f=>f.quiz.questions[0].ch.reverse()],
  ['Cyrillic explanation',f=>f.explain.byQ[1].x.c+=' промена'],
  ['shared SVG',f=>f.explain.cards.shared.h.l='<svg><text>Yield</text></svg>'],
  ['image bytes',f=>f.imageHashes['img/1.jpg']=hash('image-two')],
]) test(`${name} change invalidates a reviewed dependent record and preserves its evidence`,()=>{
  const f=fixture(),initial=createAudit(f),old=initial.questions.map(reviewed);
  change(f);
  const next=createAudit({...f,previousQuestions:old,previousCards:initial.cards});
  assert.notEqual(next.questions[0].contentHash,old[0].contentHash);
  assert.equal(next.questions[0].status,'unreviewed');
  assert.equal(next.questions[0].review,null);
  assert.equal(next.questions[0].history[0].review.evidence,old[0].review.evidence);
  assert.equal(next.questions[1].status,'reviewed','unrelated question keeps its review');
  assert.deepEqual(createAudit({...f,previousQuestions:next.questions,previousCards:next.cards}),next);
});

test('runtime nocard/direct/bySub precedence determines actual dependencies',()=>{
  const f=fixture(); f.explain.bySub[92]='shared';
  assert.deepEqual(createAudit(f).questions[1].dependencies.cards,[]);
  delete f.explain.byQ[2].nocard;
  assert.deepEqual(createAudit(f).questions[1].dependencies.cards,['shared']);
  assert.deepEqual(createAudit(f).questions[0].dependencies.cards,['shared'],'nocard only blocks subarea fallback');
});

test('atlas, situations and trap dependencies include referenced questions and images',()=>{
  for(const kind of ['atlas','situacije','zamke']) {
    const f=fixture();
    if(kind==='zamke') f.explain.zamke[2]=[1];
    else { f.explain.byQ[2].card='shared'; f.explain[kind].shared=[1]; }
    const a=createAudit(f);
    f.quiz.questions[0].ch[0].t.c+=' промена';
    assert.notEqual(createAudit(f).questions[1].contentHash,a.questions[1].contentHash,kind);
  }
});

test('changing a cited public source reopens its dependent review',()=>{
  const f=fixture(); f.legalSources=[{id:'fixture-law',url:'https://example.org/law',title:'Synthetic source',article:'7',checkedOn:'2026-09-10',revision:'one'}];
  const a=createAudit(f); a.questions[0].legalSources=['fixture-law'];
  const cited=createAudit({...f,previousQuestions:a.questions,previousCards:a.cards});
  const previous=cited.questions.map(reviewed);
  f.legalSources[0].revision='two';
  const b=createAudit({...f,previousQuestions:previous,previousCards:cited.cards});
  assert.equal(b.questions[0].status,'unreviewed');
  assert.equal(b.questions[1].status,'reviewed');
});

test('malformed coverage, dangling links and unevidenced review fail closed',()=>{
  const f=fixture();
  assert.throws(()=>createAudit({...f,expectedQuestionCount:3}),/coverage/i);
  f.quiz.questions[1].id=1;
  assert.throws(()=>createAudit(f),/duplicate/i);
  const g=fixture(); g.explain.byQ[1].card='missing';
  assert.throws(()=>createAudit(g),/card/i);
  const h=fixture(),a=createAudit(h); a.questions[0].status='reviewed';
  assert.throws(()=>createAudit({...h,previousQuestions:a.questions,previousCards:a.cards}),/review/i);
});

test('applicable content and existing images cannot be waved through as not-applicable',()=>{
  for(const check of ['questionAnswers','explanation','scripts','image','cardLinks']) {
    const f=fixture(),a=createAudit(f); a.questions=a.questions.map(reviewed);
    a.questions[0].checks[check]='not-applicable';
    a.questions[0].notApplicableReasons[check]='Synthetic attempt to skip an applicable check.';
    assert.throws(()=>createAudit({...f,previousQuestions:a.questions,previousCards:a.cards}),/applicable/i,check);
  }
});

test('partial legal review requires a registered source before that aspect is marked reviewed',()=>{
  const f=fixture(),a=createAudit(f);
  a.questions[0]=reviewed(a.questions[0]);
  a.questions[0].status='in-progress';
  a.questions[0].checks.legalSource='reviewed';
  assert.throws(()=>createAudit({...f,previousQuestions:a.questions,previousCards:a.cards}),/legal.*source/i);
  a.questions[0].legalSources=['not-registered'];
  assert.throws(()=>createAudit({...f,previousQuestions:a.questions,previousCards:a.cards}),/cited public source/i);
});

test('unquoted HTML and CSS image resources participate in dependent hashes',()=>{
  for(const html of ['<img src=img/1.jpg>','<div style="background:url(img/1.jpg)"></div>']) {
    const f=fixture(); f.explain.cards.shared.h.l=html; f.explain.byQ[2].card='shared';
    const a=createAudit(f); f.imageHashes['img/1.jpg']=hash('replacement');
    assert.notEqual(createAudit(f).questions[1].contentHash,a.questions[1].contentHash);
  }
});

test('public JSON assignments are parsed without executing code or echoing private payloads',()=>{
  assert.deepEqual(parseAssignment('window.QUIZ = {"questions":[]};\r\n','QUIZ'),{questions:[]});
  const secret='PRIVATE_SENTINEL_DO_NOT_PRINT';
  for(const text of [`window.QUIZ = {}; process.exit();`, `window.QUIZ = {"private":"${secret}" bad};`]) {
    assert.throws(()=>parseAssignment(text,'QUIZ'),error=>!error.message.includes(secret));
  }
  const f=fixture(); f.quiz.practiceId=secret;
  assert.throws(()=>createAudit(f),error=>!error.message.includes(secret));
});

async function withFiles(fn) {
  const root=await mkdtemp(path.join(tmpdir(),'vozacki-audit-'));
  try {
    const f=fixture(); await mkdir(path.join(root,'img')); await mkdir(path.join(root,'docs/revizija-sadrzaja'),{recursive:true});
    await writeFile(path.join(root,'data.js'),'window.QUIZ = '+JSON.stringify(f.quiz)+';\n');
    await writeFile(path.join(root,'explanations.js'),'window.EXPLAIN = '+JSON.stringify(f.explain)+';\n');
    await writeFile(path.join(root,'img/1.jpg'),'image-one');
    await writeFile(path.join(root,'docs/revizija-sadrzaja/izvori.json'),JSON.stringify({schemaVersion:1,sources:[]}));
    await fn(root,f);
  } finally {await rm(root,{recursive:true,force:true});}
}

test('unsafe resource paths are rejected before arbitrary filesystem reads',()=>withFiles(async(root,f)=>{
  f.explain.cards.shared.h.l='<img src="../private.txt">';
  await writeFile(path.join(root,'explanations.js'),'window.EXPLAIN = '+JSON.stringify(f.explain)+';');
  await assert.rejects(readPublicSources(root),/resource|image/i);
}));

test('write/check lifecycle is deterministic, read-only check fails on stale content, bad inputs never overwrite ledger',()=>withFiles(async(root,f)=>{
  await runAudit({root,write:true,expectedQuestionCount:2});
  const file=path.join(root,'docs/revizija-sadrzaja/pitanja.jsonl');
  const first=await readFile(file,'utf8');
  await runAudit({root,write:true,expectedQuestionCount:2});
  assert.equal(await readFile(file,'utf8'),first);
  await runAudit({root,expectedQuestionCount:2});
  await assert.rejects(runAudit({root,requireReviewed:true,expectedQuestionCount:2}),/unreviewed|review/i);
  f.explain.byQ[1].x.l+=' changed';
  await writeFile(path.join(root,'explanations.js'),'window.EXPLAIN = '+JSON.stringify(f.explain)+';');
  await assert.rejects(runAudit({root,expectedQuestionCount:2}),/stale|current|refresh/i);
  assert.equal(await readFile(file,'utf8'),first);
  await writeFile(path.join(root,'data.js'),'not JSON');
  await assert.rejects(runAudit({root,write:true,expectedQuestionCount:2}));
  assert.equal(await readFile(file,'utf8'),first);
}));

test('actual public bank covers exactly all 1327 IDs and both-script card dependencies',async()=>{
  const root=path.resolve(import.meta.dirname,'../..');
  const sources=await readPublicSources(root),audit=createAudit(sources);
  assert.equal(audit.questions.length,1327);
  assert.equal(new Set(audit.questions.map(r=>r.id)).size,1327);
  assert.equal(audit.cards.length,39);
  assert.ok(audit.questions.every(r=>r.status==='unreviewed'));
  assert.deepEqual(audit.questions.find(r=>r.id===8007).dependencies.cards,['kategorije-vozila']);
});
