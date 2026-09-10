import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app = fs.readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const ctx = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(new URL('../../data.js', import.meta.url), 'utf8'), ctx);
ctx.byId = new Map(ctx.window.QUIZ.questions.map(q => [q.id, q]));
ctx.FS_MIN = 0.84; ctx.FS_MAX = 1.24;
vm.runInContext(app.slice(app.indexOf('  function nInt('), app.indexOf('  function load()')), ctx);
const detailStart = app.indexOf('  function simDetalji(');
if (detailStart >= 0) vm.runInContext(app.slice(detailStart, app.indexOf('  function renderSimReview(')), ctx);
const plain = value => JSON.parse(JSON.stringify(value));
const q = ctx.byId.get(7921);
const choice = q.ch.find(c => c.ok).id;
const rec = {d: 1000, score: q.pts, total: q.pts, passed: true, wrong: [], qs: [{id: q.id, ch: [choice]}]};

test('history retains the actual choice IDs through save/load and repeated normalization', () => {
  assert.equal(choice, 25253);
  assert.equal(ctx.byId.has(choice), false, 'answer IDs are a different namespace');
  const once = plain(ctx.normalizeState({q: {}, sims: [rec]}));
  const twice = plain(ctx.normalizeState(JSON.parse(JSON.stringify(once))));
  assert.deepEqual(once.sims[0].qs, rec.qs);
  assert.deepEqual(twice.sims, once.sims);
  assert.equal(twice.sims[0].score, rec.score);
});

test('history filters foreign, duplicate and invalid choices against their own question', () => {
  const foreign = ctx.window.QUIZ.questions.find(x => x.id !== q.id).ch[0].id;
  const input = {...rec, wrong: [q.id, 999999], qs: [{id: q.id, ch: [choice, foreign, choice, String(choice), 999999]}, {id: 999999, ch: []}]};
  const result = plain(ctx.normalizeState({q: {}, sims: [input]})).sims[0];
  assert.deepEqual(result.qs, rec.qs);
  assert.deepEqual(result.wrong, [q.id]);
});

test('review accepts consistent details and rejects previously lost or partial details without changing totals', () => {
  assert.equal(typeof ctx.simDetalji, 'function');
  assert.equal(ctx.simDetalji(rec).length, 1);
  assert.equal(ctx.simDetalji({...rec, qs: [{id: q.id, ch: []}]}), null);
  assert.equal(ctx.simDetalji({...rec, total: rec.total + 1}), null);
  assert.equal(ctx.simDetalji({...rec, wrong: [q.id]}), null);
  assert.equal(ctx.simDetalji({...rec, qs: undefined}), null);
  assert.equal(rec.score, q.pts);
});

test('empty historical choices alone cannot prove whether the candidate answered', () => {
  const empty = {...rec, score: 0, passed: false, wrong: [q.id], qs: [{id: q.id, ch: []}]};
  const wrongChoice = q.ch.find(c => !c.ok).id;
  assert.equal(ctx.simDetalji(empty).length, 1);
  assert.equal(ctx.simDetalji({...empty, qs: [{id: q.id, ch: [wrongChoice]}]}).length, 1);
  // Both have consistent scores; the UI must describe missing saved choices neutrally.
  assert.equal(empty.score, 0);
});
