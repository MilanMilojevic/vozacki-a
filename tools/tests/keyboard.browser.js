// Playwright CLI: run-code --filename tools/tests/keyboard.browser.js
// Creates and closes a new context; never uses the calling page's storage.
async (page) => {
  const origin = await page.evaluate(() => location.origin);
  if (!/^http:\/\/localhost:\d+$/.test(origin)) throw Error('Use an isolated localhost test server');
  const ctx = await page.context().browser().newContext({viewport:{width:390,height:844}, serviceWorkers:'block'});
  const results = [];
  try {
    await ctx.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await ctx.addInitScript(() => localStorage.setItem('vozackiA.v1', JSON.stringify({q:{},tour:1,noUpd:1,script:'l'})));
    const p = await ctx.newPage();
    await p.goto(origin + '/#/uci');
    await p.locator('#qCard .choice').first().click();
    const list = p.locator('#btnNazad');
    await list.focus();
    await p.keyboard.press('Enter');
    results.push({name:'Enter activates focused list without submitting an answer', pass: await p.evaluate(() => document.getElementById('view-browse').classList.contains('active') && !Object.values(__dev.S.q).some(r=>r.a))});
    const imgId = await p.evaluate(() => QUIZ.questions.find(q=>q.img).id);
    await p.goto(origin + '/#/p/' + imgId);
    const trigger = p.locator('#qCard .qImgBtn');
    await trigger.locator('img').waitFor({state:'visible'});
    await p.waitForFunction(() => document.querySelector('#qCard img.qImg').naturalWidth > 0);
    await trigger.click();
    results.push({name:'Image opens named modal containing its controls', pass: await p.evaluate(() => {
      const dialog=document.querySelector('[role="dialog"][aria-modal="true"]');
      return !!dialog && !!dialog.getAttribute('aria-label') && dialog.contains(document.activeElement) && dialog.querySelectorAll('.zoomAlat button').length===2;
    })});
    const firstFocus = await p.evaluate(() => document.activeElement.textContent);
    await p.keyboard.press('Shift+Tab');
    await p.keyboard.press('Tab');
    results.push({name:'Tab and Shift+Tab stay inside image dialog', pass:await p.evaluate(text => document.activeElement.textContent===text && !!document.activeElement.closest('[role="dialog"]'), firstFocus)});
    const chosen = await p.evaluate(() => document.querySelectorAll('#qCard .choice[aria-pressed="true"]').length);
    await p.keyboard.press('1');
    results.push({name:'Question shortcuts inactive behind image dialog',pass:chosen===await p.evaluate(() => document.querySelectorAll('#qCard .choice[aria-pressed="true"]').length)});
    await p.keyboard.press('Escape');
    results.push({name:'Escape closes image and restores focus/background',pass:await trigger.evaluate(el => document.activeElement===el && !document.getElementById('imgZoom') && !document.getElementById('glavni').inert)});
    const num = p.locator('#qCard .qNum[data-qid]');
    results.push({name:'Question number copy action is keyboard focusable',pass: await num.evaluate(el => el.tabIndex===0 && (el.tagName==='BUTTON' || el.getAttribute('role')==='button'))});
    await p.evaluate(() => { window.copiedUrls=[]; Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copiedUrls.push(text)}}); });
    await num.focus();
    await p.keyboard.press('Space');
    await p.keyboard.press('Enter');
    results.push({name:'Space and Enter copy question URL without answering',pass:await p.evaluate(id => copiedUrls.length===2 && copiedUrls.every(url=>url.endsWith('#/p/'+id)) && !Object.values(__dev.S.q).some(r=>r.a),imgId)});
    await trigger.click();
    await p.locator('[role="dialog"] .zoomAlat.gore button').click();
    await trigger.click();
    await p.keyboard.press('Escape');
    results.push({name:'Repeated click-close and Escape restore focus',pass:await trigger.evaluate(el=>document.activeElement===el && !document.querySelector('[aria-modal="true"]'))});
    await p.goto(origin+'/#/');
    await p.locator('#btnPojmovnik').click();
    await p.locator('[data-poj="brzine"]').click();
    await p.locator('[data-poj="brzine"]').evaluate(button => button.nextElementSibling.querySelectorAll('.kPod > button').forEach(b=>b.click()));
    const svg = p.locator('svg[data-zum]:visible').first();
    await svg.focus();
    await p.keyboard.press('Enter');
    results.push({name:'Keyboard opens a real glossary diagram',pass:await p.locator('#imgZoom img.crtezZum').count()===1});
    await p.keyboard.press('Escape');
    await p.locator('[data-nav="sim"]').first().click();
    await p.evaluate(() => {
      const record=JSON.parse(localStorage.getItem('vozackiA.sim'));
      record.i=__dev.sim.qs.findIndex(sq=>sq.q.img);
      if(record.i<0) throw Error('Exam fixture has no image');
      localStorage.setItem('vozackiA.sim',JSON.stringify(record));
    });
    p.on('dialog', dialog=>dialog.accept());
    await p.reload();
    await p.waitForFunction(()=>document.querySelector('#simQCard img.qImg')?.naturalWidth>0);
    const examBefore=await p.evaluate(()=>localStorage.getItem('vozackiA.sim'));
    await p.locator('#simQCard .qImgBtn').click();
    await p.keyboard.press('1'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter');
    results.push({name:'Image modal preserves exam answers, position and saved record',pass:examBefore===await p.evaluate(()=>localStorage.getItem('vozackiA.sim'))});
    await p.keyboard.press('Escape');
    if(results.some(r=>!r.pass)) throw Error(JSON.stringify(results));
    return results;
  } finally { await ctx.close(); }
}
