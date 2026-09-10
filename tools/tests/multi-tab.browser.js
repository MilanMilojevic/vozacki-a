// Run only against a disposable localhost checkout:
// npx --yes --package @playwright/cli playwright-cli -s=multi-tab open http://localhost:18764
// npx --yes --package @playwright/cli playwright-cli -s=multi-tab run-code --filename tools/tests/multi-tab.browser.js
// Creates and closes fresh BrowserContexts. It never uses the caller's storage or a real file.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:18764(?=\/|$)/)?.[0];
  if (!origin) throw Error('Multi-tab test requires http://localhost:18764.');
  const browser = page.context().browser();
  if (!browser) throw Error('A separate disposable BrowserContext is required.');
  const results = [];
  const assert = (condition, message) => { if (!condition) throw Error(message); };

  async function freshContext() {
    const context = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Belgrade' });
    context.setDefaultTimeout(5000);
    await context.route('**/*', (route) => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await context.addInitScript(() => {
      window.__syntheticExports = [];
      window.__documentToken = Math.random().toString(36);
      Object.defineProperty(window, 'showSaveFilePicker', {
        configurable: true,
        value: async () => ({
          name: 'synthetic-progress.json',
          async createWritable() {
            return {
              async write(value) {
                window.__syntheticExports.push(value instanceof Blob ? await value.text() : String(value));
              },
              async close() {},
              async abort() {},
            };
          },
        }),
      });
    });
    return context;
  }

  async function open(context) {
    const p = await context.newPage();
    await p.goto(origin);
    await p.waitForFunction(() => !!window.__dev);
    return p;
  }

  async function tabTo(page, id) {
    await page.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate((expected) => document.activeElement?.id === expected, id)) return;
    }
    throw Error(`Tab key could not reach #${id}.`);
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const reader = await open(context);
      await reader.waitForFunction(() => !!document.querySelector('[data-preview]'));
      const roles = await Promise.all([
        writer.evaluate(() => window.__dev.rezimPisanja),
        reader.evaluate(() => window.__dev.rezimPisanja),
      ]);
      assert(roles[0] === 'writer' && roles[1] === 'reader', `Unexpected initial roles: ${roles.join(',')}`);
      const readerMemory = await reader.evaluate(() => JSON.stringify(window.__dev.S));
      const readerToken = await reader.evaluate(() => window.__documentToken);
      results.push({ step: 'first page is writer and second page is read-only', pass: true });

      await writer.locator('#btnTheme').click();
      await writer.locator('[data-nav="sim"]').first().click();
      await writer.waitForFunction(() => !!localStorage.getItem('vozackiA.sim'));
      const writerBytes = await writer.evaluate(() => ({
        state: localStorage.getItem('vozackiA.v1'),
        exam: localStorage.getItem('vozackiA.sim'),
      }));

      const readerBlocked = await reader.evaluate(async () => {
        const inert = document.getElementById('glavni').inert;
        document.getElementById('btnTheme').click();
        location.hash = '#/sim';
        await new Promise((resolve) => setTimeout(resolve, 80));
        return { inert, sim: window.__dev.sim, role: window.__dev.rezimPisanja };
      });
      const afterReaderAttempt = await writer.evaluate(() => ({
        state: localStorage.getItem('vozackiA.v1'),
        exam: localStorage.getItem('vozackiA.sim'),
      }));
      assert(!readerBlocked.inert && readerBlocked.sim === null && readerBlocked.role === 'reader', 'Read-only UI or exam guard failed.');
      assert(afterReaderAttempt.state === writerBytes.state && afterReaderAttempt.exam === writerBytes.exam,
        'Reader changed progress or the pending exam.');

      const validImport = await writer.evaluate(() => JSON.stringify({ q: {}, script: 'c', theme: 'light', tour: 1, noUpd: 1 }));
      const importWasReachable = await reader.evaluate((raw) => {
        const input = document.getElementById('fileImport');
        if (!input) return false;
        const transfer = new DataTransfer();
        transfer.items.add(new File([raw], 'synthetic-valid-progress.json', { type: 'application/json' }));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }, validImport);
      if (importWasReachable) await reader.waitForTimeout(100);
      assert(await reader.evaluate(() => JSON.stringify(window.__dev.S)) === readerMemory, 'Reader import changed its in-memory profile.');
      assert(await writer.evaluate(() => localStorage.getItem('vozackiA.v1')) === writerBytes.state, 'Reader import changed stored progress.');

      assert(await reader.locator('[data-preview]').count() === 1, 'Reader lacks content preview label.');
      assert(await reader.evaluate(() => JSON.stringify(window.__dev.S)) === readerMemory, 'Reader display changes mutated the loaded profile.');
      results.push({ step: 'reader browses content but cannot mutate/import/resume', pass: true });

      await writer.close();
      await reader.waitForTimeout(200);
      assert(await reader.evaluate(() => window.__dev.rezimPisanja) === 'reader', 'Reader automatically took over after writer closed.');
      assert(await reader.evaluate(() => window.__documentToken) === readerToken, 'Reader automatically reloaded after writer closed.');
      await reader.locator('[data-practice-link]').focus();
      await reader.keyboard.press('Enter');
      await reader.waitForFunction(() => !!window.__dev && window.__dev.rezimPisanja === 'writer' && !!window.__dev.sim);
      assert(await reader.evaluate(() => localStorage.getItem('vozackiA.v1')) === writerBytes.state, 'Explicit takeover did not load the latest progress.');
      assert(await reader.evaluate(() => localStorage.getItem('vozackiA.sim')) === writerBytes.exam, 'Explicit takeover did not resume the pending exam.');
      results.push({ step: 'writer close does not take over until explicit practice action, then pending work resumes', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const legacy = await open(context);
      await legacy.waitForFunction(() => window.__dev.rezimPisanja === 'reader');
      await writer.locator('#btnTheme').click();
      const inMemoryBeforeConflict = await writer.evaluate(() => JSON.stringify(window.__dev.S));
      await writer.waitForFunction(() => !!document.getElementById('tourTip'));
      await writer.evaluate(() => {
        for (const id of ['repoUpd', 'updBar', 'iosHint']) {
          const overlay = document.createElement('div');
          overlay.id = id;
          overlay.innerHTML = '<button type="button">synthetic action</button>';
          document.body.appendChild(overlay);
        }
      });
      const legacyRaw = await legacy.evaluate(() => JSON.stringify({ q: {}, script: 'c', theme: 'light', tour: 1, noUpd: 1 }));
      await legacy.evaluate((raw) => localStorage.setItem('vozackiA.v1', raw), legacyRaw);
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict' && !!document.getElementById('tabZakljucan'));
      await writer.waitForTimeout(700);
      assert(await writer.evaluate(() => !document.getElementById('tourTip') && !document.getElementById('tourDim') && !document.querySelector('.tourSpot')),
        'A current or delayed tour remained interactive after conflict.');
      assert(await writer.evaluate(() => ['repoUpd', 'updBar', 'iosHint'].every((id) => !document.getElementById(id))),
        'An update or install overlay remained interactive after conflict.');
      await tabTo(writer, 'btnTabExport');
      await writer.keyboard.press('Space');
      await writer.waitForFunction(() => window.__syntheticExports.length === 1);
      assert(await writer.evaluate(() => window.__syntheticExports[0]) === inMemoryBeforeConflict,
        'Conflict export did not preserve the writer in-memory profile.');
      await writer.evaluate(() => document.getElementById('btnScript').click());
      assert(await legacy.evaluate(() => localStorage.getItem('vozackiA.v1')) === legacyRaw,
        'Demoted writer overwrote the external legacy write.');
      results.push({ step: 'legacy storage event freezes the writer and preserves its exportable memory', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const legacy = await open(context);
      const imageId = await writer.evaluate(() => {
        window.__dev.S.tour = 1;
        return QUIZ.questions.find((question) => question.img)?.id;
      });
      assert(imageId, 'No image question exists for the modal regression.');
      await writer.evaluate((id) => { location.hash = '#/p/' + id; }, imageId);
      await writer.waitForFunction(() => document.getElementById('view-question')?.classList.contains('active'));
      await writer.waitForFunction(() => document.querySelector('img.qImg')?.naturalWidth > 0);
      await writer.locator('.qImgBtn, img.qImg').first().click();
      await writer.waitForFunction(() => !!document.getElementById('imgZoom'));
      const legacyRaw = await legacy.evaluate(() => JSON.stringify({ q: {}, script: 'l', theme: 'dark', tour: 1, noUpd: 1 }));
      await legacy.evaluate((raw) => localStorage.setItem('vozackiA.v1', raw), legacyRaw);
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      await writer.keyboard.press('Escape');
      const frozen = await writer.evaluate(() => ({
        modalGone: !document.getElementById('imgZoom'),
        inert: ['topbar', 'glavni', 'donjaNav', 'podnozje'].every((id) => document.getElementById(id)?.inert === true),
      }));
      assert(frozen.modalGone && frozen.inert, 'Image modal cleanup unlocked the conflicted application.');
      results.push({ step: 'conflict closes image modal without unlocking the application', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const legacy = await open(context);
      await writer.locator('#btnTheme').click();
      await legacy.evaluate(() => localStorage.clear());
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      await writer.evaluate(() => document.getElementById('btnScript').click());
      assert(await writer.evaluate(() => localStorage.getItem('vozackiA.v1')) === null,
        'A writer recreated progress after an external localStorage.clear().');
      results.push({ step: 'external localStorage.clear freezes the active writer', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const unseenRaw = await writer.evaluate(() => JSON.stringify({ q: {}, script: 'c', theme: 'light', tour: 1, noUpd: 1 }));
      await writer.evaluate((raw) => localStorage.setItem('vozackiA.v1', raw), unseenRaw);
      await writer.evaluate(() => document.getElementById('btnTheme').click());
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      assert(await writer.evaluate(() => localStorage.getItem('vozackiA.v1')) === unseenRaw,
        'Compare-before-write overwrote bytes changed without a storage event.');
      results.push({ step: 'pre-write comparison catches an unseen legacy change', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const legacy = await open(context);
      await writer.evaluate(() => { window.__dev.S.tour = 1; location.hash = '#/uci'; });
      await writer.waitForFunction(() => document.getElementById('view-question')?.classList.contains('active'));
      const before = await writer.evaluate(() => ({
        state: JSON.stringify(window.__dev.S),
        qid: document.getElementById('qCard').dataset.qid,
        choices: [...document.querySelectorAll('#qCard .choice')].map((choice) => choice.getAttribute('aria-pressed')),
      }));
      const legacyRaw = await legacy.evaluate(() => JSON.stringify({ q: {}, script: 'c', theme: 'dark', tour: 1, noUpd: 1 }));
      await legacy.evaluate((raw) => localStorage.setItem('vozackiA.v1', raw), legacyRaw);
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      await writer.keyboard.press('1');
      await writer.keyboard.press('ArrowRight');
      await writer.keyboard.press('Enter');
      const after = await writer.evaluate(() => ({
        state: JSON.stringify(window.__dev.S),
        qid: document.getElementById('qCard').dataset.qid,
        choices: [...document.querySelectorAll('#qCard .choice')].map((choice) => choice.getAttribute('aria-pressed')),
      }));
      assert(JSON.stringify(after) === JSON.stringify(before), 'Question shortcuts changed frozen progress, choice, or position.');
      results.push({ step: 'question keyboard shortcuts cannot mutate a conflicted tab', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const legacy = await open(context);
      await writer.evaluate(() => { window.__dev.S.tour = 1; });
      await writer.locator('[data-nav="sim"]').first().click();
      await writer.waitForFunction(() => !!window.__dev.sim);
      const before = await writer.evaluate(() => ({
        state: JSON.stringify(window.__dev.S),
        index: window.__dev.sim.i,
        choices: window.__dev.sim.qs.map((sq) => [...sq.chosen]),
      }));
      const legacyRaw = await legacy.evaluate(() => JSON.stringify({ q: {}, script: 'c', theme: 'dark', tour: 1, noUpd: 1 }));
      await legacy.evaluate((raw) => localStorage.setItem('vozackiA.v1', raw), legacyRaw);
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      await writer.keyboard.press('1');
      await writer.keyboard.press('ArrowRight');
      await writer.keyboard.press('Enter');
      const after = await writer.evaluate(() => ({
        state: JSON.stringify(window.__dev.S),
        index: window.__dev.sim.i,
        choices: window.__dev.sim.qs.map((sq) => [...sq.chosen]),
        timerStopped: window.__dev.sim.timerId === null,
      }));
      assert(after.state === before.state && after.index === before.index &&
        JSON.stringify(after.choices) === JSON.stringify(before.choices) && after.timerStopped,
      'Exam shortcuts or timer changed a conflicted tab.');
      results.push({ step: 'exam keyboard shortcuts and timer cannot mutate a conflicted tab', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      await writer.evaluate(() => { window.__dev.S.tour = 1; });
      await writer.locator('[data-nav="sim"]').first().click();
      await writer.waitForFunction(() => !!window.__dev.sim);
      const before = await writer.evaluate(() => {
        window.__dev.sim.deadline = Date.now() + 100;
        const snapshot = JSON.stringify(window.__dev.S);
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        return snapshot;
      });
      await writer.waitForTimeout(700);
      const after = await writer.evaluate(() => ({
        state: JSON.stringify(window.__dev.S),
        role: window.__dev.rezimPisanja,
        simPresent: !!window.__dev.sim,
        timerStopped: window.__dev.sim?.timerId === null,
      }));
      assert(after.state === before && after.role === 'retired' && after.simPresent && after.timerStopped,
        'A retired document completed or changed its expired pending exam.');
      results.push({ step: 'retired pending exam cannot expire into history', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const before = await writer.evaluate(() => {
        window.__dev.S.tour = 1;
        window.__dev.S.q[String(QUIZ.questions[0].id)] = { a: 3, w: 1, streak: 0, marked: 1 };
        const snapshot = JSON.stringify(window.__dev.S);
        window.confirm = () => {
          localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, script: 'c', theme: 'dark', tour: 1, noUpd: 1 }));
          return true;
        };
        document.getElementById('btnReset').click();
        return snapshot;
      });
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      assert(await writer.evaluate(() => JSON.stringify(window.__dev.S)) === before,
        'Reset replaced in-memory progress after storage changed during confirmation.');
      results.push({ step: 'reset rechecks ownership after confirmation', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      const before = await writer.evaluate(() => {
        window.__dev.S.tour = 1;
        window.__dev.S.q[String(QUIZ.questions[0].id)] = { a: 2, w: 1, streak: 0, marked: 0 };
        const snapshot = JSON.stringify(window.__dev.S);
        window.confirm = () => {
          localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, script: 'c', theme: 'dark', tour: 1, noUpd: 1 }));
          return true;
        };
        const transfer = new DataTransfer();
        transfer.items.add(new File([JSON.stringify({ q: {}, script: 'c', theme: 'light', tour: 1, noUpd: 1 })],
          'synthetic-import.json', { type: 'application/json' }));
        const input = document.getElementById('fileImport');
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return snapshot;
      });
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      assert(await writer.evaluate(() => JSON.stringify(window.__dev.S)) === before,
        'Import replaced in-memory progress after storage changed during confirmation.');
      results.push({ step: 'import rechecks ownership after confirmation', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      await writer.evaluate(() => { window.__dev.S.tour = 1; });
      await writer.locator('[data-nav="sim"]').first().click();
      await writer.waitForFunction(() => !!window.__dev.sim);
      const before = await writer.evaluate(() => {
        const snapshot = JSON.stringify(window.__dev.S);
        window.confirm = () => {
          localStorage.setItem('vozackiA.sim', 'synthetic-foreign-exam');
          return true;
        };
        document.getElementById('btnFinishSim').click();
        return snapshot;
      });
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      assert(await writer.evaluate(() => JSON.stringify(window.__dev.S)) === before && await writer.evaluate(() => !!window.__dev.sim),
        'Exam completion mutated progress after the pending exam changed during confirmation.');
      results.push({ step: 'exam finish rechecks ownership after confirmation', pass: true });
    } finally {
      await context.close();
    }
  }

  {
    const context = await freshContext();
    try {
      const writer = await open(context);
      await writer.evaluate(() => { window.__dev.S.tour = 1; });
      await writer.locator('[data-nav="sim"]').first().click();
      await writer.waitForFunction(() => !!window.__dev.sim);
      await writer.evaluate(() => {
        window.confirm = () => {
          localStorage.setItem('vozackiA.sim', 'synthetic-foreign-exam');
          return true;
        };
        document.querySelector('[data-nav="home"]').click();
      });
      await writer.waitForFunction(() => window.__dev.rezimPisanja === 'conflict');
      assert(await writer.evaluate(() => !!window.__dev.sim),
        'Exam navigation discarded the in-memory exam after storage changed during confirmation.');
      results.push({ step: 'exam leave rechecks ownership after confirmation', pass: true });
    } finally {
      await context.close();
    }
  }

  console.log(JSON.stringify({ passed: results.length, results }));
  return { passed: results.length, results };
}
