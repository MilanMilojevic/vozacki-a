// Playwright CLI: run-code --filename tools/tests/drawing.browser.js
// All profiles and their data are disposable. A false passed result is a failure.
async (page) => {
  const origin=await page.evaluate(()=>location.origin);
  if(!/^http:\/\/localhost:\d+$/.test(origin)) throw Error('Use an isolated localhost test server');
  const browser=page.context().browser(), results=[], screenshots=[], stamp=Date.now();
  const cases=[];
  for(const width of [320,375]) for(const script of ['l','c']) for(const theme of ['light','dark']) for(const fs of [1,1.25]) cases.push({width,script,theme,fs});
  // Check both sides of the extra-width breakpoint and a normal desktop layout.
  for(const width of [370,371,1280]) cases.push({width,script:'l',theme:'light',fs:1});
  for(const {width,script,theme,fs} of cases) {
    const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
    try {
      await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
      await context.addInitScript(settings=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},guide:1,tour:1,noUpd:1,...settings})),{script,theme,fs});
      const p=await context.newPage();await p.goto(origin+'/');await p.locator('#btnPojmovnik').click();
      const audit=await p.evaluate(async()=>{
        const drawings=[], failures=[];
        const raf=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        await document.fonts.ready;
        const overlap=(a,b)=>{
          const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
          return w<=0||h<=0?0:w*h/Math.min(a.width*a.height,b.width*b.height);
        };
        const inspect=(svg,card,index)=>{
          const r=svg.getBoundingClientRect();if(!r.width)return;
          const labels=[...svg.querySelectorAll('text')].filter(el=>el.textContent.trim()).map(el=>{
            const m=el.getScreenCTM();
            return {text:el.textContent,px:parseFloat(getComputedStyle(el).fontSize)*Math.hypot(m.c,m.d),box:el.getBoundingClientRect()};
          });
          const small=labels.filter(x=>x.px<10).map(({text,px})=>({text,px}));
          const collisions=[];
          for(let a=0;a<labels.length;a++)for(let b=a+1;b<labels.length;b++)
            if(overlap(labels[a].box,labels[b].box)>.15)collisions.push([labels[a].text,labels[b].text]);
          const outside=labels.filter(({box:b})=>b.left<r.left-.5||b.right>r.right+.5||b.top<r.top-.5||b.bottom>r.bottom+.5).map(x=>x.text);
          const container=svg.closest('.card').getBoundingClientRect();
          const escaped=r.left<Math.max(0,container.left)-.5||r.right>Math.min(innerWidth,container.right)+.5;
          const item={card,index,width:r.width,min:labels.length?Math.min(...labels.map(x=>x.px)):null,small,collisions,outside,escaped};
          drawings.push(item);if(small.length||collisions.length||outside.length||escaped)failures.push(item);
        };
        for(const b of [...document.querySelectorAll('[data-poj]')]) {
          b.click();await raf();const cd=b.nextElementSibling;
          for(let i=0;i<4;i++) {
            const closed=[...cd.querySelectorAll('.kPod > button')].filter(x=>x.getAttribute('aria-expanded')==='false'&&!/Slike iz baze|Слике из базе|Situacije|Ситуације/.test(x.textContent));
            if(!closed.length)break;closed.forEach(x=>x.click());await raf();
          }
          [...cd.querySelectorAll('svg')].forEach((svg,i)=>inspect(svg,b.dataset.poj,i));
          b.click();await raf();
        }
        window.__dev.S.dani=[{d:'2026-09-01',n:40,ok:26,novih:30,pon:10},{d:'2026-09-02',n:52,ok:44,novih:35,pon:17}];
        location.hash='#/stats';await raf();document.querySelector('#btnDani').click();await raf();
        inspect(document.querySelector('#daniTelo svg'),'daily-trend',0);
        // The same drawings also appear inside the extra padded answer explanation.
        location.hash='#/p/9868';await raf();
        const q=window.QUIZ.questions.find(q=>q.id===9868);
        [...document.querySelectorAll('#qCard .choice')].slice(0,q.req).forEach(x=>x.click());
        document.querySelector('#qCard .qActions .primary').click();await raf();
        const answerCard=document.querySelector('#qCard [data-card="brzine"]');answerCard.click();await raf();
        const answerBody=answerCard.nextElementSibling;
        for(let i=0;i<4;i++) {
          const closed=[...answerBody.querySelectorAll('.kPod > button')].filter(x=>x.getAttribute('aria-expanded')==='false');
          if(!closed.length)break;closed.forEach(x=>x.click());await raf();
        }
        [...answerBody.querySelectorAll('svg')].forEach((svg,i)=>inspect(svg,'question-brzine',i));
        return {count:drawings.length,min:Math.min(...drawings.filter(x=>x.min!==null).map(x=>x.min)),failures};
      });
      if(audit.count!==204)audit.failures.push({issue:'missing-drawings',expected:204,actual:audit.count});
      results.push({width,script,theme,fs,...audit});
      if(width===320&&theme==='dark'&&fs===1.25) {
        await p.locator('#qCard .explCard svg').first().evaluate(el=>el.scrollIntoView({block:'center'}));
        const questionPath=`output/playwright/drawing-${stamp}-${script}-question.png`;await p.screenshot({path:questionPath});screenshots.push(questionPath);
        await p.evaluate(()=>{location.hash='#/stats';});await p.locator('#btnDani').click();
        await p.locator('#daniTelo svg').evaluate(el=>el.scrollIntoView({block:'center'}));
        const path=`output/playwright/drawing-${stamp}-${script}-trend.png`;await p.screenshot({path});screenshots.push(path);
        await p.evaluate(()=>{location.hash='#/';});await p.locator('#btnPojmovnik').click();
        for(const [card,index] of [['slicni-pojmovi',7],['semafori',4],['brzine',1]]) {
          const button=p.locator(`[data-poj="${card}"]`);await button.click();
          await p.evaluate(card=>{
            const cd=document.querySelector(`[data-poj="${card}"]`).nextElementSibling;
            for(let i=0;i<4;i++)[...cd.querySelectorAll('.kPod > button')].filter(x=>x.getAttribute('aria-expanded')==='false'&&!/Slike iz baze|Слике из базе|Situacije|Ситуације/.test(x.textContent)).forEach(x=>x.click());
          },card);
          const svg=button.locator('xpath=following-sibling::*[1]').locator('svg').nth(index);
          await svg.evaluate(el=>el.scrollIntoView({block:'center'}));
          const path=`output/playwright/drawing-${stamp}-${script}-${card}.png`;
          await p.screenshot({path});screenshots.push(path);await button.click();
        }
      }
    } finally {await context.close();}
  }
  return {passed:results.every(x=>!x.failures.length),contexts:results.length,drawings:results.reduce((n,x)=>n+x.count,0),minimum:Math.min(...results.map(x=>x.min)),results,screenshots};
}
