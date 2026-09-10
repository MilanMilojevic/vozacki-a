// Measures foreground against actual rasterized SVG layers under each text glyph.
// Focused parking-card regression: 320px, both scripts/themes and glossary/inline.
// Does not assert font size, zoom usability or complete WCAG conformance.
async page=>{
 const origin=await page.evaluate(()=>location.origin);if(!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Isolated localhost fixture required');
 const results=[],pageErrors=[],stamp=Date.now();
 const served=await page.evaluate(async()=>({version:APP_V,byQSHA256:[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(EXPLAIN.byQ))))].map(b=>b.toString(16).padStart(2,'0')).join('')}));
 for(const script of ['l','c'])for(const theme of ['light','dark'])for(const location of ['glossary','inline']){
  const c=await page.context().browser().newContext({viewport:{width:320,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
  try{
   await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());await c.addInitScript(s=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},tour:1,noUpd:1,guide:1,fs:1.25,...s})),{script,theme});const p=await c.newPage();p.on('pageerror',error=>pageErrors.push({script,theme,location,message:error.message}));let card;
   if(location==='glossary'){await p.goto(origin+'/#/pojmovnik/parkiranje');card=p.locator('#browseList>.explCard');}else{await p.goto(origin+'/#/p/10052');await p.waitForFunction(()=>document.querySelector('#qCard')?.dataset.qid==='10052');const q=p.locator('#qCard');await q.locator('.choice[data-ok="1"]').click();await q.locator('.qActions .primary').click();await q.locator('.verdict.ok').waitFor();const b=q.locator('[data-card="parkiranje"]');await b.click();card=b.locator('xpath=following-sibling::*[1]');}
   await card.waitFor();await card.evaluate(el=>{for(let k=0;k<4;k++)[...el.querySelectorAll('.kPod>button')].filter(b=>b.getAttribute('aria-expanded')==='false').forEach(b=>b.click());});await p.evaluate(()=>document.fonts.ready);
   const drawings=[];
   for(let n=0;n<await card.locator('svg').count();n++){
    const svg=card.locator('svg').nth(n);await svg.scrollIntoViewIfNeeded();
    drawings.push(await svg.evaluate(async (s,n)=>{
     const NS='http://www.w3.org/2000/svg',scale=4,vb=s.viewBox.baseVal,w=Math.ceil(vb.width*scale),h=Math.ceil(vb.height*scale),rgb=v=>(v.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
     const luminance=a=>a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
     const ratio=(a,b)=>{a=luminance(a);b=luminance(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
     let background='rgb(255, 255, 255)';for(let el=s;el;el=el.parentElement){const bg=getComputedStyle(el).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){background=bg;break;}}
     const root=()=>{const k=document.createElementNS(NS,'svg');k.setAttribute('xmlns',NS);k.setAttribute('viewBox',s.getAttribute('viewBox'));k.setAttribute('width',w);k.setAttribute('height',h);k.style.color=getComputedStyle(s).color;k.style.fontFamily=getComputedStyle(s).fontFamily;return k;};
     const render=async (svg,bg)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const cx=canvas.getContext('2d',{willReadFrequently:true});if(bg){cx.fillStyle=bg;cx.fillRect(0,0,w,h);}const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await image.decode();cx.drawImage(image,0,0,w,h);return cx.getImageData(0,0,w,h).data;};
     const base=root();for(const child of s.childNodes)base.appendChild(child.cloneNode(true));for(const t of base.querySelectorAll('text'))t.remove();const under=await render(base,background),texts=[];
     for(const t of s.querySelectorAll('text')){
      const style=getComputedStyle(t),mask=root(),g=document.createElementNS(NS,'g'),m=s.getScreenCTM().inverse().multiply(t.getScreenCTM());g.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);const copy=t.cloneNode(true);copy.removeAttribute('transform');copy.style.fill='white';copy.style.stroke='none';copy.style.opacity='1';copy.style.fillOpacity='1';copy.style.fontFamily=style.fontFamily;copy.style.fontSize=style.fontSize;copy.style.fontWeight=style.fontWeight;g.appendChild(copy);mask.appendChild(g);const pixels=await render(mask),fg=rgb(style.fill);let alpha=Number(style.fillOpacity);for(let el=t;el;el=el.parentElement){alpha*=Number(getComputedStyle(el).opacity);if(el===s)break;}let min=Infinity,samples=0,worst;
      for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>=240){const bg=[under[i],under[i+1],under[i+2]],paint=fg.map((v,j)=>v*alpha+bg[j]*(1-alpha)),value=ratio(paint,bg);if(value<min){min=value;worst={fg:paint,bg};}samples++;}
      const ctm=t.getScreenCTM();texts.push({text:t.textContent,ratio:min,samples,worst,px:parseFloat(style.fontSize)*Math.hypot(ctm.c,ctm.d)});
     }
     return {n:n+1,background,texts,failures:texts.filter(t=>!t.samples||t.ratio<4.5)};
    },n));
   }
   results.push({script,theme,location,drawings});
  }finally{await c.close();}
 }
 const summary={origin,stamp,served,pageErrors,cases:results.length,textCases:results.reduce((n,r)=>n+r.drawings.reduce((m,d)=>m+d.texts.length,0),0),failures:results.flatMap(r=>r.drawings.flatMap(d=>d.failures.map(f=>({script:r.script,theme:r.theme,location:r.location,svg:d.n,...f})))),results,scope:'Rendered text glyphs against composited SVG backgrounds at320/max app font. Essential non-text shapes and zoom require separate explicit checks.'};
 if(summary.cases!==8||summary.textCases!==728||results.some(r=>r.drawings.length!==19)||summary.failures.length||pageErrors.length)throw Error('Parking text contrast failed: '+JSON.stringify({cases:summary.cases,textCases:summary.textCases,failures:summary.failures.slice(0,10),pageErrors}));
 return summary;
}
