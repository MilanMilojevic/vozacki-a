import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
function fixture() {
  const card = { innerHTML: '', querySelectorAll: () => [] };
  const c = vm.createContext({ window: {}, card, console });
  vm.runInContext(readFileSync(new URL('../../data.js', import.meta.url), 'utf8'), c);
  c.Q = c.window.QUIZ.questions;
  const slots = app.indexOf('  const SIM_SLOTS = [');
  vm.runInContext(app.slice(slots, app.indexOf('  ];', slots) + 4), c);
  vm.runInContext(app.slice(app.indexOf('  const STR = {'), app.indexOf('  // ---------- Jedan aktivan tab')), c);
  vm.runInContext(`let S = {q:{}, sims:[], script:'l'};
    const SIM_PTS_MIN=98, prag=n=>Math.ceil(.85*n);
    const localDay=d=>new Date(d).toISOString().slice(0,10);
    const L=k=>STR[k][S.script], el=()=>card, bindNav=()=>{};
    const pragTekst=n=>'Prag: '+prag(n), subShortName=n=>String(n), escapeHtml=x=>String(x);
    ${app.slice(app.indexOf('  function readiness()'), app.indexOf('  // ---------- Statistika'))}`, c);
  return { Q: c.Q, run: (s) => vm.runInContext(s, c), card,
    set(questions, a = 1, w = 0) {
      c.records = Object.fromEntries(questions.map(q => [q.id, {a, w}]));
      vm.runInContext('S.q=records', c);
    },
  };
}

for (const size of [30, 150]) {
  test(`${size} correct answers in a narrow part of the bank cannot imply certainty elsewhere`, () => {
    const f = fixture();
    const questions = size === 30 ? f.Q.slice(0, 30) : [...f.Q.filter(q=>q.sub===159), ...f.Q.filter(q=>q.sub===160)].slice(0,150);
    assert.equal(questions.length, size);
    f.set(questions);
    const r = f.run('readiness()'), sp = f.run('spremnost()');
    assert.equal(r.exp, null);
    assert.equal(sp.sansa, null);
    assert.equal(sp.sansaOk, false);
    assert.equal(sp.nedostaje, 1327-size);
    assert.equal(sp.odgovoreno, size);
    assert.ok(r.slotovi.some(s=>s.p===null));
  });
}

test('repeating one answer cannot fill coverage or lend confidence to unseen questions', () => {
  const f=fixture(); f.set(f.Q.slice(0,1),10000,0);
  const sp=f.run('spremnost()');
  assert.equal(sp.odgovoreno,1);
  assert.equal(sp.nedostaje,1326);
  assert.equal(sp.sansa,null);
});

test('answering across all subareas still leaves unknown questions unmodeled', () => {
  const f=fixture();
  f.set([...new Map(f.Q.map(q=>[q.sub,q])).values()]);
  assert.equal(f.run('spremnost().sansa'),null);
});

test('full coverage retains finite conditional estimates and improves with the recorded accuracy', () => {
  const f=fixture(); f.set(f.Q,20,0);
  const good=f.run('spremnost()');
  assert.equal(good.modelDostupan,true);
  assert.equal(good.nedostaje,0);
  assert.ok(Number.isFinite(good.exp) && good.exp>84 && good.exp<98);
  assert.ok(good.sansa>0 && good.sansa<=1);
  f.set(f.Q,20,20);
  const bad=f.run('spremnost()');
  assert.equal(bad.modelDostupan,true);
  assert.ok(bad.exp>=0 && bad.exp<good.exp);
  assert.ok(bad.sansa>=0 && bad.sansa<good.sansa);
});

