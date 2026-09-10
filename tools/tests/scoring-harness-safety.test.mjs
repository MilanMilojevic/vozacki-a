import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../provera-bodovanja.js', import.meta.url), 'utf8');
// Run the actual app hook with in-memory backup state; never open IndexedDB or a file handle.
const appSource = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const hookSource = appSource.match(/async proveraBezFajla\(\) \{[\s\S]*?\n      \},/)[0];
const PROFILE = '{"q":{"9502":{"a":3,"w":1,"marked":1}},"sims":[{"score":98}],"theme":"dark"}';
const SIM = '{"qs":[9502],"d":9999999999999,"i":0}';
const keys = ['vozackiA.v1', 'vozackiA.sim'];
function storage(entries = {}) {
  const map = new Map(Object.entries(entries));
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
    snapshot() { return Object.fromEntries(map); },
  };
}
function browser(local = storage({ [keys[0]]: PROFILE, [keys[1]]: SIM }), session = storage()) {
  let reloads = 0;
  let domTouches = 0;
  const context = vm.createContext({
    localStorage: local, sessionStorage: session,
    location: { origin: 'http://localhost:8137', hostname: 'localhost', hash: '#/', reload() { reloads++; } },
    console: { log() {}, error() {} },
    document: { getElementById() { domTouches++; throw Error('suite reached DOM'); } },
    crypto: { randomUUID: () => crypto.randomUUID() },
    setTimeout, Date, performance,
  });
  context.window = context;
  context.history = { replaceState(state, title, url) { context.location.hash = url; } };
  context.__dev = { S: { q: {} }, async proveraBezFajla() {},
    async proveraPotvrdiPovratak(originals) {
      if (!keys.every((key) => local.getItem(key) === originals[key])) throw Error('Zapisi se razlikuju od kopije.');
    },
  };
  context.addEventListener = () => {};
  vm.runInContext(source, context);
  return { context, local, session, get reloads() { return reloads; }, get domTouches() { return domTouches; },
    nextPage() { return browser(local, session); },
    run(code) { return vm.runInContext(code, context); },
    suite(code) { vm.runInContext(`proveraBodovanjaTestovi = async function () { ${code} };`, context); },
  };
}
function originals(b, profile = PROFILE, sim = SIM) {
  assert.equal(b.local.getItem(keys[0]), profile);
  assert.equal(b.local.getItem(keys[1]), sim);
}

function bootRestoredApp(b) {
  // Actual load/normalization, automatic startup save, and simulation decoding. Only the
  // browser/IO boundaries are replaced; no DOM, network, IndexedDB or real handles exist.
  const state = appSource.slice(appSource.indexOf("  const KEY = 'vozackiA.v1';"), appSource.indexOf('  // Ako pregledač odbije upis'));
  const update = appSource.slice(appSource.indexOf('  function mozdaProveriRepo()'), appSource.indexOf('  setInterval(checkVersion'));
  const sim = appSource.slice(appSource.indexOf('  function simObrisi()'), appSource.indexOf('  // Vraća true ako je ispit nastavljen'));
  b.context.byId = new Map();
  b.context.setTimeout = () => {};
  const receipt = appSource.match(/  const proveraPosleUcitavanja = [^\n]+/);
  const confirm = appSource.match(/async proveraPotvrdiPovratak\(zapisi\) \{[\s\S]*?\n      \},/);
  b.run(`${state}\n const BOOT_V=126, SIM_KEY='vozackiA.sim', SIM_N=41;
    function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
    ${update}\n${sim}\nsimVrati();
    ${receipt ? receipt[0] : ''}
    Object.defineProperty(window.__dev, 'S', { get() { return S; } });
    ${confirm ? `window.__dev.proveraPotvrdiPovratak = ({${confirm[0]}}).proveraPotvrdiPovratak;` : ''}`);
}

test('direct phase two rejects before touching DOM or either original record', async () => {
  const b = browser();
  await assert.rejects(b.run('proveraBodovanja2()'), /kontekst|pokreni/i);
  originals(b);
  assert.equal(b.domTouches, 0);
  assert.equal(b.reloads, 0);
});

test('backup failure prevents the first localStorage mutation', async () => {
  const b = browser();
  b.session.setItem = () => { throw Error('quota'); };
  await assert.rejects(b.run('proveraBodovanja()'), /quota/);
  originals(b);
  assert.equal(b.reloads, 0);
});

test('pending file-backup initialization blocks start and a connected file rejects without mutation', async () => {
  const b = browser();
  let rejectInit;
  b.context.__dev.proveraBezFajla = () => new Promise((resolve, reject) => { rejectInit = reject; });
  const start = b.run('proveraBodovanja()');
  originals(b);
  assert.deepEqual(b.session.snapshot(), {});
  rejectInit(Error('povezan fajl'));
  await assert.rejects(start, /fajl/);
  originals(b);
});

test('a file connection after first reload blocks the scoring body', async () => {
  const first = browser();
  await first.run('proveraBodovanja()');
  const b = first.nextPage();
  b.context.__dev.proveraBezFajla = async () => { throw Error('povezan fajl'); };
  await assert.rejects(b.run('proveraBodovanja2()'), /fajl/);
  assert.equal(b.domTouches, 0);
  assert.ok(Object.keys(b.session.snapshot()).length);
});

