// Playwright CLI, isolated localhost:18764. Synthetic progress in new contexts only.
// Measures rendered footer links against their actual background, both themes,
// including hover/focus and enlarged text. No external destination is requested.
async(page)=>{
  if(!/^http:\/\/localhost:18764\//.test(page.url()))throw Error('Use isolated localhost:18764');
  const browser=page.context().browser(),results=[];
  for(const width of [320,1280])for(const script of ['l','c'])for(const theme of ['light','dark'])for(const enlarged of [false,true]){
    const c=await browser.newContext({serviceWorkers:'block',viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
    const cfg={width,script,theme,enlarged};
    try{
      await c.route('**/*',r=>r.request().url().startsWith('http://localhost:18764/')?r.continue():r.abort());
      await c.addInitScript(({script,theme})=>{
        localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},script,theme,fs:1.25,tour:1,guide:1,noUpd:1}));
        window.__footerOps=[];
        for(const method of ['setItem','removeItem','clear']){const f=Storage.prototype[method];Storage.prototype[method]=function(...args){__footerOps.push(method);return f.apply(this,args);};}
      },cfg);
      const p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));
      await p.goto('http://localhost:18764/?preview=1#/sva');await p.waitForFunction(()=>!!window.__dev);
      const before=await p.evaluate(()=>{window.__footerIdentity=__dev.S;return {raw:localStorage.getItem('vozackiA.v1'),sim:localStorage.getItem('vozackiA.sim'),memory:JSON.stringify(__dev.S)};});
      if(enlarged)await p.addStyleTag({content:'html{font-size:32px!important}'});
      const links=p.locator('#podnozje a'),measures=[];
      if(await links.count()!==2)throw Error('Expected existing code and privacy links');
      for(let i=0;i<2;i++){
        const link=links.nth(i);await link.scrollIntoViewIfNeeded();await p.mouse.move(1,1);
        for(const state of ['normal','hover','focus']){
          if(state==='hover')await link.hover();
          if(state==='focus'){await p.mouse.move(1,1);await link.focus();}
          await p.waitForTimeout(170);
          const m=await link.evaluate((a,state)=>{
            const rgb=s=>s.match(/[\d.]+/g).map(Number);
            const blend=(f,b)=>f.slice(0,3).map((v,i)=>v*(f[3]??1)+b[i]*(1-(f[3]??1)));
            const chain=[];for(let x=a;x;x=x.parentElement)chain.unshift(x);
            const bg=chain.reduce((b,x)=>blend(rgb(getComputedStyle(x).backgroundColor),b),[255,255,255]);
            const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
            const cs=getComputedStyle(a),fg=blend(rgb(cs.color),bg),l=[lum(fg),lum(bg)].sort((a,b)=>a-b);
            const range=document.createRange();range.selectNodeContents(a);const rects=[...range.getClientRects()];
            return {state,href:a.href,ratio:(l[1]+.05)/(l[0]+.05),underlined:cs.textDecorationLine.includes('underline'),focus:document.activeElement===a,
              textFits:rects.some(r=>r.width>0&&r.height>0)&&cs.visibility==='visible'&&rects.every(r=>r.left>=-1&&r.right<=innerWidth+1),pageFits:document.documentElement.scrollWidth<=innerWidth+1,
              safeTarget:a.target==='_blank'&&a.relList.contains('noopener')};
          },state);measures.push(m);
          if(m.ratio<4.5||!m.underlined||!m.textFits||!m.pageFits||!m.safeTarget||(state==='focus'&&!m.focus))throw Error(JSON.stringify(m));
        }
      }
      const unchanged=await p.evaluate(b=>__dev.S===__footerIdentity&&JSON.stringify(__dev.S)===b.memory&&localStorage.getItem('vozackiA.v1')===b.raw&&localStorage.getItem('vozackiA.sim')===b.sim&&__footerOps.length===0,before);
      if(!unchanged||errors.length)throw Error('Progress changed or page error: '+errors.join('; '));
      if(width===320&&script==='c'&&theme==='dark'&&!enlarged)await p.locator('#podnozje').screenshot({path:'output/playwright/footer-links-320-c-dark.png'});
      results.push({cfg,pass:true,minContrast:Math.min(...measures.map(m=>m.ratio)),measurements:measures.length});
    }catch(e){results.push({cfg,pass:false,error:String(e)});}finally{await c.close();}
  }
  return {passed:results.filter(r=>r.pass).length,total:results.length,results};
}
