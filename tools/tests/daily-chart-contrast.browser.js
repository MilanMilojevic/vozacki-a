// Playwright CLI: open isolated localhost:18764, run-code --filename tools/tests/daily-chart-contrast.browser.js.
// Fresh contexts and synthetic progress/SIM only. Tests actual paint colors, alpha
// compositing and screen geometry, including the SVG serialized into the real zoom.
// WCAG 1.4.3 applies to graph text even when a table repeats its values. The bars
// and threshold line have equivalent labels/table/prose (1.4.11 redundancy).
async(page)=>{
  const origin=page.url().match(/^http:\/\/localhost:18764(?=\/|$)/)?.[0];
  if(!origin)throw Error('Use the isolated localhost:18764 checkout');
  const exam=await page.evaluate(()=>JSON.stringify({v:1,d:Date.now()+1800000,i:0,r:0,
    qs:QUIZ.questions.slice(0,41).map(q=>({id:q.id,o:q.ch.map(c=>c.id),c:[],m:0}))}));
  const browser=page.context().browser(),results=[],screenshots=[];
  const normal=[0,40,70,85,100,50,90].map((pct,i)=>({d:'2026-09-0'+(i+1),n:20,ok:pct/5,novih:10,pon:10}));
  const cases=[];
  for(const width of [320,1280])for(const script of ['l','c'])for(const theme of ['light','dark'])for(const scale of [1.25,2])cases.push({width,script,theme,scale,kind:'normal',days:normal});
  for(const kind of ['empty','zero','wrong','negative','large'])cases.push({width:320,script:'c',theme:'dark',scale:2,kind,
    days:kind==='empty'?[]:normal.map(d=>({...d,n:kind==='negative'?-20:kind==='zero'?0:kind==='large'?100000:20,
      ok:kind==='negative'?-5:kind==='large'?100000:0,novih:kind==='negative'?-2:0,pon:kind==='negative'?-3:kind==='large'?100000:0}))});
  for(const cfg of cases){
    const c=await browser.newContext({viewport:{width:cfg.width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
    const failures=[];const check=(v,m)=>{if(!v)failures.push(m);};
    const errors=[];c.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
    try{
      await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
      await c.addInitScript(({cfg,exam})=>{
        if(location.origin!=='http://localhost:18764')return;
        localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},guide:1,tour:1,noUpd:1,script:cfg.script,theme:cfg.theme,fs:1.25,dani:cfg.days}));
        localStorage.setItem('vozackiA.sim',exam);
        window.__chartOps=[];
        for(const name of ['setItem','removeItem','clear']){const original=Storage.prototype[name];Storage.prototype[name]=function(...args){__chartOps.push(name);return original.apply(this,args);};}
        const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...args)=>{__chartOps.push('idb');return open(...args);};
        window.showSaveFilePicker=async()=>{__chartOps.push('file');throw Error('Unexpected file operation');};
        // Colors from computed styles / SVG paint attributes, not antialiased
        // screenshot pixels. Retain fractional channels when compositing alpha.
        const rgb=s=>s.match(/[\d.]+/g).map(Number),blend=(f,b,a)=>f.slice(0,3).map((v,i)=>v*a+b[i]*(1-a));
        const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
        const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
        const bg=el=>{const chain=[];for(let x=el;x;x=x.parentElement)chain.unshift(x);return chain.reduce((b,x)=>{const color=rgb(getComputedStyle(x).backgroundColor);return blend(color,b,color[3]??1);},[255,255,255]);};
        window.__chartColor={rgb,blend,bg,contrast};
      },{cfg,exam});
      const p=await c.newPage();await p.goto(origin+'/?preview=1#/stats');await p.waitForFunction(()=>!!window.__dev);
      const before=await p.evaluate(()=>{window.__chartState=__dev.S;return {memory:JSON.stringify(__dev.S),raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim')};});
      if(cfg.scale===2)await p.evaluate(w=>document.documentElement.style.fontSize=(w===320?30:32)+'px',cfg.width);
      await p.locator('#btnDani').click();await p.evaluate(()=>document.fonts.ready);
      const measured=await p.evaluate(()=>{
        const {rgb,blend,bg,contrast}=__chartColor,svg=document.querySelector('#daniTelo svg');
        const text=[...document.querySelectorAll('#daniTelo svg text,#daniTelo th,#daniTelo td,#daniTelo td .mut,#daniTelo p')].map(el=>{
          const cs=getComputedStyle(el),background=bg(el);let alpha=1;
          for(let x=el;x;x=x.parentElement)alpha*=Number(getComputedStyle(x).opacity);
          const isSvg=el.tagName==='text',color=rgb(isSvg?cs.fill:cs.color);alpha*=isSvg?Number(cs.fillOpacity):1;alpha*=color[3]??1;
          const m=isSvg?el.getScreenCTM():null,px=parseFloat(cs.fontSize)*(m?Math.hypot(m.c,m.d):1);
          const threshold=px>=24 || (px>=18.6666667 && +cs.fontWeight>=700)?3:4.5;
          return {tag:el.tagName,text:el.textContent,px,threshold,ratio:contrast(blend(color,background,alpha),background)};
        });
        const labels=svg?[...svg.querySelectorAll('text')].map(el=>({text:el.textContent,box:el.getBoundingClientRect()})):[];
        const bounds=svg?.getBoundingClientRect(),outside=labels.filter(({box:b})=>b.left<bounds.left-.5||b.right>bounds.right+.5||b.top<bounds.top-.5||b.bottom>bounds.bottom+.5).map(x=>x.text);
        const overlaps=[];for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
          const a=labels[i].box,b=labels[j].box,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
          if(w>0 && h>0 && w*h/Math.min(a.width*a.height,b.width*b.height)>.15)overlaps.push([labels[i].text,labels[j].text]);
        }
        const rows=[...document.querySelectorAll('#daniTelo tbody tr')].map(tr=>[...tr.cells].map(td=>td.textContent));
        const days=__dev.S.dani;
        const equivalent=rows.length===days.length && rows.every((r,i)=>{
          const d=days[days.length-1-i],pct=d.n?Math.round(100*d.ok/d.n)+'%':'—';
          return r[0]===d.d.slice(8)+'.'+d.d.slice(5,7)+'.' && r[1]===String(d.novih) && r[2]===String(d.pon) && r[3]===pct+' ('+d.ok+'/'+d.n+')';
        });
        const card=svg?.closest('.card').getBoundingClientRect();
        const table=document.querySelector('#daniTelo table');let completeLastCell=true;
        if(table){table.scrollLeft=table.scrollWidth;const last=table.querySelector('tr:last-child td:last-child'),r=document.createRange();r.selectNodeContents(last);const b=table.getBoundingClientRect();completeLastCell=[...r.getClientRects()].every(x=>x.left>=b.left-.5 && x.right<=b.right+.5);table.scrollLeft=0;}
        return {text,rows,equivalent,days,svg:!!svg,outside,overlaps,completeLastCell,emptyNotice:!table && !!document.querySelector('#daniTelo p')?.textContent,
          width:bounds?.width,minText:Math.min(...text.filter(x=>x.tag==='text').map(x=>x.px)),escaped:bounds&&(bounds.left<Math.max(0,card.left)-.5||bounds.right>Math.min(innerWidth,card.right)+.5),pageOverflow:document.documentElement.scrollWidth>innerWidth+1};
      });
      for(const t of measured.text)check(t.ratio>=t.threshold,'Contrast '+t.tag+' '+t.text+': '+t.ratio.toFixed(4)+' < '+t.threshold);
      check(measured.equivalent,'Daily table does not match normalized data');check(measured.completeLastCell,'Full numeric cell cannot be reached in table scroller');
      check(!measured.pageOverflow && !measured.escaped,'Chart/table escapes viewport/card');
      check(!measured.outside.length && !measured.overlaps.length,'Graph text overlaps or escapes SVG');
      if(cfg.kind==='empty')check(!measured.svg && measured.emptyNotice,'Empty history should explain absence of data');
      else check(measured.svg && measured.minText>=10,'Missing chart or actual labels below10px');
      const zoom=[];
      if(measured.svg){
        await p.locator('#daniTelo svg').focus();await p.keyboard.press('Enter');await p.locator('#imgZoom img').evaluate(im=>im.decode());
        for(let mode=0;mode<2;mode++){
          if(mode)await p.locator('[role="dialog"] .zoomAlat.dole button').click();
          const z=await p.locator('#imgZoom img').evaluate(im=>{
            const {rgb,blend,bg,contrast}=__chartColor,source=new DOMParser().parseFromString(decodeURIComponent(im.src.split(',').slice(1).join(',')),'image/svg+xml'),root=source.documentElement;
            const cs=getComputedStyle(im),box=im.getBoundingClientRect(),vb=root.getAttribute('viewBox').split(/\s+/).map(Number);
            const scale=Math.min((box.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight))/vb[2],(box.height-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom))/vb[3]);
            return [...root.querySelectorAll('text')].map(t=>{
              const color=rgb(t.getAttribute('fill')==='currentColor'?root.style.color:t.getAttribute('fill')),alpha=Number(t.getAttribute('opacity')??1)*Number(t.getAttribute('fill-opacity')??1),background=bg(im),px=Number(t.getAttribute('font-size'))*scale;
              return {text:t.textContent,px,threshold:px>=24?3:4.5,ratio:contrast(blend(color,background,alpha),background)};
            });
          });zoom.push(z);for(const t of z)check(t.ratio>=t.threshold,'Zoom contrast '+t.text+': '+t.ratio.toFixed(4)+' < '+t.threshold);
        }
        await p.keyboard.press('Escape');check(await p.locator('#daniTelo svg').evaluate(s=>s===document.activeElement),'Zoom failed to restore focus');
      }
      check(await p.evaluate(b=>__dev.S===__chartState && JSON.stringify(__dev.S)===b.memory && localStorage.getItem('vozackiA.v1')===b.raw && localStorage.getItem('vozackiA.sim')===b.sim && __dev.sim===null && __chartOps.length===0,before),'Chart changed S identity/data/SIM or attempted persistence');
      check(!errors.length,errors.join(' | '));
      if(cfg.width===320 && cfg.scale===2 && cfg.kind==='normal'){
        const path='output/playwright/daily-chart-'+cfg.script+'-'+cfg.theme+'.png';await p.locator('#btnDani').scrollIntoViewIfNeeded();await p.screenshot({path});screenshots.push(path);
      }
      results.push({settings:{...cfg,days:undefined},passed:!failures.length,failures,minInline:Math.min(...measured.text.filter(x=>x.tag==='text').map(x=>x.ratio)),minZoom:zoom.length?Math.min(...zoom.flat().map(x=>x.ratio)):null,width:measured.width,minText:measured.svg?measured.minText:null});
    }catch(e){results.push({settings:{...cfg,days:undefined},passed:false,failures:[String(e)]});}finally{await c.close();}
  }
  const result={passed:results.filter(r=>r.passed).length,total:results.length,results,screenshots};
  if(result.passed!==result.total)throw Error(JSON.stringify(result));return result;
}
