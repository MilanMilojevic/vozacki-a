// Playwright CLI: run-code --filename tools/tests/brzine-card.browser.js
// Uses fresh contexts only. 200% is twice the actual base root font (30px at 320, 32px desktop).
async (page) => {
  const origin=await page.evaluate(()=>location.origin);
  if(!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Use an isolated localhost fixture');
  const results=[],screenshots=[],stamp=Date.now();
  for(const width of [320,1280])for(const script of ['l','c'])for(const theme of ['light','dark'])for(const scale of [1.25,2]){
    const context=await page.context().browser().newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
    try{
      await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
      await context.addInitScript(settings=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},tour:1,noUpd:1,guide:1,...settings})),{script,theme,fs:scale===2?1:scale});
      for(const location of ['glossary','inline']){
        const p=await context.newPage();
        await p.goto(origin+(location==='inline'?'/#/p/9868':'/'));
        let content;
        if(location==='glossary'){
          await p.locator('#btnPojmovnik').click();const b=p.locator('[data-poj="brzine"]');await b.click();content=b.locator('xpath=following-sibling::*[1]');
        }else{
          const q=p.locator('#qCard');for(const c of await q.locator('.choice[data-ok="1"]').all())await c.click();
          await q.locator('.qActions .primary').click();await q.locator('.verdict.ok').waitFor();const b=q.locator('[data-card="brzine"]');await b.click();content=b.locator('xpath=following-sibling::*[1]');
        }
        const base=await p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));
        if(scale===2)await p.evaluate(base=>document.documentElement.style.fontSize=base*2+'px',base);
        await content.evaluate(el=>{for(let i=0;i<4;i++)[...el.querySelectorAll('.kPod>button')].filter(x=>x.getAttribute('aria-expanded')==='false').forEach(x=>x.click());});
        await p.evaluate(()=>document.fonts.ready);
        const audit=await content.evaluate((el,{script,scale,base})=>{
          const failures=[],drawings=[];
          const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
          const lum=s=>rgb(s).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
          const contrast=(a,b)=>{a=lum(a);b=lum(b);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
          const background=element=>{for(let p=element;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return 'rgb(255, 255, 255)';};
          const svgs=[...el.querySelectorAll('svg')];if(svgs.length!==6)failures.push('Expected six diagrams');
          const overlap=(a,b)=>{const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return w<=0||h<=0?0:w*h/Math.min(a.width*a.height,b.width*b.height);};
          svgs.forEach((svg,index)=>{
            const rect=svg.getBoundingClientRect(),bg=background(svg),labels=[...svg.querySelectorAll('text')];
            const aria=svg.getAttribute('aria-label')||'';
            if(script==='c'&&(/[a-z]/i.test(aria.replace(/km\/h/g,''))||!/[А-Яа-я]/.test(aria)))failures.push({index,issue:'Cyrillic accessible name',aria});
            if(script==='l'&&/[А-Яа-я]/.test(aria))failures.push({index,issue:'Latin accessible name',aria});
            const texts=labels.map(t=>{
              const b=t.getBoundingClientRect(),s=getComputedStyle(t),m=t.getScreenCTM();
              const numberOnSign=(index===0||index===2)&&/^(40|50|60|80|100|130)$/.test(t.textContent.trim());
              const ratio=contrast(s.fill,numberOnSign?'rgb(255, 255, 255)':bg);
              if(ratio<4.5)failures.push({index,issue:'text contrast',text:t.textContent,ratio});
              if(b.left<rect.left-.5||b.right>rect.right+.5||b.top<rect.top-.5||b.bottom>rect.bottom+.5)failures.push({index,issue:'label outside diagram',text:t.textContent});
              return {text:t.textContent,contrast:ratio,px:parseFloat(s.fontSize)*Math.hypot(m.c,m.d),box:b};
            });
            for(let a=0;a<texts.length;a++)for(let b=a+1;b<texts.length;b++)if(overlap(texts[a].box,texts[b].box)>.15)failures.push({index,issue:'overlapping labels',labels:[texts[a].text,texts[b].text]});
            const container=el.closest('.card').getBoundingClientRect();
            if(rect.left<Math.max(0,container.left)-.5||rect.right>Math.min(innerWidth,container.right)+.5)failures.push({index,issue:'diagram outside container'});
            drawings.push({index,background:bg,aria,minTextContrast:Math.min(...texts.map(t=>t.contrast)),minTextPixels:Math.min(...texts.map(t=>t.px))});
          });
          const examples=svgs[2];
          if([...examples.querySelectorAll('circle')].some(c=>getComputedStyle(c).fill!=='rgb(255, 255, 255)'))failures.push('Speed sign background');
          const settlement=svgs[3];
          const signRects=[...settlement.querySelectorAll('rect')].filter(r=>r.getAttribute('width')==='54');
          if(signRects.length!==2||signRects.some(r=>getComputedStyle(r).fill!=='rgb(255, 255, 255)'||getComputedStyle(r).stroke!=='rgb(17, 17, 17)'))failures.push('Settlement sign colors');
          const symbols=[...settlement.querySelectorAll('g')];
          if(symbols.length!==2||symbols.some(g=>getComputedStyle(g).fill!=='rgb(17, 17, 17)'))failures.push('Settlement symbol colors');
          const stop=svgs[4],bg=background(stop),bracket=stop.querySelector('g[stroke-width="3"]'),bike=stop.querySelector('g[stroke-width="2.5"]'),obstacle=stop.querySelector('rect[x="284"]');
          const nonText=[bracket,bike,obstacle].map(e=>contrast(getComputedStyle(e).stroke,bg));
          if(nonText.some(c=>c<3))failures.push({issue:'essential diagram stroke contrast',nonText});
          if(getComputedStyle(stop.querySelector('rect[y="112"]')).fill!=='none')failures.push('Decorative road obscures bicycle contrast');
          const actualRoot=parseFloat(getComputedStyle(document.documentElement).fontSize),expectedRoot=scale===2?base*2:base;
          if(Math.abs(actualRoot-expectedRoot)>.01)failures.push('Root text scale changed');
          const bounds=el.getBoundingClientRect();
          if(bounds.left<-.5||bounds.right>innerWidth+.5)failures.push('Card bounds outside viewport');
          // Tables may scroll inside their designated wrappers. Paragraph text and controls must stay inside the card.
          for(const node of el.querySelectorAll('p,li,.kPod>button,.kSek>button')){
            const b=node.getBoundingClientRect();if(b.width&&(b.left<bounds.left-.5||b.right>bounds.right+.5))failures.push({issue:'content outside card',tag:node.tagName,text:node.textContent.slice(0,60)});
          }
          return {failures,drawings,rootTextPixels:actualRoot,nonTextContrast:nonText,svgTextScalesWithRoot:false};
        },{script,scale,base});
        // Bounds alone do not detect sticky headers/fixed navigation covering a drawing.
        const visibility=[];
        for(let index=0;index<6;index++){
          const drawing=content.locator('svg').nth(index);
          const visible=await drawing.evaluate(async svg=>{
            const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
            svg.scrollIntoView({block:'center'});await frame();
            const occupied=()=>[...document.querySelectorAll('#topbar,#donjaNav')].filter(el=>getComputedStyle(el).display!=='none').map(el=>el.getBoundingClientRect());
            let r=svg.getBoundingClientRect(),bars=occupied();
            const top=Math.max(0,...bars.filter(b=>b.top<=0).map(b=>b.bottom));
            const bottom=Math.min(innerHeight,...bars.filter(b=>b.bottom>=innerHeight).map(b=>b.top));
            if(r.height<=bottom-top)scrollBy(0,r.top-(top+(bottom-top-r.height)/2));
            await frame();r=svg.getBoundingClientRect();bars=occupied();
            const overlaps=bars.some(b=>Math.min(r.right,b.right)>Math.max(r.left,b.left)&&Math.min(r.bottom,b.bottom)>Math.max(r.top,b.top));
            const covered=[];
            for(const x of [.1,.5,.9])for(const y of [.1,.5,.9]){const hit=document.elementFromPoint(r.left+r.width*x,r.top+r.height*y);if(!hit||!svg.contains(hit))covered.push({x,y,tag:hit?.tagName,id:hit?.id});}
            return {insideViewport:r.top>=0&&r.bottom<=innerHeight,overlaps,covered};
          });
          visibility.push({index,...visible});
          if(!visible.insideViewport||visible.overlaps||visible.covered.length)audit.failures.push({index,issue:'drawing covered or outside visible gap',...visible});
          if(scale===2&&[1,3,4].includes(index)){
            const file=`output/playwright/brzine-004-${stamp}-${width}-${script}-${theme}-${location}-svg${index+1}.png`;
            await drawing.screenshot({path:file});screenshots.push(file);
            if(index===4){const full=file.replace('-svg5.png','-viewport.png');await p.screenshot({path:full});screenshots.push(full);}
          }
        }
        audit.visibility=visibility;
        results.push({width,script,theme,scale,location,...audit});
        await p.close();
      }
    }finally{await context.close();}
  }
  return {passed:results.every(r=>!r.failures.length),cases:results.length,drawings:results.reduce((n,r)=>n+r.drawings.length,0),results,screenshots};
}
