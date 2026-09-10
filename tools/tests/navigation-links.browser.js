// Playwright CLI: open disposable localhost:18764, then run-code --filename tools/tests/navigation-links.browser.js.
// Every case creates/closes its own BrowserContext. File mode uses ?navigationFile=file:///.../output/navigation-links-v146/index.html.
// Synthetic state only; the caller and any study profile remain untouched.
async (page) => {
  const base = await page.evaluate(() => new URLSearchParams(location.search).get('navigationFile') || location.href.split(/[?#]/)[0]);
  if (!/^http:\/\/localhost:18764\//.test(base) && !/^file:\/\/\/.*\/output\/navigation-links-v146\/index\.html$/.test(base)) throw Error('Use the owned navigation snapshot.');
  const browser = page.context().browser(), results = [];
  const assert = (v, m) => { if (!v) throw Error(m); };
  const ready = p => p.waitForSelector('.view.active');
  async function test(name, fn, noLocks = false) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    context.setDefaultTimeout(2500);
    const errors = []; context.on('page', p => p.on('pageerror', e => errors.push(String(e))));
    await context.route('**/*', r => /^(http:\/\/localhost:18764\/|file:)/.test(r.request().url()) ? r.continue() : r.abort());
    await context.addInitScript(noLocks => {
      if (!/^(http:|file:)$/.test(location.protocol)) return;
      if (localStorage.getItem('vozackiA.v1') === null) localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, tour: 1, noUpd: 1, script: 'l' }));
      window.__ops = [];
      for (const name of ['setItem', 'removeItem', 'clear']) {
        const original = Storage.prototype[name];
        Storage.prototype[name] = function (...args) { window.__ops.push(name); return original.apply(this, args); };
      }
      const open = indexedDB.open.bind(indexedDB);
      indexedDB.open = (...args) => { window.__ops.push('idb'); return open(...args); };
      if (noLocks) Object.defineProperty(navigator, 'locks', { value: undefined });
      else if (navigator.locks) {
        const request = navigator.locks.request.bind(navigator.locks);
        navigator.locks.request = (...args) => { window.__ops.push('lock'); return request(...args); };
      }
      window.showSaveFilePicker = async () => { window.__ops.push('file'); throw Error('Synthetic picker must not run.'); };
    }, noLocks);
    try { await fn(context); assert(!errors.length, errors.join(' | ')); results.push({ name, pass: true }); }
    catch (e) { results.push({ name, pass: false, error: String(e) }); }
    finally { await context.close(); }
  }
  await test('destinations are native anchors; plain Enter stays in writer flow', async c => {
    const p = await c.newPage(); await p.goto(base + '#/sek/c25'); await ready(p);
    const a = p.locator('.subRow').first();
    assert(await a.evaluate(e => e.tagName === 'A' && new URL(e.href).searchParams.get('preview') === '1'), 'Subcategory has no safe native href.');
    await a.focus(); await p.keyboard.press('Enter');
    assert(!p.url().includes('preview=1'), 'Ordinary Enter entered preview.');
  });
  await test('real middle click opens preview and leaves source URL unchanged', async c => {
    const p = await c.newPage(); await p.goto(base + '#/sek/c25'); await ready(p); const before = p.url();
    const popup = c.waitForEvent('page', { timeout: 2500 });
    await p.locator('.subRow').first().click({ button: 'middle' });
    const q = await popup; await ready(q);
    assert(q.url().includes('preview=1') && p.url() === before, 'Middle click navigated the source or lacked preview.');
    assert(await q.evaluate(() => __ops.length === 0), 'Preview performed persistence/lock operations.');
  });
  await test('explicit preview renders options, answer and explanations with zero operations', async c => {
    const p = await c.newPage(); await p.goto(base + '?preview=1#/p/7921'); await ready(p);
    assert(await p.locator('[data-preview]').count() === 1, 'Preview has no clear mode label.');
    assert(await p.locator('#qCard .choice').count() > 1, 'Question options are missing.');
    await p.locator('#previewAnswer').click();
    assert(await p.locator('#qCard .explBox').count() > 0, 'No explanation after local reveal.');
    await p.locator('#btnScript').click(); await p.locator('#btnTheme').click();
    assert(await p.evaluate(() => __ops.length === 0), 'Explicit preview performed persistence/lock operations.');
    assert(await p.locator('[data-practice-link]').evaluate(e => e.tagName === 'A' && !new URL(e.href).searchParams.has('preview')), 'No deliberate route to normal practice.');
  });
  await test('explicit preview remains read only with missing Web Locks', async c => {
    const p = await c.newPage(); await p.goto(base + '?preview=1#/sva'); await ready(p);
    await p.locator('#qSearch').fill('#7921'); await p.locator('.qRow:visible').click();
    assert(await p.locator('#qCard .qNum').innerText() === '#7921', 'Preview cannot browse a question.');
    assert(await p.evaluate(() => __ops.length === 0), 'No-lock preview wrote storage or opened IDB.');
  }, true);
  if (base.startsWith('http:')) await test('initial reader browses content while writer remains untouched', async c => {
    const writer = await c.newPage(); await writer.goto(base); await ready(writer);
    const raw = await writer.evaluate(() => localStorage.getItem('vozackiA.v1'));
    const reader = await c.newPage(); await reader.goto(base + '#/p/7921'); await ready(reader);
    assert(await reader.locator('#qCard .qNum').innerText() === '#7921', 'Initial reader has no usable content.');
    assert(await reader.locator('#glavni').evaluate(e => !e.inert), 'Initial reader content is inert.');
    assert(await writer.evaluate(() => localStorage.getItem('vozackiA.v1')) === raw, 'Reader changed writer progress.');
  });
  await test('preview Back/Forward, search and local script changes preserve display only', async c => {
    const p = await c.newPage(); await p.goto(base + '?preview=1#/sva'); await ready(p);
    await p.locator('#qSearch').fill('#7921'); await p.locator('.qRow:visible').click();
    await p.goBack(); await p.waitForTimeout(120);
    assert(await p.locator('#qSearch').inputValue() === '#7921', 'Preview Back lost search.');
    await p.locator('#btnScript').click(); await p.waitForTimeout(120);
    assert(await p.locator('#qSearch').inputValue() === '#7921', 'Local script redraw lost search.');
    await p.goForward(); await p.waitForTimeout(120);
    assert(await p.locator('#qCard .qNum').innerText() === '#7921', 'Preview Forward lost question.');
    await p.reload(); await ready(p);
    assert(await p.locator('#qCard .qNum').innerText() === '#7921' && await p.evaluate(() => __ops.length === 0), 'Preview reload changed mode or wrote.');
  });
  await test('glossary deep link and actual image keyboard zoom work without writes', async c => {
    const p = await c.newPage(); await p.goto(base + '?preview=1#/pojmovnik'); await ready(p);
    const first = p.locator('#browseList .pojBtn').first(); await first.focus(); await p.keyboard.press('Enter');
    assert(p.url().includes('#/pojmovnik/'), 'Glossary entry has no stable destination.');
    const title = await p.locator('#browseList h3').innerText(); await p.reload(); await ready(p);
    assert(await p.locator('#browseList h3').innerText() === title, 'Glossary reload lost card.');
    const id = await p.evaluate(() => QUIZ.questions.find(q => q.img).id);
    await p.goto(base + '?preview=1#/p/' + id); await ready(p);
    await p.locator('.qImg').evaluate(im => im.decode());
    await p.locator('.qImgBtn').focus(); await p.keyboard.press('Enter');
    await p.locator('[role="dialog"] .zoomAlat.gore button').waitFor(); await p.keyboard.press('Escape');
    assert(await p.locator('[role="dialog"]').count() === 0, 'Escape did not close image.');
    assert(await p.evaluate(() => document.activeElement.classList.contains('qImgBtn') && __ops.length === 0), 'Zoom lost keyboard focus or wrote.');
  });
  await test('ordinary practice link deliberately leaves standalone preview', async c => {
    const p = await c.newPage(); await p.goto(base + '?preview=1#/p/7921'); await ready(p);
    await p.locator('[data-practice-link]').click(); await ready(p);
    assert(!p.url().includes('preview=1') && await p.locator('.markBox input').count() === 1, 'Ordinary-practice link trapped visitor in preview.');
  });
  await test('missing or malformed progress remains untouched in explicit preview', async c => {
    for (const raw of [null, '{synthetic invalid']) {
      const p = await c.newPage();
      await p.addInitScript(raw => {
        if (raw === null) localStorage.removeItem('vozackiA.v1'); else localStorage.setItem('vozackiA.v1', raw);
        window.__ops.length = 0;
      }, raw);
      await p.goto(base + '?preview=1#/p/7921'); await ready(p);
      await p.locator('#previewAnswer').click();
      assert(await p.evaluate(raw => localStorage.getItem('vozackiA.v1') === raw && __ops.length === 0, raw), 'Preview replaced missing/malformed bytes or attempted persistence.');
      await p.close();
    }
  });
  await test('context-menu destination is native and unsupported modifiers are not intercepted', async c => {
    const p = await c.newPage(); await p.goto(base + '#/sek/c25'); await ready(p); const before = p.url();
    const a = p.locator('.subRow').first();
    await a.click({ button: 'right' }); assert(p.url() === before, 'Right click navigated current tab.'); await p.keyboard.press('Escape');
    const observations = await a.evaluate(a => {
      const values = [];
      for (const modifier of ['altKey', 'metaKey', 'shiftKey']) {
        const inspect = e => { values.push({ modifier, prevented: e.defaultPrevented }); e.preventDefault(); };
        document.addEventListener('click', inspect, { once: true });
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, [modifier]: true }));
      }
      return { values, href: a.href };
    });
    assert(observations.values.every(v => !v.prevented) && p.url() === before, 'App intercepted a modifier click.');
    const q = await c.newPage(); await q.goto(observations.href); await ready(q);
    assert(await q.locator('[data-preview]').count() === 1, 'Copied/context-menu URL cannot load preview.');
  });
  await test('unsupported exam/practice and noncanonical personal routes explain fallback', async c => {
    const p = await c.newPage();
    for (const hash of ['#/lista/wrong/', '#/lista/marked/extra', '#/sim', '#/uci', '#/vezba', '#/vezba/c25']) {
      await p.goto(base + '?preview=1' + hash); await ready(p);
      assert(await p.locator('#previewRouteNote').isVisible() && p.url().endsWith(hash), 'Unsupported route silently changed destination: ' + hash);
      assert(await p.locator('#browseList .qRow').count() > 0 && await p.evaluate(() => __ops.length === 0), 'Fallback lacks content or writes: ' + hash);
    }
    await p.goto(base + '?preview=1#/pregled/0'); await ready(p);
    assert(await p.locator('#reviewUnavailable').isVisible() && p.url().endsWith('#/pregled/0'), 'Legacy review must report unavailable instead of guessing an index');
    assert(await p.locator('#simResultCard .bigScore').count() === 0 && await p.evaluate(() => __ops.length === 0), 'Legacy review fabricated a result or wrote data');
  });
  await test('unknown inherited glossary keys remain usable on direct preview and writer loads', async c => {
    await c.addInitScript(() => {
      let data;
      Object.defineProperty(window, 'EXPLAIN', { configurable: true, get: () => data, set: value => {
        data = value;
        data.cards['missing-title'] = { h: { l: 'test', c: 'test' } };
        data.cards['missing-body'] = { t: { l: 'test', c: 'test' } };
      } });
    });
    for (const query of ['?preview=1', '']) for (const key of ['__proto__', 'constructor', 'toString', 'missing-title', 'missing-body']) {
      const p = await c.newPage(); await p.goto(base + query + '#/pojmovnik/' + key); await ready(p);
      if (!query && base.startsWith('http:')) assert(await p.evaluate(() => __dev.rezimPisanja === 'writer'), 'Ordinary-route case did not hold writer role.');
      assert(await p.locator('#browseList .pojBtn').count() > 0, 'Unknown glossary key did not return a usable index: ' + key);
      assert(await p.locator('#glossaryUnknown').isVisible(), 'Unknown glossary fallback is not explained: ' + key);
      if (query) assert(await p.evaluate(() => __ops.length === 0), 'Malformed preview route attempted persistence.');
      await p.close();
    }
  });
  if (base.startsWith('http:')) {
    await test('in-session malformed routes cannot expose writer controls or change memory', async c => {
      const fixture = await page.evaluate(() => JSON.stringify({ v: 1, d: Date.now() + 1800000, i: 3, r: 0,
        qs: QUIZ.questions.slice(0, 41).map(q => ({ id: q.id, o: q.ch.map(c => c.id), c: [], m: 0 })) }));
      const p = await c.newPage();
      await p.addInitScript(raw => { localStorage.setItem('vozackiA.sim', raw); window.__ops.length = 0; }, fixture);
      await p.goto(base + '?preview=1#/p/7921'); await ready(p);
      await p.evaluate(() => { window.__initialPreviewState = __dev.S; });
      const before = await p.evaluate(() => JSON.stringify({ s: __dev.S, raw: localStorage.getItem('vozackiA.v1'), sim: localStorage.getItem('vozackiA.sim') }));
      for (const hash of ['#/pojmovnik/__proto__', '#/pojmovnik/constructor', '#/p/7921extra', '#/sek/c25extra', '#/pojmovnik/missing-card']) {
        await p.evaluate(hash => { location.hash = hash; }, hash); await p.waitForTimeout(120);
        await p.evaluate(() => { document.getElementById('btnPodesavanja')?.click(); document.getElementById('btnPlanAuto')?.click(); });
        assert(await p.evaluate(() => JSON.stringify({ s: __dev.S, raw: localStorage.getItem('vozackiA.v1'), sim: localStorage.getItem('vozackiA.sim') })) === before, 'Malformed route exposed a writer mutation: ' + hash);
        assert(await p.locator('#btnPodesavanja, #btnPlanAuto, #btnReset, #fileImport').count() === 0, 'Preview constructed writer controls: ' + hash);
        assert(await p.locator('.view.active').count() === 1 && await p.evaluate(() => __ops.length === 0), 'Malformed route left unusable content or attempted a write.');
        assert(await p.evaluate(() => __dev.S === __initialPreviewState && __dev.sim === null), 'Malformed route replaced state identity or resumed the exam.');
      }
    });
    await test('preview boot and traversal rendering errors fall back to usable content only', async c => {
      const p = await c.newPage();
      await p.addInitScript(() => {
        let data;
        Object.defineProperty(window, 'EXPLAIN', { configurable: true, get: () => data, set: value => {
          data = value;
          data.cards['renderer-failure'] = { t: { l: 'Synthetic rendering failure', c: 'Синтетичка грешка приказа' }, h: { c: 'test', get l() { throw Error('Synthetic card renderer failure'); } } };
        } });
      });
      await p.goto(base + '?preview=1#/pojmovnik/renderer-failure'); await ready(p); await p.waitForFunction(() => !!window.__dev);
      const before = await p.evaluate(() => JSON.stringify({ s: __dev.S, raw: localStorage.getItem('vozackiA.v1'), sim: localStorage.getItem('vozackiA.sim') }));
      assert(await p.locator('#browseList .qRow').count() > 0 && await p.locator('#previewRouteNote').isVisible(), 'Boot rendering failure lacks usable catalog and explanation.');
      await p.evaluate(() => { location.hash = '#/pojmovnik/renderer-failure'; }); await p.waitForTimeout(120);
      await p.evaluate(() => { document.getElementById('btnPlanAuto')?.click(); });
      assert(await p.locator('#btnPlanAuto, #btnPodesavanja').count() === 0 && await p.locator('#browseList .qRow').count() > 0, 'Traversal failure exposed writer home or lost catalog.');
      assert(await p.evaluate(() => JSON.stringify({ s: __dev.S, raw: localStorage.getItem('vozackiA.v1'), sim: localStorage.getItem('vozackiA.sim') })) === before, 'Error fallback changed state.');
      assert(await p.evaluate(() => __ops.length === 0), 'Error fallback attempted persistence.');
    });
    await test('preview leaves exact in-memory S and pending SIM bytes unchanged across content actions', async c => {
      const fixture = await page.evaluate(() => JSON.stringify({ v: 1, d: Date.now() + 1800000, i: 3, r: 0,
        qs: QUIZ.questions.slice(0, 41).map(q => ({ id: q.id, o: q.ch.map(c => c.id), c: [], m: 0 })) }));
      const p = await c.newPage();
      await p.addInitScript(raw => { localStorage.setItem('vozackiA.sim', raw); window.__ops.length = 0; }, fixture);
      await p.goto(base + '?preview=1#/p/7921'); await ready(p); await p.waitForFunction(() => !!window.__dev);
      await p.evaluate(() => { window.__initialPreviewState = __dev.S; });
      const before = await p.evaluate(() => ({ memory: JSON.stringify(__dev.S), progress: localStorage.getItem('vozackiA.v1'), exam: localStorage.getItem('vozackiA.sim') }));
      assert(before.exam === fixture, 'Fixture pending exam changed during preview boot.');
      await p.locator('#previewAnswer').click(); await p.locator('#btnScript').click(); await p.locator('#btnTheme').click();
      await p.locator('.brand').click(); await p.locator('#qSearch').fill('#7921');
      await p.locator('#browseHead a[href$="#/pojmovnik"]').click(); await p.locator('#browseList .pojBtn').first().click();
      const after = await p.evaluate(() => ({ memory: JSON.stringify(__dev.S), progress: localStorage.getItem('vozackiA.v1'), exam: localStorage.getItem('vozackiA.sim') }));
      assert(JSON.stringify(after) === JSON.stringify(before), 'Preview changed exact in-memory progress or pending exam bytes.');
      assert(await p.evaluate(() => __dev.S === __initialPreviewState && __dev.sim === null && __ops.length === 0), 'Preview replaced state identity, started an exam or attempted persistence.');
    });
    await test('modified navigation during active exam leaves SIM and source intact', async c => {
      const p = await c.newPage(); await p.goto(base); await ready(p);
      await p.locator('.menuBtn[data-nav="sim"]').click();
      const raw = await p.evaluate(() => localStorage.getItem('vozackiA.sim'));
      assert(raw !== null, 'Fixture did not start an exam.');
      let dialogs = 0; p.on('dialog', d => { dialogs++; d.dismiss(); });
      const event = c.waitForEvent('page'); await p.locator('.brand').click({ modifiers: ['Control'] });
      const q = await event; await ready(q);
      assert(p.url().endsWith('#/sim') && dialogs === 0, 'Modified click navigated/prompted exam.');
      assert(await p.evaluate(() => localStorage.getItem('vozackiA.sim')) === raw, 'Preview mutated the pending exam.');
      assert(await q.evaluate(() => __ops.length === 0 && window.__dev.sim === null), 'Preview resumed SIM or wrote.');
      await p.locator('.brand').click();
      assert(dialogs === 1 && p.url().endsWith('#/sim'), 'Ordinary canceled navigation failed to preserve exam.');
    });
    await test('writer changes do not freeze or promote initial reader', async c => {
      const writer = await c.newPage(); await writer.goto(base + '#/p/7921'); await ready(writer);
      const reader = await c.newPage(); await reader.goto(base + '#/p/7921'); await ready(reader);
      const startOps = await reader.evaluate(() => __ops.slice());
      await writer.locator('.markBox input').check(); await reader.waitForTimeout(120);
      await reader.locator('#previewAnswer').click();
      assert(await reader.evaluate(() => __dev.rezimPisanja === 'reader' && !document.getElementById('glavni').inert), 'Reader was promoted or frozen by storage event.');
      assert(await reader.evaluate(() => JSON.stringify(__ops)) === JSON.stringify(startOps), 'Reader wrote after writer update.');
      await writer.evaluate(() => localStorage.removeItem('vozackiA.v1')); await reader.waitForTimeout(120);
      await reader.locator('#btnScript').click();
      assert(await reader.evaluate(() => localStorage.getItem('vozackiA.v1') === null && !document.getElementById('glavni').inert), 'Removing writer progress froze preview or caused it to restore stale bytes.');
      assert(await reader.evaluate(() => JSON.stringify(__ops)) === JSON.stringify(startOps), 'Reader wrote after progress removal.');
      await writer.close(); await reader.waitForTimeout(120);
      assert(await reader.evaluate(() => __dev.rezimPisanja === 'reader'), 'Reader automatically took over after writer closed.');
    });
    await test('conflict and retired tabs remain frozen, including existing links', async c => {
      const p = await c.newPage(); await p.goto(base + '#/sek/c25'); await ready(p);
      await p.evaluate(() => dispatchEvent(new StorageEvent('storage', { key: 'vozackiA.v1', newValue: 'synthetic conflict' })));
      await p.waitForSelector('#tabZakljucan');
      assert(await p.evaluate(() => __dev.rezimPisanja === 'conflict' && document.getElementById('glavni').inert), 'Conflict is no longer frozen.');
      const raw = await p.evaluate(() => localStorage.getItem('vozackiA.v1'));
      await p.evaluate(() => { document.querySelector('.subRow').click(); dispatchEvent(new PageTransitionEvent('pagehide')); });
      await p.waitForTimeout(120);
      assert(await p.evaluate(() => __dev.rezimPisanja === 'retired' && document.getElementById('glavni').inert), 'Retired tab became preview.');
      assert(await p.evaluate(() => localStorage.getItem('vozackiA.v1')) === raw, 'Frozen link wrote progress.');
    });
  }
  if (results.some(r => !r.pass)) throw Error(JSON.stringify({ passed: results.filter(r => r.pass).length, total: results.length, results }));
  return { passed: results.filter(r => r.pass).length, total: results.length, results };
}
