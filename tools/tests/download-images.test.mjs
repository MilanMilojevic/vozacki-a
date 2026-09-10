import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { argumentsFor } from '../download-images.mjs';

const script = fileURLToPath(new URL('../download-images.mjs', import.meta.url));
const guid = '00000000-0000-4000-8000-000000000001';
const jpeg = (byte = 1) => { const b = Buffer.alloc(1200, byte); b.set([255,216,255]); b.set([255,217],b.length-2); return b; };

test('defaults are anchored to the script and explicit paths use the caller directory',()=>{
  const defaults=argumentsFor(['--guid',guid]);
  assert.equal(defaults.source,fileURLToPath(new URL('../base-A.json',import.meta.url)));
  assert.equal(defaults.out,fileURLToPath(new URL('../../img',import.meta.url)));
  const explicit=argumentsFor(['--guid',guid,'--source','relative.json','--out','relative-images']);
  assert.equal(explicit.source,path.resolve('relative.json'));
  assert.equal(explicit.out,path.resolve('relative-images'));
});
async function fixture(t, { source = {questions:[{qId:7001,HasImage:true}]}, response='ok' } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(),'vozacki-images-'));
  t.after(async()=>{
    assert.equal(path.dirname(dir),path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('vozacki-images-'));
    await rm(dir,{recursive:true,force:true});
  });
  const input=path.join(dir,'base with spaces.json'), output=path.join(dir,'images'), calls=path.join(dir,'calls.jsonl');
  await writeFile(input,typeof source==='string'?source:JSON.stringify(source));
  const preload=path.join(dir,'mock-fetch.mjs');
  await writeFile(preload, `
    import fs from 'node:fs';
    const nativeTimer=globalThis.setTimeout;
    globalThis.setTimeout=(fn,ms,...args)=>nativeTimer(fn,0,...args);
    globalThis.fetch=async url=>{
      const u=new URL(url);
      if(u.origin!=='https://servisi.euprava.gov.rs'||u.pathname!=='/autoskole/Question/QuestionsPracticeImage')throw Error('Unexpected test request');
      if(u.searchParams.get('guid')!==${JSON.stringify(guid)})throw Error('Incorrect practice identifier');
      fs.appendFileSync(${JSON.stringify(calls)},JSON.stringify({id:u.searchParams.get('id')})+'\\n');
      if(${JSON.stringify(response)}==='throw')throw Error('synthetic failure for '+url);
      if(${JSON.stringify(response)}==='http')return new Response('error',{status:503});
      if(${JSON.stringify(response)}==='html')return new Response('<html>login</html>');
      return new Response(Buffer.from(${JSON.stringify(jpeg(2).toString('base64'))},'base64'),{headers:{'Content-Type':'image/jpeg'}});
    };
  `);
  return {dir,input,output,calls,
    run(extra=[],baseArgs=['--guid',guid,'--source',input,'--out',output]) {
      return spawnSync(process.execPath,['--import',pathToFileURL(preload).href,script,...baseArgs,...extra],{cwd:dir,encoding:'utf8',timeout:10000,windowsHide:true});
    },
    async count(){return (await readFile(calls,'utf8').catch(()=>'' )).trim().split('\n').filter(Boolean).length;},
  };
}

test('named GUID, source and destination are distinct and work from another directory',async t=>{
  const f=await fixture(t), r=f.run();
  assert.equal(r.status,0,r.stderr);
  assert.deepEqual(await readFile(path.join(f.output,'7001.jpg')),jpeg(2));
  assert.equal(await f.count(),1);
  assert.ok(!r.stdout.includes(guid)&&!r.stderr.includes(guid));
});

test('valid existing image is skipped; explicit refresh replaces it atomically',async t=>{
  const f=await fixture(t);await mkdir(f.output);await writeFile(path.join(f.output,'7001.jpg'),jpeg());
  assert.equal(f.run().status,0);
  assert.equal(await f.count(),0);
  assert.deepEqual(await readFile(path.join(f.output,'7001.jpg')),jpeg());
  assert.equal(f.run(['--refresh']).status,0);
  assert.deepEqual(await readFile(path.join(f.output,'7001.jpg')),jpeg(2));
  assert.deepEqual(await readdir(f.output),['7001.jpg']);
});

for(const source of ['{broken', {questions:[]}, {questions:[{qId:'../private',HasImage:true}]},
  {questions:[{qId:7001,HasImage:true},{qId:7001,HasImage:true}]}, {questions:[{qId:7001,HasImage:'false'}]}]) {
  test('invalid source is rejected before any network or output directory',async t=>{
    const f=await fixture(t,{source}),r=f.run();
    assert.equal(r.status,1);assert.equal(await f.count(),0);
    assert.match(r.stderr,/Izvor/);
    await assert.rejects(readdir(f.output),{code:'ENOENT'});
  });
}

for(const response of ['http','html','throw']) test(`${response} failure preserves the existing image and has nonzero status`,async t=>{
  const f=await fixture(t,{response});await mkdir(f.output);await writeFile(path.join(f.output,'7001.jpg'),jpeg());
  const r=f.run(['--refresh']);
  assert.equal(r.status,1);
  assert.deepEqual(await readFile(path.join(f.output,'7001.jpg')),jpeg());
  assert.deepEqual(await readdir(f.output),['7001.jpg']);
  assert.equal(await f.count(),3);
  assert.ok(!r.stdout.includes(guid)&&!r.stderr.includes(guid),'errors must not echo private request URLs');
});

test('invalid/unknown/duplicate arguments never reach network or writes',async t=>{
  const f=await fixture(t);
  for(const args of [[],['--guid','not-a-guid'],['--guid',guid,'--wat'],['--guid',guid,'--guid',guid],['--guid',guid,'--out']]) {
    const r=f.run([],args);assert.equal(r.status,1);assert.equal(await f.count(),0);assert.match(r.stderr,/Upotreba:/);
  }
  await assert.rejects(readdir(f.output),{code:'ENOENT'});
});

test('non-image questions are ignored and a truncated existing image is redownloaded',async t=>{
  const f=await fixture(t,{source:{questions:[{qId:7001,HasImage:1},{qId:7002,HasImage:0}]}});
  await mkdir(f.output);await writeFile(path.join(f.output,'7001.jpg'),Buffer.from([255,216]));
  assert.equal(f.run().status,0);assert.equal(await f.count(),1);
  assert.deepEqual(await readdir(f.output),['7001.jpg']);
});

test('failed destination replacement leaves its contents intact and removes temporary files',async t=>{
  const f=await fixture(t);
  const blocked=path.join(f.output,'7001.jpg');
  await mkdir(blocked,{recursive:true});await writeFile(path.join(blocked,'keep.txt'),'synthetic original');
  const r=f.run(['--refresh']);
  assert.equal(r.status,1);assert.equal(await f.count(),3);
  assert.equal(await readFile(path.join(blocked,'keep.txt'),'utf8'),'synthetic original');
  assert.deepEqual(await readdir(f.output),['7001.jpg']);
});
