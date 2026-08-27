// Spike: harvest the eUprava autoskole question base for a given practiceId GUID.
// Public endpoints, no auth. Gentle pacing.
const BASE = 'https://servisi.euprava.gov.rs/autoskole';
const PID = process.argv[2] || '5f24e468-dd40-4056-a2e7-8fb55bc3c12f';
const LANG = process.argv[3] || '15'; // 15 = latinica, 9 = cirilica
const OUT = process.argv[4] || 'base.json';
const CATS = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

const all = new Map(); // qId -> question
const tree = [];

for (const cid of CATS) {
  const subs = await post('/QuestionsPractice/GetQuestionSubcategoryList', {
    id: PID, languageId: LANG, questionCategoryId: String(cid),
  });
  await sleep(250);
  const node = { categoryId: cid, subs: [] };
  for (const s of subs.list || []) {
    let data;
    try {
      data = await post('/QuestionsPractice/GetQuestionsPracticeData', {
        id: PID, languageId: LANG, questionSubcategoryId: String(s.Id),
      });
    } catch (e) {
      node.subs.push({ id: s.Id, desc: s.Description, n: -1, err: String(e) });
      continue;
    }
    const qs = data.practiceData || [];
    for (const q of qs) {
      if (!all.has(q.qId)) all.set(q.qId, { ...q, categoryId: cid, subcategoryId: s.Id, subcategory: s.Description });
    }
    node.subs.push({ id: s.Id, desc: s.Description, n: qs.length });
    await sleep(250);
  }
  tree.push(node);
  console.error(`cat ${cid}: ${node.subs.length} podoblasti, ${node.subs.reduce((a, b) => a + Math.max(0, b.n), 0)} pitanja`);
}

const qs = [...all.values()];
const withImg = qs.filter((q) => q.HasImage).length;
const multi = qs.filter((q) => q.ChoicesReq > 1).length;
console.error(`\nUKUPNO jedinstvenih: ${qs.length} | sa slikom: ${withImg} | vise tacnih: ${multi}`);
console.error(`qId raspon: ${Math.min(...qs.map((q) => q.qId))} .. ${Math.max(...qs.map((q) => q.qId))}`);
const fs = await import('node:fs/promises');
await fs.writeFile(OUT, JSON.stringify({ practiceId: PID, languageId: LANG, tree, questions: qs }, null, 1));
console.error(`-> ${OUT}`);
