import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const backupSource = source.slice(source.indexOf('  let upisUToku = false;'), source.indexOf('  let povezivanjeUToku = false;'));
const saveSource = source.slice(source.indexOf('  function save('), source.indexOf('  function qs('));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const failure = name => Object.assign(new Error(`synthetic ${name}`), { name });

function fixture({ storageFails = false } = {}) {
  let now = 0, timerId = 0;
  const timers = new Map(), errors = [], warnings = [];
  const clock = {
    async flush() { for(let i=0;i<30;i++) await Promise.resolve(); },
    async tick(ms) {
      const end = now + ms;
      for(let safety=0;safety<100;safety++) {
        const next = [...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
        if(!next) { now=end; await this.flush(); return; }
        now=next[1].at; timers.delete(next[0]);
        try { Promise.resolve(next[1].fn()).catch(e=>errors.push(e)); } catch(e) { errors.push(e); }
        await this.flush();
      }
      throw Error('unbounded timer drain');
    },
  };
  const context = vm.createContext({
    Blob,
    console: { warn() {} },
    localStorage: { setItem() { if(storageFails) throw failure('QuotaExceededError'); } },
    setTimeout(fn,ms) { const id=++timerId; timers.set(id,{fn,at:now+ms}); return id; },
    clearTimeout(id) { timers.delete(id); },
    trakaUpozorenja(text) { warnings.push(text); },
    renderBackupLine() {}, L: key=>key, upozoriDaSeNeCuva() {}, prikaziOporavakStanja() {},
  });
  vm.runInContext(`
    let S={q:{},revision:0}, fsHandle=null, fsPending=null, backupTimer=null;
    let problemUcitavanja=null, sirovoZaOporavak=null;
    const KEY='synthetic';
    ${backupSource}
    ${saveSource}
    globalThis.api={
      connect(handle){fsHandle=handle;},
      request(revision){S={q:{},revision};return save();},
      block(){problemUcitavanja='invalid-json';},
      schedule:scheduleBackup,
      status(){return {active:upisUToku,handle:fsHandle,pending:fsPending};}
    };
  `, context);
  const locks = { active:0, maximum:0 };
  function handle(name, attempts=[]) {
    const result = { name, calls:0, committed:[], writers:[] };
    result.createWritable = async options => {
      assert.equal(options.keepExistingData,true);
      const plan=attempts[result.calls++] || {};
      if(plan.createWait) await plan.createWait.promise;
      if(plan.createError) throw plan.createError;
      locks.active++; locks.maximum=Math.max(locks.maximum,locks.active);
      let data, released=false;
      const release=()=>{if(!released){released=true;locks.active--;}};
      const writer={aborted:false,closed:false,writes:0,
        async write(value){writer.writes++;data=value.data;if(plan.writeWait)await plan.writeWait.promise;if(plan.writeError)throw plan.writeError;},
        async truncate(size){assert.equal(size,new Blob([data]).size);if(plan.truncateError)throw plan.truncateError;},
        async close(){if(plan.closeWait)await plan.closeWait.promise;if(plan.closeError)throw plan.closeError;result.committed.push(JSON.parse(data));writer.closed=true;release();},
        async abort(){writer.aborted=true;release();if(plan.abortError)throw plan.abortError;},
      };
      result.writers.push(writer);return writer;
    };
    return result;
  }
  return {api:context.api,clock,handle,locks,warnings,errors,timers};
}

for(const stage of ['write','close']) test(`a save during delayed ${stage} drains without requiring a third save`, async()=>{
  const f=fixture(), gate=deferred(), h=f.handle('first',[{[stage+'Wait']:gate}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(800);
  assert.equal(f.api.status().active,true);
  f.api.request(2);await f.clock.tick(800);
  assert.equal(h.calls,1);
  gate.resolve();await f.clock.flush();await f.clock.tick(800);
  assert.deepEqual(h.committed.map(s=>s.revision),[1,2]);
  assert.equal(f.locks.maximum,1);assert.equal(f.locks.active,0);assert.deepEqual(f.errors,[]);
});

test('several saves during one write coalesce to the newest snapshot',async()=>{
  const f=fixture(), gate=deferred(), h=f.handle('first',[{closeWait:gate}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(800);
  for(const revision of [2,3,4]) {f.api.request(revision);await f.clock.tick(800);}
  gate.resolve();await f.clock.flush();await f.clock.tick(800);
  assert.deepEqual(h.committed.map(s=>s.revision),[1,4]);
  assert.equal(f.locks.maximum,1);
});

test('transient retry aborts the failed writer and captures the latest state',async()=>{
  const f=fixture(), h=f.handle('first',[{writeError:failure('UnknownError')}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(800);
  assert.equal(h.writers[0].aborted,true);
  f.api.request(2);await f.clock.tick(2000);await f.clock.tick(5000);
  assert.equal(h.calls,2);assert.deepEqual(h.committed.map(s=>s.revision),[2]);
  assert.equal(f.locks.maximum,1);assert.deepEqual(f.warnings,[]);
});

test('two failures stop automatic retry; a later save can recover',async()=>{
  const f=fixture(), h=f.handle('first',[{closeError:failure('UnknownError')},{truncateError:failure('UnknownError')}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(20000);
  assert.equal(h.calls,2);assert.equal(h.writers.filter(w=>w.aborted).length,2);
  assert.deepEqual(f.warnings,['rezervaNeuspeh']);assert.equal(f.api.status().handle,h);
  assert.equal(f.api.status().active,false);assert.equal(f.timers.size,0);
  f.api.request(2);await f.clock.tick(800);
  assert.deepEqual(h.committed.map(s=>s.revision),[2]);assert.equal(f.locks.maximum,1);
});

test('permission loss stops after one attempt and retains that handle for reconnection',async()=>{
  const f=fixture(), h=f.handle('first',[{writeError:failure('NotAllowedError')}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(20000);
  assert.equal(h.calls,1);assert.equal(h.writers[0].aborted,true);
  assert.equal(f.api.status().handle,null);assert.equal(f.api.status().pending,h);
  assert.deepEqual(f.warnings,['rezervaDozvola']);
});

test('an old permission failure cannot disconnect a new handle with a queued save',async()=>{
  const f=fixture(), gate=deferred();
  const old=f.handle('old',[{writeWait:gate,writeError:failure('SecurityError')}]), next=f.handle('next');
  f.api.connect(old);f.api.request(1);await f.clock.tick(800);
  f.api.connect(next);f.api.request(2);await f.clock.tick(800);
  gate.resolve();await f.clock.flush();await f.clock.tick(800);
  assert.equal(f.api.status().handle,next);assert.equal(f.api.status().pending,null);
  assert.deepEqual(next.committed.map(s=>s.revision),[2]);
  assert.deepEqual(f.warnings,[]);assert.equal(f.locks.maximum,1);
});

test('a retry cannot silently switch to a newly selected handle without its own request',async()=>{
  const f=fixture(), old=f.handle('old',[{writeError:failure('UnknownError')}]), next=f.handle('next');
  f.api.connect(old);f.api.request(1);await f.clock.tick(800);
  f.api.connect(next);await f.clock.tick(10000);
  assert.equal(old.calls,1);assert.equal(next.calls,0);assert.equal(f.api.status().handle,next);
  f.api.request(2);await f.clock.tick(800);
  assert.deepEqual(next.committed.map(s=>s.revision),[2]);assert.equal(f.locks.maximum,1);
});

test('a captured writer finishes on its original handle before a new handle drains',async()=>{
  const f=fixture(), gate=deferred(), old=f.handle('old',[{createWait:gate}]), next=f.handle('next');
  f.api.connect(old);f.api.request(1);await f.clock.tick(800);
  f.api.connect(next);f.api.request(2);await f.clock.tick(800);
  gate.resolve();await f.clock.flush();await f.clock.tick(800);
  assert.deepEqual(old.committed.map(s=>s.revision),[1]);
  assert.deepEqual(next.committed.map(s=>s.revision),[2]);assert.equal(f.locks.maximum,1);
});

test('failure to abort preserves the original permission error',async()=>{
  const f=fixture(), h=f.handle('first',[{writeError:failure('NotAllowedError'),abortError:failure('InvalidStateError')}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(10000);
  assert.equal(h.calls,1);assert.equal(h.writers[0].aborted,true);
  assert.equal(f.api.status().pending,h);assert.deepEqual(f.warnings,['rezervaDozvola']);
});

test('valid state still reaches the file when local storage refuses the save',async()=>{
  const f=fixture({storageFails:true}), h=f.handle('first');f.api.connect(h);
  assert.equal(f.api.request(1),false);await f.clock.tick(800);
  assert.deepEqual(h.committed.map(s=>s.revision),[1]);
});

test('corrupt recovery blocks new requests and a previously scheduled backup',async()=>{
  const f=fixture(), h=f.handle('first');f.api.connect(h);f.api.request(1);f.api.block();
  assert.equal(f.api.request(2),false);f.api.schedule();await f.clock.tick(10000);
  assert.equal(h.calls,0);assert.deepEqual(h.committed,[]);assert.equal(f.api.status().active,false);
});

test('rapid saves before the first writer starts retain the debounce and latest state',async()=>{
  const f=fixture(), h=f.handle('first');f.api.connect(h);
  f.api.request(1);await f.clock.tick(400);f.api.request(2);await f.clock.tick(300);f.api.request(3);
  await f.clock.tick(799);assert.equal(h.calls,0);
  await f.clock.tick(1);assert.deepEqual(h.committed.map(s=>s.revision),[3]);
});

test('a newer save during the second attempt drains after that attempt closes',async()=>{
  const f=fixture(), gate=deferred(), h=f.handle('first',[{createError:failure('UnknownError')},{closeWait:gate}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(800);
  f.api.request(2);await f.clock.tick(2000);
  f.api.request(3);await f.clock.tick(800);
  gate.resolve();await f.clock.flush();await f.clock.tick(800);
  assert.equal(h.calls,3);assert.deepEqual(h.committed.map(s=>s.revision),[2,3]);assert.equal(f.locks.maximum,1);
});

for(const stage of ['create','write']) test(`recovery beginning during delayed ${stage} aborts the uncommitted writer`,async()=>{
  const f=fixture(), gate=deferred(), h=f.handle('first',[{[stage+'Wait']:gate}]);
  f.api.connect(h);f.api.request(1);await f.clock.tick(800);f.api.block();
  gate.resolve();await f.clock.flush();await f.clock.tick(10000);
  assert.equal(h.calls,1);assert.equal(h.writers[0].aborted,true);
  assert.equal(h.writers[0].writes,stage==='create'?0:1);assert.deepEqual(h.committed,[]);
  assert.equal(f.locks.active,0);assert.equal(f.api.status().active,false);assert.deepEqual(f.warnings,[]);
});
