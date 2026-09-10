// Requires separate fixture: node tools/fixtures/sw-server.mjs (port18765).
// Playwright CLI run-code --filename tools/tests/service-worker.browser.js
async(page)=>{
  const browser=page.context().browser();
  const results=[];
  for(const mode of ['public','local']) {
    const context=await browser.newContext({serviceWorkers:'allow'});
    const base='http://localhost:18765/'+mode+'/';
    const assert=(condition,message)=>{if(!condition)throw Error(mode+': '+message);};
    try {
      await context.request.post(base+'control?v=200');
      const p=await context.newPage();
      await p.goto(base);
      await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
      await p.evaluate(()=>localStorage.setItem('synthetic-progress','keep-me'));
      await context.setOffline(true);
      await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='200','fresh offline document missing its complete core');
      results.push({mode,step:'fresh offline document',pass:true});
      await context.setOffline(false);
      await context.request.post(base+'control?v=201&fail=1');
      const state=await p.evaluate(async()=>{
        const registration=await navigator.serviceWorker.getRegistration();
        await registration.update();
        const worker=registration.installing;
        if(!worker)return 'no-new-worker';
        return new Promise(resolve=>{
          const check=()=>{if(worker.state==='redundant'||worker.state==='activated')resolve(worker.state);};
          worker.addEventListener('statechange',check);check();
        });
      });
      assert(state==='redundant','incomplete release activated: '+state);
      await context.setOffline(true);
      await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='200','interrupted upgrade broke old offline version');
      assert(await p.evaluate(()=>localStorage.getItem('synthetic-progress'))==='keep-me','progress changed during update');
      results.push({mode,step:'interrupted upgrade retains old offline version and progress',pass:true});
      await context.setOffline(false);
      await context.request.post(base+'control?v=201');
      await p.evaluate(async()=>{
        const registration=await navigator.serviceWorker.getRegistration();
        await registration.update();
        if(!registration.installing)return;
        const worker=registration.installing;
        await new Promise((resolve,reject)=>{
          const check=()=>{if(worker.state==='activated')resolve();if(worker.state==='redundant')reject(Error('complete release rejected'));};
          worker.addEventListener('statechange',check);check();
        });
      });
      assert(await p.locator('body').getAttribute('data-loaded')==='200','activation forced the current document to refresh');
      results.push({mode,step:'activation leaves the current document running',pass:true});
      await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='201','complete release unavailable');
      await context.setOffline(true);
      await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='201','new offline core unavailable');
      results.push({mode,step:'complete upgrade opens online and offline',pass:true});

      // A rollback is a new release with old application code. Reusing v200 would
      // collide with clients that still legitimately request the original v200.
      await context.setOffline(false);
      await context.request.post(base+'control?v=202&code=200');
      await p.evaluate(async()=>{
        const registration=await navigator.serviceWorker.getRegistration();
        await registration.update();
        if(!registration.installing)return;
        const worker=registration.installing;
        await new Promise((resolve,reject)=>{
          const check=()=>{if(worker.state==='activated')resolve();if(worker.state==='redundant')reject(Error('rollback release rejected'));};
          worker.addEventListener('statechange',check);check();
        });
      });
      assert(await p.locator('body').getAttribute('data-loaded')==='201','rollback activation forced the current document to refresh');
      await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='200','rollback code was not served as new release 202');
      await context.setOffline(true);
      await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='200','rollback release is unavailable offline');
      results.push({mode,step:'rollback code ships under a new release number',pass:true});
    } finally {await context.close();}
  }
  return results;
}
