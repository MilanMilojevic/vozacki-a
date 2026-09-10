import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script=fileURLToPath(new URL('../harvest.mjs',import.meta.url));
const guid='00000000-0000-4000-8000-000000000001';
const original='synthetic original output\n';

async function fixture(t, mode='ok') {
  const dir=await mkdtemp(path.join(tmpdir(),'vozacki-harvest-'));
  t.after(async()=>{
    assert.equal(path.dirname(dir),path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('vozacki-harvest-'));
    await rm(dir,{recursive:true,force:true});
  });
  const output=path.join(dir,'output with spaces.json'), trace=path.join(dir,'trace.jsonl'), preload=path.join(dir,'mock.mjs');
  await writeFile(output,original);
  await writeFile(preload,`
    import fs from 'node:fs';
    import fsp from 'node:fs/promises';
    const mode=${JSON.stringify(mode)}, guid=${JSON.stringify(guid)};
    const log=value=>fs.appendFileSync(${JSON.stringify(trace)},JSON.stringify(value)+'\\n');
    const nativeTimer=setTimeout, nativeClear=clearTimeout, nativeTimeout=AbortSignal.timeout;
    globalThis.setTimeout=(fn,ms,...args)=>nativeTimer(fn,0,...args);
    AbortSignal.timeout=ms=>{log({timeout:ms});return nativeTimeout(mode==='timeout'?5:ms);};
    const nativeOpen=fsp.open;
    if(mode==='write-failure')fsp.open=async(...args)=>{
      const h=await nativeOpen(...args);
      return {writeFile:async text=>{await h.writeFile(text.slice(0,10));throw Error(guid);},close:()=>h.close()};
    };
    if(mode==='rename-failure')fsp.rename=async()=>{throw Error(guid);};
    let failures=0;
    globalThis.fetch=async(url,options)=>{
      const u=new URL(url),body=JSON.parse(options.body);
      if(u.origin!=='https://servisi.euprava.gov.rs'||body.id!==guid)throw Error('Unexpected synthetic request');
      const list=u.pathname.endsWith('GetQuestionSubcategoryList');
      const cid=list?Number(body.questionCategoryId):Number(body.questionSubcategoryId)-1000;
      log({request:list?'list':'questions',cid,signal:!!options.signal});
      if(cid===25&&!list) {
        if(mode==='throw')throw Error('synthetic private failure '+guid);
        if(mode==='timeout') {
          if(!options.signal)throw Error('Missing timeout');
          return new Promise((resolve,reject)=>{
            const keepAlive=nativeTimer(()=>reject(Error('No abort received')),1000);
            options.signal.addEventListener('abort',()=>{nativeClear(keepAlive);reject(options.signal.reason);},{once:true});
          });
        }
        if(mode==='http'||(mode==='transient'&&failures++===0))return new Response('error',{status:503});
        if(mode==='html')return new Response('<html>login '+guid+'</html>',{headers:{'content-type':'text/html'}});
        if(mode==='invalid-json')return new Response('{'+guid,{headers:{'content-type':'application/json'}});
      }
      let data;
      if(list) {
        const sub={Id:cid+1000,Description:'Synthetic subsection',QuestionCount:mode==='zero-sub'&&cid===38?0:1};
        data={list:[sub],totalCount:1};
        if(mode==='missing-list'&&cid===25)data={};
        if(mode==='malformed-list'&&cid===25)data.list={};
        if(mode==='all-empty')data={list:[],totalCount:0};
        if(mode==='empty-questions')sub.QuestionCount=0;
        if(mode==='duplicate-sub'&&cid===25){data.list.push({...sub});data.totalCount=2;}
        if(mode==='duplicate-sub-across-categories'&&cid===26)sub.Id=1025;
        if(mode==='sub-count-mismatch'&&cid===25)sub.QuestionCount=2;
        if(mode==='list-count-mismatch'&&cid===25)data.totalCount=2;
        if(mode==='invalid-count'&&cid===25)data.totalCount='1';
        if(mode==='without-counts'){delete sub.QuestionCount;delete data.totalCount;}
      } else {
        const q={qId:7000+cid,Text:'Synthetic question',Points:2,ChoicesReq:1,HasImage:false,
          Choices:[{paId:10000+cid*2,Text:'First',isCorrect:true},{paId:10001+cid*2,Text:'Second',isCorrect:false}]};
        data={practiceData:[q],totalCount:1};
        if(mode==='missing-data'&&cid===25)data={};
        if(mode==='malformed-data'&&cid===25)data.practiceData={};
        if(mode==='empty-questions'||(mode==='zero-sub'&&cid===38))data={practiceData:[],totalCount:0};
        if(mode==='duplicate-question'&&cid===26)q.qId=7025;
        if(mode==='bad-question'&&cid===25)q.qId='unsafe';
        if(mode==='wrong-category'&&cid===25)q.categoryId=26;
        if(mode==='wrong-subcategory'&&cid===25)q.subcategoryId=1026;
        if(mode==='bad-choice'&&cid===25)q.Choices[1].paId=q.Choices[0].paId;
        if(mode==='wrong-correct-count'&&cid===25)q.ChoicesReq=2;
        if(mode==='question-count-mismatch'&&cid===25)data.totalCount=2;
        if(mode==='api-error'&&cid===25)data.error='synthetic failure '+guid;
        if(mode==='api-unsuccessful'&&cid===25)data.success=false;
        if(mode==='echo'&&cid===25)q.Text='private echo '+guid;
        if(mode==='private-metadata'){q.practiceId=guid;q.Choices[0].practiceId=guid;}
        if(mode==='without-counts')delete data.totalCount;
      }
      return new Response(JSON.stringify(data),{headers:{'content-type':'application/json; charset=utf-8'}});
    };
  `);
  return {output,dir,
    run(args=[guid,'15',output]) {return spawnSync(process.execPath,['--import',pathToFileURL(preload).href,script,...args],{cwd:dir,encoding:'utf8',timeout:5000,windowsHide:true});},
    async events(){return (await readFile(trace,'utf8').catch(()=>'' )).trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));},
  };
}

