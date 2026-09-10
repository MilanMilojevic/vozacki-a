// Playwright CLI: open this disposable localhost snapshot, then run-code --filename this file.
// File mode accepts only this ignored snapshot. Every case uses a fresh BrowserContext.
async (page) => {
  const target = await page.evaluate(() => {
    const configured = new URLSearchParams(location.search).get('glossaryFocusFile');
    const u = new URL(configured || location.href.split(/[?#]/)[0]);
    return { href: u.href, protocol: u.protocol, hostname: u.hostname, pathname: u.pathname, origin: u.origin };
  });
  const entry = target.href;
  const http = /^https?:$/.test(target.protocol) && target.hostname === 'localhost';
  const file = target.protocol === 'file:' && /\/output\/navigation-glossary-focus-v160\/index\.html$/i.test(target.pathname);
  if (!http && !file) throw Error('Use the isolated glossary-focus snapshot on localhost or under output/.');
  const browser = page.context().browser(), results = [];
  if (!browser) throw Error('A separate BrowserContext is required.');
  const assert = (value, message) => { if (!value) throw Error(message); };
  const ready = async p => { await p.locator('.view.active').waitFor(); if (http) await p.waitForFunction(() => !!window.__dev); };
  const snapshot = p => p.evaluate(() => ({
    memory: window.__dev ? JSON.stringify(__dev.S) : null,
    raw: localStorage.getItem('vozackiA.v1'),
    sim: localStorage.getItem('vozackiA.sim'),
    ops: JSON.stringify(window.__glossaryOps || []),
  }));
  async function unchanged(p, before, message) {
    assert(JSON.stringify(await snapshot(p)) === JSON.stringify(before), message);
  }
  async function newContext() {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    context.setDefaultTimeout(5000);
    const errors = [];
    context.on('page', p => p.on('pageerror', e => errors.push(String(e))));
    if (http) await context.route('**/*', route => route.request().url().startsWith(target.origin + '/') ? route.continue() : route.abort());
    await context.addInitScript(() => {
      if (!/^(http:|file:)$/.test(location.protocol)) return;
      if (!localStorage.getItem('vozackiA.v1')) localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, script: 'l', theme: 'light', tour: 1, noUpd: 1 }));
      window.__glossaryOps = [];
      for (const name of ['setItem', 'removeItem', 'clear']) {
        const original = Storage.prototype[name];
        Storage.prototype[name] = function (...args) { __glossaryOps.push(name); return original.apply(this, args); };
      }
    });
    return { context, errors };
  }
  async function focusRoundTrip(p) {
    const links = p.locator('#browseList > a.pojBtn');
    assert(await links.count() > 13, 'Glossary fixture has fewer than fourteen entries.');
    const chosen = links.nth(12), next = links.nth(13);
    const chosenHref = await chosen.getAttribute('href'), nextHref = await next.getAttribute('href');
    const chosenId = await chosen.getAttribute('id'), nextId = await next.getAttribute('id');
    assert(/^pojam-[a-z0-9-]+$/.test(chosenId || '') && /^pojam-[a-z0-9-]+$/.test(nextId || ''), 'Glossary links have no stable key-based ids.');
    assert(chosenId === 'pojam-' + chosenHref.split('#/pojmovnik/')[1] && nextId === 'pojam-' + nextHref.split('#/pojmovnik/')[1], 'Glossary ids are not derived from their canonical card keys.');
    await chosen.focus(); await p.keyboard.press('Enter'); await p.locator('#browseList > h3').waitFor();
    await p.goBack(); await p.locator('#browseList > a.pojBtn').nth(12).waitFor();
    assert(await p.evaluate(id => document.activeElement?.id === id, chosenId), 'Back did not restore the thirteenth glossary link focus.');
    await p.keyboard.press('Tab');
    assert(await p.evaluate(id => document.activeElement?.id === id, nextId), 'Tab after Back did not advance to the fourteenth glossary link.');
    return { chosenHref, nextHref, chosenId, nextId };
  }
  async function test(name, fn) {
    const { context, errors } = await newContext();
    try { await fn(context); assert(errors.length === 0, errors.join(' | ')); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, error: String(error) }); }
    finally { await context.close(); }
  }

  await test('writer Back restores stable glossary focus across script and theme redraw', async context => {
    const p = await context.newPage(); await p.goto(entry + '#/pojmovnik'); await ready(p);
    const first = await focusRoundTrip(p);
    await p.locator('#btnScript').click(); await p.locator('#btnTheme').click();
    const afterRedraw = await snapshot(p);
    const second = await focusRoundTrip(p);
    assert(first.chosenHref.endsWith(second.chosenHref.slice(second.chosenHref.indexOf('#'))), 'Script redraw changed the glossary destination.');
    assert(first.nextHref.endsWith(second.nextHref.slice(second.nextHref.indexOf('#'))), 'Script redraw changed the following glossary destination.');
    await unchanged(p, afterRedraw, 'Glossary history changed progress or pending exam after redraw.');
  });

  await test('middle click keeps the writer and opens the glossary destination read-only', async context => {
    const writer = await context.newPage(); await writer.goto(entry + '#/pojmovnik'); await ready(writer);
    const before = await snapshot(writer), source = writer.url(), link = writer.locator('#browseList > a.pojBtn').nth(12);
    const popupPromise = context.waitForEvent('page'); await link.click({ button: 'middle' });
    const reader = await popupPromise; await reader.waitForURL(/preview=1/); await ready(reader); await reader.locator('#browseList > h3').waitFor();
    assert(writer.url() === source, 'Middle click navigated the writer.');
    assert(reader.url().includes('preview=1#/pojmovnik/'), 'Middle click did not retain a native preview destination.');
    const readerState = await snapshot(reader);
    assert(readerState.ops === '[]' && await reader.locator('#bStart,#btnReset,#fileImport').count() === 0, 'Middle-click preview exposed a writer or performed persistence.');
    await unchanged(writer, before, 'Middle click changed writer memory, progress or pending exam.');
  });

  if (http) await test('initial reader restores glossary focus without changing shared progress or pending exam', async context => {
    const writer = await context.newPage(); await writer.goto(entry + '#/pojmovnik'); await ready(writer);
    await writer.evaluate(() => {
      const raw = JSON.stringify({ v: 1, d: Date.now() + 1800000, i: 3, r: 0,
        qs: QUIZ.questions.slice(0, 41).map(q => ({ id: q.id, o: q.ch.map(c => c.id), c: [], m: 0 })) });
      localStorage.setItem('vozackiA.sim', raw); __glossaryOps.length = 0;
    });
    const reader = await context.newPage(); await reader.goto(entry + '#/pojmovnik'); await ready(reader);
    assert(await reader.evaluate(() => __dev.rezimPisanja) === 'reader', 'Second page did not enter the reader role.');
    const before = await snapshot(reader); await focusRoundTrip(reader);
    await reader.locator('#btnScript').click(); await reader.locator('#btnTheme').click();
    const afterRedraw = await snapshot(reader); await focusRoundTrip(reader);
    await unchanged(reader, afterRedraw, 'Reader glossary history changed its loaded state or shared storage.');
    assert(before.raw === afterRedraw.raw && before.sim === afterRedraw.sim, 'Reader script/theme redraw changed shared progress or pending exam.');
  });

  await test('explicit preview restores glossary focus without writes', async context => {
    const p = await context.newPage(); await p.goto(entry + '?preview=1#/pojmovnik'); await ready(p);
    const before = await snapshot(p); await focusRoundTrip(p); await unchanged(p, before, 'Preview glossary navigation wrote state.');
  });

  if (results.some(r => !r.pass)) throw Error(JSON.stringify(results));
  return { passed: true, mode: http ? 'http' : 'file', results };
}
