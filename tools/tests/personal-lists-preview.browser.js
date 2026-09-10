// Playwright CLI on isolated localhost:18764 or :18951. Optional caller ?listsFile=file:///.../output/personal-lists-v156/index.html.
// All fixtures live in disposable contexts; no existing profile is touched.
async(page)=>{
  const base=await page.evaluate(()=>new URLSearchParams(location.search).get('listsFile')||location.href.split(/[?#]/)[0]);
  if(!/^http:\/\/localhost:(18764|18951)\//.test(base)&&!/^file:\/\/\/.*\/output\/personal-lists-v156\/index\.html$/.test(base))throw Error('Use the isolated personal-list fixture');
  const http=base.startsWith('http:'),origin=http?await page.evaluate(b=>new URL(b).origin,base):'',browser=page.context().browser(),results=[];
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const ready=async p=>{await p.locator('.view.active').waitFor();if(http)await p.waitForFunction(()=>!!window.__dev);};
  async function test(name,fn,opts={}){
    const c=await browser.newContext({serviceWorkers:'block',viewport:{width:opts.width||390,height:844}}),errors=[];
    c.setDefaultTimeout(3000);c.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
    await c.route('**/*',r=>(http?r.request().url().startsWith(origin+'/'):r.request().url().startsWith('file:'))?r.continue():r.abort());
    await c.addInitScript(opts=>{
      if(!/^(http:|file:)$/.test(location.protocol))return;
      let bank;Object.defineProperty(window,'QUIZ',{configurable:true,get:()=>bank,set:value=>{
        bank=value;
        if(!localStorage.getItem('personal-fixture')){
          const q={},ids=value.questions.map(q=>q.id),now=Date.now(),day=86400000;
          const r=(a,w,streak,last=now,due=0,marked=0)=>({a,w,streak,last,due,marked});
          if(!opts.empty&&!opts.large&&!opts.stale){
            q[ids[0]]=r(3,2,0,now-day,now-day,1);
            q[ids[1]]=r(4,1,2,now-day,now-day);
            q[ids[2]]=r(1,0,1,now-day); // correct first answer, legacy due = last + three days
            q[ids[3]]=r(2,1,1,now,now+day);
            q[ids[4]]=r(4,1,3,now-30*day);
            q[ids[5]]=r(0,0,0,0,0,1); // mark without ever answering
            q[ids[6]]=r(2,0,2);
          }
          if(opts.stale)q[ids[4]]=r(4,1,3,now-30*day);
          if(opts.large)for(const id of ids.slice(0,70))q[id]=r(1,1,0,now-day,now-day,1);
          localStorage.setItem('vozackiA.v1',opts.bad==='shape'?'[]':opts.bad?'invalid synthetic JSON':JSON.stringify({q,script:opts.script||'l',theme:opts.theme||'light',fs:1.25,tour:1,guide:1,noUpd:1}));
          if(!opts.noSim)localStorage.setItem('vozackiA.sim',JSON.stringify({v:1,d:now+1800000,i:3,r:0,qs:value.questions.slice(0,41).map(q=>({id:q.id,o:q.ch.map(c=>c.id),c:[],m:0}))}));
          if(opts.absent)localStorage.removeItem('vozackiA.v1');
          localStorage.setItem('personal-fixture','1');
        }
        window.__ops=[];
        if(opts.unavailable){const get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k==='vozackiA.v1')throw Error('Synthetic read failure');return get.call(this,k);};}
      }});
      window.__ops=[];
      for(const name of ['setItem','removeItem','clear']){const f=Storage.prototype[name];Storage.prototype[name]=function(...a){__ops.push(name);return f.apply(this,a);};}
      const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...a)=>{__ops.push('idb');return open(...a);};
      window.showSaveFilePicker=async()=>{__ops.push('file');throw Error('Unexpected picker');};
      if(opts.noLocks)Object.defineProperty(navigator,'locks',{value:undefined});
      else if(navigator.locks){const f=navigator.locks.request.bind(navigator.locks);navigator.locks.request=(...a)=>{__ops.push('lock');return f(...a);};}
    },opts);
    try{await fn(c);assert(!errors.length,errors.join(' | '));results.push({name,pass:true});}
    catch(e){results.push({name,pass:false,error:String(e)});}finally{await c.close();}
  }
  const capture=p=>p.evaluate(()=>{
    const read=k=>{try{return localStorage.getItem(k);}catch{return 'unavailable';}};
    if(window.__dev)window.__personalIdentity=__dev.S;
    return {s:window.__dev?JSON.stringify(__dev.S):null,raw:read('vozackiA.v1'),sim:read('vozackiA.sim'),ops:JSON.stringify(__ops)};
  });
  async function unchanged(p,before){
    const after=await p.evaluate(()=>{
      const read=k=>{try{return localStorage.getItem(k);}catch{return 'unavailable';}};
      return {s:window.__dev?JSON.stringify(__dev.S):null,raw:read('vozackiA.v1'),sim:read('vozackiA.sim'),ops:JSON.stringify(__ops)};
    });
    assert(JSON.stringify(after)===JSON.stringify(before),'Memory/progress/SIM or persistence operations changed');
    if(http)assert(await p.evaluate(()=>__dev.S===__personalIdentity&&__dev.sim===null),'Identity changed or SIM resumed');
    assert(await p.locator('#bReady,#bAll,#bStale,#bAllM,#shufBox,#btnReset,#fileImport,.markBox input,#browseHead [data-nav="sim"],#browseHead [data-nav="learn"]').count()===0,'Writer controls exposed');
  }
  const rowIds=p=>p.locator('#browseList .qRow').evaluateAll(a=>a.map(x=>+x.dataset.qid));
  for(const kind of ['wrong','marked'])await test(kind+' membership, order, counts, reveal and local redraw',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/'+kind);await ready(p);const before=await capture(p);
    const ids=await p.evaluate(()=>QUIZ.questions.map(q=>q.id)),expected=kind==='wrong'?ids.slice(0,4):[ids[0],ids[5]];
    assert(JSON.stringify(await rowIds(p))===JSON.stringify(expected),'List is not the actual ready+waiting queue / marked set');
    assert(await p.locator('#listSnapshotNote').isVisible(),'Snapshot explanation missing');
    if(kind==='wrong')assert(/4\D+2\D+2/.test(await p.locator('#browseHead .opisRed').innerText()),'Ready/waiting counts incorrect');
    if(http)await p.evaluate(()=>{const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}};freeze(__dev.S);});
    await p.locator('#browseList .qRow').last().focus();await p.keyboard.press('Enter');await p.locator('#previewAnswer').click();
    assert(await p.locator('#qCard .choice.ok').count()>0,'Answer was not revealed');await unchanged(p,before);
    await p.goBack();await p.locator('#listSnapshotNote').waitFor();await p.locator('#btnScript').click();await p.locator('#btnTheme').click();
    assert(JSON.stringify(await rowIds(p))===JSON.stringify(expected),'Redraw changed list membership/order');await unchanged(p,before);
    await p.goForward();await p.locator('#previewExplanation').waitFor();await unchanged(p,before);
  });
  for(const kind of ['wrong','marked'])await test(kind+' empty is truthful and has only content navigation',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/'+kind);await ready(p);const before=await capture(p);
    assert((await rowIds(p)).length===0,'Empty profile became global catalog');assert(await p.locator('#listEmpty').isVisible(),'Explicit empty state missing');
    const link=p.locator('#browseHead a[href*="#/sva"]');assert(await link.isVisible(),'Empty state has no useful content link');
    await link.click();await p.locator('#browseList .qRow').first().waitFor();await p.goBack();await p.locator('#listEmpty').waitFor();await unchanged(p,before);
  },{empty:true});
  await test('stale-only is not incorrectly included in repetition queue',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/wrong');await ready(p);const before=await capture(p);
    assert((await rowIds(p)).length===0,'Mastered stale question entered repetition queue');
    assert(await p.locator('#listStaleNote').isVisible()&&await p.locator('#listEmpty').isVisible(),'Stale-only state missing its explanation');await unchanged(p,before);
  },{stale:true});
  for(const failure of ['json','shape','unavailable'])await test(failure+' cannot fabricate personal lists',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/marked');await ready(p);const before=await capture(p);
    assert(await p.locator('#listUnavailable').isVisible(),'Unreadable state reported as valid empty data');
    assert((await rowIds(p)).length===0&&await p.locator('#listEmpty').count()===0,'Fabricated personal results');await unchanged(p,before);
  },failure==='unavailable'?{unavailable:true}:{bad:failure});
  for(const script of ['l','c'])for(const theme of ['light','dark'])await test(script+'/'+theme+' mobile search, native links, history and scroll',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/marked');await ready(p);const before=await capture(p);
    assert((await rowIds(p)).length===70,'Large list membership incorrect');
    const nav=p.locator('#donjaNav');assert(await nav.locator('[data-nav]:visible').count()===4,'Preview navigation does not expose the supported repetition list');
    assert(await nav.locator('[data-nav="drill"]').isVisible()&&!await nav.locator('[data-nav="sim"]').isVisible(),'Wrong preview navigation destinations');
    await nav.locator('[data-nav="learn"]').click();await nav.locator('[data-nav="drill"]').click();await p.locator('#listSnapshotNote').waitFor();
    assert(p.url().endsWith('#/lista/wrong')&&(await rowIds(p)).length===70,'Bottom navigation did not open actual repetition queue');
    assert(await nav.evaluate(nav=>{const b=nav.getBoundingClientRect(),links=[...nav.querySelectorAll('[data-nav]')].filter(a=>a.getClientRects().length);return b.left>=-1&&b.right<=innerWidth+1&&links.every((a,i)=>{const r=a.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1&&r.bottom<=b.bottom+1&&a.scrollWidth<=a.clientWidth+1&&(!i||r.left>=links[i-1].getBoundingClientRect().right-1);});}),'Four preview navigation links overflow or overlap');
    await p.goBack();await p.goBack();await p.locator('#listSnapshotNote').waitFor();assert(p.url().endsWith('#/lista/marked'),'Back from navigation lost marked list');
    await unchanged(p,before);
    const id=await p.locator('#browseList .qRow').nth(55).getAttribute('data-qid');
    await p.locator('#qSearch').fill('#'+id);assert(await p.locator('#browseList .qRow:visible').count()===1,'ID search failed');
    await p.locator('#browseList [role="status"]').waitFor({state:'visible'});
    const a=p.locator('#browseList .qRow:visible');assert((await a.getAttribute('href')).includes('?preview=1#/p/'+id),'Row lacks native preview href');
    const popup=c.waitForEvent('page');await a.click({button:'middle'});const other=await popup;await ready(other);
    assert(await other.locator('#previewAnswer').isVisible(),'Middle-click destination is not question preview');assert(await other.evaluate(()=>__ops.length===0),'Popup performed writes');await other.close();
    await a.click();await p.locator('#previewAnswer').waitFor();await p.goBack();await p.locator('#qSearch').waitFor();
    assert(await p.locator('#qSearch').inputValue()==='#'+id&&await p.locator('#browseList .qRow:visible').count()===1,'Back lost search');
    await p.locator('#qSearch').fill('');const deep=p.locator('#browseList .qRow').nth(55);await deep.scrollIntoViewIfNeeded();
    const y=await p.evaluate(()=>scrollY);assert(y>1000,'Test never reached a deep scroll');await deep.click();await p.locator('#previewAnswer').waitFor();await p.goBack();await p.locator('#listSnapshotNote').waitFor();await p.waitForTimeout(100);
    assert(Math.abs(await p.evaluate(()=>scrollY)-y)<5,'Back lost native list scroll');
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile personal list overflows');await unchanged(p,before);
  },{large:true,script,theme,width:320});
  await test('explicit preview is safe without Web Locks',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/wrong');await ready(p);const before=await capture(p);
    assert((await rowIds(p)).length===4,'No-lock preview fell back');await p.locator('#browseList .qRow').first().click();await p.locator('#previewAnswer').click();await unchanged(p,before);
  },{noLocks:true});
  if(http)await test('initial reader keeps loaded membership until reload after writer clears progress',async c=>{
    const writer=await c.newPage();await writer.goto(base+'#/lista/marked');await ready(writer);
    const p=await c.newPage();await p.goto(base+'#/lista/marked');await ready(p);const before=await capture(p);
    assert(await p.evaluate(()=>__dev.rezimPisanja)==='reader','Second tab did not become initial reader');assert((await rowIds(p)).length===2,'Reader list unavailable');
    await writer.evaluate(()=>localStorage.removeItem('vozackiA.v1'));await p.waitForTimeout(80);
    await p.locator('#btnScript').click();assert((await rowIds(p)).length===2,'Reader auto-refreshed saved snapshot');
    assert(await p.evaluate(()=>__dev.S===__personalIdentity),'Writer change replaced reader identity');
    const after=await capture(p);assert(after.s===before.s&&after.sim===before.sim&&after.ops===before.ops,'Writer change mutated reader memory/SIM or triggered operations');
    await p.reload();await ready(p);assert(await p.locator('#listEmpty').isVisible(),'Reload did not read removed progress');assert(await p.evaluate(()=>__ops.length===1&&__ops[0]==='lock'&&localStorage.getItem('vozackiA.v1')===null),'Reader reload wrote data or acquired writer');
  });
  await test('absent saved profile stays absent after empty list reload',async c=>{
    const p=await c.newPage();await p.goto(base+'?preview=1#/lista/wrong');await ready(p);const before=await capture(p);
    assert(before.raw===null&&await p.locator('#listEmpty').isVisible(),'Missing profile is not an explicit empty snapshot');
    await p.reload();await ready(p);const after=await capture(p);assert(JSON.stringify(after)===JSON.stringify(before),'Reload changed absent profile or SIM');await unchanged(p,after);
  },{absent:true});
  for(const kind of ['drill','marked'])await test('writer '+kind+' home link supports middle click and ordinary activation',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);
    const a=p.locator('.menuBtn[data-nav="'+kind+'"]');const before=await capture(p),url=p.url(),popup=c.waitForEvent('page');
    await a.click({button:'middle'});const other=await popup;await ready(other);
    assert(await other.locator('#listSnapshotNote').isVisible(),'Native home link does not open personal list');
    assert((await rowIds(other)).length===(kind==='drill'?4:2),'Popup list membership incorrect');
    assert(p.url()===url,'Middle click navigated source writer');
    const after=await capture(p);assert(JSON.stringify(before)===JSON.stringify(after),'Middle click changed writer state or pending SIM');
    assert(await other.evaluate(()=>__ops.length===0),'Explicit popup touched persistence or locks');await other.close();
    await a.focus();await p.keyboard.press('Enter');await p.locator(kind==='drill'?'#bReady':'#bAllM').waitFor();
    assert(await p.locator('#listSnapshotNote').count()===0,'Ordinary activation replaced writer practice with preview');
    await p.locator(kind==='drill'?'#bReady':'#bAllM').click();await p.locator('#view-question.active').waitFor();
    assert(await p.locator('.markBox input').count()===1,'Writer exercise no longer has marking');
  },{noSim:true});
  if(http)await test('copied personal-list destinations leave active exam unchanged',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);
    const hrefs=await p.locator('.menuBtn[data-nav="drill"],.menuBtn[data-nav="marked"]').evaluateAll(a=>a.map(a=>a.href));
    await p.locator('.menuBtn[data-nav="sim"]').click();await p.locator('#view-sim.active').waitFor();
    const before=await capture(p);assert(before.sim!==null,'Synthetic exam did not start');let dialogs=0;p.on('dialog',d=>{dialogs++;d.dismiss();});
    for(const href of hrefs){const q=await c.newPage();await q.goto(href);await ready(q);const state=await capture(q);
      assert(await q.locator('#listSnapshotNote').isVisible(),'Exam-linked preview unavailable');await q.locator('#browseList .qRow').first().click();await q.locator('#previewAnswer').click();await unchanged(q,state);await q.close();}
    const after=await capture(p);assert(p.url().endsWith('#/sim')&&dialogs===0&&JSON.stringify(before)===JSON.stringify(after),'Preview changed or abandoned active exam');
  },{noSim:true});
  for(const kind of ['wrong','marked'])for(const failure of ['json','shape','unavailable'])await test('ordinary recovery '+kind+'/'+failure+' does not fabricate saved lists',async c=>{
    const p=await c.newPage();await p.goto(base);await ready(p);const before=await capture(p);
    await p.evaluate(hash=>{location.hash=hash;},'#/lista/'+kind);await p.waitForTimeout(120);
    assert(await p.locator('#listUnavailable').isVisible(),'Ordinary recovery fabricated an empty personal list');
    assert((await rowIds(p)).length===0&&await p.locator('#listEmpty').count()===0,'Ordinary recovery displayed personal results');
    if(http)assert(await p.evaluate(()=>__dev.S===__personalIdentity),'Recovery route replaced state identity');
    const after=await capture(p);assert(JSON.stringify(after)===JSON.stringify(before),'Recovery route mutated memory, raw data, pending SIM or storage operations');
    assert(await p.locator('#browseHead #bReady,#browseHead #bAll,#browseHead #bAllM,#browseHead #bStale,#browseHead #shufBox,#browseHead [data-nav]').count()===0,'Recovery list offers a practice action');
  },failure==='unavailable'?{unavailable:true}:{bad:failure});
  const result={passed:results.every(r=>r.pass),cases:results.length,results};
  if(!result.passed)throw Error(JSON.stringify(result));return result;
}
