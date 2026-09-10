// Requires separate disposable fixture: PORT=... node tools/fixtures/sw-server.mjs.
// Playwright CLI run-code --filename tools/tests/service-worker.browser.js
async(page)=>{
  const browser=page.context().browser();
  const origin=await page.evaluate(()=>location.origin);
  if(!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Use an isolated localhost service-worker fixture.');
  const results=[];
  for(const mode of ['public','local']) {
    const context=await browser.newContext({serviceWorkers:'allow'});
    const base=origin+'/'+mode+'/';
    const assert=(condition,message)=>{if(!condition)throw Error(mode+': '+message);};
    try {
      await context.request.post(base+'control?v=200&image=synthetic-image-one');
      const p=await context.newPage();
      await p.goto(base);
      await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
      const hash=async value=>p.evaluate(async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join(''),value);
      const one='synthetic-image-one',two='synthetic-image-two',three='synthetic-image-three';
      const h1=await hash(one),h2=await hash(two),h3=await hash(three);
      const get=path=>p.evaluate(async path=>{const response=await fetch(path);return {status:response.status,body:await response.text()};},path);
      assert((await get(`img/1.jpg?h=${h1}`)).body===one,'verified image did not load');
      await context.request.post(base+'control?v=200&image='+two);
      assert((await get(`img/1.jpg?h=${h1}`)).body===one,'old open document lost cached image bytes');
      assert((await get(`img/1.jpg?h=${h2}`)).body===two,'changed image did not use a new verified URL');
      assert((await get(`img/1.jpg?h=${h3}`)).status===504,'hash mismatch was served');
      await context.request.post(base+'control?v=200&image='+three);
      assert((await get(`img/1.jpg?h=${h3}`)).body===three,'repaired hash response could not retry');
      await p.evaluate(()=>caches.delete('va-img-1'));
      await context.request.post(base+'control?v=200&image='+one);
      assert((await get('img/1.jpg')).body===one,'legacy baseline network fallback failed');
      await p.evaluate(()=>caches.delete('va-img-1'));
      await context.request.post(base+'control?v=200&image='+two);
      assert((await get('img/1.jpg')).status===504,'changed bytes were served to a legacy URL');
      assert((await get(`img/1.jpg?h=${h1}&extra=1`)).status===400,'ambiguous hash URL was accepted');
      results.push({mode,step:'verified image cache preserves old tabs and retries safely',pass:true});
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
      await context.request.post(base+'control?v=201&baseline=missing');
      const baselineState=await p.evaluate(async()=>{
        const registration=await navigator.serviceWorker.getRegistration();
        try { await registration.update(); } catch { return 'update-rejected'; }
        const worker=registration.installing;
        if(!worker)return 'no-new-worker';
        return new Promise(resolve=>{
          const check=()=>{if(worker.state==='redundant'||worker.state==='activated')resolve(worker.state);};
          worker.addEventListener('statechange',check);check();
        });
      });
      assert(['update-rejected','no-new-worker','redundant'].includes(baselineState),'missing imported baseline activated: '+baselineState);
      await context.setOffline(true);await p.reload();
      assert(await p.locator('body').getAttribute('data-loaded')==='200','missing imported baseline broke old offline version');
      results.push({mode,step:'missing imported baseline retains old offline version',pass:true});
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
