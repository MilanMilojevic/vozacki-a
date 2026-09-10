// Playwright CLI: open the isolated snapshot server with ?imageFile=file:///.../output/image-hash-a5/index.html,
// then run-code --filename tools/tests/image-hashes.browser.js. All contexts and profiles are disposable.
async(page)=>{
  const control=await page.evaluate(()=>({origin:location.origin,file:new URLSearchParams(location.search).get('imageFile')}));
  if(!/^http:\/\/localhost:\d+$/.test(control.origin)||!/^file:\/\/\/.*\/output\/image-hash-a5\/index\.html$/.test(control.file||''))throw Error('Use the isolated A5 snapshot and file fixture.');
  const browser=page.context().browser(),results=[];
  const assert=(value,message)=>{if(!value)throw Error(message);};
  for(const [mode,base] of [['http',control.origin+'/'],['file',control.file]]){
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
    try{
      await context.route('**/*',route=>{
        const url=route.request().url();
        if(url.startsWith(control.origin+'/')||url.startsWith('file:'))return route.continue();
        return route.abort();
      });
      await context.addInitScript(()=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},tour:1,guide:1,noUpd:1,script:'l'})));
      const p=await context.newPage();await p.goto(base+'#/p/9878');
      await p.waitForFunction(()=>document.querySelector('#qCard')?.dataset.qid==='9878');
      const direct=await p.locator('#qCard img.qImg').getAttribute('src');
      const expected=await p.evaluate(()=>window.QUIZ.imageHashes[9878]);
      assert(direct===(mode==='file'?'img/9878.jpg':`img/9878.jpg?h=${expected}`),mode+': direct question URL mismatch');
      assert(await p.locator('#qCard img.qImg').evaluate(async image=>{if(!image.complete)await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;});return image.naturalWidth>0;}),mode+': direct question image did not load');

      await p.goto(base+'#/pojmovnik/znakovi-opasnosti');
      await p.locator('#browseList .explCard img').first().waitFor({state:'attached'});
      const card=await p.locator('#browseList .explCard img').first().getAttribute('src');
      const id=(card||'').match(/img\/(\d+)\.jpg/)?.[1],cardHash=id&&await p.evaluate(id=>window.QUIZ.imageHashes[id],id);
      assert(!!id&&card===(mode==='file'?`img/${id}.jpg`:`img/${id}.jpg?h=${cardHash}`),mode+': explanation-card URL mismatch');
      assert(!mode.includes('file')||!card.includes('?'),'file mode must remain query-free');
      results.push({mode,direct,card,pass:true});
    }finally{await context.close();}
  }

  const context=await browser.newContext({serviceWorkers:'block'});
  try{
    const hash='a'.repeat(64),remote='https://milanmilojevic.github.io/vozacki-a/';
    await context.route(remote+'data.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:`window.QUIZ={imageHashes:{1:'${hash}'},questions:[{id:1,img:1,req:1,t:{c:'Питање'},ch:[{id:1,ok:1,t:{c:'Одговор'}}]}]};`}));
    await context.route(remote+'img/**',route=>route.abort());
    const p=await context.newPage();await p.goto(control.origin+'/embed.html');await p.waitForSelector('img.qi');
    assert(await p.locator('img.qi').getAttribute('src')===remote+`img/1.jpg?h=${hash}`,'embed URL is not content-addressed');
    results.push({mode:'embed',pass:true});
  }finally{await context.close();}
  return {passed:true,cases:results.length,results};
}