test('the app guard waits for initialization and rejects all active or pending file states', async () => {
  for (const flag of ['fsHandle', 'fsPending', 'upisUToku', 'povezivanjeUToku']) {
    let ready;
    const state = { backupSpreman: new Promise((resolve) => { ready = resolve; }),
      fsHandle: null, fsPending: null, upisUToku: false, povezivanjeUToku: false };
    const guard = vm.runInNewContext(`({ ${hookSource} }).proveraBezFajla`, state);
    let settled = false;
    const pending = guard().finally(() => { settled = true; });
    await new Promise(setImmediate);
    assert.equal(settled, false);
    state[flag] = true;
    ready();
    await assert.rejects(pending, /fajl/i);
    state[flag] = false;
    await guard();
  }
});

test('start verifies persisted backup before clearing and cannot overwrite it on restart', async () => {
  const b = browser();
  await b.run('proveraBodovanja()');
  const backup = b.session.snapshot();
  assert.ok(Object.keys(backup).length);
  assert.equal(b.local.getItem(keys[0]), null);
  assert.equal(b.local.getItem(keys[1]), null);
  b.local.setItem(keys[0], 'synthetic');
  await assert.rejects(b.run('proveraBodovanja()'), /postoji|započet|kontekst/i);
  assert.deepEqual(b.session.snapshot(), backup);
  assert.equal(b.local.getItem(keys[0]), 'synthetic');
  await assert.rejects(b.run('proveraBodovanja2()'), /osvež|učita/i);
});

test('silently dropped backup write cannot authorize destructive start', async () => {
  const b = browser();
  b.session.setItem = () => {};
  await assert.rejects(b.run('proveraBodovanja()'), /kopij|kontekst/i);
  originals(b);
});

test('starting from an exam route reloads onto home so a new test exam is not resumed', async () => {
  const b = browser();
  b.context.location.hash = '#/sim';
  await b.run('proveraBodovanja()');
  assert.equal(b.context.location.hash, '#/');
});

for (const [name, code, fails] of [
  ['normal completion', 'localStorage.setItem("vozackiA.v1", "synthetic"); return { palo: 0 };', false],
  ['unexpected exception', 'localStorage.setItem("vozackiA.sim", "synthetic"); throw Error("suite exploded");', true],
]) {
  test(`${name} restores both raw values, reloads, and keeps recovery until fresh-page verification`, async () => {
    const first = browser();
    await first.run('proveraBodovanja()');
    const b = first.nextPage();
    b.suite(code);
    if (fails) await assert.rejects(b.run('proveraBodovanja2()'), /suite exploded/);
    else assert.equal((await b.run('proveraBodovanja2()')).palo, 0);
    originals(b);
    assert.equal(b.reloads, 1);
    assert.ok(Object.keys(b.session.snapshot()).length);
    await assert.rejects(b.run('proveraBodovanjaPotvrdi()'), /osvež|učita/i);
    await b.nextPage().run('proveraBodovanjaPotvrdi()');
    assert.deepEqual(b.session.snapshot(), {});
  });
}

test('interrupted running phase recovers originals instead of resuming synthetic data', async () => {
  const first = browser();
  await first.run('proveraBodovanja()');
  const running = first.nextPage();
  running.suite('localStorage.setItem("vozackiA.v1", "partial test"); return new Promise(() => {});');
  running.run('proveraBodovanja2()');
  await new Promise(setImmediate); // Simulate navigation only after the suite actually started.
  assert.equal(running.local.getItem(keys[0]), 'partial test');
  const interrupted = running.nextPage();
  await assert.rejects(interrupted.run('proveraBodovanja2()'), /prekinut|oporav|Vrati/i);
  await interrupted.run('proveraBodovanjaVrati()');
  originals(interrupted);
  assert.equal(interrupted.reloads, 1);
});

for (const raw of ['{', '{}', '{"v":1,"origin":"http://localhost:8137","stranica":"old","faza":"pripremljen","zapisi":{"vozackiA.v1":"original"}}']) {
  test(`invalid or partial session context rejects without mutating: ${raw}`, async () => {
    const b = browser();
    b.session.setItem('provera.kontekst', raw);
    await assert.rejects(b.run('proveraBodovanja2()'), /kontekst/i);
    await assert.rejects(b.run('proveraBodovanjaVrati()'), /kontekst/i);
    originals(b);
    assert.equal(b.domTouches, 0);
    assert.equal(b.session.getItem('provera.kontekst'), raw);
  });
}

test('legacy backup is preserved and blocks a new test', async () => {
  const b = browser();
  b.session.setItem('provera.backup', 'older original');
  await assert.rejects(b.run('proveraBodovanja()'), /stara|kopija/i);
  originals(b);
  assert.equal(b.session.getItem('provera.backup'), 'older original');
});

