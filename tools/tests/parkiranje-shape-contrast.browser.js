// Focused essential-shape contrast regression; no zoom or font-size claim.
async page=>{
 const origin=await page.evaluate(()=>location.origin);if(!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Isolated localhost fixture required');const results=[],pageErrors=[],stamp=Date.now();
 const specs=[
  {n:1,label:'Actual white pedestrian crossing stripes',fg:[80,45],bg:[80,51]},
  {n:2,label:'White carriageway marking',fg:[4,73],bg:[4,68]},
  {n:2,label:'Vehicle silhouette on carriageway',fg:[50,55],bg:[18,55]},
  {n:2,label:'Blue direction arrow',fg:[200,92],bg:[200,87]},
  {n:4,label:'Rails on carriageway',fg:[125,90],bg:[125,94]},
  {n:4,label:'Rail sleepers on carriageway',fg:[128,96],bg:[122,96]},
  {n:5,label:'Off-road vehicle boundary',fg:[176,115],bg:[172,115]},
  {n:6,label:'Parking sign boundary',fg:[264,64],bg:[260,64]},
  {n:10,label:'Bicycle wheel on bicycle lane',fg:[191,114],bg:[191,104]},
  {n:18,label:'Rails on card background',fg:[130,90],bg:[130,95]},
  {n:18,label:'Rail sleepers on card background',fg:[140,100],bg:[146,100]},
  {n:18,label:'Broken vehicle boundary',fg:[176,100],bg:[172,100]},
  {n:18,label:'Warning symbol boundary',fg:[153.5,46],bg:[158,46]},
  {n:18,label:'Warning exclamation',fg:[140,42],bg:[146,42]},
  {n:19,label:'Quantitative bar boundary',fg:[6,53],bg:[3,53]},
 ];
 for(const script of ['l','c'])for(const theme of ['light','dark'])for(const location of ['glossary','inline']){
  const c=await page.context().browser().newContext({viewport:{width:320,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
  try{await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());await c.addInitScript(s=>localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},tour:1,noUpd:1,guide:1,fs:1.25,...s})),{script,theme});const p=await c.newPage();p.on('pageerror',error=>pageErrors.push({script,theme,location,message:error.message}));let card;
   if(location==='glossary'){await p.goto(origin+'/#/pojmovnik/parkiranje');card=p.locator('#browseList>.explCard');}else{await p.goto(origin+'/#/p/10052');await p.waitForFunction(()=>document.querySelector('#qCard')?.dataset.qid==='10052');const q=p.locator('#qCard');await q.locator('.choice[data-ok="1"]').click();await q.locator('.qActions .primary').click();await q.locator('.verdict.ok').waitFor();const b=q.locator('[data-card="parkiranje"]');await b.click();card=b.locator('xpath=following-sibling::*[1]');}
   await card.waitFor();await card.evaluate(el=>{for(let k=0;k<4;k++)[...el.querySelectorAll('.kPod>button')].filter(b=>b.getAttribute('aria-expanded')==='false').forEach(b=>b.click());});await p.evaluate(()=>document.fonts.ready);
   const samples=await card.evaluate(async (card,specs)=>{
    const svgs=[...card.querySelectorAll('svg')],scale=8,cache=new Map(),rgb=v=>(v.match(/[\d.]+/g)||[]).slice(0,3).map(Number),lum=a=>a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    const canvas=async n=>{if(cache.has(n))return cache.get(n);const s=svgs[n-1],k=s.cloneNode(true),vb=s.viewBox.baseVal,w=Math.ceil(vb.width*scale),h=Math.ceil(vb.height*scale);k.setAttribute('xmlns','http://www.w3.org/2000/svg');k.setAttribute('width',w);k.setAttribute('height',h);k.style.width='';k.style.maxWidth='';k.style.height='';k.style.color=getComputedStyle(s).color;let bg='white';for(let el=s;el;el=el.parentElement){const x=getComputedStyle(el).backgroundColor;if(x!=='transparent'&&x!=='rgba(0, 0, 0, 0)'){bg=x;break;}}const can=document.createElement('canvas');can.width=w;can.height=h;const ctx=can.getContext('2d',{willReadFrequently:true});ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(k));await img.decode();ctx.drawImage(img,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h).data,sample=([x,y])=>{const i=(Math.floor(y*scale)*w+Math.floor(x*scale))*4;return [...pixels.slice(i,i+3)];};const out={sample};cache.set(n,out);return out;};
    const rows=[];for(const spec of specs){const can=await canvas(spec.n),fg=can.sample(spec.fg),bg=can.sample(spec.bg);rows.push({...spec,fgRGB:fg,bgRGB:bg,ratio:ratio(fg,bg)});}
    // Colored crosses/arrows/checks keep their original hue; their identical wider white underlay supplies a readable edge.
    const halos=[];for(const [i,s] of svgs.entries())for(const p of s.querySelectorAll('path[stroke="#c0392b"],path[stroke="#1f7a3f"]')){const previous=p.previousElementSibling,match=previous?.tagName==='path'&&previous.getAttribute('d')===p.getAttribute('d')&&previous.getAttribute('stroke')==='#fff'&&Number(previous.getAttribute('stroke-width'))>Number(p.getAttribute('stroke-width'));halos.push({svg:i+1,match,ratio:ratio(rgb(getComputedStyle(p).stroke),[255,255,255])});}
    for(const [i,s] of svgs.entries())for(const g of s.querySelectorAll('g[stroke="#c0392b"]')){const previous=g.previousElementSibling,match=previous?.tagName==='g'&&previous.innerHTML===g.innerHTML&&previous.getAttribute('stroke')==='#fff'&&Number(previous.getAttribute('stroke-width'))>Number(g.getAttribute('stroke-width'));halos.push({svg:i+1,group:true,match,ratio:ratio(rgb(getComputedStyle(g).stroke),[255,255,255])});}
    return {rows,halos};
   },specs);
   results.push({script,theme,location,...samples});
  }finally{await c.close();}
 }
 const summary={origin,stamp,pageErrors,results,sampleCases:results.reduce((n,r)=>n+r.rows.length,0),failures:results.flatMap(r=>r.rows.filter(s=>s.ratio<3).map(s=>({script:r.script,theme:r.theme,location:r.location,...s}))),haloCases:results.reduce((n,r)=>n+r.halos.length,0),haloFailures:results.flatMap(r=>r.halos.filter(s=>!s.match||s.ratio<3))};
 if(results.length!==8||summary.sampleCases!==120||summary.haloCases!==216||summary.failures.length||summary.haloFailures.length||pageErrors.length)throw Error('Parking shape contrast failed: '+JSON.stringify({cases:results.length,sampleCases:summary.sampleCases,haloCases:summary.haloCases,failures:summary.failures.slice(0,10),haloFailures:summary.haloFailures.slice(0,10),pageErrors}));
 return summary;
}
