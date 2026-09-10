// Playwright CLI on an isolated localhost:18764/:18962 checkout. Never uses the caller's storage.
async page => {
  const base=page.url().split(/[?#]/)[0];
  if(!/^http:\/\/localhost:(18764|18962)\//.test(base))throw Error('Use the isolated zoom fixture');
  const origin=await page.evaluate(b=>new URL(b).origin,base),results=[],stamp=Date.now();
  const assert=(ok,message)=>{if(!ok)throw Error(message);};
  const capture=p=>p.evaluate(()=>({s:JSON.stringify(__dev.S),raw:localStorage.getItem('vozackiA.v1'),savedSim:localStorage.getItem('vozackiA.sim'),sim:__dev.sim?JSON.stringify({i:__dev.sim.i,d:__dev.sim.deadline,qs:__dev.sim.qs.map(x=>({id:x.q.id,ch:[...x.chosen],order:x.order.map(c=>c.id)}))}):null,ops:JSON.stringify(__ops)}));
  async function run(kind,script,theme,width,exam=false,height=844){
    const c=await page.context().browser().newContext({serviceWorkers:'block',viewport:{width,height}}),checks=[],errors=[];
    c.setDefaultTimeout(5000);c.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
    await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
    await c.addInitScript(({script,theme})=>{
      let bank;Object.defineProperty(window,'QUIZ',{configurable:true,get:()=>bank,set:value=>{
        bank=value;const image=value.questions.find(q=>q.img);window.__imageId=image.id;
        const qs=[image,...value.questions.filter(q=>q.id!==image.id).slice(0,40)];
        localStorage.setItem('vozackiA.v1',JSON.stringify({q:{},sims:[],script,theme,fs:1.25,tour:1,noUpd:1}));
        localStorage.setItem('vozackiA.sim',JSON.stringify({v:1,d:Date.now()+1800000,i:0,r:0,qs:qs.map(q=>({id:q.id,o:q.ch.map(c=>c.id),c:[],m:0}))}));window.__ops=[];
      }});
      window.__ops=[];for(const method of ['setItem','removeItem','clear']){const fn=Storage.prototype[method];Storage.prototype[method]=function(...args){__ops.push([method,args[0]]);return fn.apply(this,args);};}
      const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...a)=>{__ops.push(['idb']);return open(...a);};
      window.showSaveFilePicker=async()=>{__ops.push(['file']);throw Error('Unexpected picker');};
    },{script,theme});
    try {
      const p=await c.newPage();await p.goto(base+(exam?'':'?preview=1#/pojmovnik/parkiranje'));await p.waitForFunction(()=>!!window.__dev);
      let target;
      if(kind==='svg'){
        for(const btn of await p.locator('#browseList .kPodBtn').all())if(await btn.getAttribute('aria-expanded')!=='true')await btn.click();
        target=p.locator('#browseList svg').filter({hasText:/ODMAH|ОДМАХ/}).first();await target.waitFor();
      } else if(exam){await p.locator('#view-sim.active').waitFor();target=p.locator('#simQCard .qImgBtn').first();}
      else {const id=await p.evaluate(()=>__imageId);await p.evaluate(id=>{location.hash='#/p/'+id;},id);await p.locator('#view-question.active').waitFor();target=p.locator('#qCard .qImgBtn');}
      await target.scrollIntoViewIfNeeded();if(kind==='jpg')await target.locator('img').evaluate(im=>im.complete&&im.naturalWidth?Promise.resolve():new Promise(r=>im.addEventListener('load',r,{once:true})));
      const original=await target.evaluate(n=>({html:n.outerHTML,width:(n.tagName.toLowerCase()==='svg'?n:n.querySelector('img')).getBoundingClientRect().width,fonts:n.tagName.toLowerCase()==='svg'?[...n.querySelectorAll('text')].map(t=>getComputedStyle(t).fontFamily):[]}));
      const before=await capture(p);await p.evaluate(()=>{window.__identity=__dev.S;});await target.focus();await p.keyboard.press('Enter');await p.locator('#imgZoom img').waitFor();
      await p.waitForFunction(()=>document.querySelector('#imgZoom img')?.naturalWidth>0);await p.waitForTimeout(180);
      const geometry=()=>p.evaluate(()=>{
        const z=document.querySelector('#imgZoom'),im=z.querySelector('img'),r=im.getBoundingClientRect(),s=getComputedStyle(im),n=k=>parseFloat(s[k])||0;
        const contentWidth=r.width-n('paddingLeft')-n('paddingRight')-n('borderLeftWidth')-n('borderRightWidth');
        const contentHeight=r.height-n('paddingTop')-n('paddingBottom')-n('borderTopWidth')-n('borderBottomWidth');
        const v=z.getBoundingClientRect();
        return {contentWidth,ratioError:Math.abs(contentWidth/contentHeight/(im.naturalWidth/im.naturalHeight)-1),fits:r.left>=v.left-0.5&&r.top>=v.top-0.5&&r.right<=v.left+z.clientWidth+0.5&&r.bottom<=v.top+z.clientHeight+0.5,blizu:z.classList.contains('blizu'),controls:[...document.querySelectorAll('.zoomAlat button')].every(b=>{const a=b.getBoundingClientRect();return a.top>=0&&a.bottom<=innerHeight&&a.left>=0&&a.right<=innerWidth&&document.elementFromPoint(a.x+a.width/2,a.y+a.height/2)===b;})};
      });
      const initial=await geometry();checks.push({name:'initial image preserves natural content aspect and visible controls',pass:initial.ratioError<0.005&&initial.controls,...initial});
      if(kind==='svg'){
        const fonts=await p.evaluate(async()=>{
          const src=document.querySelector('#imgZoom img').src,xml=decodeURIComponent(src.slice(src.indexOf(',')+1));
          const f=document.createElement('iframe');f.hidden=true;const ready=new Promise(r=>f.onload=r);f.srcdoc=xml;document.body.append(f);await ready;
          const families=[...f.contentDocument.querySelectorAll('text')].map(t=>f.contentWindow.getComputedStyle(t).fontFamily);f.remove();return families;
        });
        checks.push({name:'serialized text preserves computed font family',pass:JSON.stringify(fonts)===JSON.stringify(original.fonts),source:original.fonts[0],serialized:fonts[0]});
      }
      const close=p.locator('.zoomAlat.gore button'),toggle=p.locator('.zoomAlat.dole button');
      if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();
      const corners=await p.evaluate(()=>{
        const z=document.querySelector('#imgZoom'),im=z.querySelector('img'),controls=[...document.querySelectorAll('.zoomAlat button')],result=[];
        for(const [x,y] of [[0,0],[1,0],[0,1],[1,1]]){
          z.scrollLeft=x?z.scrollWidth:0;z.scrollTop=y?z.scrollHeight:0;
          const r=im.getBoundingClientRect(),v=z.getBoundingClientRect();
          const px=x?Math.min(r.right,v.right)-3:Math.max(r.left,v.left)+3,py=y?Math.min(r.bottom,v.bottom)-3:Math.max(r.top,v.top)+3;
          const content={left:Math.max(r.left,v.left),right:Math.min(r.right,v.right),top:Math.max(r.top,v.top),bottom:Math.min(r.bottom,v.bottom)};
          const overlap=controls.some(b=>{const t=b.getBoundingClientRect();return t.left<content.right&&t.right>content.left&&t.top<content.bottom&&t.bottom>content.top;});
          result.push({x,y,cornerReachable:document.elementFromPoint(px,py)===im,controlOverlap:overlap});
        }
        return result;
      });
      checks.push({name:'all pan corners accessible without controls covering image',pass:corners.every(r=>r.cornerReachable&&!r.controlOverlap),corners});
      if(width===320&&script==='c'&&((kind==='svg'&&theme==='dark')||(kind==='jpg'&&theme==='light')||exam)){
        await p.locator('#imgZoom').evaluate(z=>{z.scrollLeft=0;z.scrollTop=0;});
        await p.screenshot({path:'output/playwright/zoom-'+stamp+'-'+kind+'-'+script+'-'+theme+'-'+(exam?'exam':'preview')+'.png'});
      }
      await p.locator('#imgZoom').evaluate(z=>{z.scrollLeft=0;z.scrollTop=0;});await p.locator('#imgZoom').hover();await p.mouse.wheel(120,120);await p.waitForTimeout(50);
      checks.push({name:'wheel still pans enlarged image',pass:await p.locator('#imgZoom').evaluate(z=>z.scrollWidth<=z.clientWidth||z.scrollLeft>0)});
      await close.focus();await p.keyboard.press('Tab');assert(await toggle.evaluate(b=>b===document.activeElement),'Tab lost zoom controls');await p.keyboard.press('Enter');assert(await toggle.getAttribute('aria-pressed')==='false','Keyboard farther toggle failed');
      const fit=await geometry();checks.push({name:'Farther fits complete natural-aspect image beside visible controls',pass:fit.ratioError<0.005&&fit.controls&&fit.fits,...fit});
      checks.push({name:'initial zoom decision uses actual available fit size',pass:initial.blizu===(fit.contentWidth<original.width*1.25)});
      if(width===840&&height===360){
        await p.setViewportSize({width:320,height:568});await p.waitForTimeout(80);const portrait=await geometry();
        checks.push({name:'rotation recalculates fit without distortion or clipped controls',pass:portrait.ratioError<0.005&&portrait.controls&&portrait.fits,...portrait});
        await p.setViewportSize({width,height});await p.waitForTimeout(80);
      }
      await p.keyboard.press('Shift+Tab');assert(await close.evaluate(b=>b===document.activeElement),'Reverse Tab escaped dialog');await p.keyboard.press('ArrowRight');await p.keyboard.press('1');await p.keyboard.press('Escape');
      assert(await p.locator('#imgZoom').count()===0&&await target.evaluate(n=>n===document.activeElement),'Escape did not close and restore focus');
      assert(await target.evaluate(n=>n.outerHTML)===original.html,'Zoom changed the source SVG/photo markup');
      await target.click();await p.locator('#imgZoom img').waitFor();await close.click();assert(await p.locator('#imgZoom').count()===0,'Repeated click-close failed');
      await target.click();await p.locator('#imgZoom img').waitFor();await p.locator('#imgZoom').evaluate(z=>{z.scrollLeft=0;z.scrollTop=0;});
      await p.locator('#imgZoom').click({position:{x:5,y:5}});assert(await p.locator('#imgZoom').count()===0,'Click outside the image stopped closing the dialog');
      assert(await p.evaluate(()=>__dev.S===__identity),'Zoom replaced state identity');assert(JSON.stringify(await capture(p))===JSON.stringify(before),'Zoom changed memory/rawS/SIM or performed operations');
      assert(!errors.length,errors.join(' | '));results.push({kind,script,theme,width,height,exam,pass:checks.every(x=>x.pass),checks});
    } catch(e){results.push({kind,script,theme,width,height,exam,pass:false,error:String(e),checks});}finally{await c.close();}
  }
  for(const kind of ['svg','jpg'])for(const script of ['l','c'])for(const theme of ['light','dark'])for(const width of [320,1280])await run(kind,script,theme,width);
  for(const width of [320,1280])await run('jpg','c','dark',width,true);
  for(const kind of ['svg','jpg'])for(const [width,height] of [[840,360],[320,568]])await run(kind,'c','dark',width,false,height);
  const result={passed:results.every(r=>r.pass),cases:results.length,results};if(!result.passed)throw Error(JSON.stringify(result));return result;
}
