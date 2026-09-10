// Playwright CLI: run-code --filename tools/tests/readiness.browser.js
// Only fresh disposable contexts on localhost; no caller storage changes.
async (page) => {
  const origin = page.url().match(/^https?:\/\/localhost(?::\d+)?(?=\/|$)/)?.[0];
  if (!origin) throw Error('Readiness test requires localhost.');
  const results = [];
  for (const scenario of ['first30', 'narrow150', 'repeatOne', 'fullGood', 'fullWrong']) {
    const context = await page.context().browser().newContext({ serviceWorkers: 'block', viewport: scenario === 'first30' ? {width:320,height:844} : {width:1280,height:900} });
    try {
      const p = await context.newPage();
      await p.goto(origin);
      await p.waitForFunction(() => !!window.__dev);
      const count = await p.evaluate(async (scenario) => {
        await window.__dev.proveraBezFajla();
        if (sessionStorage.getItem('provera.kontekst') !== null) throw Error('Scoring recovery is pending.');
        const Q = window.QUIZ.questions;
        const chosen = scenario === 'first30' ? Q.slice(0, 30) : scenario === 'narrow150'
          ? Q.filter(q => q.sub === 159).concat(Q.filter(q => q.sub === 160)).slice(0, 150)
          : scenario === 'repeatOne' ? Q.slice(0, 1) : Q;
        const a = scenario === 'repeatOne' ? 10000 : scenario.startsWith('full') ? 20 : 1;
        const q = Object.fromEntries(chosen.map(q => [q.id, { a, w: scenario === 'fullWrong' ? a : 0 }]));
        const sims = scenario === 'first30' ? [1,2,3,4,5].map(i=>({d:Date.now()-i*86400000,score:98,total:98,passed:true})) : [];
        localStorage.setItem('vozackiA.v1', JSON.stringify({ q, sims, tour: 1, noUpd: 1, script: 'l', fs:scenario==='first30'?1.25:1, theme:scenario==='first30'?'dark':'light' }));
        return chosen.length;
      }, scenario);
      await p.reload();
      await p.waitForFunction(() => !!window.__dev);
      const home = await p.locator('#mSimSub').innerText();
      const sp = await p.evaluate(() => window.__dev.spremnost());
      if (scenario === 'first30') {
        await p.locator('.menuBtn[data-nav="sim"]').scrollIntoViewIfNeeded();
        await p.screenshot({path:'output/playwright/readiness-partial-home-320-125.png'});
      }
      await p.locator('.menuBtn[data-nav="stats"]').click();
      const stats = await p.locator('#readyCard').innerText();
      if (scenario.startsWith('full')) {
        const percent = Math.round(sp.sansa * 100) + '%';
        if (!sp.modelDostupan || !home.includes(percent) || !stats.includes(percent)) throw Error(scenario + ': model outputs differ between home and statistics.');
        if (!home.includes('uslovna procena modela') || !stats.includes('Ovo nije izmerena šansa polaganja')) throw Error(scenario + ': conditional model label missing.');
        if (await p.locator('#readyCard .pill.pass, #readyCard .pill.fail, #readyCard .bigScore.pass, #readyCard .bigScore.fail').count()) throw Error(scenario + ': model is labeled as an actual exam result.');
      } else {
        if (sp.sansa !== null || sp.sansaOk || sp.nedostaje !== 1327 - count) throw Error(scenario + ': unseen questions borrowed confidence.');
        for (const text of [home, stats]) {
          // The home button still states the real exam's 85% threshold.
          if (!text.includes(String(1327 - count)) || /procena modela\s+\d+%/i.test(text)) throw Error(scenario + ': missing-data counts are inconsistent: ' + text);
        }
        if (!stats.includes(count + ' / 1327') || home.includes(count + ' / 1327')) throw Error(scenario + ': home notice is not compact or detailed statistics lost coverage.');
        if (await p.locator('#readyCard .bigScore').count()) throw Error(scenario + ': an incomplete model displayed points.');
        const checklist = await p.locator('#readyCard .brRed').allTextContents();
        if (checklist.length !== 4 || !checklist[3].includes(String(1327-count)) || checklist[3].includes('%')) throw Error(scenario + ': factual checklist missing or unknown model formatted as a percentage.');
        if (scenario === 'first30' && (!checklist[0].includes('imaš 5') || !checklist[1].includes('imaš 5') || !checklist.slice(0,3).every(text=>text.includes('✓')))) throw Error('Partial profile hid completed simulation facts.');
      }
      if (scenario === 'first30') await p.locator('#readyCard').screenshot({path:'output/playwright/readiness-partial-stats-320-125.png'});
      results.push({ scenario, answered: count, missing: sp.nedostaje, modelAvailable: sp.modelDostupan, percentage: sp.sansa === null ? null : Math.round(sp.sansa * 100) });
    } finally { await context.close(); }
  }
  return { passed: results.length, results };
}
