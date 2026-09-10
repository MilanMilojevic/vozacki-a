import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const appSource = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = appSource.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `function ${name} is missing`);
  const open = appSource.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < appSource.length; i++) {
    const char = appSource[i];
    const next = appSource[i + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; i++; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; i++; continue; }
    if (char === '/' && next === '*') { blockComment = true; i++; continue; }
    if (char === "'" || char === '"' || char === '`') { quote = char; continue; }
    if (char === '{') depth++;
    if (char === '}' && --depth === 0) return appSource.slice(start, i + 1);
  }
  throw new Error(`function ${name} is incomplete`);
}

const loadSource = extractFunction('load');
const saveSource = extractFunction('save');
const scheduleBackupSource = extractFunction('scheduleBackup');
const simSnimiSource = extractFunction('simSnimi');
const simObrisiSource = extractFunction('simObrisi');
const startSimSource = extractFunction('startSim');

function runScenario({ initial, readFails = false, writeFails = false, withFile = false, action = 'save(); scheduleBackup();' }) {
  let stored = initial;
  let writes = 0;
  let scheduled = 0;
  const sandbox = {
    Blob,
    console: { warn() {} },
    localStorage: {
      getItem() {
        if (readFails) throw new Error('synthetic read failure');
        return stored;
      },
      setItem(_key, value) {
        writes++;
        if (writeFails) throw new Error('synthetic write failure');
        stored = value;
      },
    },
    setTimeout() { scheduled++; return scheduled; },
    clearTimeout() {},
  };

  vm.runInNewContext(`
    const KEY = 'vozackiA.v1';
    function normalizeState(value) {
      return value && typeof value === 'object' && !Array.isArray(value)
        && value.q && typeof value.q === 'object' && !Array.isArray(value.q)
        ? JSON.parse(JSON.stringify(value)) : null;
    }
    let problemUcitavanja = null;
    let sirovoZaOporavak = null;
    let rezimPisanja = 'writer';
    let ocekivaniZapisi = { [KEY]: ${JSON.stringify(initial)} };
    let aktivniBackupPromise = Promise.resolve();
    function mozePisati() { return rezimPisanja === 'writer'; }
    function zahtevajZakljucanPrikaz() {}
    function zapisJeSvez() { return true; }
    function zapamtiUpis(key, raw) { ocekivaniZapisi[key] = raw; }
    ${loadSource}
    let S = load();
    let fsHandle = ${withFile ? '{}' : 'null'};
    let backupTimer = null;
    let upisUToku = false;
    let upozorenONeuspehuRezerve = false;
    let backupRevizija = 0, backupZahtev = null;
    function isprazniRedRezerve() { throw new Error('file write must not start in this test'); }
    function pokreniPraznjenjeRezerve() { return isprazniRedRezerve(); }
    function upisiRezervu() { throw new Error('file write must not start in this test'); }
    function upozoriDaSeNeCuva() {}
    function prikaziOporavakStanja() {}
    ${scheduleBackupSource}
    ${saveSource}
    const problemPreRadnje = problemUcitavanja;
    let saveResult;
    ${action}
    globalThis.testResult = JSON.stringify({
      problemPreRadnje,
      problemUcitavanja,
      sirovoZaOporavak,
      state: S,
      saveResult,
    });
  `, sandbox);

  return { ...JSON.parse(sandbox.testResult), stored, writes, scheduled };
}

test('corrupt stored states survive boot/default saves and cannot reach file backup', () => {
  const cases = [
    ['invalid-json', '{synthetic-broken'],
    ['invalid-json', ''],
    ['invalid-shape', JSON.stringify({ q: null })],
  ];

  for (const [expectedProblem, raw] of cases) {
    const result = runScenario({ initial: raw, withFile: true });
    assert.equal(result.problemPreRadnje, expectedProblem);
    assert.equal(result.problemUcitavanja, expectedProblem);
    assert.equal(result.sirovoZaOporavak, raw);
    assert.equal(result.stored, raw);
    assert.equal(result.writes, 0);
    assert.equal(result.scheduled, 0);
  }
});

