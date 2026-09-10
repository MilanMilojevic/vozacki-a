// Run only against a disposable localhost checkout:
// npx --yes --package @playwright/cli playwright-cli -s=dailygoal open http://localhost:18764
// npx --yes --package @playwright/cli playwright-cli -s=dailygoal run-code --filename tools/tests/daily-goal.browser.js
// Creates and closes a fresh BrowserContext. The caller's page/storage is never modified.
async (page) => {
  const origin = page.url().match(/^https?:\/\/localhost(?::\d+)?(?=\/|$)/)?.[0];
  if (!origin) throw Error('Daily-goal test requires localhost.');
  await page.evaluate(async () => {
    if (['provera.kontekst', 'provera.backup', 'provera.backupSim'].some((key) => sessionStorage.getItem(key) !== null)) throw Error('Finish pending scoring recovery before daily-goal testing.');
    if (!window.__dev) throw Error('The localhost application must be loaded.');
    await window.__dev.proveraBezFajla();
  });
  const browser = page.context().browser();
  if (!browser) throw Error('A separate disposable BrowserContext is required.');
  const context = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Belgrade' });
  const results = [];
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  try {
    // This initialization runs only in the fresh context, once; real reloads must retain edits.
    await context.addInitScript(() => {
      if (location.hostname !== 'localhost' || sessionStorage.getItem('daily-goal.fixture')) return;
      if (localStorage.getItem('vozackiA.v1') !== null || localStorage.getItem('vozackiA.sim') !== null) throw Error('Fixture context was not empty.');
      const date = new Date(); date.setDate(date.getDate() + 30);
      const examDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, tour: 1, noUpd: 1, script: 'l', examDate,
        plan: { novih: null, pon: 30, auto: 0, prio: 0 } }));
      sessionStorage.setItem('daily-goal.fixture', '1');
    });
    const testPage = await context.newPage();
    const ready = async () => {
      await testPage.waitForFunction(() => !!window.__dev && !!document.querySelector('#homeSummary .planBox'));
      await testPage.evaluate(async () => {
        if (location.hostname !== 'localhost') throw Error('Navigation left localhost.');
        if (['provera.kontekst', 'provera.backup', 'provera.backupSim'].some((key) => sessionStorage.getItem(key) !== null)) throw Error('Finish pending scoring recovery before daily-goal testing.');
        await window.__dev.proveraBezFajla();
      });
    };
    const settings = async () => {
      if (await testPage.locator('#btnPodesavanja').getAttribute('aria-expanded') !== 'true') await testPage.locator('#btnPodesavanja').click();
    };
    const check = async (label, expected, quota, date) => {
      const actual = await testPage.evaluate(() => {
        const live = window.__dev.S;
        const stored = window.__dev.normalizeState(JSON.parse(localStorage.getItem('vozackiA.v1')));
        const p = window.__dev.planStanje();
        return { livePlan: live.plan, storedPlan: stored.plan, date: live.examDate, storedDate: stored.examDate,
          quota: { novih: p.cNovih, pon: p.cPon }, text: document.querySelector('#homeSummary .planBox').textContent.replace(/\s+/g, ' ').trim(),
          autoPressed: document.getElementById('btnPlanAuto').getAttribute('aria-pressed'), disabled: document.getElementById('planNovih').disabled };
      });
      for (const key of ['novih', 'pon', 'auto', 'prio']) {
        assert(actual.livePlan[key] === expected[key], `${label}: live ${key}: ${JSON.stringify(actual)}`);
        assert(actual.storedPlan[key] === expected[key], `${label}: persisted ${key}: ${JSON.stringify(actual)}`);
      }
      assert(actual.date === date && actual.storedDate === date, `${label}: exam date did not persist.`);
      assert(actual.quota.novih === quota.novih && actual.quota.pon === quota.pon, `${label}: quota differs: ${JSON.stringify(actual)}`);
      assert(actual.autoPressed === String(!!expected.auto) && actual.disabled === !!expected.auto, `${label}: auto controls disagree with stored mode.`);
      if (quota.novih) assert(actual.text.includes('Nova pitanja: 0 / ' + quota.novih), `${label}: new-question UI quota differs.`);
      else assert(!actual.text.includes('Nova pitanja: 0 /'), `${label}: zero quota should not show a new-question progress bar.`);
      assert(actual.text.includes('Ponavljanja: 0 / ' + quota.pon), `${label}: repetition UI quota differs.`);
      if (!expected.auto) {
        // Both manual fixtures (0 or 12 new/day) leave unseen questions by the exam date.
        assert(actual.text.includes('NE stižeš gradivo'), `${label}: manual plan falsely promises unseen coverage: ${actual.text}`);
        assert(!actual.text.includes('Ovim tempom stižeš:'), `${label}: contradictory success verdict.`);
      } else assert(actual.text.includes('Ovim tempom stižeš:'), `${label}: sufficient automatic quotas are shown as insufficient.`);
      results.push({ step: label, plan: actual.livePlan, quota: actual.quota, date: actual.date, verdict: actual.text.includes('NE stižeš gradivo') ? 'unseen coverage blocked' : 'coverage possible' });
    };
    const stepAndReload = async (label, expected, quota, date) => {
      await check(label, expected, quota, date);
      await testPage.reload();
      await ready();
      await check(label + ' after reload', expected, quota, date);
    };
    await testPage.goto(origin);
    await ready();
    const dates = await testPage.evaluate(() => {
      const date = new Date(); date.setDate(date.getDate() + 15);
      return { original: window.__dev.S.examDate, changed: date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') };
    });
    const manual = { novih: null, pon: 30, auto: 0, prio: 0 };
    const auto = { ...manual, auto: 1 };
    await stepAndReload('repeat-only with 1327 unseen', manual, { novih: 0, pon: 30 }, dates.original);
    await settings();
    await testPage.locator('#btnPlanAuto').click();
    // Hand-checked fixture: 1327 / (30 - 7) => 58; 1327 / (15 - 5) => 133.
    await stepAndReload('auto enabled', auto, { novih: 58, pon: 58 }, dates.original);
    await settings();
    await testPage.locator('#examDate').fill(dates.changed);
    await testPage.locator('#examDate').press('Tab');
    await stepAndReload('exam date changed', auto, { novih: 133, pon: 120 }, dates.changed);
    await settings();
    await testPage.locator('#btnPlanAuto').click();
    await stepAndReload('auto disabled restores manual quota', manual, { novih: 0, pon: 30 }, dates.changed);
    await settings();
    await testPage.locator('#planNovih').fill('12');
    await testPage.locator('#planPon').fill('40');
    await testPage.locator('#btnPlanSave').click();
    await stepAndReload('manual saved', { novih: 12, pon: 40, auto: 0, prio: 0 }, { novih: 12, pon: 40 }, dates.changed);
    console.log(JSON.stringify({ passed: results.length, results }));
    return { passed: results.length, results };
  } finally {
    await context.close();
  }
}