for(const mode of ['ok','zero-sub','without-counts','private-metadata','transient'])test(`complete synthetic harvest succeeds: ${mode}`,async t=>{
  const f=await fixture(t,mode),r=f.run();assert.equal(r.status,0,r.stderr);
  const text=await readFile(f.output,'utf8'),data=JSON.parse(text);
  assert.equal(data.tree.length,14);assert.equal(data.questions.length,mode==='zero-sub'?13:14);
  assert.equal(data.questions[0].Choices.length,2);
  assert.ok(!text.includes(guid)&&!r.stdout.includes(guid)&&!r.stderr.includes(guid));
  assert.deepEqual((await readdir(f.dir)).filter(x=>x.endsWith('.tmp')),[]);
  if(mode==='transient')assert.equal((await f.events()).filter(x=>x.request==='questions'&&x.cid===25).length,2);
});

for(const mode of ['throw','http','timeout','html','invalid-json','missing-list','malformed-list','missing-data','malformed-data','all-empty','empty-questions',
  'duplicate-sub','duplicate-sub-across-categories','duplicate-question','bad-question','wrong-category','wrong-subcategory','bad-choice','wrong-correct-count',
  'sub-count-mismatch','list-count-mismatch','invalid-count','question-count-mismatch','api-error','api-unsuccessful','echo','write-failure','rename-failure']) {
  test(`invalid or interrupted harvest preserves old output: ${mode}`,async t=>{
    const f=await fixture(t,mode),r=f.run();assert.equal(r.status,1,r.stderr);
    assert.equal(await readFile(f.output,'utf8'),original);
    assert.deepEqual((await readdir(f.dir)).filter(x=>x.endsWith('.tmp')),[]);
    assert.ok(!r.stdout.includes(guid)&&!r.stderr.includes(guid),'private identifier must not appear in errors');
    if(['throw','http','timeout','html','invalid-json'].includes(mode)) {
      assert.equal((await f.events()).filter(x=>x.request==='questions'&&x.cid===25).length,3);
    }
    if(mode==='timeout')assert.ok((await f.events()).some(x=>x.timeout===30000));
  });
}

test('invalid arguments cause no requests and leave output unchanged',async t=>{
  const f=await fixture(t);
  for(const args of [[],['bad'],[guid,'other',f.output],[guid,'15',f.output,'extra'],
    [guid,'15',''],[guid,'15',f.dir],[guid,'15',path.join(f.dir,'missing','out.json')]]) {
    const r=f.run(args);assert.equal(r.status,1);assert.equal((await f.events()).length,0);
    assert.equal(await readFile(f.output,'utf8'),original);assert.ok(!r.stderr.includes(guid));
  }
});

test('default output is relative to the requested working directory; Cyrillic remains supported',async t=>{
  const f=await fixture(t),r=f.run([guid]);
  assert.equal(r.status,0,r.stderr);
  assert.equal(JSON.parse(await readFile(path.join(f.dir,'base.json'),'utf8')).languageId,'15');
  assert.equal(await readFile(f.output,'utf8'),original);
  const c=f.run([guid,'9',f.output]);assert.equal(c.status,0,c.stderr);
  assert.equal(JSON.parse(await readFile(f.output,'utf8')).languageId,'9');
});

test('public source validation rejects duplicate categories and mismatched tree counts',async()=>{
  const {validateSource}=await import('../harvest.mjs');
  const source={tree:[{categoryId:25,subs:[{id:1025,desc:'Synthetic subsection',n:1}]}],
    questions:[{qId:7025,categoryId:25,subcategoryId:1025,Text:'Synthetic question',Points:2,ChoicesReq:1,HasImage:false,
      Choices:[{paId:10050,Text:'First',isCorrect:true},{paId:10051,Text:'Second',isCorrect:false}]}]};
  assert.doesNotThrow(()=>validateSource(source));
  source.tree.push({categoryId:25,subs:[]});
  assert.throws(()=>validateSource(source),/Neispravan|Ponovljen/);
  source.tree.pop();source.tree[0].subs[0].n=2;
  assert.throws(()=>validateSource(source),/Neispravan|Ponovljen/);
});
