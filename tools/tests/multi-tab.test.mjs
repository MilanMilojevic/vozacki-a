import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const idbSetStart = source.indexOf('  async function idbSet(');
const idbSetEnd = source.indexOf('  async function idbGet(', idbSetStart);
assert.notEqual(idbSetStart, -1, 'idbSet is missing');
const idbSetSource = source.slice(idbSetStart, idbSetEnd);

function functionSource(name) {
  const match = source.match(new RegExp(`  function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?\\n  \\}`));
  assert.ok(match, `function ${name} is missing`);
  return match[0];
}

function coordinatorSource() {
  const start = source.indexOf('  // ---------- Jedan aktivan tab ----------');
  const end = source.indexOf('  const pocetniRezimPisanja = await odrediRezimPisanja();');
  assert.notEqual(start, -1, 'app.js has no single-writer coordinator');
  assert.notEqual(end, -1, 'app.js does not await the writer role before loading state');
  return source.slice(start, end);
}

function fixture({ lock = 'grant', protocol = 'https:' } = {}) {
  const calls = [];
  let requestSettled = false;
  const navigator = {};
  if (lock !== 'missing') {
    navigator.locks = {
      request(name, options, callback) {
        calls.push({ name, options });
        if (lock === 'reject') return Promise.reject(new Error('synthetic lock failure'));
        const pending = Promise.resolve().then(() => callback(lock === 'grant' ? { name } : null));
        pending.finally(() => { requestSettled = true; });
        return pending;
      },
    };
  }
  const context = vm.createContext({
    navigator,
    location: { protocol },
    Promise,
    console: { warn() {} },
    zaustaviBackupZaZakljucavanje() {},
  });
  vm.runInContext(`${coordinatorSource()}
    async function idb(){return globalThis.dbForTest;}
    ${idbSetSource}
    globalThis.api = {
      choose: odrediRezimPisanja,
      retire: penzionisiPisca,
      writable: mozePisati,
      mode: () => rezimPisanja,
      setBackup: (promise) => { aktivniBackupPromise = promise; },
      startIdb: (db) => { globalThis.dbForTest = db; return idbSet('handle', {}); },
    };`, context);
  return { api: context.api, calls, get requestSettled() { return requestSettled; } };
}

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };

test('the first cooperating document holds one exclusive non-stealing writer lock', async () => {
  const f = fixture();
  assert.equal(await f.api.choose(), 'writer');
  assert.equal(f.api.mode(), 'writer');
  assert.equal(f.api.writable(), true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].options.mode, 'exclusive');
  assert.equal(f.calls[0].options.ifAvailable, true);
  assert.equal('steal' in f.calls[0].options, false);
  await flush();
  assert.equal(f.requestSettled, false, 'writer lock was released while the document is active');
});

test('a second cooperating document becomes read-only without waiting or taking over', async () => {
  const f = fixture({ lock: 'unavailable' });
  assert.equal(await f.api.choose(), 'reader');
  assert.equal(f.api.writable(), false);
  await flush();
  assert.equal(f.requestSettled, true);
});

for (const lock of ['missing', 'reject']) {
  test(`missing/rejected Web Locks preserve a writable fallback: ${lock}`, async () => {
    const f = fixture({ lock });
    assert.equal(await f.api.choose(), 'fallback');
    assert.equal(f.api.writable(), true);
  });
}

test('file pages use the honest writable fallback even if a lock object exists', async () => {
  const f = fixture({ protocol: 'file:' });
  assert.equal(await f.api.choose(), 'fallback');
  assert.equal(f.calls.length, 0);
});

test('page retirement blocks writes before waiting for an active backup to drain', async () => {
  const f = fixture();
  await f.api.choose();
  const gate = deferred();
  f.api.setBackup(gate.promise);
  let retired = false;
  const retiring = f.api.retire().then(() => { retired = true; });
  assert.equal(f.api.mode(), 'retired');
  assert.equal(f.api.writable(), false);
  await flush();
  assert.equal(retired, false);
  assert.equal(f.requestSettled, false);
  gate.resolve();
  await retiring;
  await flush();
  assert.equal(f.requestSettled, true);
});

