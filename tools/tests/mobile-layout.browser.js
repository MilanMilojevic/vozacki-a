// Playwright CLI: run-code --filename tools/tests/mobile-layout.browser.js
// Uses fresh contexts, synthetic settings and the caller's isolated localhost server.
// A false `passed` result is a failed run; screenshots go to ignored output/playwright.
async (page) => {
  const origin = await page.evaluate(() => location.origin);
  if (!/^http:\/\/localhost:\d+$/.test(origin)) throw Error('Use an isolated localhost test server');
  const browser = page.context().browser();
  const failures = [], contrasts = [], motion = [], simulator = [], screenshots = [];
  const stamp = Date.now();
  let cases = 0;
  // applyFont rounds 15/16 * fs to whole pixels. These include every possible
  // rendered size in the supported continuous .90–1.25 range, not just +8% clicks.
  for (const width of [320, 360, 390, 768]) {
    for (const script of ['l', 'c']) for (const theme of ['light', 'dark']) {
      const ctx = await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
      try {
        await ctx.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
        await ctx.addInitScript(settings => {
          localStorage.setItem('vozackiA.v1', JSON.stringify({q:{},guide:1,tour:1,noUpd:1,fs:1.08,...settings}));
          // Stable exam content makes its before/after screenshot/style useful.
          let seed = 41;
          Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
        }, {script,theme});
        const p = await ctx.newPage();
        await p.goto(origin + '/');
        await p.locator('#btnPodesavanja').waitFor();
        await p.evaluate(() => document.fonts.ready);
        const base = width <= 560 ? 15 : 16;
        const sizes = Array.from({length:Math.round(base*1.25)-Math.round(base*.9)+1}, (_,i)=>Math.round(base*.9)+i);
        const measure = async (px, target=p) => target.evaluate(async px => {
              document.documentElement.style.fontSize = px + 'px';
              // Let layout and the navigation's ResizeObserver settle after font changes.
              await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
              const rect = el => { const r=el.getBoundingClientRect(); return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; };
              const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
              const buttons = [...document.querySelectorAll('#topbar button')].filter(visible).map(el=>({id:el.id||'brand',...rect(el)}));
              const issues=[];
              for(const b of buttons) {
                if(b.left < -.5 || b.right > innerWidth+.5) issues.push('outside:' + b.id);
                if(b.height < 43.5 || b.width < 43.5) issues.push('small-target:' + b.id);
              }
              for(let i=0;i<buttons.length;i++) for(let j=i+1;j<buttons.length;j++) {
                const a=buttons[i],b=buttons[j];
                if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5) issues.push('overlap:' + a.id + '/' + b.id);
              }
              const brand = document.querySelector('.brand');
              if(brand.scrollWidth > brand.clientWidth+1) issues.push('clipped-brand');
              for(const el of document.querySelectorAll('#donjaNav button')) {
                if(!visible(el)) continue;
                const b=rect(el);
                if(b.left < -.5 || b.right > innerWidth+.5) issues.push('outside:bottom-nav');
                const label=rect(el.querySelector('.dnTekst'));
                if(label.left < b.left-.5 || label.right > b.right+.5) issues.push('outside:bottom-nav-label');
              }
              if(document.documentElement.scrollWidth > innerWidth+1) issues.push('document-overflow');
              const nav = document.querySelector('#donjaNav'), navHeight = rect(nav).height;
              const oldScroll = scrollY;
              if(visible(document.querySelector('#podnozje'))) {
                window.scrollTo(0,document.documentElement.scrollHeight);
                const privacy = rect(document.querySelector('#podnozje > :last-child'));
                if(privacy.bottom > innerHeight-navHeight+.5) issues.push('footer-covered-by-navigation');
                window.scrollTo(0,oldScroll);
              }
              // Exercise the real fixed-strip CSS even when no update/recovery is pending.
              for(const [id,gap] of [['trakeDrzac',12],['iosHint',12],['updBar',14],['repoUpd',16]]) {
                const existing=document.getElementById(id), strip=existing || document.createElement('div');
                if(!existing) { strip.id=id;strip.textContent='Test';document.body.append(strip); }
                if(visible(strip) && rect(strip).bottom > innerHeight-navHeight-gap+.5) issues.push('strip-navigation-gap:'+id);
                if(!existing) strip.remove();
              }
              return {issues,buttons};
            }, px);
        for (const route of ['#/', '#/sva', '#/p/7921']) {
          await p.evaluate(hash => { location.hash = hash; }, route);
          await p.locator(route === '#/' ? '#view-home.active' : route === '#/sva' ? '#view-browse.active' : '#view-question.active').waitFor();
          if(route === '#/p/7921') await p.locator('#btnNazad').waitFor({state:'visible'});
          for (const px of sizes) {
            const result = await measure(px);
            cases++;
            if(result.issues.length) failures.push({width,script,theme,route,px,...result});
          }
          // Representative 108% and largest supported size, with/without Back.
          if((width===320 || width===390) && theme==='dark' && (script==='l' || width===320)) {
            for(const fs of [1.08,1.25]) {
              await p.evaluate(px=>document.documentElement.style.fontSize=px+'px', Math.round(base*fs));
              const path = `output/playwright/mobile-${stamp}-${width}-${script}-${route==='#/'?'home':route==='#/sva'?'list':'question'}-${fs}.png`;
              await p.screenshot({path}); screenshots.push(path);
            }
          }
        }
        await p.evaluate(() => { location.hash='#/'; });
        await p.locator('#view-home.active').waitFor();
        if(width===320 && script==='c' && theme==='dark') {
          const recordOffset = async (step, px=19, target=p) => {
            const result=await measure(px,target); cases++;
            if(result.issues.length) failures.push({width,script,theme,step,...result});
          };
          // An extra bottom inset must affect clearance, not just the label height.
          await p.locator('#donjaNav').evaluate(el=>el.style.paddingBottom='28px');
          await recordOffset('extra-bottom-inset');
          await p.locator('#donjaNav').evaluate(el=>el.style.removeProperty('padding-bottom'));
          await p.setViewportSize({width:768,height:844});
          await recordOffset('navigation-hidden-on-desktop',20);
          await p.setViewportSize({width:320,height:844});
          await recordOffset('navigation-visible-again');
          await p.locator('#btnScript').click();
          await recordOffset('script-changed');
          await p.locator('#btnScript').click();
          await recordOffset('script-restored');
          const footerPath=`output/playwright/mobile-${stamp}-320-c-footer-1.25.png`;
          await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
          await p.screenshot({path:footerPath}); screenshots.push(footerPath);
          await p.evaluate(()=>window.scrollTo(0,0));
          const fallbackPage=await ctx.newPage();
          try {
            await fallbackPage.addInitScript(()=>{ delete window.ResizeObserver; });
            await fallbackPage.goto(origin+'/');
            await fallbackPage.locator('#btnPodesavanja').waitFor();
            await recordOffset('without-resize-observer',19,fallbackPage);
          } finally { await fallbackPage.close(); }
        }
        const readContrast = async locator => locator.evaluate(el => {
          const rgb = s => s.match(/[\d.]+/g).map(Number);
          let bg = el;
          while(bg && rgb(getComputedStyle(bg).backgroundColor)[3]===0) bg=bg.parentElement;
          const fg=getComputedStyle(el).color, background=getComputedStyle(bg).backgroundColor;
          const lum = s => rgb(s).slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);
          const l1=lum(fg),l2=lum(background);
          return {foreground:fg,background,ratio:(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
        });
        const contrast = await readContrast(p.locator('#btnPodesavanja'));
        contrasts.push({width,script,theme,...contrast});
        if(contrast.ratio<4.5) failures.push({width,script,theme,issue:'blue-text-contrast',...contrast});
        // Hover changes the row background while its normal-size title stays blue.
        // Check the rendered state after the transition, not just the idle card.
        await p.evaluate(() => { location.hash='#/sek/c32'; });
        const subRow = p.locator('.subRow').first();
        await subRow.hover();
        await subRow.evaluate(async el => {
          await Promise.all(el.getAnimations().map(animation => animation.finished));
        });
        const hoverContrast = await readContrast(subRow.locator('.subName'));
        contrasts.push({width,script,theme,state:'subarea-hover',...hoverContrast});
        if(hoverContrast.ratio<4.5) failures.push({width,script,theme,issue:'blue-text-hover-contrast',...hoverContrast});
        await p.evaluate(() => { location.hash='#/'; });
        await p.locator('#view-home.active').waitFor();
        // Exercise every existing instructional CSS animation; compare the
        // preference modes in the same loaded document without another profile.
        const motionResult = {width,script,theme};
        await p.evaluate(() => {
          const holder=document.createElement('div'); holder.id='motion-probe';
          holder.style.cssText='position:fixed;left:-10000px;top:0';
          for(const cls of ['animVoziTrakom','animUkljuci','animIzlazak','animBiciklObilazi','animSinskoPrilazi','animPropusti','animUlazUTunel','animVoziloSeKotrlja','animSusret','animVoziloUSusret','animDolaziUSusret','animPesakPrelazi','animKolonaPrelazi','animPrilaziGranici','animIzlaziIzSporednog','animTrepti','animMigavac','animKoridorTok','animPutanjaSkretanja','animMaglaProlazi']) {
            const el=document.createElement('span');el.className=cls;el.textContent='●';holder.append(el);
          }
          document.body.append(holder);
        });
        await p.emulateMedia({reducedMotion:'no-preference'});
        motionResult.normal = await p.locator('#motion-probe').evaluate(el => [...el.children].every(c=>getComputedStyle(c).animationName!=='none'));
        await p.emulateMedia({reducedMotion:'reduce'});
        motionResult.reduced = await p.locator('#motion-probe').evaluate(el => [...el.children].every(c=>getComputedStyle(c).animationName==='none' && c.getAnimations().length===0));
        motion.push(motionResult);
        if(!motionResult.normal || !motionResult.reduced) failures.push({...motionResult,issue:'motion-preference'});
        await p.locator('#motion-probe').evaluate(el=>el.remove());
        await p.emulateMedia({reducedMotion:'no-preference'});
        await p.evaluate(px=>document.documentElement.style.fontSize=px+'px', Math.round(base*1.08));
        await p.locator('#view-home [data-nav="sim"]').click();
        await p.locator('#view-sim.active').waitFor();
        for(const px of sizes) {
          const result = await measure(px);
          cases++;
          if(result.issues.length) failures.push({width,script,theme,route:'#/sim',px,...result});
        }
        await p.evaluate(px=>document.documentElement.style.fontSize=px+'px', Math.round(base*1.08));
        simulator.push(await p.evaluate(({width,script,theme})=>{
          const selectors=['#topbar','.brand','#btnTheme','#btnScript','#view-sim','#simQCard'];
          return {width,script,theme,elements:selectors.map(selector=>{
            const el=document.querySelector(selector); if(!el)return {selector,missing:true};
            const s=getComputedStyle(el),r=el.getBoundingClientRect();
            return {selector,width:r.width,height:r.height,left:r.left,top:r.top,color:s.color,background:s.backgroundColor,font:s.fontSize,display:s.display,columns:s.gridTemplateColumns,blue:s.getPropertyValue('--blue').trim()};
          })};
        }, {width,script,theme}));
        if(width===320 && script==='l' && theme==='dark') {
          const path=`output/playwright/mobile-${stamp}-320-simulator.png`;
          await p.screenshot({path}); screenshots.push(path);
        }
      } finally { await ctx.close(); }
    }
  }
  return {passed:failures.length===0,cases,failureCount:failures.length,failures:failures.slice(0,15),contrastMinimum:Math.min(...contrasts.map(c=>c.ratio)),motion,simulator,screenshots};
}
