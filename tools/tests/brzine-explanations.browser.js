// Playwright CLI: run-code --filename tools/tests/brzine-explanations.browser.js
// Every setting and answer is confined to a fresh browser context on an isolated localhost fixture.
async (page) => {
  const origin=await page.evaluate(()=>location.origin);
  if(!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Use an isolated localhost fixture');
  const keys={9868:[31406,31407],9870:[31414],9873:[31424,31425],9878:[31442],10488:[33317,33319,33321],10489:[33324,33325]};
  const results=[],screenshots=[],stamp=Date.now();
  for(const width of [320,1280])for(const script of ['l','c'])for(const theme of ['light','dark']){
    const context=await page.context().browser().newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
    try{
      await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
      await context.addInitScript(settings=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},tour:1,noUpd:1,guide:1,fs:1.25,...settings})),{script,theme});
      const p=await context.newPage();
      for(const [idText,correct] of Object.entries(keys)){
        const id=Number(idText);await p.goto(origin+'/#/p/'+id);
        // Hash navigation keeps the old question mounted until routing completes.
        await p.waitForFunction(id=>document.querySelector('#qCard')?.dataset.qid===String(id),id);
        const q=p.locator('#qCard');await q.locator('.qText').waitFor();
        const expected=await p.evaluate(({id,script})=>{const question=window.QUIZ.questions.find(q=>q.id===id);return {question:question.t[script],req:question.req,pts:question.pts,image:question.img,choices:question.ch.map(ch=>({id:ch.id,text:ch.t[script],ok:ch.ok})),explanation:window.EXPLAIN.byQ[id].x[script]};},{id,script});
        if((await q.locator('.qText').innerText()).trim()!==expected.question.trim())throw Error('Question text mismatch: '+id);
        const actual=await q.locator('.choice').evaluateAll(els=>els.map(el=>({id:el._ch.id,text:el.innerText,ok:Number(el.dataset.ok)})).sort((a,b)=>a.id-b.id));
        if(JSON.stringify(actual)!==JSON.stringify(expected.choices.sort((a,b)=>a.id-b.id)))throw Error('Rendered option text/ID/key mismatch: '+id);
        if(JSON.stringify(actual.filter(ch=>ch.ok).map(ch=>ch.id))!==JSON.stringify(correct))throw Error('Official answer IDs changed: '+id);
        if(expected.req!==correct.length||expected.pts!==3)throw Error('Scoring metadata changed: '+id);
        if(await q.locator('img.qImg').count()!==expected.image)throw Error('Question image count mismatch: '+id);
        if(expected.image){const img=q.locator('img.qImg');await img.evaluate(async el=>{if(!el.complete)await new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;});if(!el.naturalWidth)throw Error('Question image did not load');});if(!((await img.getAttribute('src'))||'').endsWith('/'+id+'.jpg'))throw Error('Wrong question image: '+id);}
        const confirm=q.locator('.qActions .primary');if(!await confirm.isDisabled())throw Error('Fresh question already answered: '+id);
        for(const ch of await q.locator('.choice[data-ok="1"]').all())await ch.click();
        if(await confirm.isDisabled())throw Error('Cannot confirm full correct selection: '+id);await confirm.click();
        await q.locator('.verdict.ok').waitFor();const explanation=q.locator('.explBox > p');await explanation.waitFor();
        if(await explanation.innerText()!==expected.explanation)throw Error('Wrong displayed explanation: '+id);
        const visibility=await explanation.evaluate(async el=>{
          el.scrollIntoView({block:'center'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
          const b=el.getBoundingClientRect(),bars=[...document.querySelectorAll('#topbar,#donjaNav')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.getBoundingClientRect());
          const overlaps=bars.some(r=>Math.min(r.right,b.right)>Math.max(r.left,b.left)&&Math.min(r.bottom,b.bottom)>Math.max(r.top,b.top));
          return {inside:b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight,overlaps,height:b.height};
        });
        if(!visibility.inside||visibility.overlaps)throw Error('Explanation is obscured: '+id);
        if((width===320&&script==='c'&&theme==='dark')||(width===1280&&script==='l'&&theme==='light')){
          const file=`output/playwright/brzine-005-${stamp}-${width}-${script}-${theme}-${id}.png`;await p.screenshot({path:file});screenshots.push(file);
        }
        const link=q.locator('[data-card="brzine"]');if(await link.count()!==1)throw Error('Card link mismatch: '+id);await link.click();
        const content=link.locator('xpath=following-sibling::*[1]');if(!await content.isVisible()||await content.locator('svg').count()!==6)throw Error('Card content missing: '+id);
        results.push({id,width,script,theme,correct,options:actual.length,req:expected.req,pts:expected.pts,image:expected.image,...visibility});
      }
    }finally{await context.close();}
  }
  return {passed:true,cases:results.length,results,screenshots};
}
