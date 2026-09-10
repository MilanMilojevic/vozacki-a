// Playwright CLI: open isolated localhost:18764, run-code --filename tools/tests/statistics-preview.browser.js.
// File check: caller query ?statisticsFile=file:///.../output/stats-preview-runtime/index.html.
// Fresh contexts only. Seeded progress/SIM are synthetic; never attach an existing browser profile.
async (page) => {
  const base=await page.evaluate(()=>new URLSearchParams(location.search).get('statisticsFile') || location.href.split(/[?#]/)[0]);
  if(!/^http:\/\/localhost:18764\//.test(base) && !/^file:\/\/\/.*\/output\/stats-preview-runtime\/index\.html$/.test(base)) throw Error('Use the isolated statistics test runtime');
  const http=base.startsWith('http:'), browser=page.context().browser(), results=[], screenshots=[];
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const ready=async p=>{await p.locator('.view.active').waitFor();if(http)await p.waitForFunction(()=>!!window.__dev);};
  async function test(name,fn,opts={}) {
    const c=await browser.newContext({serviceWorkers:'block',viewport:{width:opts.width||390,height:844}});
    c.setDefaultTimeout(2500); const errors=[];
    c.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
    await c.route('**/*',r=>/^(http:\/\/localhost:18764\/|file:)/.test(r.request().url())?r.continue():r.abort());
    await c.addInitScript(opts=>{
      if(!/^(http:|file:)$/.test(location.protocol))return;
      let bank;
      Object.defineProperty(window,'QUIZ',{configurable:true,get:()=>bank,set:value=>{
        bank=value;
        if(localStorage.getItem('stats-fixture')===null) {
          const q={};
          for(const item of value.questions.slice(0,opts.profile==='full'?undefined:opts.profile==='partial'?30:0)) q[item.id]={a:4,w:1,streak:1,marked:0};
          const state={q,script:opts.script||'l',theme:opts.theme||'light',fs:1.25,guide:1,tour:1,noUpd:1,
            dani:[{d:'2026-09-07',n:10,ok:8,novih:6,pon:4},{d:'2026-09-08',n:20,ok:15,novih:10,pon:10}]};
          localStorage.setItem('vozackiA.v1',opts.bad==='shape'?'[]':opts.bad?'synthetic invalid JSON':JSON.stringify(state));
          if(opts.pending)localStorage.setItem('vozackiA.sim',JSON.stringify({v:1,d:Date.now()+1800000,i:3,r:0,qs:value.questions.slice(0,41).map(q=>({id:q.id,o:q.ch.map(c=>c.id),c:[],m:0}))}));
          localStorage.setItem('stats-fixture','1');
        }
        window.__ops=[];
        if(opts.unavailable) {
          const get=Storage.prototype.getItem;
          Storage.prototype.getItem=function(key){if(key==='vozackiA.v1')throw Error('Synthetic storage read failure');return get.call(this,key);};
        }
      }});
      window.__ops=[];
      for(const name of ['setItem','removeItem','clear']) {
        const original=Storage.prototype[name];Storage.prototype[name]=function(...args){__ops.push(name);return original.apply(this,args);};
      }
      const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...args)=>{__ops.push('idb');return open(...args);};
      window.showSaveFilePicker=async()=>{__ops.push('file');throw Error('Unexpected file picker');};
      if(opts.noLocks)Object.defineProperty(navigator,'locks',{value:undefined});
      else if(navigator.locks) {const request=navigator.locks.request.bind(navigator.locks);navigator.locks.request=(...args)=>{__ops.push('lock');return request(...args);};}
    },opts);
    try {await fn(c);assert(!errors.length,errors.join(' | '));results.push({name,pass:true});}
    catch(e){results.push({name,pass:false,error:String(e)});}finally{await c.close();}
  }
  const capture=p=>p.evaluate(()=>{
    if(window.__dev)window.__statsIdentity=__dev.S;
    return {s:window.__dev?JSON.stringify(__dev.S):null,raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim'),ops:JSON.stringify(__ops)};
  });
  async function unchanged(p,before) {
    const after=await p.evaluate(()=>({s:window.__dev?JSON.stringify(__dev.S):null,raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim'),ops:JSON.stringify(__ops)}));
    assert(JSON.stringify(after)===JSON.stringify(before),'Statistics changed memory, raw progress, pending SIM or performed operations');
    if(http)assert(await p.evaluate(()=>__dev.S===__statsIdentity && __dev.sim===null),'State identity changed or preview started SIM');
    assert(await p.locator('#btnPodesavanja,#bStart,#btnReset,#fileImport,.markBox input').count()===0,'Writer controls exposed in preview');
  }
  for(const profile of ['empty','partial','full']) await test(profile+' profile renders real statistics without writes',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/stats');await ready(p);const before=await capture(p);
    assert(await p.locator('#view-stats.active').count()===1,'Statistics route fell back to question catalog');
    assert(await p.locator('#statsSnapshotNote').isVisible(),'Loaded-snapshot explanation missing');
    const total=await p.locator('#statsBars .catTotal .catCnt').innerText();
    assert(total.startsWith(profile==='empty'?'0/':profile==='partial'?'30/':(await p.evaluate(()=>QUIZ.questions.length))+'/'),'Wrong coverage count');
    assert(await p.locator('#readyCard .statLink a').count()===(profile==='full'?5:0),'Wrong complete/missing-model branch');
    if(profile!=='full') {
      await p.locator('#readyCard a[data-nav="learn"]').click();await p.locator('#view-browse.active').waitFor();
      await p.goBack();await p.locator('#view-stats.active').waitFor();
    }
    await p.locator('#statsBars .catChevBtn').first().click();
    await p.locator('#btnDani').click();await p.locator('#daniTelo svg').focus();await p.keyboard.press('Enter');
    await p.locator('[role="dialog"] .zoomAlat.gore button').waitFor();await p.keyboard.press('Escape');
    assert(await p.locator('[role="dialog"]').count()===0 && await p.locator('#daniTelo svg').evaluate(s=>s===document.activeElement),'Daily chart zoom failed to close or restore focus');
    await p.locator('#btnScript').click();await p.locator('#btnTheme').click();
    assert(await p.locator('#btnDani').getAttribute('aria-expanded')==='true','Script redraw collapsed daily history');
    assert(await p.locator('#statsBars .catRow.open').count()===1,'Script redraw collapsed category');
    await unchanged(p,before);
    if(profile==='full') {
      const link=p.locator('#readyCard .statLink a').first();await link.focus();await p.keyboard.press('Enter');
      await p.locator('#view-browse.active').waitFor();await unchanged(p,before);
      await p.goBack();await p.locator('#view-stats.active').waitFor();
      assert(await p.locator('#btnDani').getAttribute('aria-expanded')==='true' && await p.locator('#statsBars .catRow.open').count()===1,'Back lost local statistics expansion');
      await p.goForward();await p.locator('#view-browse.active').waitFor();await p.goBack();await p.locator('#view-stats.active').waitFor();
    }
    await unchanged(p,before);await p.reload();await ready(p);
    assert(await p.locator('#view-stats.active').count()===1,'Reload lost deterministic stats route');
    assert(await p.evaluate(()=>__ops.length===0),'Reload wrote data');
  },{profile,pending:true});
  await test('writer full-model recommendation is a real middle-click destination',async c=>{
    const p=await c.newPage();await p.goto(base+'#/stats');await ready(p);
    const a=p.locator('#readyCard .statLink a');assert(await a.count()===5,'Recommendation still has only direct browse row handlers');
    const source=p.url(),popup=c.waitForEvent('page');await a.first().click({button:'middle'});
    const preview=await popup;await ready(preview);
    assert(p.url()===source && preview.url().includes('preview=1#/sek/s'),'Middle click changed writer or lost native destination');
    assert(await preview.locator('#view-browse.active').count()===1 && await preview.locator('#bStart').count()===0,'Recommendation popup exposed writer section');
    assert(await preview.evaluate(()=>__ops.length===0),'Recommendation preview performed operations');
    await a.first().focus();const length=await p.evaluate(()=>history.length);await p.keyboard.press('Enter');
    await p.locator('#bStart').waitFor();assert(await p.evaluate(()=>history.length)===length+1,'Recommendation navigated twice');
    await p.goBack();await p.locator('#view-stats.active').waitFor();
  },{profile:'full'});
  await test('visible writer Home Statistics link opens a snapshot with real middle click',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);
    const before=await p.evaluate(()=>({url:location.href,raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim')}));
    const stats=p.locator('.menuBtn[data-nav="stats"]');assert(await stats.isVisible(),'Home Statistics link not visible');
    const popup=c.waitForEvent('page');await stats.click({button:'middle'});const q=await popup;await ready(q);
    assert(await q.locator('#view-stats.active').count()===1 && await q.locator('#statsSnapshotNote').isVisible(),'Home middle click did not open actual snapshot statistics');
    assert(q.url().includes('preview=1#/stats') && await q.evaluate(()=>__ops.length===0),'Home middle click lost safe preview destination');
    assert(await p.evaluate(b=>location.href===b.url && localStorage.getItem('vozackiA.v1')===b.raw && localStorage.getItem('vozackiA.sim')===b.sim,before),'Home middle click changed source or shared progress/SIM');
  },{profile:'partial'});
  for(const script of ['l','c'])for(const theme of ['light','dark'])await test('320px '+script+' '+theme+' stats expands without page overflow',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/stats');await ready(p);const before=await capture(p);
    assert(await p.locator('#view-stats.active').count()===1,'Stats missing');
    await p.locator('#statsBars .catChevBtn').first().click();await p.locator('#btnDani').click();
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Statistics overflows viewport');
    assert(await p.locator('#donjaNav [data-nav="stats"]').isVisible(),'Stats destination hidden in preview navigation');
    const screenshot='output/playwright/stats-preview-'+(http?'http':'file')+'-'+script+'-'+theme+'.png';
    await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:screenshot});screenshots.push(screenshot);
    await unchanged(p,before);
  },{profile:'full',width:320,script,theme,pending:true});
  for(const bad of ['json','shape'])await test(bad+' saved progress has an explicit unavailable state, no fabricated statistics',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/stats');await ready(p);const before=await capture(p);
    assert(await p.locator('#statsUnavailable').isVisible(),'Invalid progress presented default statistics or unrelated catalog');
    assert(await p.locator('#statsBars,.bigScore').count()===0,'Invalid progress fabricated statistics');
    await p.locator('#btnScript').click();await unchanged(p,before);
  },{bad});
  await test('unreadable storage does not fabricate a default statistics result',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/stats');await ready(p);
    assert(await p.locator('#statsUnavailable').isVisible() && await p.locator('#statsBars,.bigScore').count()===0,'Unreadable storage presented default statistics');
    await p.locator('#btnScript').click();await p.locator('#btnTheme').click();
    assert(await p.evaluate(()=>__ops.length===0),'Unavailable statistics attempted operations');
  },{unavailable:true});
  await test('ordinary recovery tab cannot navigate into fabricated default statistics',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);
    const before=await p.evaluate(()=>({raw:localStorage.getItem('vozackiA.v1'),ops:JSON.stringify(__ops)}));
    await p.evaluate(()=>{location.hash='#/stats';});await p.locator('#view-stats.active').waitFor();
    assert(await p.locator('#statsUnavailable').isVisible() && await p.locator('#statsBars,.bigScore').count()===0,'Recovery navigation fabricated default statistics');
    assert(await p.evaluate(b=>localStorage.getItem('vozackiA.v1')===b.raw && JSON.stringify(__ops)===b.ops,before),'Recovery navigation changed data or attempted operations');
  },{bad:'json'});
  await test('direct hash changes and separate history entries retain their own expanded panels',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/stats');await ready(p);const before=await capture(p);
    await p.locator('#statsBars .catChevBtn').first().click();await p.locator('#btnDani').click();
    await p.evaluate(()=>{location.hash='#/p/7921';});await p.locator('#view-question.active').waitFor();
    await p.locator('#donjaNav [data-nav="stats"]').click();await p.locator('#view-stats.active').waitFor();
    assert(await p.locator('#btnDani').getAttribute('aria-expanded')==='false' && await p.locator('#statsBars .catRow.open').count()===0,'New stats entry borrowed older accordion state');
    await p.goBack();await p.locator('#view-question.active').waitFor();await p.goBack();await p.locator('#view-stats.active').waitFor();
    assert(await p.locator('#btnDani').getAttribute('aria-expanded')==='true' && await p.locator('#statsBars .catRow.open').count()===1,'Older stats entry lost accordion state');
    await unchanged(p,before);
  },{profile:'full',pending:true});
  await test('explicit statistics preview does not require Web Locks',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/stats');await ready(p);const before=await capture(p);
    assert(await p.locator('#view-stats.active').count()===1,'No-lock preview lacks statistics');await unchanged(p,before);
  },{noLocks:true,profile:'partial',pending:true});
  if(http) {
    await test('initial reader uses loaded snapshot until explicit reload',async c=>{
      const writer=await c.newPage();await writer.goto(base+'#/p/7921');await ready(writer);
      const p=await c.newPage();await p.goto(base+'#/stats');await ready(p);const before=await capture(p);
      assert(await p.evaluate(()=>__dev.rezimPisanja==='reader'),'Expected initial reader');
      const count=await p.locator('#statsBars .catTotal .catCnt').innerText();
      await writer.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vozackiA.v1'));s.q={};localStorage.setItem('vozackiA.v1',JSON.stringify(s));});
      await p.locator('#btnScript').click();
      assert(await p.locator('#statsBars .catTotal .catCnt').innerText()===count,'Reader silently replaced loaded snapshot');
      assert(await p.evaluate(s=>JSON.stringify(__dev.S)===s && __dev.S===__statsIdentity && __dev.rezimPisanja==='reader',before.s),'Reader changed memory/role after writer update');
      assert(await p.evaluate(()=>__ops.length===1 && __ops[0]==='lock'),'Reader attempted writes');
      await p.reload();await ready(p);assert((await p.locator('#statsBars .catTotal .catCnt').innerText()).startsWith('0/'),'Explicit reload did not read new data');
      await writer.evaluate(raw=>localStorage.setItem('vozackiA.v1',raw),before.raw);
      await p.reload();await ready(p);const restored=await capture(p);
      assert(await p.locator('#statsBars .catTotal .catCnt').innerText()===count,'Restored synthetic fixture did not reload');
      await writer.evaluate(()=>localStorage.removeItem('vozackiA.v1'));await p.locator('#btnScript').click();
      assert(await p.locator('#statsBars .catTotal .catCnt').innerText()===count,'Removing stored progress silently replaced reader snapshot');
      assert(await p.evaluate(s=>__dev.S===__statsIdentity && JSON.stringify(__dev.S)===s && localStorage.getItem('vozackiA.v1')===null && __dev.rezimPisanja==='reader',restored.s),'Removal mutated/promoted reader or restored old bytes');
      await p.reload();await ready(p);
      assert((await p.locator('#statsBars .catTotal .catCnt').innerText()).startsWith('0/') && await p.locator('#statsSnapshotNote').isVisible(),'Reload after removal did not display the now-empty saved profile');
      assert(await p.evaluate(()=>localStorage.getItem('vozackiA.v1')===null && __ops.length===1 && __ops[0]==='lock'),'Reload after removal persisted defaults or acquired writer');
    },{profile:'partial'});
    await test('opening a copied statistics destination during exam leaves SIM untouched',async c=>{
      const p=await c.newPage();await p.goto(base);await ready(p);
      const statsHref=await p.locator('.menuBtn[data-nav="stats"]').getAttribute('href');
      await p.locator('.menuBtn[data-nav="sim"]').click();
      const before=await p.evaluate(()=>({raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim')}));
      assert(before.sim!==null,'Exam did not start');let dialogs=0;p.on('dialog',d=>{dialogs++;d.dismiss();});
      // The real exam deliberately hides navigation. Open its previously copied
      // native stats URL; do not force-click a hidden element or alter exam UI.
      const q=await c.newPage();await q.goto(statsHref);await ready(q);const previewBefore=await capture(q);
      assert(await q.locator('#view-stats.active').count()===1,'Exam popup lacks stats');
      await q.locator('#btnDani').click();await unchanged(q,previewBefore);
      assert(p.url().endsWith('#/sim') && dialogs===0,'Opening stats left exam or asked to abandon it');
      assert(await p.evaluate(b=>localStorage.getItem('vozackiA.v1')===b.raw && localStorage.getItem('vozackiA.sim')===b.sim,before),'Stats popup changed writer or pending SIM');
    });
  }
  const result={passed:results.filter(r=>r.pass).length,total:results.length,results,screenshots};
  if(result.passed!==result.total)throw Error(JSON.stringify(result));return result;
}
