// Public-content audit ledger. Technical freshness never implies semantic truth.
import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, rename, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIR = 'docs/revizija-sadrzaja';
const STATES = ['unreviewed', 'in-progress', 'needs-expert', 'reviewed'];
const CHECKS = ['unreviewed', 'needs-expert', 'reviewed', 'not-applicable'];
const Q_CHECKS = ['questionAnswers', 'image', 'explanation', 'legalSource', 'cardLinks', 'scripts'];
const CARD_CHECKS = ['content', 'image', 'legalSource', 'scripts'];
const digest = value => createHash('sha256').update(value).digest('hex');
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ensure = (condition, message) => { if (!condition) throw Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const id = value => Number.isSafeInteger(value) && value > 0;
const hex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const sortIds = values => [...new Set(values)].sort((a, b) => typeof a === 'number' ? a - b : a < b ? -1 : a > b ? 1 : 0);
const canonical = value => JSON.stringify(ordered(value));
function ordered(value) {
  if (Array.isArray(value)) return value.map(ordered);
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]));
  return value;
}
function keys(value, allowed, label) {
  ensure(isObject(value) && Object.keys(value).every(key => allowed.includes(key)), 'Unexpected fields or shape in ' + label);
}
function bilingual(value, label) {
  keys(value, ['l', 'c'], label);
  ensure(text(value.l) && text(value.c), 'Missing script in ' + label);
}

export function parseAssignment(source, name) {
  ensure(['QUIZ', 'EXPLAIN'].includes(name), 'Unsupported public assignment');
  const match = source.match(new RegExp('^\\s*window\\.' + name + '\\s*=\\s*(\\{[\\s\\S]*\\})\\s*;\\s*$'));
  ensure(match, 'Invalid public JSON assignment: ' + name);
  try { return JSON.parse(match[1]); }
  catch { throw Error('Invalid JSON in public assignment: ' + name); } // Do not echo input snippets.
}