test('one unanswered question prevents complete-bank readiness even if many simulations passed', () => {
  const f=fixture(); f.set(f.Q.slice(1),20,0);
  f.run('S.sims=[1,2,3,4,5].map(i=>({d:i*86400000,score:98,total:98,passed:true}));');
  const sp=f.run('spremnost()');
  assert.equal(sp.nedostaje,1);
  assert.equal(sp.brojOk,true);
  assert.equal(sp.daniOk,true);
  assert.equal(sp.nizOk,true);
  assert.equal(sp.sansaOk,false);
  assert.equal(sp.sansa,null);
});

test('poor simulation history remains visible in the checklist despite a high model result', () => {
  const f=fixture(); f.set(f.Q,20,0);
  f.run('S.sims=[1,2,3,4,5].map(i=>({d:i*86400000,score:0,total:98,passed:false}));');
  assert.equal(f.run('spremnost().nizOk'),false);
});

test('conditional score distribution preserves exact deterministic and hand-computed cases', () => {
  const f=fixture();
  assert.equal(f.run('sansaZaProlaz([{pts:1,p:1},{pts:1,p:1}]).sansa'),1);
  assert.equal(f.run('sansaZaProlaz([{pts:1,p:0},{pts:1,p:0}]).sansa'),0);
  assert.equal(f.run('sansaZaProlaz([{pts:1,p:.5},{pts:1,p:.5}]).sansa'),.25);
  assert.equal(f.run('sansaZaProlaz([{pts:1,p:null}])'),null);
  assert.equal(f.run('sansaZaProlaz([{pts:1,p:NaN}])'),null);
});

test('statistics explains missing coverage in both scripts and never renders a probability from it', () => {
  const f=fixture(); f.set(f.Q.slice(0,30));
  for(const script of ['l','c']) {
    f.run(`S.script='${script}'; renderReady();`);
    assert.ok(f.card.innerHTML.includes('1297'));
    assert.ok(f.card.innerHTML.includes('30 / 1327'));
    assert.ok(!f.card.innerHTML.includes('100%'));
    assert.ok(!f.card.innerHTML.includes('class="bigScore'));
  }
});

test('partial coverage keeps factual simulation checklist visible without inventing a model result', () => {
  const f=fixture(); f.set(f.Q.slice(0,30));
  f.run('S.sims=[1,2,3,4,5].map(i=>({d:i*86400000,score:98,total:98,passed:true}));');
  for(const script of ['l','c']) {
    f.run(`S.script='${script}'; renderReady();`);
    const rows=[...f.card.innerHTML.matchAll(/<div class="brRed">([\s\S]*?)<\/div>/g)].map(m=>m[1]);
    assert.equal(rows.length,4,'keep the existing four factual/model checklist rows');
    assert.ok(rows.slice(0,3).every(row=>row.includes('✓')));
    assert.ok(rows[0].includes('5') && rows[1].includes('5'));
    assert.ok(rows[3].includes('✗') && rows[3].includes('1297'));
    assert.ok(!rows[3].includes('%'),'unknown model is never formatted as a percentage');
    assert.ok(!f.card.innerHTML.includes('class="bigScore'));
    assert.ok(!f.card.innerHTML.includes('<table'));
  }
});

test('a missing simulation model keeps the checklist but does not claim unanswered questions at full coverage', () => {
  const f=fixture(); f.set(f.Q); f.run('SIM_SLOTS.length=0; renderReady();');
  assert.equal((f.card.innerHTML.match(/class="brRed"/g)||[]).length,4);
  assert.ok(f.card.innerHTML.includes('Model trenutno nema potpune podatke'));
  assert.ok(!f.card.innerHTML.includes('0%'));
  assert.ok(!f.card.innerHTML.includes('class="bigScore'));
});

test('compact home notice retains the missing count without repeating coverage counts', () => {
  const f=fixture(); f.set(f.Q.slice(0,30));
  for(const script of ['l','c']) {
    f.run(`S.script='${script}';`);
    const text=f.run('razlogBezProcene(spremnost(),true)');
    assert.ok(text.includes('1297'));
    assert.ok(!text.includes('30 / 1327'));
  }
});