test('missing and valid states keep their existing writable behavior', () => {
  for (const initial of [null, JSON.stringify({ q: { 7: { a: 1 } }, script: 'c' })]) {
    const result = runScenario({ initial, action: 'saveResult = save();' });
    assert.equal(result.problemPreRadnje, null);
    assert.equal(result.problemUcitavanja, null);
    assert.equal(result.saveResult, true);
    assert.equal(result.writes, 1);
  }
});

test('validated import explicitly replaces a corrupt value and unlocks later saves', () => {
  const raw = '{synthetic-broken';
  const imported = { q: { 7: { a: 3, w: 1 } }, script: 'c', sims: [{ score: 8 }] };
  const result = runScenario({
    initial: raw,
    action: `S = ${JSON.stringify(imported)}; saveResult = save(true);`,
  });

  assert.equal(result.problemPreRadnje, 'invalid-json');
  assert.equal(result.problemUcitavanja, null);
  assert.equal(result.sirovoZaOporavak, null);
  assert.equal(result.saveResult, true);
  assert.deepEqual(JSON.parse(result.stored), imported);
  assert.equal(result.writes, 1);
});

test('failed recovery replacement retains the corrupt raw value and write lock', () => {
  const raw = '{synthetic-broken';
  const result = runScenario({
    initial: raw,
    writeFails: true,
    withFile: true,
    action: 'S = { q: { 7: { a: 2 } } }; saveResult = save(true);',
  });

  assert.equal(result.problemUcitavanja, 'invalid-json');
  assert.equal(result.sirovoZaOporavak, raw);
  assert.equal(result.stored, raw);
  assert.equal(result.saveResult, false);
  assert.equal(result.scheduled, 0);
});

test('storage read failure blocks both storage and file writes', () => {
  const result = runScenario({ initial: null, readFails: true, withFile: true });

  assert.equal(result.problemUcitavanja, 'unavailable');
  assert.equal(result.sirovoZaOporavak, null);
  assert.equal(result.writes, 0);
  assert.equal(result.scheduled, 0);
});

test('valid in-memory state still reaches file backup when browser storage write fails', () => {
  const initial = JSON.stringify({ q: { 7: { a: 1 } } });
  const result = runScenario({ initial, writeFails: true, withFile: true, action: 'saveResult = save();' });

  assert.equal(result.problemUcitavanja, null);
  assert.equal(result.stored, initial);
  assert.equal(result.saveResult, false);
  assert.equal(result.scheduled, 1);
});

test('recovery mode blocks pending-exam writes, deletes, and new exam starts', () => {
  const metrics = { writes: 0, removes: 0, builds: 0, warnings: 0 };
  const sandbox = {
    Date,
    Math,
    Set,
    metrics,
    clearInterval() {},
    document: { getElementById() { return null; } },
    localStorage: {
      setItem() { metrics.writes++; },
      removeItem() { metrics.removes++; },
    },
    setInterval() { return 1; },
  };
  vm.runInNewContext(`
    const SIM_KEY = 'vozackiA.sim';
    const SIM_SECONDS = 2700;
    let problemUcitavanja = 'invalid-json';
    let rezimPisanja = 'writer';
    let sim = { deadline: 1, i: 0, showReport: false, qs: [] };
    let current = null;
    function prikaziOporavakStanja() { metrics.warnings++; }
    function zahtevajZakljucanPrikaz() {}
    function mozePisati() { return rezimPisanja === 'writer'; }
    function zapisJeSvez() { return true; }
    function zapamtiUpis() {}
    function upozoriDaSeNeCuva() {}
    function buildSimSet() { metrics.builds++; return []; }
    function applySimLabels() {}
    function renderSimReport() {}
    function renderSimQ() {}
    function tickSim() {}
    function setHash() {}
    function show() {}
    ${simSnimiSource}
    ${simObrisiSource}
    ${startSimSource}
    simSnimi();
    simObrisi();
    startSim();
  `, sandbox);

  assert.equal(metrics.writes, 0);
  assert.equal(metrics.removes, 0);
  assert.equal(metrics.builds, 0);
  assert.equal(metrics.warnings, 3);
});
