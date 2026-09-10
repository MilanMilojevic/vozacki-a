// Playwright CLI: run-code --filename tools/tests/parkiranje-card.browser.js
// Disposable localhost contexts only; layout/semantic scope, not a full accessibility pass.
async page=>{
 const origin=await page.evaluate(()=>location.origin);if(!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Isolated localhost fixture required');
 const keys={10052:[31997],10054:[32004],10055:[32005],10057:[32013],10058:[32014],10060:[32020],10061:[32023],10065:[32034],10066:[32038],10068:[32043],10071:[32054],10073:[32058,32061],10090:[32107],10091:[32111],10092:[32114],10101:[32139],10111:[32170],10113:[32176],10117:[32188],10118:[32190],10120:[32197],10141:[32259],10142:[32262],10499:[33355],10500:[33358,33360],10507:[33379],10528:[33436]};
 const results=[],questions=[],screenshots=[],stamp=Date.now();
 const require=(value,message)=>{if(!value)throw Error(message);};
 for(const width of [320,1280])for(const script of ['l','c'])for(const theme of ['light','dark']){
  const ctx=await page.context().browser().newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
  try{
   await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
   await ctx.addInitScript(s=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},tour:1,noUpd:1,guide:1,fs:1.25,...s})),{script,theme});
   const p=await ctx.newPage();
   for(const location of ['glossary','inline']){
    let content;
    if(location==='glossary'){await p.goto(origin+'/#/pojmovnik/parkiranje');content=p.locator('#browseList>.explCard');}
    else {await p.goto(origin+'/#/p/10052');await p.waitForFunction(()=>document.querySelector('#qCard')?.dataset.qid==='10052');const q=p.locator('#qCard');for(const c of await q.locator('.choice[data-ok="1"]').all())await c.click();await q.locator('.qActions .primary').click();await q.locator('.verdict.ok').waitFor();const b=q.locator('[data-card="parkiranje"]');await b.click();content=b.locator('xpath=following-sibling::*[1]');}
    await content.waitFor();await content.evaluate(el=>{for(let i=0;i<4;i++)[...el.querySelectorAll('.kPod>button')].filter(b=>b.getAttribute('aria-expanded')==='false').forEach(b=>b.click());});await p.evaluate(()=>document.fonts.ready);
    require(await content.locator('svg').count()===19,'Nineteen retained diagrams');require(await content.locator('table').count()===5,'Five useful tables');
    const semantic=await content.evaluate((el,script)=>{
     const text=el.innerText,svgs=[...el.querySelectorAll('svg')],labels=svgs.map(s=>s.getAttribute('aria-label'));
     return {roman3:text.includes('(II-3)'),roman41:text.includes('II-41.1'),parkingP:svgs[5].querySelector('text[x="278"]')?.textContent==='P',bankScope:labels.at(-1).includes('27'),twoWay:script==='l'?labels[0].includes('dvosmerni')&&labels[7].includes('dvosmernom'):labels[0].includes('двосмерни')&&labels[7].includes('двосмерном'),localized:script==='l'||labels.every(s=>/[А-Яа-я]/.test(s)&&!/[A-Za-z]/.test(s.replace(/\b(?:P|m)\b/g,''))),sidewalkParked:script==='l'?text.includes('kada je vozilo parkirano'):text.includes('када је возило паркирано'),lev:script==='l'?text.includes('vozače lakih električnih vozila'):text.includes('возаче лаких електричних возила')};
    },script);for(const [key,value] of Object.entries(semantic))require(value,`${width}/${script}/${theme}/${location}: ${key}`);
    const images=[];for(const img of await content.locator('img').all()){await img.scrollIntoViewIfNeeded();images.push(await img.evaluate(async i=>{if(!i.complete)await new Promise((res,rej)=>{i.onload=res;i.onerror=rej;});return {src:i.getAttribute('src'),width:i.naturalWidth};}));}
    require(images.length===5&&images.every(i=>i.width>0),'Five actual situations load');require(JSON.stringify(images.map(i=>Number(i.src.match(/img\/(\d+)\.jpg/)?.[1])).sort((a,b)=>a-b))===JSON.stringify([10091,10092,10113,10118,10142]),'Exact situation image IDs');
    const drawings=[];
    for(let n=0;n<19;n++){
     const svg=content.locator('svg').nth(n);
     const report=await svg.evaluate(async el=>{
      const frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));el.scrollIntoView({block:'center'});await frame();
      const occupied=()=>[...document.querySelectorAll('#topbar,#donjaNav')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.getBoundingClientRect());
      let rect=el.getBoundingClientRect(),bars=occupied();const top=Math.max(0,...bars.filter(b=>b.top<=0).map(b=>b.bottom)),bottom=Math.min(innerHeight,...bars.filter(b=>b.bottom>=innerHeight).map(b=>b.top));
      if(rect.height<=bottom-top)scrollBy(0,rect.top-(top+(bottom-top-rect.height)/2));await frame();rect=el.getBoundingClientRect();bars=occupied();
      const overlaps=bars.some(b=>Math.min(b.right,rect.right)>Math.max(b.left,rect.left)&&Math.min(b.bottom,rect.bottom)>Math.max(b.top,rect.top));
      const labels=[...el.querySelectorAll('text')].map(t=>{const r=t.getBoundingClientRect(),m=t.getScreenCTM();return {text:t.textContent,px:parseFloat(getComputedStyle(t).fontSize)*Math.hypot(m.c,m.d),box:{x:r.x,y:r.y,width:r.width,height:r.height},outside:r.left<rect.left-.5||r.right>rect.right+.5||r.top<rect.top-.5||r.bottom>rect.bottom+.5};});
      const clashes=[];for(let a=0;a<labels.length;a++)for(let b=a+1;b<labels.length;b++){const x=labels[a].box,y=labels[b].box,w=Math.min(x.x+x.width,y.x+y.width)-Math.max(x.x,y.x),h=Math.min(x.y+x.height,y.y+y.height)-Math.max(x.y,y.y);if(w>0&&h>0&&w*h/Math.min(x.width*x.height,y.width*y.height)>.15)clashes.push([labels[a].text,labels[b].text]);}
      const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
      return {aria:el.getAttribute('aria-label'),width:rect.width,height:rect.height,minPx:Math.min(...labels.map(l=>l.px)),inside:rect.left>=0&&rect.right<=innerWidth&&rect.top>=0&&rect.bottom<=innerHeight,overlaps,hit:hit===el||el.contains(hit),outside:labels.filter(l=>l.outside).map(l=>l.text),clashes};
     });
     require(report.inside&&!report.overlaps&&report.hit,`Unobscured SVG ${n+1} ${width}/${script}/${theme}/${location}`);require(!report.outside.length&&!report.clashes.length,`SVG text geometry ${n+1} ${JSON.stringify(report)}`);
     const file=`output/playwright/parkiranje-${stamp}-${width}-${script}-${theme}-${location}-svg${n+1}.png`;await svg.screenshot({path:file});screenshots.push(file);drawings.push({n:n+1,...report});
    }
    const tables=await content.locator('table').evaluateAll(ts=>ts.map(t=>{const r=t.getBoundingClientRect();return {width:r.width,inside:r.left>=-.5&&r.right<=innerWidth+.5};}));require(tables.every(t=>t.inside),'Tables fit horizontal viewport');
    results.push({width,script,theme,location,rootPixels:await p.evaluate(()=>getComputedStyle(document.documentElement).fontSize),semantic,images,drawings,tables});
   }
   // Independent keys and metadata; full official texts/options and effective explanation/link parity.
   // The inline case just answered 10052; leave its hash before beginning a fresh answer flow.
   await p.goto(origin+'/');
   for(const [idText,correct] of Object.entries(keys)){
    const id=Number(idText);await p.goto(origin+'/#/p/'+id);await p.waitForFunction(id=>document.querySelector('#qCard')?.dataset.qid===String(id),id);const q=p.locator('#qCard');
    const expected=await p.evaluate(({id,script})=>{const q=QUIZ.questions.find(q=>q.id===id);return {text:q.t[script],choices:q.ch.map(c=>({id:c.id,text:c.t[script],ok:c.ok})).sort((a,b)=>a.id-b.id),image:q.img,pts:q.pts,req:q.req,x:EXPLAIN.byQ[id].x[script]};},{id,script});
    const actual=await q.locator('.choice').evaluateAll(es=>es.map(e=>({id:e._ch.id,text:e.innerText,ok:Number(e.dataset.ok)})).sort((a,b)=>a.id-b.id));
    require(JSON.stringify(actual)===JSON.stringify(expected.choices),'Options '+id);require((await q.locator('.qText').innerText()).trim()===expected.text.trim(),'Question '+id);
    require(JSON.stringify(actual.filter(c=>c.ok).map(c=>c.id))===JSON.stringify(correct),'Official key '+id);require(expected.pts===2&&expected.req===correct.length,'Scoring metadata '+id);
    const confirm=q.locator('.qActions .primary');require(await confirm.isDisabled(),'New answer flow '+id);for(const c of await q.locator('.choice[data-ok="1"]').all())await c.click();require(!await confirm.isDisabled(),'Correct selection '+id);await confirm.click();await q.locator('.verdict.ok').waitFor();
    require(await q.locator('.explBox>p').innerText()===expected.x,'Served explanation '+id);
    const links=await q.locator('[data-card]').evaluateAll(es=>es.map(e=>e.dataset.card));require(JSON.stringify(links)===JSON.stringify(id===10061?['oznake-kolovoz','parkiranje']:['parkiranje']),'Effective links '+id);
    const imgs=await q.locator('img.qImg').evaluateAll(async es=>{for(const img of es)if(!img.complete)await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;});return es.map(i=>({src:i.getAttribute('src'),width:i.naturalWidth}));});require(imgs.length===expected.image&&imgs.every(i=>i.width>0),'Question image '+id);if(expected.image)require(imgs[0].src===await p.evaluate(id=>`img/${id}.jpg?h=${QUIZ.imageHashes[id]}`,id),'Exact image version '+id);
    questions.push({id,width,script,theme,correct,pts:expected.pts,req:expected.req,links,images:imgs,explanationMatches:true});
   }
  }finally{await ctx.close();}
 }
 return {passed:true,origin,stamp,cardCases:results.length,svgCases:results.reduce((n,r)=>n+r.drawings.length,0),questionCases:questions.length,results,questions,screenshots,limitation:'Semantic/layout regression; known earlier contrast and minimum-font failures remain open, no full readability/contrast pass is claimed.'};
}
