// Playwright CLI: open a disposable localhost checkout, then run-code --filename tools/tests/navigation.browser.js.
// Also accepts file:///.../output/<disposable-snapshot>/index.html. Never run against a study profile.
// Every case creates/closes its own BrowserContext; the caller's page and storage are untouched.
async (page) => {
  const entry = await page.evaluate(() => { const u = new URL(new URLSearchParams(location.search).get('navigationFile') || location.href); return { hostname: u.hostname, protocol: u.protocol, pathname: u.pathname, href: u.href.split(/[?#]/)[0] }; });
  if (!(entry.hostname === 'localhost' && /^https?:$/.test(entry.protocol)) &&
      !(entry.protocol === 'file:' && /\/output\/[^/]+\/index\.html$/i.test(entry.pathname))) {
    throw Error('Navigation tests require localhost or a disposable file snapshot under output/.');
  }

  const base = entry.href, browser = page.context().browser(), results = [];
  if (!browser) throw Error('A separate BrowserContext is required.');
  const assert = (v, message) => { if (!v) throw Error(message); };
  const settle = p => p.waitForTimeout(120);
  const qid = p => p.locator('#qCard .qNum').innerText();
  const stored = p => p.evaluate(() => JSON.parse(localStorage.getItem('vozackiA.v1')));
  const go = async (p, delta) => { await p.evaluate(n => history.go(n), delta); await settle(p); };
  const ready = p => p.waitForSelector('.view.active');
  async function test(name, fn, options = {}) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    context.setDefaultTimeout(5000);
    await context.addInitScript(({ protocol, failHistory }) => {
      if (location.protocol !== protocol) return;
      if (!localStorage.getItem('vozackiA.v1')) {
        localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, tour: 1, noUpd: 1, script: 'l' }));
      }
      if (failHistory) for (const method of ['pushState', 'replaceState']) history[method] = () => { throw Error('Synthetic unavailable History API'); };
    }, { protocol: entry.protocol, failHistory: !!options.failHistory });
    const p = await context.newPage();
    try { await p.goto(base + (options.hash || '#/')); await ready(p); await fn(p); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, error: String(error) }); }
    finally { await context.close(); }
  }
  async function markedRun(p) {
    await p.goto(base + '#/p/7921'); await ready(p);
    await p.locator('.markBox input').check();
    await p.locator('.brand').click(); await p.locator('.menuBtn[data-nav="marked"]').click();
    await p.locator('#bAllM').click(); await settle(p);
  }
  await test('category/subcategory Back and Forward return correct views', async p => {
    await p.locator('.menuBtn[data-nav="stats"]').click();
    await p.locator('#statsBars .catRow:not(.catTotal) .catMain').first().click();
    const category = await p.locator('#browseHead h3').innerText();
    await p.locator('.subRow').first().click(); const subcategory = await p.locator('#browseHead h3').innerText();
    await go(p, -1); assert(await p.locator('#browseHead h3').innerText() === category, 'Back did not restore category.');
    await go(p, -1); assert(await p.locator('#view-stats').evaluate(e => e.classList.contains('active')), 'Second Back did not restore statistics.');
    await go(p, 1); await go(p, 1); assert(await p.locator('#browseHead h3').innerText() === subcategory, 'Forward did not restore subcategory.');
  });
  await test('direct question survives reload', async p => {
    assert(await qid(p) === '#7921', 'Direct question URL was ignored.');
    await p.reload(); await ready(p); assert(await qid(p) === '#7921', 'Reload lost direct question.');
  }, { hash: '#/p/7921' });
  await test('search/filter and focused question return with Back', async p => {
    await p.locator('.menuBtn[data-nav="learn"]').click(); await p.locator('#qSearch').fill('#7921');
    const row = p.locator('.qRow:visible').first(); await row.click(); await go(p, -1);
    assert(await p.locator('#qSearch').inputValue() === '#7921', 'Back lost search text.');
    assert(await p.locator('.qRow:visible').count() === 1, 'Back did not restore filtered results.');
    assert(await p.evaluate(() => document.activeElement?.classList.contains('qRow')), 'Back lost focus on the question row.');
  });
  await test('script and theme redraw preserve filtered list and history entry', async p => {
    await p.locator('.menuBtn[data-nav="learn"]').click(); await p.locator('#qSearch').fill('#7921');
    const length = await p.evaluate(() => history.length);
    await p.locator('#btnScript').click(); await p.locator('#btnTheme').click(); await settle(p);
    assert(await p.locator('#qSearch').inputValue() === '#7921' && await p.locator('.qRow:visible').count() === 1, 'Redraw discarded the filter.');
    assert(await p.evaluate(() => history.length) === length, 'Redraw added a navigation entry.');
  });
  await test('Back restores real deep-list scroll and focus with browser scroll restoration enabled', async p => {
    await p.locator('.menuBtn[data-nav="learn"]').click();
    const row = p.locator('.qRow').nth(100); await row.scrollIntoViewIfNeeded(); await settle(p);
    const before = await p.evaluate(() => ({ y: scrollY, restoration: history.scrollRestoration }));
    assert(before.y > 3000 && before.restoration === 'auto', 'Fixture did not reach a deep list with browser default restoration.');
    await row.click(); await go(p, -1); await settle(p);
    const after = await p.evaluate(() => ({ y: scrollY, focus: document.activeElement?.dataset.qid }));
    assert(Math.abs(after.y - before.y) < 3, `Back lost deep-list position: ${before.y} -> ${after.y}.`);
    assert(after.focus === await row.getAttribute('data-qid'), 'Back did not focus the question at the restored position.');
  });
  await test('ephemeral passage survives history and redraw without replaying an answer', async p => {
    await markedRun(p);
    for (const choice of await p.locator('#qCard .choice[data-ok="1"]').all()) await choice.click();
    await p.locator('#qCard .qActions > .primary').click();
    const before = (await stored(p)).q['7921'].a;
    await p.locator('#btnScript').click(); await p.locator('#btnTheme').click();
    await go(p, -1); await go(p, 1);
    assert(await p.locator('#view-question').evaluate(e => e.classList.contains('active')), 'Forward discarded the temporary passage.');
    assert(await qid(p) === '#7921', 'Forward restored a different question.');
    assert(await p.locator('#qCard .chipYourOk').count() > 0, 'Previously confirmed answer was lost.');
    assert((await stored(p)).q['7921'].a === before, 'History or redraw recorded the answer twice.');
  });
  await test('different ephemeral history entries retain their own lists and cursor', async p => {
    await markedRun(p); const first = await qid(p);
    await p.locator('.brand').click(); await p.locator('.menuBtn[data-nav="learn"]').click();
    await p.locator('#shufBox').click(); await p.locator('#bFrom1').click();
    await p.locator('#qCard [data-uloga="dalje"]').click(); const second = await qid(p);
    await go(p, -1); await go(p, -1); await go(p, -1);
    assert(await qid(p) === first && await p.locator('#view-question').evaluate(e => e.classList.contains('active')), 'Older passage was replaced by the newer list.');
    await go(p, 1); await go(p, 1); await go(p, 1);
    assert(await qid(p) === second, 'Newer passage lost its position.');
  });
  await test('Enter in the position field survives Back and Forward', async p => {
    await p.locator('.menuBtn[data-nav="learn"]').click(); await p.locator('#bFrom1').click();
    await p.locator('#jumpN').fill('10'); await p.locator('#jumpN').press('Enter');
    const tenth = await qid(p); await go(p, -1); await go(p, 1);
    assert(await qid(p) === tenth && await p.locator('#jumpN').getAttribute('placeholder') === '10', 'Keyboard jump reverted to the old history cursor.');
  });
  await test('restoring an older confirmed answer after another run never records it again', async p => {
    await markedRun(p);
    for (const choice of await p.locator('#qCard .choice[data-ok="1"]').all()) await choice.click();
    await p.locator('#qCard .qActions > .primary').click();
    await p.locator('.brand').click(); await p.locator('.menuBtn[data-nav="learn"]').click(); await p.locator('#bFrom1').click();
    for (const choice of await p.locator('#qCard .choice[data-ok="1"]').all()) await choice.click();
    await p.locator('#qCard .qActions > .primary').click();
    const before = JSON.stringify((await stored(p)).q);
    await go(p, -1); await go(p, -1); await go(p, -1); await p.locator('#btnScript').click();
    assert(await qid(p) === '#7921' && await p.locator('#qCard .chipYourOk').count() > 0, 'Older confirmed answer was not restored.');
    assert(JSON.stringify((await stored(p)).q) === before, 'Restoration replayed an older confirmed answer.');
  });
  await test('history does not rewind newer persisted sequential progress', async p => {
    await p.locator('.menuBtn[data-nav="learn"]').click(); await p.locator('#bFrom1').click();
    await p.locator('#qCard [data-uloga="dalje"]').click(); const older = await qid(p);
    await p.locator('.brand').click(); await p.locator('.menuBtn[data-nav="learn"]').click(); await p.locator('#bCont').click();
    await p.locator('#qCard [data-uloga="dalje"]').click(); const latest = (await stored(p)).seqPos;
    await go(p, -1); await go(p, -1); await go(p, -1);
    assert(await qid(p) === older, 'Old entry followed the latest shared cursor.');
    assert((await stored(p)).seqPos === latest, 'History rewound persisted sequential progress.');
  });
  await test('ephemeral reload explains expiry and returns to its origin list', async p => {
    await markedRun(p); await p.reload(); await ready(p); await settle(p);
    assert(p.url().slice(p.url().indexOf('#')) === '#/lista/marked', 'Expired passage did not return to its originating list.');
    assert(await p.locator('[role="status"]').filter({ hasText: /privremen|привремен/i }).count() > 0, 'Missing explanation for expired passage.');
  });
  await test('successful reset invalidates old confirmed question history', async p => {
    await p.goto(base + '#/p/7921'); await ready(p);
    for (const choice of await p.locator('#qCard .choice[data-ok="1"]').all()) await choice.click();
    await p.locator('#qCard .qActions > .primary').click();
    await p.locator('.brand').click(); await p.locator('#btnPodesavanja').click();
    p.on('dialog', d => d.accept()); await p.locator('#btnReset').click();
    assert(Object.keys((await stored(p)).q).length === 0, 'Reset did not clear synthetic progress.');
    await go(p, -1);
    assert(await qid(p) === '#7921', 'Stable direct question could not be reopened after reset.');
    assert(await p.locator('#qCard .chipYourOk').count() === 0 && await p.locator('#qCard .verdict').count() === 0, 'Reset restored an old confirmed answer.');
  });
  await test('successful import invalidates old transient list membership', async p => {
    await markedRun(p); await p.locator('.brand').click(); await p.locator('#btnPodesavanja').click();
    p.on('dialog', d => d.accept());
    await p.locator('#fileImport').evaluate(input => {
      const data = new DataTransfer(); data.items.add(new File([JSON.stringify({q:{},tour:1,noUpd:1,script:'l'})], 'navigation-fixture.json', {type:'application/json'}));
      input.files = data.files; input.dispatchEvent(new Event('change', {bubbles:true}));
    });
    await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('vozackiA.v1')).q).length === 0);
    await go(p, -1);
    assert(p.url().slice(p.url().indexOf('#')) === '#/lista/marked', 'Import restored stale transient list membership.');
    assert(await p.locator('.qRow:visible').count() === 0, 'Imported empty marks still show old list members.');
  });
  await test('cancelled reset preserves the current transient answer history', async p => {
    await markedRun(p);
    for (const choice of await p.locator('#qCard .choice[data-ok="1"]').all()) await choice.click();
    await p.locator('#qCard .qActions > .primary').click(); const before = JSON.stringify((await stored(p)).q);
    await p.locator('.brand').click(); await p.locator('#btnPodesavanja').click();
    p.on('dialog', d => d.dismiss()); await p.locator('#btnReset').click(); await go(p, -1);
    assert(await qid(p) === '#7921' && await p.locator('#qCard .chipYourOk').count() > 0, 'Cancelled reset discarded current history.');
    assert(JSON.stringify((await stored(p)).q) === before, 'Cancelled reset changed saved progress.');
  });
  await test('history and script redraw do not rewind newer saved section position', async p => {
    await p.goto(base + '#/sek/c25'); await ready(p); await p.locator('.qRow').first().click();
    await p.locator('#qCard [data-uloga="dalje"]').click(); const older = await qid(p);
    await p.locator('.brand').click(); await p.locator('.menuBtn[data-nav="stats"]').click();
    await p.locator('#statsBars .catRow:not(.catTotal) .catMain').first().click(); await p.locator('#bStart').click();
    await p.locator('#qCard [data-uloga="dalje"]').click(); const before = JSON.stringify((await stored(p)).secPos);
    await go(p, -1); await go(p, -1); await go(p, -1); await go(p, -1);
    assert(await qid(p) === older, 'Section history lost the old displayed question.');
    await p.locator('#btnScript').click();
    assert(JSON.stringify((await stored(p)).secPos) === before, 'History/redraw overwrote the newer saved section position.');
  });
  await test('cancelled exam Back keeps current entry and next Back still works', async p => {
    await p.locator('.menuBtn[data-nav="stats"]').click(); await p.locator('#donjaNav [data-nav="sim"]').click();
    const exam = await p.evaluate(() => localStorage.getItem('vozackiA.sim'));
    let accept = false, dialogs = 0; p.on('dialog', async d => { dialogs++; await (accept ? d.accept() : d.dismiss()); });
    const length = await p.evaluate(() => history.length); await go(p, -1);
    assert(p.url().slice(p.url().indexOf('#')) === '#/sim', 'Cancelled Back left the exam.');
    assert(await p.evaluate(() => history.length) === length, 'Cancelled Back added another entry.');
    assert(await p.evaluate(() => localStorage.getItem('vozackiA.sim')) === exam, 'Cancelled Back changed the exam.');
    accept = true; await go(p, -1);
    assert(p.url().slice(p.url().indexOf('#')) === '#/stats' && dialogs === 2, 'Next Back did not leave once for statistics.');
  });
  await test('direct hash change and paired history events do not duplicate navigation', async p => {
    await p.evaluate(() => { location.hash = '#/stats'; }); await settle(p);
    assert(await p.locator('#view-stats').evaluate(e => e.classList.contains('active')), 'Direct hash did not route.');
    await p.evaluate(() => { location.hash = '#/sek/c25'; }); await settle(p);
    const length = await p.evaluate(() => history.length); await go(p, -1); await go(p, 1);
    assert(p.url().slice(p.url().indexOf('#')) === '#/sek/c25' && await p.evaluate(() => history.length) === length, 'Paired events created extra history.');
  });
  await test('cancelled multi-entry traversal after invalid route restores the exam entry', async p => {
    await p.locator('.menuBtn[data-nav="stats"]').click();
    await p.evaluate(() => { location.hash = '#/not-a-route'; }); await settle(p);
    await p.locator('.menuBtn[data-nav="sim"]').click();
    p.on('dialog', d => d.dismiss()); await go(p, -2);
    assert(p.url().slice(p.url().indexOf('#')) === '#/sim', 'Cancellation could not return across a replaced route.');
    assert(await p.locator('#view-sim').evaluate(e => e.classList.contains('active')), 'Cancelled traversal lost the exam view.');
  });
  await test('unavailable History state API keeps ordinary hash navigation working', async p => {
    await p.locator('.menuBtn[data-nav="stats"]').click(); await p.locator('#statsBars .catRow:not(.catTotal) .catMain').first().click();
    await go(p, -1); assert(await p.locator('#view-stats').evaluate(e => e.classList.contains('active')), 'History fallback broke Back.');
    assert(await p.locator('#errStrip').count() === 0, 'History failure escaped into application error UI.');
  }, { failHistory: true });
  console.log(JSON.stringify({ base, results }, null, 2));
  if (results.some(r => !r.pass)) throw Error(`Navigation: ${results.filter(r => r.pass).length}/${results.length} passed. ${results.filter(r => !r.pass).map(r => r.name + ': ' + r.error).join(' | ')}`);
  return { base, results };
}