test('the internal scoring suite also refuses a direct call', async () => {
  const b = browser();
  await assert.rejects(b.run('proveraBodovanjaTestovi()'), /kontekst/i);
  originals(b);
  assert.equal(b.domTouches, 0);
});

test('absent and empty original records remain distinct through recovery', async () => {
  const first = browser(storage({ [keys[1]]: '' }));
  await first.run('proveraBodovanja()');
  const b = first.nextPage();
  b.local.setItem(keys[0], 'synthetic');
  b.local.setItem(keys[1], 'synthetic');
  await b.run('proveraBodovanjaVrati()');
  originals(b, null, '');
  await b.nextPage().run('proveraBodovanjaPotvrdi()');
  assert.deepEqual(b.session.snapshot(), {});
});

test('partial restore failure retains the only backup for retry', async () => {
  const first = browser();
  await first.run('proveraBodovanja()');
  const b = first.nextPage();
  const set = b.local.setItem;
  b.local.setItem = (key, value) => { if (key === keys[1]) throw Error('disk full'); set(key, value); };
  await assert.rejects(b.run('proveraBodovanjaVrati()'), /disk full/);
  assert.ok(Object.keys(b.session.snapshot()).length);
  assert.equal(b.reloads, 0);
  b.local.setItem = set;
  await b.run('proveraBodovanjaVrati()');
  originals(b);
});

test('fresh-page verification refuses to discard backup if storage has changed', async () => {
  const first = browser();
  await first.run('proveraBodovanja()');
  await first.nextPage().run('proveraBodovanjaVrati()');
  const b = first.nextPage();
  b.local.setItem(keys[0], 'unexpected late save');
  await assert.rejects(b.run('proveraBodovanjaPotvrdi()'), /vrać|razlik|kopij/i);
  assert.ok(Object.keys(b.session.snapshot()).length);
});

for (const raw of [null, '', '{"q":{}}']) {
  test(`real boot receipt confirms restored ${JSON.stringify(raw)} profile despite startup normalization`, async () => {
    const first = browser(storage({ ...(raw === null ? {} : { [keys[0]]: raw }), [keys[1]]: '' }));
    await first.run('proveraBodovanja()');
    await first.nextPage().run('proveraBodovanjaVrati()');
    const restored = first.nextPage();
    bootRestoredApp(restored);
    assert.notEqual(restored.local.getItem(keys[0]), raw); // The actual startup write occurred.
    assert.equal(restored.local.getItem(keys[1]), null); // Actual simVrati removes empty input.
    await restored.run('proveraBodovanjaPotvrdi()');
    assert.deepEqual(restored.session.snapshot(), {});
  });
}

for (const edit of ['S.theme = "dark";', 'localStorage.setItem("vozackiA.v1", "late overwrite");']) {
  test(`boot receipt retains backup after a later change: ${edit}`, async () => {
    const first = browser(storage({ [keys[0]]: '{"q":{}}' }));
    await first.run('proveraBodovanja()');
    await first.nextPage().run('proveraBodovanjaVrati()');
    const restored = first.nextPage();
    bootRestoredApp(restored);
    restored.run(edit);
    await assert.rejects(restored.run('proveraBodovanjaPotvrdi()'), /promen|razlik|kopij/i);
    assert.ok(Object.keys(restored.session.snapshot()).length);
  });
}

test('unchanged raw storage cannot hide a changed live profile after reload', async () => {
  const raw = '{"q":{},"noUpd":1}';
  const first = browser(storage({ [keys[0]]: raw }));
  await first.run('proveraBodovanja()');
  await first.nextPage().run('proveraBodovanjaVrati()');
  const restored = first.nextPage();
  bootRestoredApp(restored);
  assert.equal(restored.local.getItem(keys[0]), raw);
  restored.run('S.theme = "dark";');
  await assert.rejects(restored.run('proveraBodovanjaPotvrdi()'), /promenjen|kopij/i);
  assert.ok(Object.keys(restored.session.snapshot()).length);
});

test('rewriting original bytes after boot cannot hide that the document loaded a different profile', async () => {
  const raw = '{"q":{},"noUpd":1}';
  const first = browser(storage({ [keys[0]]: raw }));
  await first.run('proveraBodovanja()');
  await first.nextPage().run('proveraBodovanjaVrati()');
  const restored = first.nextPage();
  restored.local.setItem(keys[0], '{"q":{},"theme":"dark","noUpd":1}');
  bootRestoredApp(restored);
  restored.local.setItem(keys[0], raw);
  await assert.rejects(restored.run('proveraBodovanjaPotvrdi()'), /učitao|kopij/i);
  assert.ok(Object.keys(restored.session.snapshot()).length);
});

test('boot fallback from corrupt nonempty original never authorizes deleting its backup', async () => {
  const first = browser(storage({ [keys[0]]: '{broken' }));
  await first.run('proveraBodovanja()');
  await first.nextPage().run('proveraBodovanjaVrati()');
  const restored = first.nextPage();
  bootRestoredApp(restored);
  await assert.rejects(restored.run('proveraBodovanjaPotvrdi()'), /ispravno|kopij/i);
  assert.ok(Object.keys(restored.session.snapshot()).length);
});
