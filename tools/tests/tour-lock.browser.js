// Run after tour.browser.js in a disposable localhost checkout. All storage
// writes use fresh contexts and synthetic data; the caller is not modified.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:\d+(?=\/|$)/)?.[0];
  if (!origin) throw Error('Tour lock test requires isolated localhost.');
  const browser = page.context().browser(), results = [];
  const assert = (value, message) => { if (!value) throw Error(message); };
  for (const script of ['l', 'c']) for (const phase of ['pending', 'open']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    try {
      context.setDefaultTimeout(5000);
      await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      await context.addInitScript(script => {
        if (localStorage.getItem('vozackiA.v1') === null) localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, tour: 0, noUpd: 1, script }));
        // Observe this document's listener lifetime without calling application
        // closures or forcing a role. The peer writes through real same-origin storage.
        const add = window.addEventListener, remove = window.removeEventListener;
        window.__tourResizeListeners = new Set();
        window.addEventListener = function(type, listener, options) {
          if (type === 'resize') window.__tourResizeListeners.add(listener);
          return add.call(this, type, listener, options);
        };
        window.removeEventListener = function(type, listener, options) {
          if (type === 'resize') window.__tourResizeListeners.delete(listener);
          return remove.call(this, type, listener, options);
        };
      }, script);
      const peer = await context.newPage();
      // Same origin, no app boot/lock: models an older non-cooperating document.
      await peer.goto(origin + '/version.js');
      const p = await context.newPage(), errors = [];
      p.on('pageerror', error => errors.push(error.message));
      await p.goto(origin);
      await p.waitForFunction(() => !!window.__dev);
      assert(await p.evaluate(() => window.__dev.rezimPisanja) === 'writer', 'Fixture did not acquire writer role.');
      assert(await p.locator('#tourTip').count() === 0, 'Pending-guide fixture reached the page too late.');
      const before = await p.evaluate(() => ({ memory: JSON.stringify(window.__dev.S), listeners: window.__tourResizeListeners.size }));
      if (phase === 'open') {
        await p.locator('#tourTip').waitFor();
        assert(await p.evaluate(() => window.__tourResizeListeners.size) === before.listeners + 1, 'Guide resize listener not installed exactly once.');
      }
      const external = await peer.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('vozackiA.v1'));
        state.theme = 'dark';
        const raw = JSON.stringify(state);
        localStorage.setItem('vozackiA.v1', raw);
        return raw;
      });
      await p.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      await p.waitForTimeout(800); // Let the actual pending automatic guide callback fire.
      assert(await p.locator('#tourTip, #tourDim, .tourSpot').count() === 0, 'Locked page retained or started a guide.');
      await p.setViewportSize({ width: 568, height: 320 });
      await p.keyboard.press('Escape');
      const after = await p.evaluate(() => ({ memory: JSON.stringify(window.__dev.S), raw: localStorage.getItem('vozackiA.v1'), listeners: window.__tourResizeListeners.size, focusInert: !!document.activeElement.closest('[inert]') }));
      assert(after.memory === before.memory, 'Guide conflict cleanup changed the in-memory progress or completion flag.');
      assert(after.raw === external, 'Guide cleanup overwrote the other document.');
      assert(after.listeners === before.listeners, 'Guide resize listener survived cleanup.');
      assert(!after.focusInert && errors.length === 0, 'Conflict restored focus into locked content or caused an error.');
      results.push({ script, phase, pass: true });
    } finally { await context.close(); }
  }
  return { passed: results.length === 4, results };
}
