// Harvest a complete response set before replacing the public source file.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const BASE = 'https://servisi.euprava.gov.rs/autoskole';
const CATS = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class HarvestError extends Error {}
const invalid = () => { throw new HarvestError('Neispravan ili nepotpun odgovor izvora; izlaz nije zamenjen.'); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = value => Number.isSafeInteger(value) && value > 0;
const count = value => Number.isSafeInteger(value) && value >= 0;
const text = value => typeof value === 'string' && value.trim().length > 0;
const flag = value => typeof value === 'boolean' || value === 0 || value === 1;

export function sanitizeSource({ languageId, tree, questions }) {
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (!object(value)) return value;
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !/^practice(?:id|guid)$/i.test(key))
      .map(([key, child]) => [key, clean(child)]));
  }
  return clean({ languageId, tree, questions });
}
export function validateSource({ tree, questions }) {
  if (!Array.isArray(tree) || !tree.length || !Array.isArray(questions) || !questions.length) invalid();
  const categories = new Set(), subs = new Map(), questionIds = new Set();
  for (const node of tree) {
    if (!object(node) || !id(node.categoryId) || categories.has(node.categoryId) || !Array.isArray(node.subs)) invalid();
    categories.add(node.categoryId);
    for (const sub of node.subs) {
      if (!object(sub) || !id(sub.id) || subs.has(sub.id) || !text(sub.desc) || !count(sub.n) || 'err' in sub) invalid();
      subs.set(sub.id, { categoryId: node.categoryId, expected: sub.n, actual: 0 });
    }
  }
  if (!subs.size) invalid();
  for (const q of questions) {
    if (!object(q) || !id(q.qId) || questionIds.has(q.qId)) invalid();
    questionIds.add(q.qId);
    const sub = subs.get(q.subcategoryId);
    if (!sub || sub.categoryId !== q.categoryId || !text(q.Text) || !id(q.Points) ||
        !id(q.ChoicesReq) || !flag(q.HasImage) || !Array.isArray(q.Choices) || q.ChoicesReq > q.Choices.length) invalid();
    const choices = new Set();
    let correct = 0;
    for (const choice of q.Choices) {
      if (!object(choice) || !id(choice.paId) || choices.has(choice.paId) || !text(choice.Text) || !flag(choice.isCorrect)) invalid();
      choices.add(choice.paId);
      if (choice.isCorrect) correct++;
    }
    if (correct !== q.ChoicesReq) invalid();
    sub.actual++;
  }
  for (const sub of subs.values()) if (sub.expected !== sub.actual) invalid();
}

// Only explicit API totals have a known meaning. Without them, successful requests
// and internal consistency cannot detect silent server-side truncation. No fixed
// question count is assumed: languages and source revisions may legitimately differ.
function expectedCounts(value, names, actual) {
  for (const name of names) {
    if (Object.hasOwn(value, name) && (!count(value[name]) || value[name] !== actual)) invalid();
  }
}

function responseObject(value) {
  if (!object(value)) invalid();
  for (const [key, child] of Object.entries(value)) {
    if ((/^(error|errors|errorMessage)$/i.test(key) && child && (!Array.isArray(child) || child.length)) ||
        (/^(success|isSuccess)$/i.test(key) && child === false)) invalid();
  }
  return value;
}

async function post(endpoint, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
        redirect: 'error',
      });
      if (!res.ok || !/^(?:application\/(?:[\w.-]+\+)?json|text\/json)(?:\s*;|$)/i.test(res.headers.get('content-type') || '')) {
        await res.body?.cancel();
        throw new Error('response');
      }
      return responseObject(await res.json());
    } catch (error) {
      if (error instanceof HarvestError) throw error;
      if (attempt === 2) throw new HarvestError('Preuzimanje nije uspelo posle 3 pokušaja; izlaz nije zamenjen.');
      await sleep(1500);
    }
  }
}

async function replaceOutput(out, content) {
  const temporary = path.join(path.dirname(out), `.${path.basename(out)}.${randomUUID()}.tmp`);
  let handle, created = false;
  try {
    handle = await fs.open(temporary, 'wx');
    created = true;
    await handle.writeFile(content, 'utf8');
    await handle.close();
    handle = null;
    await fs.rename(temporary, out);
    created = false;
  } finally {
    if (handle) await handle.close().catch(() => {});
    if (created) await fs.rm(temporary, { force: true });
  }
}

async function harvest() {
  const args = process.argv.slice(2);
  const [pid, languageId = '15', output = 'base.json'] = args;
  if (args.length > 3 || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(pid || '') ||
      !['9', '15'].includes(languageId) || !text(output) || output.includes('\0')) {
    throw new HarvestError('Upotreba: node harvest.mjs <practice-GUID> [15|9] [izlaz.json]');
  }
  const out = path.resolve(output);
  if (!(await fs.stat(path.dirname(out))).isDirectory()) invalid();
  const existing = await fs.lstat(out).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing && !existing.isFile()) invalid();
  const tree = [], questions = [], seenSubs = new Set();
  for (const cid of CATS) {
    const result = await post('/QuestionsPractice/GetQuestionSubcategoryList', {
      id: pid, languageId, questionCategoryId: String(cid),
    });
    if (!Array.isArray(result.list)) invalid();
    expectedCounts(result, ['totalCount', 'TotalCount'], result.list.length);
    await sleep(250);
    const node = { categoryId: cid, subs: [] };
    for (const sub of result.list) {
      if (!object(sub) || !id(sub.Id) || seenSubs.has(sub.Id) || !text(sub.Description)) invalid();
      seenSubs.add(sub.Id);
      const data = await post('/QuestionsPractice/GetQuestionsPracticeData', {
        id: pid, languageId, questionSubcategoryId: String(sub.Id),
      });
      if (!Array.isArray(data.practiceData)) invalid();
      expectedCounts(sub, ['QuestionCount', 'QuestionsCount'], data.practiceData.length);
      expectedCounts(data, ['totalCount', 'TotalCount', 'QuestionCount', 'QuestionsCount'], data.practiceData.length);
      for (const q of data.practiceData) {
        if (!object(q)) invalid();
        if ((Object.hasOwn(q, 'categoryId') && q.categoryId !== cid) ||
            (Object.hasOwn(q, 'subcategoryId') && q.subcategoryId !== sub.Id)) invalid();
        questions.push({ ...q, categoryId: cid, subcategoryId: sub.Id, subcategory: sub.Description });
      }
      node.subs.push({ id: sub.Id, desc: sub.Description, n: data.practiceData.length });
      await sleep(250);
    }
    tree.push(node);
  }
  const source = sanitizeSource({ languageId, tree, questions });
  validateSource(source);
  const content = JSON.stringify(source, null, 1);
  // Unexpected echoes in arbitrary fields are rejected, never logged or persisted.
  if (content.toLowerCase().includes(pid.toLowerCase())) invalid();
  await replaceOutput(out, content);
  console.error(`Sačuvano: ${tree.length} oblasti, ${seenSubs.size} podoblasti, ${questions.length} pitanja.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await harvest();
  } catch (error) {
    // Network/filesystem errors can contain the private request or an output path.
    console.error(error instanceof HarvestError ? error.message : 'Preuzimanje ili upis nije uspeo; izlaz nije zamenjen.');
    process.exitCode = 1;
  }
}
