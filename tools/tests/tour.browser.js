// Playwright CLI run-code --filename tools/tests/tour.browser.js
// Synthetic fresh contexts only. 200% here means text/root-font resizing,
// not a claim that native pinch zoom or a physical phone was tested.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:\d+(?=\/|$)/)?.[0];
  if (!origin) throw Error('Tour test requires an isolated localhost checkout.');
  const browser = page.context().browser(), results = [], failures = [], stamp = Date.now();
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const cases = [];
  for (const width of [320, 390, 1280]) for (const script of ['l', 'c']) for (const scale of [1, 1.25, 2]) cases.push({ width, height: 844, script, scale });
  cases.push({ width: 568, height: 240, script: 'c', scale: 2 }, { width: 320, height: 400, script: 'l', scale: 2 });
  for (const { width, height, script, scale } of cases) {
    const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    let p;
    try {
      await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      await context.addInitScript(script => {
        if (sessionStorage.getItem('tour.fixture')) return;
        if (localStorage.getItem('vozackiA.v1') !== null) throw Error('Tour context was not empty.');
        localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, tour: 0, noUpd: 1, script }));
        sessionStorage.setItem('tour.fixture', '1');
      }, script);
      p = await context.newPage();
      p.setDefaultTimeout(5000);
      await p.goto(origin);
      await p.waitForFunction(() => !!window.__dev);
      await p.evaluate(scale => { document.documentElement.style.fontSize = ((innerWidth <= 560 ? 15 : 16) * scale) + 'px'; }, scale);
      await p.locator('#tourTip').waitFor();
      const initialFocusUsable = () => p.evaluate(async () => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const b = document.activeElement;
        if (b.id !== 'tourNext') return false;
        const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return r.left >= 0 && r.right <= innerWidth + .5 && r.top >= 0 && r.bottom <= innerHeight + .5 && (hit === b || b.contains(hit));
      });
      const steps = [];
      for (let step = 1; step <= 7; step++) {
        assert((await p.locator('#tourTip .mut').innerText()).trim() === `${step} / 7`, 'Tour skipped a step.');
        assert(await initialFocusUsable(), `Step ${step}: initial keyboard focus is clipped or covered.`);
        const textScroller = p.locator('#tourTip .tourText');
        if (await textScroller.evaluate(text => text.scrollHeight > text.clientHeight + 1)) {
          assert(await textScroller.getAttribute('tabindex') === '0', 'Overflowing guide text is not keyboard focusable.');
          await textScroller.focus();
          await p.keyboard.press('End');
          await p.waitForFunction(() => {
            const text = document.querySelector('#tourTip .tourText');
            return text.scrollTop + text.clientHeight >= text.scrollHeight - 2;
          });
          await p.keyboard.press('Home');
          await p.waitForFunction(() => document.querySelector('#tourTip .tourText').scrollTop === 0);
          await p.locator('#tourNext').focus();
          assert(await initialFocusUsable(), 'Reading long guide text hid the Next button.');
        }
        if (width === 390 && script === 'c' && scale === 2 && step === 3) {
          const text = await p.locator('#tourTip .tourText').innerText();
          await p.setViewportSize({ width: 568, height: 240 });
          assert(await initialFocusUsable(), 'Resize to short landscape hid the focused control.');
          assert(await p.locator('#tourTip').count() === 1 && await p.locator('#tourTip .tourText').innerText() === text, 'Resize restarted or duplicated the guide.');
          await p.setViewportSize({ width, height });
          assert(await initialFocusUsable(), 'Resize back hid the focused control.');
        }
        for (const id of ['tourSkip', 'tourNext']) {
          const control = p.locator('#' + id);
          await control.scrollIntoViewIfNeeded();
          const usable = await control.evaluate(async button => {
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const r = button.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= innerWidth + .5 && r.top >= 0 && r.bottom <= innerHeight + .5
              && (hit === button || button.contains(hit));
          });
          assert(usable, `Step ${step}: ${id} is clipped or covered.`);
        }
        steps.push(step);
        if (step === 1 && script === 'c' && scale === 2 && (width === 320 || height === 240)) {
          await p.screenshot({ path: `output/playwright/tour-${width}-${height}-c-200-candidate.png` });
        }
        if (step % 2) await p.locator('#tourNext').click();
        else await p.keyboard.press('Enter');
      }
      assert(await p.locator('#tourTip').count() === 0, 'Tour remained after its last step.');
      const after = await p.evaluate(() => ({ saved: JSON.parse(localStorage.getItem('vozackiA.v1')).tour, focus: document.activeElement.id, questions: Object.keys(window.__dev.S.q).length }));
      assert(after.saved === 1 && after.questions === 0, 'Tour completion changed answers or was not saved.');
      assert(after.focus === 'glavni', 'Automatic tour did not return focus to the main content.');
      // Replay must also open at the actual viewport/text size. No temporary
      // enlargement or forced click may conceal obstructed settings controls.
      const settings = p.locator('#btnPodesavanja');
      if (await settings.getAttribute('aria-expanded') !== 'true') await settings.click();
      await p.locator('#btnTourReplay').click();
      await p.locator('#tourNext').waitFor();
      await p.keyboard.press('Escape');
      assert(await p.locator('#tourTip').count() === 0, 'Escape did not close the replay.');
      assert(await p.evaluate(() => document.activeElement.id) === 'btnTourReplay', 'Escape did not restore replay-button focus.');
      await p.locator('#btnTourReplay').click();
      await p.locator('#tourSkip').click();
      assert(await p.evaluate(() => document.activeElement.id) === 'btnTourReplay', 'Skip did not restore replay-button focus.');
      // The guide must not make session-only settings permanently open.
      if (width === 320 && script === 'c' && scale === 2) {
        await p.reload();
        await p.waitForFunction(() => !!window.__dev);
        await p.waitForTimeout(800);
        assert(await p.locator('#tourTip').count() === 0, 'Completed guide appeared again after reload.');
        assert(await p.locator('#btnPodesavanja').getAttribute('aria-expanded') === 'false', 'Guide changed settings persistence.');
      }
      results.push({ width, height, script, scale, steps: steps.length, autoFinished: true, replayEscape: true, replaySkip: true });
    } catch (error) {
      let screenshot;
      if (p) { screenshot = `output/playwright/tour-${stamp}-${width}-${script}-${scale}-failure.png`; await p.screenshot({ path: screenshot }).catch(() => {}); }
      failures.push({ width, height, script, scale, error: error.message, screenshot });
    } finally { await context.close(); }
  }
  return { passed: failures.length === 0 && results.length === cases.length, contexts: cases.length, results, failures };
}
