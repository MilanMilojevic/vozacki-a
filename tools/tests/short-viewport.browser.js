// Run on a disposable localhost checkout. Text resizing is not native pinch zoom.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:\d+(?=\/|$)/)?.[0];
  if (!origin) throw Error('Short viewport test requires isolated localhost.');
  const browser = page.context().browser(), results = [];
  if (!browser) throw Error('A disposable BrowserContext is required.');
  for (const width of [320, 568, 1280]) for (const script of ['l', 'c']) {
    const context = await browser.newContext({ viewport: { width, height: 240 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    context.setDefaultTimeout(3500);
    try {
      await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      await context.addInitScript(script => {
        localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, tour: 1, noUpd: 1, script }));
      }, script);
      const p = await context.newPage();
      await p.goto(origin);
      await p.waitForFunction(() => !!window.__dev);
      await p.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
      await p.locator('#btnPodesavanja').click();
      if (await p.locator('#btnPodesavanja').getAttribute('aria-expanded') !== 'true') throw Error('Settings did not open.');
      // Real clicks; no forced interaction or temporary viewport enlargement.
      await p.locator('#btnTourReplay').click();
      await p.locator('#tourNext').waitFor();
      await p.keyboard.press('Escape');
      await p.locator('#btnPlanPomoc').click();
      await p.keyboard.press('Escape');
      await p.locator('#btnPodesavanja').click();
      if (await p.locator('#btnPodesavanja').getAttribute('aria-expanded') !== 'false') throw Error('Settings did not close.');
      if (await p.evaluate(() => getComputedStyle(document.documentElement).fontSize) !== '32px') throw Error('Text resize was lost during the tested interactions.');
      await p.locator('.brand').click();
      if (await p.locator('#view-home').evaluate(el => !el.classList.contains('active'))) throw Error('Home navigation failed.');
      const state = await p.evaluate(() => ({ q: Object.keys(window.__dev.S.q).length, sim: localStorage.getItem('vozackiA.sim') }));
      if (state.q !== 0 || state.sim) throw Error('Layout interactions changed practice progress.');
      // renderHome reapplies the app preference; restore the external text-size
      // probe before the screenshot, so it cannot silently show ordinary text.
      await p.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
      await p.locator('#btnPodesavanja').click();
      await p.locator('#btnTourReplay').scrollIntoViewIfNeeded();
      await p.screenshot({ path: `output/playwright/short-${width}-${script}-32px.png` });
      results.push({ width, height: 240, script, textPixels: 32, passed: true });
    } catch (error) {
      results.push({ width, height: 240, script, textPixels: 32, passed: false, error: String(error.message).slice(0, 700) });
    } finally { await context.close(); }
  }
  return { passed: results.every(r => r.passed), results };
}
