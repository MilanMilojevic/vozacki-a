// Playwright CLI against isolated localhost:18764/:18954; all scenarios own fresh contexts.
// File check: caller ?copiedFile=file:///.../output/copied-question-link-v160/index.html.
async page => {
  const base=await page.evaluate(()=>new URLSearchParams(location.search).get('copiedFile')||location.href.split(/[?#]/)[0]);
  if(!/^http:\/\/localhost:(18764|18954)\//.test(base)&&!/^file:\/\/\/.*\/output\/copied-question-link-v160\/index\.html$/.test(base))throw Error('Use isolated copied-link fixture');
  const file=base.startsWith('file:'),origin=file?'':await page.evaluate(b=>new URL(b).origin,base),results=[];
  const assert=(ok,message)=>{if(!ok)throw Error(message);};
  async function scenario(protocol,locks,clipboard){
    const c=await page.context().browser().newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),errors=[];
    c.setDefaultTimeout(5000);c.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
    await c.route('**/*',r=>(file?r.request().url().startsWith('file:'):r.request().url().startsWith(origin+'/'))?r.continue():r.abort());
    if(protocol==='https')await c.route('https://copied.invalid/**',async r=>r.fulfill({response:await c.request.get(origin+r.request().url().slice('https://copied.invalid'.length))}));
    await c.addInitScript(({locks,clipboard})=>{
      if(!locks)Object.defineProperty(navigator,'locks',{value:undefined});
      Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{if(clipboard==='prompt')throw Error('Synthetic clipboard denial');window.__copied=text;}}});
      if(/^(https?:|file:)$/.test(location.protocol)&&!localStorage.getItem('vozackiA.v1'))localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},sims:[],tour:1,noUpd:1,script:'l',theme:'light'}));
      window.__ops=[];
      for(const method of ['setItem','removeItem','clear']){const fn=Storage.prototype[method];Storage.prototype[method]=function(...args){__ops.push([method,args[0]]);return fn.apply(this,args);};}
      const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...args)=>{__ops.push(['idb']);return open(...args);};
      window.showSaveFilePicker=async()=>{__ops.push(['file']);throw Error('Unexpected synthetic file picker');};
    },{locks,clipboard});
    const capture=p=>p.evaluate(()=>({raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim'),state:window.__dev?JSON.stringify(__dev.S):null,ops:JSON.stringify(__ops)}));
    try {
      const entry=protocol==='https'?'https://copied.invalid/index.html':base;
      const p=await c.newPage();await p.goto(entry+'#/p/7921');await p.locator('#view-question.active').waitFor();
      if(file){
        const number=p.locator('.qNum[data-qid]');
        assert(await number.getAttribute('role')===null&&await number.getAttribute('tabindex')===null,'File mode unexpectedly advertises clipboard control');
        await number.click();assert(await p.evaluate(()=>typeof __copied==='undefined'),'File mode copied an unsupported address');
        results.push({protocol,locks,clipboard,pass:true,note:'File mode deliberately does not expose question-link copying; unchanged.'});return;
      }
      let copied;
      if(clipboard==='prompt')p.once('dialog',async d=>{assert(d.type()==='prompt','Clipboard fallback was not a prompt');copied=d.defaultValue();await d.dismiss();});
      await p.locator('.qNum[data-qid]').click();
      if(clipboard==='success')copied=await p.evaluate(()=>__copied);else await p.waitForTimeout(80);
      assert(typeof copied==='string'&&copied.endsWith('#/p/7921'),'Copied address lost the requested question');
      await p.locator('#donjaNav [data-nav="sim"]').click();await p.locator('#view-sim.active').waitFor();
      const source=await capture(p),sourceUrl=p.url(),sourceId=await p.locator('#simQCard').getAttribute('data-qid');
      const q=await c.newPage();await q.goto(copied);await q.locator('.view.active').waitFor();
      assert(await q.locator('#view-question.active #qCard[data-qid="7921"]').count()===1,'Copied question address resumed source exam or opened another view');
      assert(copied.includes('?preview=1#'),'Copied destination lacks explicit safe preview marker');
      const loaded=await capture(q);assert(loaded.ops==='[]','Copied destination performed storage/IDB/file operations');
      if(protocol==='http')await q.evaluate(()=>{window.__identity=__dev.S;const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}};freeze(__dev.S);});
      await q.locator('#previewAnswer').click();await q.locator('#btnScript').click();await q.locator('#btnTheme').click();
      assert(JSON.stringify(await capture(q))===JSON.stringify(loaded),'Copied question reveal/redraw changed loaded state or persisted data');
      if(protocol==='http')assert(await q.evaluate(()=>__dev.S===__identity&&__dev.sim===null&&__dev.rezimPisanja==='preview'),'Copied tab changed identity, resumed SIM, or became writer');
      assert(p.url()===sourceUrl&&await p.locator('#view-sim.active').count()===1&&await p.locator('#simQCard').getAttribute('data-qid')===sourceId,'Copied link navigated source exam');
      assert(JSON.stringify(await capture(p))===JSON.stringify(source),'Copied link changed source progress/SIM or triggered operations');
      assert(!errors.length,errors.join(' | '));results.push({protocol,locks,clipboard,pass:true});
    } catch(e){results.push({protocol,locks,clipboard,pass:false,error:String(e)});}finally{await c.close();}
  }
  for(const protocol of file?['file']:['http','https'])for(const locks of file?[false]:[true,false])for(const clipboard of ['success','prompt'])await scenario(protocol,locks,clipboard);
  const result={passed:results.every(r=>r.pass),cases:results.length,results};if(!result.passed)throw Error(JSON.stringify(result));return result;
}
