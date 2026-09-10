// Playwright CLI on isolated localhost:18764/:18953; ?historyFile=file:///.../output/history-preview-v158/index.html.
// Synthetic records in fresh BrowserContexts only. All caller storage remains untouched.
async(page)=>{
  const base=await page.evaluate(()=>new URLSearchParams(location.search).get('historyFile')||location.href.split(/[?#]/)[0]);
  if(!/^http:\/\/localhost:(18764|18953)\//.test(base)&&!/^file:\/\/\/.*\/output\/history-preview-v158\/index\.html$/.test(base))throw Error('Use isolated history fixture');
  const http=base.startsWith('http:'),origin=http?await page.evaluate(b=>new URL(b).origin,base):'',browser=page.context().browser(),results=[];
  const assert=(v,m)=>{if(!v)throw Error(m);},ready=async p=>{await p.locator('.view.active').waitFor();if(http)await p.waitForFunction(()=>!!window.__dev);};
  async function test(name,fn,opts={}){
    const c=await browser.newContext({serviceWorkers:'block',viewport:{width:opts.width||390,height:844}}),errors=[];c.setDefaultTimeout(3500);
    c.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
    await c.route('**/*',r=>(http?r.request().url().startsWith(origin+'/'):r.request().url().startsWith('file:'))?r.continue():r.abort());
    await c.addInitScript(opts=>{
      if(!/^(https?:|file:)$/.test(location.protocol))return;
      if(opts.dnt)Object.defineProperty(navigator,'doNotTrack',{value:'1'});
      const digest=crypto.subtle?.digest.bind(crypto.subtle);
      window.__hashFor=async r=>{
        const text=JSON.stringify(['vozacki-a-review-v1',r.d,r.score,r.total,!!r.passed,[...(r.wrong||[])].sort((a,b)=>a-b),Array.isArray(r.qs)?r.qs.map(q=>[q.id,[...q.ch].sort((a,b)=>a-b)]):null]);
        return [...new Uint8Array(await digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
      };
      if(opts.crypto==='missing')Object.defineProperty(crypto,'subtle',{value:undefined});
      if(opts.crypto==='reject')crypto.subtle.digest=()=>Promise.reject(Error('Synthetic digest failure'));
      window.__hashWaiters=[];
      if(opts.crypto==='delay')crypto.subtle.digest=(...a)=>new Promise((resolve,reject)=>__hashWaiters.push(()=>digest(...a).then(resolve,reject)));
      window.__releaseHashes=()=>{const waits=__hashWaiters.splice(0);waits.forEach(f=>f());};
      let bank;Object.defineProperty(window,'QUIZ',{configurable:true,get:()=>bank,set:value=>{
        bank=value;
        if(!localStorage.getItem('history-fixture')){
          const first=value.questions[0],image=value.questions.find(q=>q.img&&q.id!==first.id),multi=value.questions.find(q=>q.req>1&&q.id!==first.id&&q.id!==image.id);
          const questions=[first,image,multi],sims=[];
          for(let n=0;n<(opts.many?500:8);n++){
            const qs=questions.map((q,i)=>({id:q.id,ch:n%2&&i===0?[q.ch.find(c=>!c.ok).id]:n%2&&i===2?[]:q.ch.filter(c=>c.ok).map(c=>c.id)}));
            const wrong=qs.filter((s,i)=>s.ch.length!==questions[i].ch.filter(c=>c.ok).length||!s.ch.every(id=>questions[i].ch.some(c=>c.id===id&&c.ok))).map(s=>s.id);
            const total=questions.reduce((n,q)=>n+q.pts,0),score=questions.reduce((n,q)=>n+(wrong.includes(q.id)?0:q.pts),0);
            sims.push({d:1700000000000+Math.floor(n/2)*86400000,score,total,passed:score>=Math.ceil(total*.85),wrong,qs});
          }
          if(opts.legacy){sims[0]={d:1700000000000,score:2,total:98,passed:false,wrong:[questions[0].id]};}
          if(opts.inconsistent)sims[0].qs[0].ch=[];
          if(opts.duplicate)sims.push(JSON.parse(JSON.stringify(sims[0])));
          localStorage.setItem('vozackiA.v1',opts.bad==='shape'?'[]':opts.bad?'invalid synthetic JSON':JSON.stringify({q:{},sims,script:opts.script||'l',theme:opts.theme||'light',fs:1.25,tour:1,guide:1,noUpd:1}));
          if(!opts.noSim)localStorage.setItem('vozackiA.sim',JSON.stringify({v:1,d:Date.now()+1800000,i:3,r:0,qs:value.questions.slice(0,41).map(q=>({id:q.id,o:q.ch.map(c=>c.id),c:[],m:0}))}));
          localStorage.setItem('history-fixture','1');
        }
        window.__ops=[];
        if(opts.bad==='unavailable'){const get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k==='vozackiA.v1')throw Error('Synthetic storage failure');return get.call(this,k);};}
      }});
      window.__ops=[];
      for(const name of ['setItem','removeItem','clear']){const fn=Storage.prototype[name];Storage.prototype[name]=function(...a){__ops.push(name);return fn.apply(this,a);};}
      const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...a)=>{__ops.push('idb');return open(...a);};
      window.showSaveFilePicker=async()=>{__ops.push('file');throw Error('Unexpected file picker');};
      if(navigator.locks){const request=navigator.locks.request.bind(navigator.locks);navigator.locks.request=(...a)=>{__ops.push('lock');return request(...a);};}
    },opts);
    try{await fn(c);assert(!errors.length,errors.join(' | '));results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:String(e)});}finally{await c.close();}
  }
  const capture=p=>p.evaluate(()=>{const get=k=>{try{return localStorage.getItem(k);}catch{return 'unavailable';}};if(window.__dev)window.__identity=__dev.S;return {s:window.__dev?JSON.stringify(__dev.S):null,raw:get('vozackiA.v1'),sim:get('vozackiA.sim'),ops:JSON.stringify(__ops)};});
  async function unchanged(p,before){
    if(http)assert(await p.evaluate(()=>__dev.S===__identity&&__dev.sim===null),'Preview changed state identity or resumed SIM');
    const after=await capture(p);assert(JSON.stringify(after)===JSON.stringify(before),'Preview mutated memory/raw progress/SIM or performed operations');
    assert(await p.locator('#btnSimAgain,#btnShareRes,.markBox input').count()===0,'Preview exposed writer/share actions');
  }
  const record=p=>p.evaluate(()=>window.__dev?__dev.S.sims[0]:JSON.parse(localStorage.getItem('vozackiA.v1')).sims[0]);
  const address=async(p,index=0)=>base+'?preview=1#/pregled/h/'+await p.evaluate(index=>__hashFor((window.__dev?__dev.S:JSON.parse(localStorage.getItem('vozackiA.v1'))).sims[index]),index);
  const preview=async(c,index=0)=>{const p=await c.newPage();await p.goto(base+'?preview=1#/sva');await ready(p);await p.goto(await address(p,index));await p.locator('#reviewSnapshotNote').waitFor();return p;};
  await test('history rows are native exact-record anchors and preserve writer Enter + older focus',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);await p.locator('#btnHistOlder').click();
    const a=p.locator('#histOlder a.histBtn').last();await a.waitFor();const href=await a.getAttribute('href');assert(/\?preview=1#\/pregled\/h\/[a-f0-9]{64}$/.test(href),'History href is positional or missing');
    const source=p.url(),before=await capture(p),popup=c.waitForEvent('page');await a.click({button:'middle'});const other=await popup;await other.locator('#reviewSnapshotNote').waitFor();
    assert(p.url()===source&&JSON.stringify(await capture(p))===JSON.stringify(before),'Middle click changed writer');await other.close();
    await a.focus();await p.keyboard.press('Enter');await p.locator('#view-simresult.active .bigScore').waitFor();assert(await p.locator('#btnShareRes').isVisible(),'Writer PNG share action disappeared');
    await p.goBack();await p.locator('#histOlder').waitFor({state:'visible'});assert(await p.locator('#histOlder a.histBtn').last().evaluate(a=>a===document.activeElement),'Back lost older-history link focus');
  },{noSim:true});
  await test('legacy index and local URLs never guess an attempt',async c=>{
    for(const h of ['#/pregled/0','#/pregled/7','#/pregled/lokalni'])for(const marker of ['?preview=1','']){
      const p=await c.newPage();await p.goto(base+marker+h);await ready(p);assert(await p.locator('#reviewUnavailable').isVisible(),'Legacy address guessed an indexed attempt');assert(await p.locator('#simResultCard .bigScore').count()===0,'Legacy route displayed a result');await p.close();
    }
  },{noSim:true});
  await test('identical duplicate records have one content address and unique focus targets',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);await p.locator('#btnHistOlder').click();
    const old=p.locator('#histOlder a.histBtn').last();await old.waitFor();const href=await old.getAttribute('href');
    const ids=await p.locator('#simHistory a.histBtn').evaluateAll((links,href)=>links.filter(a=>a.getAttribute('href')===href).map(a=>a.id),href);
    assert(ids.length===2&&new Set(ids).size===2,'Identical records lost their common address or have duplicate DOM ids');
    await old.focus();await p.keyboard.press('Enter');await p.locator('.bigScore').waitFor();await p.goBack();await p.locator('#histOlder').waitFor({state:'visible'});
    assert(await p.evaluate(href=>document.activeElement?.getAttribute('href')===href,href),'Duplicate record lost equivalent focus target');
    const q=await c.newPage();await q.goto(http?href.replace('?preview=1',''):href);await q.locator('#reviewSnapshotNote').waitFor();
    if(http)assert(await q.evaluate(()=>__dev.rezimPisanja==='reader'),'Ordinary second-tab review did not stay a reader');
    const before=await capture(q);await q.locator('.pregledNaslov').first().click();await unchanged(q,before);
  },{duplicate:true,noSim:true});
  for(const script of ['l','c'])for(const theme of ['light','dark'])await test(script+'/'+theme+' complete preview preserves exact choices, local expansion and data at320',async c=>{
    const p=await preview(c,1),before=await capture(p),rec=await p.evaluate(()=>JSON.parse(localStorage.getItem('vozackiA.v1')).sims[1]);
    if(http)await p.evaluate(()=>{const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}};freeze(__dev.S);});
    assert((await p.locator('.bigScore').innerText()).startsWith(rec.score+' / '+rec.total),'Stored summary was recomputed');
    await p.locator('.pregledNaslov').first().click();assert(await p.locator('.chipYourBad').count()===1,'Actual wrong choice ID was not displayed');
    await p.locator('#simWrongList > .card > button.secondary').click();
    assert(await p.locator('.pregledStavka').evaluateAll((cards,rec)=>cards.every(card=>{
      const id=+card.dataset.reviewKey.split(':')[0],q=QUIZ.questions.find(q=>q.id===id),saved=rec.qs.find(q=>q.id===id);
      return [...card.querySelectorAll('.choice.rev')].every((row,i)=>!!row.querySelector('.chipYourOk,.chipYourBad')===saved.ch.includes(q.ch[i].id));
    }),rec),'Choice chips do not match actual stored choice IDs');
    const image=p.locator('.pregledStavka .qImgBtn').first();await image.scrollIntoViewIfNeeded();
    await p.waitForFunction(()=>document.querySelector('.pregledStavka .qImgBtn img')?.naturalWidth>0);
    await image.focus();await p.keyboard.press('Enter');await p.locator('#imgZoom').waitFor();await p.locator('[role="dialog"] button').first().waitFor();await p.keyboard.press('Escape');
    assert(await p.locator('[role="dialog"]').count()===0&&await image.evaluate(a=>a===document.activeElement),'Historical image zoom did not close or return focus');
    await p.locator('#btnScript').click();assert(await p.locator('.pregledNaslov').first().getAttribute('aria-expanded')==='true','Script redraw lost opened detail');
    const toggle=p.locator('#simWrongList > .card > button.secondary');
    assert(/^(Zatvori sva pitanja|Затвори сва питања)$/.test(await toggle.innerText()),'Restored all-open state says Open all');
    await toggle.click();assert(await p.locator('.pregledNaslov[aria-expanded="true"]').count()===0,'Close all caption did not close all');
    for(const row of await p.locator('.pregledNaslov').all())await row.click();
    assert(/^(Zatvori sva pitanja|Затвори сва питања)$/.test(await toggle.innerText()),'Individual opens did not update aggregate caption');
    await p.locator('#donjaNav [data-nav="learn"]').click();await p.goBack();await p.locator('.pregledNaslov').first().waitFor();assert(await p.locator('.pregledNaslov').first().getAttribute('aria-expanded')==='true','Back lost opened detail');
    assert(/^(Zatvori sva pitanja|Затвори сва питања)$/.test(await toggle.innerText()),'Back restored cards but lost the matching aggregate caption');
    await p.locator('#btnTheme').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Review overflows320');await unchanged(p,before);
    await p.reload();await p.locator('#reviewSnapshotNote').waitFor();assert((await p.locator('.bigScore').innerText()).startsWith(rec.score+' / '+rec.total),'Reload selected another record');assert(await p.evaluate(()=>__ops.length===0),'Preview reload wrote data');
  },{script,theme,width:320});
  for(const type of ['legacy','inconsistent'])await test(type+' detail remains neutral without fabricated choices',async c=>{
    const p=await preview(c),before=await capture(p),rec=await record(p);assert((await p.locator('.bigScore').innerText()).startsWith(rec.score+' / '+rec.total),'Legacy totals changed');
    assert(await p.locator('#simResultCard table.stats').count()===0,'Inconsistent details created category scores');
    if(await p.locator('.pregledNaslov').count())await p.locator('.pregledNaslov').first().click();assert(await p.locator('.chipYourOk,.chipYourBad').count()===0,'Lost legacy choices invented');await unchanged(p,before);
  },{[type]:true});
  await test('key survives index shift, distinguishes equal timestamps and fails after removal',async c=>{
    const p=await preview(c),url=p.url(),before=await record(p),other=await address(p,1);assert(url!==other,'Different attempts with equal timestamps share a key');
    await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vozackiA.v1'));s.sims.unshift({...s.sims[7],d:1600000000000});localStorage.setItem('vozackiA.v1',JSON.stringify(s));});
    await p.reload();await p.locator('#reviewSnapshotNote').waitFor();assert((await p.locator('.bigScore').innerText()).startsWith(before.score+' / '+before.total),'Index shift changed the selected attempt');
    await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vozackiA.v1'));s.sims.splice(1,1);localStorage.setItem('vozackiA.v1',JSON.stringify(s));});await p.reload();await p.locator('#reviewUnavailable').waitFor();assert(await p.locator('.bigScore').count()===0,'Removed record was replaced by its former neighbor');
  });
  for(const failure of ['json','shape','unavailable'])await test(failure+' saved state cannot fabricate review',async c=>{
    for(const marker of ['?preview=1','']){const p=await c.newPage();await p.goto(base+marker+'#/pregled/h/'+'a'.repeat(64));await ready(p);if(!marker)await p.evaluate(h=>{location.hash=h;},'#/pregled/h/'+'a'.repeat(64));await p.locator('#reviewUnavailable').waitFor();assert(await p.locator('.bigScore').count()===0,'Bad state fabricated result');await p.close();}
  },{bad:failure});
  for(const crypto of ['missing','reject'])await test(crypto+' digest keeps writer local review and refuses fake native href',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);await p.locator('#historyLinkUnavailable').waitFor();assert(await p.locator('#simHistory a.histBtn[href]').count()===0,'Failed hash left a native href');
    await p.locator('#simHistory button.histBtn:enabled').first().click();await p.locator('.bigScore').waitFor();assert(p.url().endsWith('#/pregled/lokalni')&&await p.locator('#btnShareRes').isVisible(),'Writer lost local review/share on hash failure');
    const q=await c.newPage();await q.goto(base+'?preview=1#/pregled/h/'+'a'.repeat(64));await q.locator('#reviewUnavailable').waitFor();assert(await q.locator('.bigScore').count()===0,'Hash failure guessed a review');
  },{crypto,noSim:true});
  await test('late digest cannot repaint after leaving the route',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/sva');await ready(p);const url=await address(p);await p.goto(url);await p.locator('#reviewLoading').waitFor();const before=await capture(p);
    await p.locator('#donjaNav [data-nav="learn"]').click();await p.evaluate(()=>__releaseHashes());await p.waitForTimeout(100);
    assert(p.url().endsWith('#/sva')&&await p.locator('#view-browse.active').count()===1,'Stale promise repainted another route');await unchanged(p,before);
  },{crypto:'delay'});
  await test('late first route digest cannot replace a newer exact attempt',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/sva');await ready(p);const first=await address(p,0),second=await address(p,1);
    await p.goto(first);await p.locator('#reviewLoading').waitFor();const before=await capture(p);
    await p.evaluate(url=>{location.hash=url.slice(url.indexOf('#'));},second);await p.waitForTimeout(60);await p.evaluate(()=>__releaseHashes());await p.locator('#reviewSnapshotNote').waitFor();
    const rec=await p.evaluate(()=>JSON.parse(localStorage.getItem('vozackiA.v1')).sims[1]);assert(p.url()===second&&(await p.locator('.bigScore').innerText()).startsWith(rec.score+' / '+rec.total),'Late resolution selected the wrong attempt');await unchanged(p,before);
  },{crypto:'delay'});
  if(http){
    for(const dnt of [false,true])await test('intercepted HTTPS analytics '+(dnt?'respects DNT':'never exports saved-record identity'),async c=>{
      let scripts=0;
      await c.route('https://history.invalid/**',async r=>{const path=r.request().url().slice('https://history.invalid'.length);await r.fulfill({response:await c.request.get(origin+path)});});
      await c.route('https://gc.zgo.at/count.js',r=>{scripts++;return r.fulfill({contentType:'text/javascript',body:'window.__counts=[]; window.goatcounter.count=v=>window.__counts.push(v.path);'});});
      const p=await c.newPage();await p.goto('https://history.invalid/index.html');await p.locator('#simHistory a.histBtn').first().waitFor();
      if(!dnt)await p.waitForFunction(()=>window.__counts?.length>0);
      await p.locator('#simHistory a.histBtn').first().click();await p.locator('.bigScore').waitFor();
      const review=p.url(),q=await c.newPage();await q.goto(review.replace('#','?preview=1#'));await q.locator('#reviewSnapshotNote').waitFor();
      for(const h of ['#/pregled/0','#/pregled/lokalni','#/pregled/h/'+'a'.repeat(64)]){await q.evaluate(h=>{location.hash=h;},h);await q.locator('#reviewUnavailable').waitFor();}
      await q.locator('#donjaNav [data-nav="learn"]').click();await q.locator('#view-browse.active').waitFor();await q.waitForTimeout(100);
      if(dnt){assert(scripts===0,'DNT still loaded analytics');return;}
      const counts=await p.evaluate(()=>__counts),other=await q.evaluate(()=>__counts);
      assert(counts.includes('/#/')&&counts.includes('/#/pregled')&&other.includes('/#/sva'),'Expected page categories were not counted');
      assert([...counts,...other].every(path=>!path.includes('/pregled/')&&!/[a-f0-9]{64}/.test(path)),'Analytics exported per-attempt fingerprint');
      assert(other.filter(path=>path==='/#/pregled').length>=4,'Initial/native review visits were not normalized');
    },{noSim:true,dnt});
    await test('real cap preserves surviving history focus and refuses a pruned captured review',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);await p.locator('#btnHistOlder').click();
      const old=p.locator('#histOlder a.histBtn').last();await old.waitFor();await old.click();await p.locator('.bigScore').waitFor();
      await p.locator('#simResultCard [data-nav="home"]').click();await p.locator('#btnHistOlder').click();
      const surviving=p.locator('#histOlder a.histBtn').nth(10);await surviving.waitFor();const href=await surviving.getAttribute('href');
      await surviving.focus();await p.keyboard.press('Enter');await p.locator('.bigScore').waitFor();
      await p.locator('#donjaNav [data-nav="home"]').click();await p.locator('.menuBtn[data-nav="sim"]').click();await p.locator('#view-sim.active').waitFor();
      p.once('dialog',d=>d.accept());await p.locator('#btnFinishSim').click();await p.locator('.bigScore').waitFor();
      assert(await p.evaluate(()=>__dev.S.sims.length===500&&__dev.sim===null),'Real finish did not prune cap');const before=await capture(p);
      await p.evaluate(()=>history.go(-3));await p.locator('.bigScore').waitFor();await p.goBack();await p.locator('#histOlder').waitFor({state:'visible'});
      assert(await p.evaluate(href=>document.activeElement?.getAttribute('href')===href,href),'Back lost surviving record focus after its index shifted');
      await p.goBack();await p.locator('#reviewUnavailable').waitFor();assert(await p.locator('.bigScore').count()===0,'Captured pruned review rendered deleted history');
      assert(JSON.stringify(await capture(p))===JSON.stringify(before),'History traversal replayed progress or SIM');
    },{many:true,noSim:true});
    await test('late home hashes cannot revive history after real reset',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);assert(await p.locator('#simHistory a.histBtn[href]').count()===0,'Unresolved rows already have native hrefs');
      await p.locator('#btnPodesavanja').click();p.once('dialog',d=>d.accept());await p.locator('#btnReset').click();await p.waitForFunction(()=>__dev.S.sims.length===0);const before=await capture(p);
      await p.evaluate(()=>__releaseHashes());await p.waitForTimeout(100);assert(await p.locator('#simHistory .histBtn').count()===0&&p.url().endsWith('#/'),'Old hashes repainted reset history');assert(JSON.stringify(await capture(p))===JSON.stringify(before),'Late hashes changed reset state');
    },{crypto:'delay',noSim:true});
    for(const role of ['conflict','retired'])await test('late hashes respect '+role+' freeze',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);
      await p.evaluate(role=>{if(role==='retired')window.dispatchEvent(new PageTransitionEvent('pagehide'));else{const raw=JSON.stringify({q:{},sims:[]});localStorage.setItem('vozackiA.v1',raw);window.dispatchEvent(new StorageEvent('storage',{key:'vozackiA.v1',newValue:raw}));}},role);
      await p.waitForFunction(role=>__dev.rezimPisanja===role,role);const before=await capture(p),url=p.url();await p.evaluate(()=>__releaseHashes());await p.waitForTimeout(100);
      assert(await p.locator('#simHistory a.histBtn[href]').count()===0&&p.url()===url,'Late hashes changed a frozen view or inserted native links');assert(JSON.stringify(await capture(p))===JSON.stringify(before),'Late hashes changed frozen state');
    },{crypto:'delay',noSim:true});
    await test('fresh finish is immediate, keeps writer actions and replaces only its local history entry',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);await p.locator('.menuBtn[data-nav="sim"]').click();await p.locator('#view-sim.active').waitFor();
      p.once('dialog',d=>d.accept());await p.locator('#btnFinishSim').click();await p.locator('.bigScore').waitFor();
      assert(p.url().endsWith('#/pregled/lokalni')&&await p.locator('#btnShareRes').isVisible()&&await p.locator('#btnSimAgain').isVisible(),'Fresh result waited for hash or lost writer actions');
      const before=await capture(p),length=await p.evaluate(()=>history.length);assert(await p.evaluate(()=>__dev.S.sims.length===9&&__dev.sim===null&&localStorage.getItem('vozackiA.sim')===null),'Finish did not close/save one exam');
      await p.evaluate(()=>__releaseHashes());await p.waitForURL(/#\/pregled\/h\/[a-f0-9]{64}$/);assert(await p.evaluate(()=>history.length)===length,'Canonical address inserted a second history entry');assert(JSON.stringify(await capture(p))===JSON.stringify(before),'Hashing fresh result recorded answers again');
      await p.goBack();await p.locator('#view-home.active').waitFor();assert(await p.evaluate(()=>__dev.sim===null&&__dev.S.sims.length===9&&localStorage.getItem('vozackiA.sim')===null),'Back revived the finished exam');
      await p.goForward();await p.locator('.bigScore').waitFor();assert(await p.locator('#btnSimAgain').isVisible()&&await p.evaluate(()=>__dev.S.sims.length===9),'Forward lost the fresh result or replayed it');
      const url=p.url().replace('#','?preview=1#'),q=await c.newPage();await q.goto(url);await q.locator('#reviewLoading').waitFor();const state=await capture(q);await q.evaluate(()=>__releaseHashes());await q.locator('#reviewSnapshotNote').waitFor();await unchanged(q,state);await q.close();
      await p.locator('#btnSimAgain').click();await p.locator('#view-sim.active').waitFor();assert(await p.evaluate(()=>__dev.S.sims.length===9&&__dev.sim!==null),'Fresh new-exam action changed history');
    },{crypto:'delay',noSim:true});
    await test('native saved attempt opened during active exam cannot alter source SIM',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);const a=p.locator('#simHistory a.histBtn').first();await a.waitFor();const href=await a.getAttribute('href');
      await p.locator('.menuBtn[data-nav="sim"]').click();await p.locator('#view-sim.active').waitFor();const before=await capture(p);let dialogs=0;p.on('dialog',d=>{dialogs++;d.dismiss();});
      const q=await c.newPage();await q.goto(href);await q.locator('#reviewSnapshotNote').waitFor();const state=await capture(q);await q.locator('.pregledNaslov').first().click();await unchanged(q,state);
      assert(p.url().endsWith('#/sim')&&dialogs===0&&JSON.stringify(await capture(p))===JSON.stringify(before),'Saved review popup altered or abandoned source exam');
    },{noSim:true});
    await test('a changed record cannot reuse an already-created writer href',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);const a=p.locator('#simHistory a.histBtn').first();await a.waitFor();await p.evaluate(()=>{__dev.S.sims.at(-1).score++;});
      await a.click();await p.locator('#reviewUnavailable').waitFor();assert(await p.locator('.bigScore').count()===0,'Old href displayed newly changed contents');
    },{noSim:true});
    await test('hash lookup and rendering work with deeply frozen loaded S',async c=>{
      const p=await c.newPage();await p.goto(base+'?preview=1#/sva');await ready(p);const url=await address(p);
      await p.evaluate(()=>{const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}};freeze(__dev.S);});const before=await capture(p);
      await p.evaluate(url=>{location.hash=url.slice(url.indexOf('#'));},url);await p.locator('#reviewSnapshotNote').waitFor();await p.locator('.pregledNaslov').first().click();await unchanged(p,before);
    });
  }
  await test('normalization cap makes a removed old record unavailable instead of selecting index zero',async c=>{
    const p=await preview(c);await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vozackiA.v1')),template=s.sims.at(-1);for(let i=0;i<500;i++)s.sims.push({...template,d:1500000000000+i});localStorage.setItem('vozackiA.v1',JSON.stringify(s));});
    await p.reload();await p.locator('#reviewUnavailable').waitFor();assert(await p.locator('.bigScore').count()===0,'Pruned record silently selected another attempt');
  });
  const result={passed:results.every(r=>r.pass),cases:results.length,results};if(!result.passed)throw Error(JSON.stringify(result));return result;
}