test('a failed compare read blocks a storage write that would otherwise succeed', () => {
  let setCalls = 0;
  const context = vm.createContext({
    warnings: 0,
    console: { warn() {} },
    localStorage: {
      getItem() { throw new Error('synthetic read failure'); },
      setItem() { setCalls++; },
    },
  });
  const saveSource = source.slice(source.indexOf('  function save('), source.indexOf('  function qs('));
  vm.runInContext(`
    const KEY='vozackiA.v1';
    let rezimPisanja='writer', ocekivaniZapisi={ [KEY]:'original' };
    let S={q:{}}, problemUcitavanja=null, sirovoZaOporavak=null;
    function mozePisati(){return rezimPisanja==='writer';}
    function zahtevajZakljucanPrikaz(){}
    function blokirajPisanje(){rezimPisanja='conflict';}
    function upozoriDaSeNeCuva(){warnings++;}
    function prikaziOporavakStanja(){}
    function zapamtiUpis(key,raw){ocekivaniZapisi[key]=raw;}
    function scheduleBackup(){}
    ${functionSource('zapisJeSvez')}
    ${saveSource}
    globalThis.result=save();
  `, context);
  assert.equal(context.result, false);
  assert.equal(setCalls, 0);
  assert.equal(context.warnings, 1);
});

test('missing initial storage receipt also fails closed before a write', () => {
  let setCalls = 0;
  const context = vm.createContext({
    warnings: 0,
    console: { warn() {} },
    localStorage: {
      getItem() { return null; },
      setItem() { setCalls++; },
    },
  });
  const saveSource = source.slice(source.indexOf('  function save('), source.indexOf('  function qs('));
  vm.runInContext(`
    const KEY='vozackiA.v1';
    let rezimPisanja='writer', ocekivaniZapisi=null;
    let S={q:{}}, problemUcitavanja=null, sirovoZaOporavak=null;
    function mozePisati(){return rezimPisanja==='writer';}
    function zahtevajZakljucanPrikaz(){}
    function blokirajPisanje(){rezimPisanja='conflict';}
    function upozoriDaSeNeCuva(){warnings++;}
    function prikaziOporavakStanja(){}
    function zapamtiUpis(){}
    function scheduleBackup(){}
    ${functionSource('zapisJeSvez')}
    ${saveSource}
    globalThis.result=save();
  `, context);
  assert.equal(context.result, false);
  assert.equal(setCalls, 0);
  assert.equal(context.warnings, 1);
});

test('an IDB handle write waiting for the database cannot start after retirement', async () => {
  let openResolve;
  const open = new Promise((resolve) => { openResolve = resolve; });
  let transactions = 0;
  const context = vm.createContext({
    Promise,
    Error,
    idb: () => open,
    fakeDb: {
      transaction() {
        transactions++;
        const tx = { objectStore: () => ({ put() {} }) };
        Promise.resolve().then(() => tx.oncomplete?.());
        return tx;
      },
    },
  });
  vm.runInContext(`
    let rezimPisanja='writer';
    function mozePisati(){return rezimPisanja==='writer';}
    function zahtevajZakljucanPrikaz(){}
    ${idbSetSource}
    globalThis.pending=idbSet('handle',{});
    globalThis.retire=()=>{rezimPisanja='retired';};
  `, context);
  context.retire();
  openResolve(context.fakeDb);
  await assert.rejects(context.pending);
  assert.equal(transactions, 0);
});

test('retirement aborts an active IDB handle transaction and waits for its completion event', async () => {
  const f = fixture();
  await f.api.choose();
  let tx;
  let puts = 0;
  let aborts = 0;
  const pending = f.api.startIdb({
    transaction() {
      tx = {
        error: Object.assign(new Error('synthetic abort'), { name: 'AbortError' }),
        objectStore: () => ({ put() { puts++; } }),
        abort() { aborts++; },
      };
      return tx;
    },
  });
  const observed = pending.catch((error) => error);
  await flush();
  assert.equal(puts, 1);
  let retired = false;
  const retiring = f.api.retire().then(() => { retired = true; });
  assert.equal(aborts, 1);
  await flush();
  assert.equal(retired, false);
  assert.equal(f.requestSettled, false);
  tx.onabort();
  assert.equal((await observed).name, 'AbortError');
  await retiring;
  await flush();
  assert.equal(retired, true);
  assert.equal(f.requestSettled, true);
});

test('storage conflict aborts an active IDB handle transaction', () => {
  const context = vm.createContext({ aborts: 0 });
  vm.runInContext(`
    let rezimPisanja='writer';
    let aktivnaIdbTransakcija={abort(){aborts++;}};
    let sim=null;
    function mozePisati(){return rezimPisanja==='writer';}
    function zaustaviBackupZaZakljucavanje(){}
    function zahtevajZakljucanPrikaz(){}
    function clearInterval(){}
    ${functionSource('blokirajPisanje')}
    blokirajPisanje('conflict');
  `, context);
  assert.equal(context.aborts, 1);
});
