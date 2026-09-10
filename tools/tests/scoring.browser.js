// Playwright CLI run-code --filename tools/tests/scoring.browser.js
// The supplied page is only a source of public question IDs. All writes, tests,
// and real reloads happen in a new, disposable localhost BrowserContext.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:18764(?=\/|$)/)?.[0];
  if (!origin) throw Error('Scoring test requires the isolated localhost:18764 checkout.');
  const browser = page.context().browser();
  if (!browser) throw Error('A separate disposable BrowserContext is required.');
  await page.waitForFunction(() => !!window.QUIZ);
  const fixture = await page.evaluate(() => {
    const questions = QUIZ.questions.slice(0, 41);
    if (questions.length !== 41) throw Error('Missing synthetic exam questions.');
    return {
      progress: JSON.stringify({ q: { [questions[0].id]: { a: 3, w: 1, streak: 2, marked: 1 } }, tour: 1, noUpd: 1, script: 'l' }),
      exam: JSON.stringify({ v: 1, d: Date.now() + 30 * 60 * 1000, i: 0, r: 0,
        qs: questions.map(q => ({ id: q.id, o: q.ch.map(c => c.id), c: [], m: 0 })) }),
    };
  });
  const context = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Belgrade', viewport: { width: 1280, height: 900 } });
  const messages = [], pageErrors = [];
  const assert = (value, message) => { if (!value) throw Error(message); };
  try {
    await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await context.addInitScript(({ progress, exam }) => {
      if (location.hostname !== 'localhost' || location.port !== '18764' || sessionStorage.getItem('scoring.fixture')) return;
      if (localStorage.getItem('vozackiA.v1') !== null || localStorage.getItem('vozackiA.sim') !== null) throw Error('Scoring context was not empty.');
      localStorage.setItem('vozackiA.v1', progress);
      localStorage.setItem('vozackiA.sim', exam);
      sessionStorage.setItem('scoring.fixture', '1');
    }, fixture);
    const testPage = await context.newPage();
    testPage.on('console', message => messages.push(message.text()));
    testPage.on('pageerror', error => pageErrors.push(error.message));
    // The synthetic saved exam can request a navigation confirmation. Reload is
    // the harness's intentional recovery step; accepting it affects this context only.
    testPage.on('dialog', dialog => dialog.type() === 'beforeunload' ? dialog.accept() : dialog.dismiss());
    const inject = async () => {
      await testPage.waitForFunction(() => !!window.__dev);
      await testPage.addScriptTag({ path: 'tools/provera-bodovanja.js' });
    };
    const snapshot = () => testPage.evaluate(() => ({
      progress: localStorage.getItem('vozackiA.v1'), exam: localStorage.getItem('vozackiA.sim'),
      recovery: sessionStorage.getItem('provera.kontekst'),
    }));
    await testPage.goto(origin);
    await inject();
    const before = await snapshot();
    assert(before.progress === fixture.progress && before.exam === fixture.exam, 'Boot altered the original synthetic records.');
    await Promise.all([
      testPage.waitForEvent('load'),
      testPage.evaluate(() => { void proveraBodovanja().catch(error => console.error('Harness preparation failed: ' + error.message)); }),
    ]);
    await inject();
    assert(await testPage.evaluate(() => proveraKontekst().faza) === 'pripremljen', 'No prepared recovery context after reload.');
    await Promise.all([
      testPage.waitForEvent('load', { timeout: 180000 }),
      testPage.evaluate(() => { void proveraBodovanja2().catch(error => console.error('Harness execution failed: ' + error.message)); }),
    ]);
    await inject();
    const confirmation = await testPage.evaluate(() => proveraBodovanjaPotvrdi());
    const after = await snapshot();
    assert(after.progress === before.progress && after.exam === before.exam, 'Scoring harness failed to restore exact original records.');
    assert(after.recovery === null, 'Confirmed recovery context was not removed.');
    assert(pageErrors.length === 0, 'Page errors: ' + pageErrors.join('; '));
    const lines = messages.flatMap(message => message.split('\n'));
    const failed = lines.filter(line => /^FAIL\b/.test(line));
    const passed = lines.filter(line => /^PASS\b/.test(line));
    const summary = lines.findLast(line => /SVE PROŠLO|PALO:/.test(line));
    assert(failed.length === 0 && /SVE PROŠLO/.test(summary || ''), 'Scoring checks failed after successful recovery: ' + JSON.stringify({ summary, failed }));
    // v138 contains 115 assertions. Do not accept an accidentally empty/truncated
    // suite; increase this floor when adding coverage, or explain an intentional removal.
    assert(passed.length >= 115, 'Scoring coverage unexpectedly shrank: ' + passed.length + ' assertions.');
    assert(Number(summary.match(/\((\d+)\)/)?.[1]) === passed.length, 'Harness result count differs from console summary.');
    return { passed: passed.length, failed, summary, restoredExactRecords: true, recoveryRemoved: true, confirmation };
  } catch (error) {
    throw Error(error.message + '\nScoring diagnostics: ' + JSON.stringify({ pageErrors, messages: messages.slice(-5) }));
  } finally {
    await context.close();
  }
}