function htmlImages(card) {
  const result = [];
  const add = (ref, link = false) => {
    if (ref.startsWith('#') || (link && /^https?:\/\//.test(ref))) return;
    ensure(/^img\/[1-9]\d*\.jpg$/.test(ref), 'Unsupported image/resource reference in public card');
    result.push(ref);
  };
  for (const html of Object.values(card.h)) {
    ensure(!/\bsrcset\s*=/i.test(html), 'Unsupported image srcset; extend audit dependencies first');
    for (const match of html.matchAll(/\b(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) add(match[2] ?? match[3] ?? match[4], match[1].toLowerCase()==='href');
    for (const match of html.matchAll(/\burl\(\s*["']?([^\s)"']+)["']?\s*\)/gi)) add(match[1]);
  }
  return sortIds(result);
}

function validateSources(legalSources) {
  ensure(Array.isArray(legalSources), 'Invalid public source registry');
  const sources = new Map();
  for (const source of legalSources) {
    keys(source, ['id', 'url', 'title', 'article', 'checkedOn', 'revision', 'contentHash'], 'public source registry');
    ensure(text(source.id) && /^[a-z0-9][a-z0-9-]*$/.test(source.id) && !sources.has(source.id), 'Invalid/duplicate public source ID');
    let url;
    try { url = new URL(source.url); } catch { throw Error('Invalid public source URL'); }
    ensure(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password, 'Public source URL must not contain credentials');
    ensure(text(source.title) && text(source.article) && date(source.checkedOn) && text(source.revision), 'Incomplete public source provenance');
    ensure(source.contentHash === undefined || hex(source.contentHash), 'Invalid public source content hash');
    sources.set(source.id, source);
  }
  return sources;
}

function validateContent(quiz, explain, expectedQuestionCount) {
  keys(quiz, ['generated', 'cats', 'subs', 'imageHashes', 'questions'], 'data.js');
  keys(explain, ['updated', 'cards', 'byQ', 'bySub', 'atlas', 'situacije', 'zamke'], 'explanations.js');
  ensure(date(quiz.generated) && date(explain.updated), 'Invalid public generation metadata');
  ensure(Array.isArray(quiz.questions), 'Invalid question coverage');
  const byId = new Map();
  for (const q of quiz.questions) {
    keys(q, ['id', 'cat', 'sub', 'pts', 'req', 'img', 't', 'ch'], 'question');
    ensure(id(q.id) && !byId.has(q.id), 'Invalid/duplicate question ID');
    ensure(id(q.cat) && id(q.sub) && id(q.pts) && id(q.req) && [0, 1].includes(q.img), 'Invalid question structure');
    bilingual(q.t, 'question text');
    ensure(Array.isArray(q.ch) && q.ch.length >= q.req, 'Invalid answer coverage');
    const choices = new Set();
    for (const ch of q.ch) {
      keys(ch, ['id', 'ok', 't'], 'answer');
      ensure(id(ch.id) && !choices.has(ch.id) && [0, 1].includes(ch.ok), 'Invalid/duplicate answer ID or flag');
      choices.add(ch.id); bilingual(ch.t, 'answer text');
    }
    ensure(q.ch.filter(ch => ch.ok).length === q.req, 'Correct-answer count differs from required count');
    byId.set(q.id, q);
  }
  ensure(byId.size === expectedQuestionCount, 'Question coverage differs from expected count');
  ensure(isObject(quiz.imageHashes), 'Missing public image hash map');
  const expectedImageIds = sortIds([...byId.values()].filter(q => q.img).map(q => String(q.id)));
  const declaredImageIds = sortIds(Object.keys(quiz.imageHashes));
  ensure(declaredImageIds.length === expectedImageIds.length && declaredImageIds.every((qid, index) => qid === expectedImageIds[index]), 'Public image hash coverage differs from current questions');
  for (const imageHash of Object.values(quiz.imageHashes)) ensure(hex(imageHash), 'Invalid public image hash');
  ensure(Array.isArray(quiz.cats) && isObject(quiz.subs), 'Invalid category structure');
  const cats = new Map();
  for (const cat of quiz.cats) {
    keys(cat, ['id', 'l', 'c'], 'category');
    ensure(id(cat.id) && !cats.has(cat.id), 'Invalid/duplicate category');
    bilingual({l:cat.l, c:cat.c}, 'category text'); cats.set(cat.id, cat);
  }
  for (const [sub, label] of Object.entries(quiz.subs)) {
    ensure(/^[1-9]\d*$/.test(sub), 'Invalid subcategory ID'); bilingual(label, 'subcategory text');
  }
  for (const q of byId.values()) ensure(cats.has(q.cat) && quiz.subs[q.sub], 'Missing question category');
  for (const name of ['cards', 'byQ', 'bySub', 'atlas', 'situacije', 'zamke']) ensure(isObject(explain[name]), 'Missing public explanation map: ' + name);
  for (const [key, card] of Object.entries(explain.cards)) {
    ensure(/^[a-z][a-z0-9-]*$/.test(key), 'Invalid card ID');
    keys(card, ['t', 'h'], 'card'); bilingual(card.t, 'card title'); bilingual(card.h, 'card content'); htmlImages(card);
  }
  ensure(Object.keys(explain.byQ).length === byId.size, 'Explanation coverage differs from questions');
  for (const [qid, e] of Object.entries(explain.byQ)) {
    ensure(String(+qid) === qid && byId.has(+qid), 'Unknown explanation question');
    keys(e, ['x', 'card', 'nocard'], 'question explanation'); bilingual(e.x, 'explanation text');
    ensure(e.nocard === undefined || [0, 1].includes(e.nocard), 'Invalid nocard flag');
    ensure(e.card === undefined || Object.hasOwn(explain.cards, e.card), 'Unknown direct card reference');
  }
  for (const [sub, card] of Object.entries(explain.bySub)) ensure(quiz.subs[sub] && Object.hasOwn(explain.cards, card), 'Unknown subarea/card reference');
  for (const kind of ['atlas', 'situacije', 'zamke']) for (const [key, refs] of Object.entries(explain[kind])) {
    ensure(kind === 'zamke' ? byId.has(+key) : Object.hasOwn(explain.cards, key), 'Unknown dependency owner');
    ensure(Array.isArray(refs) && refs.every(ref => id(ref) && byId.get(ref)?.img === 1), 'Unknown question/image dependency');
  }
  return {byId, cats};
}

function previousMap(records, ids, kind) {
  ensure(Array.isArray(records), 'Invalid previous ledger');
  const result = new Map();
  if (records.length) ensure(records.length === ids.length, 'Previous ledger coverage is incomplete');
  const allowed = new Set(ids);
  for (const r of records) {
    keys(r, ['schemaVersion', 'id', 'category', 'subcategory', 'contentHash', 'dependencies', 'legalSources', 'status', 'checks', 'notApplicableReasons', 'review', 'history'], 'previous ledger');
    ensure(allowed.has(r.id) && !result.has(r.id), 'Unknown/duplicate previous ledger ID');
    ensure(r.schemaVersion === 1 && hex(r.contentHash) && STATES.includes(r.status), 'Invalid previous review record');
    const names = kind === 'question' ? Q_CHECKS : CARD_CHECKS;
    keys(r.checks, names, 'review checks');
    ensure(names.every(key => CHECKS.includes(r.checks[key])), 'Missing/invalid review check');
    ensure(isObject(r.notApplicableReasons) && Array.isArray(r.history) && Array.isArray(r.legalSources), 'Invalid review metadata');
    for (const key of names) if (r.checks[key] === 'not-applicable') {
      ensure(['image','legalSource','cardLinks'].includes(key), 'Applicable content check cannot be not-applicable');
      ensure(text(r.notApplicableReasons[key]), 'Review N/A needs a reason');
    }
    if (r.review !== null) keys(r.review, ['reviewer','date','evidence','findings','verification'], 'review evidence');
    if (r.status === 'reviewed' || Object.values(r.checks).includes('reviewed')) {
      ensure(isObject(r.review) && text(r.review.reviewer) && date(r.review.date) && text(r.review.evidence) && text(r.review.findings) && text(r.review.verification), 'Reviewed record requires actual review evidence');
    }
    if (r.status === 'reviewed') {
      ensure(names.every(key => ['reviewed', 'not-applicable'].includes(r.checks[key])), 'Reviewed record has unfinished checks');
    }
    ensure(r.checks.legalSource !== 'reviewed' || r.legalSources.length > 0, 'Reviewed legal assertion needs a public source');
    result.set(r.id, r);
  }
  return result;
}

function sourceRefs(old, sources) {
  const refs = old?.legalSources || [];
  ensure(refs.every(ref => typeof ref === 'string' && sources.has(ref)) && new Set(refs).size === refs.length, 'Unknown/duplicate cited public source');
  return sortIds(refs).map(ref => sources.get(ref));
}

function makeRecord(kind, id_, components, dependencies, old, hasImage, extra = {}) {
  const contentHash = digest(canonical(components));
  const checks = Object.fromEntries((kind === 'question' ? Q_CHECKS : CARD_CHECKS).map(key => [key, 'unreviewed']));
  const notApplicableReasons = {};
  if (!hasImage) { checks.image = 'not-applicable'; notApplicableReasons.image = kind === 'question' ? 'Official question has no image (img=0).' : 'Card has no image or inline SVG.'; }
  const fresh = {schemaVersion:1, id:id_, ...extra, contentHash, dependencies, legalSources:sortIds(old?.legalSources || []), status:'unreviewed', checks, notApplicableReasons, review:null, history:old?.history || []};
  if (!old) return fresh;
  if (old.contentHash === contentHash) {
    ensure(!hasImage || old.checks.image !== 'not-applicable', 'Existing image is an applicable check');
    ensure(!dependencies.cards.length || old.checks.cardLinks !== 'not-applicable', 'Linked card is an applicable check');
    return {...fresh, status:old.status, checks:old.checks, notApplicableReasons:old.notApplicableReasons, review:old.review};
  }
  // Preserve prior work, but never silently carry a review across changed content.
  const hadWork = old.status !== 'unreviewed' || old.review !== null || Object.values(old.checks).some(s => s === 'reviewed' || s === 'needs-expert');
  if (hadWork) fresh.history = [...old.history, {reason:'content-changed', contentHash:old.contentHash, legalSources:old.legalSources, status:old.status, checks:old.checks, notApplicableReasons:old.notApplicableReasons, review:old.review}];
  return fresh;
}

export function createAudit({quiz, explain, imageHashes, previousQuestions = [], previousCards = [], legalSources = [], expectedQuestionCount = 1327}) {
  const {byId, cats} = validateContent(quiz, explain, expectedQuestionCount);
  const sources = validateSources(legalSources);
  const qIds = sortIds([...byId.keys()]), cardIds = sortIds(Object.keys(explain.cards));
  const oldQ = previousMap(previousQuestions, qIds, 'question'), oldCards = previousMap(previousCards, cardIds, 'card');
  ensure(isObject(imageHashes), 'Missing public image hashes');
  for (const [qid, declared] of Object.entries(quiz.imageHashes)) {
    ensure(imageHashes[`img/${qid}.jpg`] === declared, 'Declared public image hash differs from image bytes');
  }
  const image = ref => { ensure(/^img\/[1-9]\d*\.jpg$/.test(ref) && hex(imageHashes[ref]), 'Missing/invalid public image hash'); return {path:ref, sha256:imageHashes[ref]}; };
  const atoms = new Map(qIds.map(qid => {
    const q=byId.get(qid);
    return [qid, digest(canonical({question:q, category:cats.get(q.cat), subcategory:quiz.subs[q.sub], image:q.img ? image(`img/${qid}.jpg`) : null}))];
  }));
  // Atlas duplicate-meaning counts are derived from the complete atlas in app.js.
  // Hash that public context too; no rendered caption change stays hidden.
  const atlasContext = Object.entries(explain.atlas).sort(([a],[b])=>a<b?-1:1).map(([key, refs]) => ({key, items:refs.map(qid=>({id:qid, hash:atoms.get(qid)}))}));
  const cards = cardIds.map(key => {
    const card=explain.cards[key], old=oldCards.get(key);
    const atlas=explain.atlas[key] || [], situations=explain.situacije[key] || [];
    const questions=sortIds([...atlas, ...situations]);
    const images=sortIds([...htmlImages(card), ...questions.map(qid=>`img/${qid}.jpg`)]);
    const components={card, atlas:atlas.map(qid=>({id:qid, hash:atoms.get(qid)})), situations:situations.map(qid=>({id:qid, hash:atoms.get(qid)})), images:images.map(image), legalSources:sourceRefs(old,sources), ...(atlas.length ? {atlasContext} : {})};
    return makeRecord('card', key, components, {cards:[], questions, images}, old, images.length > 0 || Object.values(card.h).some(h=>/<svg\b/i.test(h)));
  });
  const cardMap=new Map(cards.map(card=>[card.id, card]));
  const questions=qIds.map(qid=>{
    const q=byId.get(qid), e=explain.byQ[qid], old=oldQ.get(qid);
    // Match explNode: nocard blocks only bySub fallback, never a direct card.
    const attached=sortIds([e.card, e.nocard ? null : explain.bySub[q.sub]].filter(Boolean));
    const traps=explain.zamke[qid] || [];
    const questionDeps=sortIds([...traps, ...attached.flatMap(key=>cardMap.get(key).dependencies.questions)]);
    const images=sortIds([...(q.img?[`img/${qid}.jpg`]:[]), ...traps.map(id_=>`img/${id_}.jpg`), ...attached.flatMap(key=>cardMap.get(key).dependencies.images)]);
    const components={question:atoms.get(qid), explanation:e, cards:attached.map(key=>({id:key, hash:cardMap.get(key).contentHash})), traps:traps.map(id_=>({id:id_, hash:atoms.get(id_)})), legalSources:sourceRefs(old,sources), ...(traps.length?{atlasContext}:{})};
    return makeRecord('question',qid,components,{cards:attached,questions:questionDeps,images},old,!!q.img,{category:q.cat,subcategory:q.sub});
  });
  const counts = rows => Object.fromEntries(STATES.map(status=>[status,rows.filter(r=>r.status===status).length]));
  const manifest = {schemaVersion:1, hashAlgorithm:'SHA-256 of canonical JSON; image bytes use SHA-256',
    provenance:[{path:'data.js',sha256:digest(canonical(quiz)),declaredDate:quiz.generated},{path:'explanations.js',sha256:digest(canonical(explain)),declaredDate:explain.updated}],
    publicSourcesHash:digest(canonical([...sources.values()].sort((a,b)=>a.id<b.id?-1:1))),
    contentHash:digest(canonical({questions:questions.map(r=>[r.id,r.contentHash]),cards:cards.map(r=>[r.id,r.contentHash])})),
    questionCount:questions.length,cardCount:cards.length,imageCount:Object.keys(imageHashes).length,
    questions:counts(questions),cards:counts(cards),semanticAccuracy:'not-established-by-this-tool'};
  return {questions,cards,manifest};
}

async function safeFile(root, relative) {
  const full=path.resolve(root,relative);
  let resolved;
  try { resolved=await realpath(full); } catch { throw Error('Required public file is missing: ' + relative); }
  const rel=path.relative(root,resolved);
  ensure(rel && !rel.startsWith('..') && !path.isAbsolute(rel), 'Public source resolves outside project');
  const same = process.platform==='win32' ? resolved.toLowerCase()===full.toLowerCase() : resolved===full;
  ensure(same, 'Public source must not be a symlink or redirected path');
  return resolved;
}

export async function readPublicSources(root = ROOT) {
  root=await realpath(root);
  const quiz=parseAssignment(await readFile(await safeFile(root,'data.js'),'utf8'),'QUIZ');
  const explain=parseAssignment(await readFile(await safeFile(root,'explanations.js'),'utf8'),'EXPLAIN');
  // Validate resource paths and JSON shape before reading any referenced bytes.
  validateContent(quiz,explain,quiz.questions?.length);
  const paths=sortIds([...quiz.questions.filter(q=>q.img).map(q=>`img/${q.id}.jpg`), ...Object.values(explain.cards).flatMap(htmlImages)]);
  const imageHashes={};
  for (const relative of paths) imageHashes[relative]=digest(await readFile(await safeFile(root,relative)));
  return {quiz,explain,imageHashes};
}

async function readJsonFile(root, relative) {
  const source=await readFile(await safeFile(root,relative),'utf8');
  try { return JSON.parse(source); } catch { throw Error('Invalid JSON in audit metadata: ' + relative); }
}
async function readLedger(root, name, write) {
  try { await realpath(path.join(root,DIR,name)); }
  catch (error) { if (error.code==='ENOENT' && write) return []; throw Error('Missing audit ledger; run --write after checking inputs'); }
  const source=await readFile(await safeFile(root,DIR+'/'+name),'utf8');
  ensure(source.trim(), 'Empty audit ledger is not a valid review history');
  try { return source.trim().split(/\r?\n/).map(line=>JSON.parse(line)); }
  catch { throw Error('Invalid JSONL audit ledger: ' + name); }
}

export async function runAudit({root = ROOT, write = false, requireReviewed = false, expectedQuestionCount = 1327} = {}) {
  root=await realpath(root);
  const input=await readPublicSources(root);
  const registry=await readJsonFile(root,DIR+'/izvori.json');
  keys(registry,['schemaVersion','sources'],'public source registry');
  ensure(registry.schemaVersion===1,'Unsupported public source registry');
  // Check the output directory's real location before reading existing history.
  await safeFile(root,DIR);
  const previousQuestions=await readLedger(root,'pitanja.jsonl',write), previousCards=await readLedger(root,'kartice.jsonl',write);
  const audit=createAudit({...input,previousQuestions,previousCards,legalSources:registry.sources,expectedQuestionCount});
  const files={'pitanja.jsonl':audit.questions.map(canonical).join('\n')+'\n','kartice.jsonl':audit.cards.map(canonical).join('\n')+'\n','manifest.json':JSON.stringify(ordered(audit.manifest),null,2)+'\n'};
  if (requireReviewed) ensure([...audit.questions,...audit.cards].every(r=>r.status==='reviewed'),'Semantic review incomplete: unreviewed or unresolved records remain');
  if (write) {
    await mkdir(path.join(root,DIR),{recursive:true});
    const staged=[];
    try {
      for (const [name,body] of Object.entries(files)) {
        const temporary=path.join(root,DIR,'.'+name+'.'+randomUUID()+'.tmp');
        staged.push({temporary,target:path.join(root,DIR,name)});
        await writeFile(temporary,body,{encoding:'utf8',flag:'wx'});
      }
      // Atomic replacement per file; this is not a multi-file transaction.
      for (const file of staged) await rename(file.temporary,file.target);
    } finally { for (const file of staged) await rm(file.temporary,{force:true}); }
  } else {
    for (const [name,body] of Object.entries(files)) {
      const actual=await readFile(await safeFile(root,DIR+'/'+name),'utf8');
      ensure(actual.replace(/\r\n/g,'\n')===body,'Audit ledger is stale; inspect changes and refresh with --write');
    }
  }
  return audit.manifest;
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    ensure(args.every(arg=>['--write','--check','--require-reviewed'].includes(arg)) && !(args.includes('--write')&&args.includes('--check')), 'Usage: node tools/audit-content.mjs [--check|--write] [--require-reviewed]');
    const result=await runAudit({write:args.includes('--write'),requireReviewed:args.includes('--require-reviewed')});
    console.log(JSON.stringify(result,null,2));
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
