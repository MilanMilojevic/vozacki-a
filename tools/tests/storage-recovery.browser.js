// Run only against a disposable localhost checkout:
// npx --yes --package @playwright/cli playwright-cli -s=storage-recovery open http://localhost:18764
// npx --yes --package @playwright/cli playwright-cli -s=storage-recovery run-code --filename tools/tests/storage-recovery.browser.js
// Creates and closes a fresh BrowserContext. The caller's page/storage is never modified.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:18764(?=\/|$)/)?.[0];
  if (!origin) throw Error('Storage-recovery test requires http://localhost:18764.');
  const browser = page.context().browser();
  if (!browser) throw Error('A separate disposable BrowserContext is required.');

  const context = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Belgrade' });
  const results = [];
  const pageErrors = [];
  const consoleErrors = [];
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const malformed = '{synthetic-storage-recovery';
  const savedExam = await page.evaluate(() => {
    const questions = QUIZ.questions.slice(0, 41);
    if (questions.length !== 41) throw Error('Synthetic saved-exam fixture needs 41 questions.');
    return JSON.stringify({
      v: 1,
      d: Date.now() + 30 * 60 * 1000,
      i: 0,
      r: 0,
      qs: questions.map((question) => ({
        id: question.id,
        o: question.ch.map((choice) => choice.id),
        c: [],
        m: 0,
      })),
    });
  });

  try {
    await context.route('**/*', (route) => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await context.addInitScript(({ malformedRaw, examRaw }) => {
      if (location.hostname !== 'localhost' || location.port !== '18764') return;
      window.__syntheticFileWrites = [];
      window.__fixtureExamRaw = examRaw;
      Object.defineProperty(window, 'showSaveFilePicker', {
        configurable: true,
        value: async () => ({
          name: 'synthetic-recovery.txt',
          async createWritable() {
            return {
              async write(data) {
                const value = data instanceof Blob ? await data.text() : String(data);
                window.__syntheticFileWrites.push(value);
              },
              async close() {},
            };
          },
        }),
      });
      if (sessionStorage.getItem('storage-recovery.fixture')) return;
      if (localStorage.getItem('vozackiA.v1') !== null || localStorage.getItem('vozackiA.sim') !== null) {
        throw Error('Fresh recovery context was not empty.');
      }
      localStorage.setItem('vozackiA.v1', malformedRaw);
      localStorage.setItem('vozackiA.sim', examRaw);
      sessionStorage.setItem('storage-recovery.fixture', '1');
    }, { malformedRaw: malformed, examRaw: savedExam });

    const testPage = await context.newPage();
    testPage.on('pageerror', (error) => pageErrors.push(error.message));
    testPage.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await testPage.goto(origin);
    await testPage.waitForFunction(() => !!window.__dev && !!document.getElementById('oporavakStanja'));

    const initial = await testPage.evaluate(() => ({
      rawProtected: localStorage.getItem('vozackiA.v1') === '{synthetic-storage-recovery',
      examProtected: localStorage.getItem('vozackiA.sim') === window.__fixtureExamRaw,
      recoveryVisible: !!document.getElementById('oporavakStanja'),
      regularExportDisabled: document.getElementById('btnExport')?.disabled === true,
      resetDisabled: document.getElementById('btnReset')?.disabled === true,
      automaticFileWrites: window.__syntheticFileWrites.length,
    }));
    assert(initial.rawProtected && initial.examProtected, 'Boot changed a synthetic recovery record.');
    assert(initial.recoveryVisible && initial.regularExportDisabled && initial.resetDisabled, 'Recovery controls are not safely constrained.');
    assert(initial.automaticFileWrites === 0, 'Boot wrote to a file without a user action.');
    results.push({ step: 'boot protects malformed progress and pending exam', pass: true });

    // The daily version-check path previously called save() immediately during boot.
    await testPage.waitForTimeout(3000);
    await testPage.locator('#btnTheme').click();
    const afterBootAndMutation = await testPage.evaluate(() => ({
      rawProtected: localStorage.getItem('vozackiA.v1') === '{synthetic-storage-recovery',
      examProtected: localStorage.getItem('vozackiA.sim') === window.__fixtureExamRaw,
      fileWrites: window.__syntheticFileWrites.length,
    }));
    assert(afterBootAndMutation.rawProtected, 'Boot or a normal mutation replaced the malformed record.');
    assert(afterBootAndMutation.examProtected, 'Recovery boot consumed or deleted the pending exam.');
    assert(afterBootAndMutation.fileWrites === 0, 'A blocked normal save reached the file writer.');
    results.push({ step: 'version check and normal mutation remain blocked', pass: true });

    await testPage.locator('[data-nav="sim"]').first().click();
    const afterExamAttempt = await testPage.evaluate(() => ({
      examProtected: localStorage.getItem('vozackiA.sim') === window.__fixtureExamRaw,
      noLiveExam: window.__dev.sim === null,
    }));
    assert(afterExamAttempt.examProtected && afterExamAttempt.noLiveExam,
      'Recovery mode changed or started a pending exam.');
    results.push({ step: 'exam start is blocked and pending exam is preserved', pass: true });

    await testPage.evaluate(() => { location.hash = '#/sim'; });
    await testPage.waitForTimeout(100);
    const afterResumeAttempt = await testPage.evaluate(() => ({
      examProtected: localStorage.getItem('vozackiA.sim') === window.__fixtureExamRaw,
      noLiveExam: window.__dev.sim === null,
    }));
    assert(afterResumeAttempt.examProtected && afterResumeAttempt.noLiveExam,
      'Hash navigation resumed a saved exam while recovery mode was active.');
    results.push({ step: 'saved exam resume is blocked during recovery', pass: true });

    await testPage.locator('[data-nav="stats"]').first().click();
    await testPage.locator('[data-nav="home"]').first().click();
    const controlsAfterRender = await testPage.evaluate(() => ({
      regularExportDisabled: document.getElementById('btnExport')?.disabled === true,
      resetDisabled: document.getElementById('btnReset')?.disabled === true,
    }));
    assert(controlsAfterRender.regularExportDisabled && controlsAfterRender.resetDisabled, 'Home redraw re-enabled unsafe recovery controls.');
    await testPage.evaluate(() => document.getElementById('btnExport').click());
    assert(await testPage.evaluate(() => window.__syntheticFileWrites.length) === 0, 'Regular export bypassed recovery after home redraw.');
    results.push({ step: 'navigation cannot re-enable normal export or reset', pass: true });

    await testPage.locator('#btnPodesavanja').click();
    await testPage.locator('#planNovih').fill('10');
    await testPage.locator('#planPon').fill('20');
    await testPage.locator('#btnPlanSave').click();
    const afterGoalAttempt = await testPage.evaluate(() => ({
      rawProtected: localStorage.getItem('vozackiA.v1') === '{synthetic-storage-recovery',
      falseSuccess: [...document.querySelectorAll('.poruka, #planPoruka')].some((node) => /sačuvan|сачуван/i.test(node.textContent)),
    }));
    assert(afterGoalAttempt.rawProtected && !afterGoalAttempt.falseSuccess, 'Blocked daily-goal save reported success or changed storage.');
    results.push({ step: 'blocked goal edit does not claim it was saved', pass: true });

    await testPage.locator('#oporavakStanja button').filter({ hasText: 'Sačuvaj nečitljiv zapis' }).click();
    await testPage.waitForFunction(() => window.__syntheticFileWrites.length === 1);
    const rawExportExact = await testPage.evaluate(() => window.__syntheticFileWrites[0] === '{synthetic-storage-recovery');
    assert(rawExportExact, 'User-triggered recovery export did not preserve the exact raw record.');
    results.push({ step: 'raw recovery export is exact and memory-only', pass: true });

    const fixture = await testPage.evaluate(() => {
      const id = QUIZ.questions[0].id;
      return {
        id,
        raw: JSON.stringify({ q: { [id]: { a: 3, w: 1, streak: 2, marked: 1 } }, script: 'l', theme: 'light', tour: 1, noUpd: 1 }),
      };
    });
    await testPage.evaluate(() => {
      window.__originalStorageSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'vozackiA.v1') throw new DOMException('Synthetic write failure', 'QuotaExceededError');
        return window.__originalStorageSetItem.call(this, key, value);
      };
    });
    testPage.once('dialog', (dialog) => dialog.accept());
    await testPage.evaluate(({ raw }) => {
      const input = document.getElementById('fileImport');
      const transfer = new DataTransfer();
      transfer.items.add(new File([raw], 'synthetic-valid-progress.json', { type: 'application/json' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, fixture);
    await testPage.waitForTimeout(200);
    const afterFailedImport = await testPage.evaluate(() => ({
      rawProtected: localStorage.getItem('vozackiA.v1') === '{synthetic-storage-recovery',
      recoveryVisible: !!document.getElementById('oporavakStanja'),
    }));
    assert(afterFailedImport.rawProtected && afterFailedImport.recoveryVisible, 'Failed recovery import discarded the original or unlocked writes.');
    await testPage.evaluate(() => { Storage.prototype.setItem = window.__originalStorageSetItem; });
    results.push({ step: 'failed validated import keeps original and recovery lock', pass: true });

    testPage.once('dialog', (dialog) => dialog.accept());
    await testPage.evaluate(({ raw }) => {
      const input = document.getElementById('fileImport');
      const transfer = new DataTransfer();
      transfer.items.add(new File([raw], 'synthetic-valid-progress.json', { type: 'application/json' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, fixture);
    await testPage.waitForFunction((id) => {
      const raw = localStorage.getItem('vozackiA.v1');
      if (!raw || document.getElementById('oporavakStanja')) return false;
      try { return JSON.parse(raw).q[id]?.a === 3; } catch { return false; }
    }, fixture.id);

    const afterImport = await testPage.evaluate(({ id }) => {
      const stored = JSON.parse(localStorage.getItem('vozackiA.v1'));
      return {
        answer: stored.q[id],
        examProtected: localStorage.getItem('vozackiA.sim') === window.__fixtureExamRaw,
        regularExportEnabled: document.getElementById('btnExport')?.disabled === false,
        resetEnabled: document.getElementById('btnReset')?.disabled === false,
      };
    }, { id: fixture.id });
    assert(afterImport.answer.a === 3 && afterImport.answer.w === 1 && afterImport.answer.streak === 2 && afterImport.answer.marked === 1,
      'Validated import did not preserve the synthetic progress fields.');
    assert(afterImport.examProtected, 'Validated progress import changed the separate pending exam.');
    assert(afterImport.regularExportEnabled && afterImport.resetEnabled, 'Normal controls did not unlock after recovery.');

    await testPage.locator('#btnTheme').click();
    await testPage.waitForFunction(() => JSON.parse(localStorage.getItem('vozackiA.v1')).theme === 'dark');
    results.push({ step: 'validated import unlocks later saves', pass: true });

    assert(pageErrors.length === 0, `Page errors: ${JSON.stringify(pageErrors)}`);
    assert(consoleErrors.length === 0, `Console errors: ${JSON.stringify(consoleErrors)}`);
    console.log(JSON.stringify({ passed: results.length, results }));
    return { passed: results.length, results };
  } finally {
    await context.close();
  }
}
