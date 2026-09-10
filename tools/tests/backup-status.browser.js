// Disposable localhost contexts only. The file is created in their private OPFS,
// never selected from the user's disk. Delayed close checks the visible promise.
async (page) => {
  const origin = page.url().match(/^http:\/\/localhost:18764(?=\/|$)/)?.[0];
  if (!origin) throw Error('Backup status test requires http://localhost:18764.');
  const browser = page.context().browser();
  if (!browser) throw Error('A disposable BrowserContext is required.');
  const results = [];
  const assert = (value, message) => { if (!value) throw Error(message); };
  for (const script of ['l', 'c']) {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    context.setDefaultTimeout(7000);
    try {
      await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      await context.addInitScript(({ script }) => {
        localStorage.setItem('vozackiA.v1', JSON.stringify({ q: {}, script, tour: 1, noUpd: 1 }));
        window.__backupProbe = { calls: 0, closed: 0, fail: false, release: null };
        const original = FileSystemFileHandle.prototype.createWritable;
        FileSystemFileHandle.prototype.createWritable = async function(options) {
          const probe = window.__backupProbe;
          probe.calls++;
          if (probe.fail) throw new DOMException('Synthetic unavailable file', 'UnknownError');
          const writer = await original.call(this, options);
          return {
            write: value => writer.write(value),
            truncate: size => writer.truncate(size),
            abort: () => writer.abort(),
            close: async () => {
              await new Promise(resolve => { probe.release = resolve; });
              probe.release = null;
              await writer.close();
              probe.closed++;
            },
          };
        };
        window.showSaveFilePicker = async () => {
          const root = await navigator.storage.getDirectory();
          return root.getFileHandle('synthetic-backup.json', { create: true });
        };
      }, { script });
      const p = await context.newPage();
      await p.goto(origin);
      await p.waitForFunction(() => window.__dev?.rezimPisanja === 'writer');
      await p.locator('#btnPodesavanja').click();
      await p.locator('#btnConnectBackup').click();
      const text = {
        waiting: script === 'l' ? 'čeka upis' : 'чека упис',
        writing: script === 'l' ? 'se upisuje' : 'се уписује',
        current: script === 'l' ? 'je upisana' : 'је уписана',
        failed: script === 'l' ? 'nije upisana' : 'није уписана',
      };
      await p.waitForFunction(t => document.getElementById('backupLine').textContent.includes(t), text.waiting);
      await p.locator('#btnPodesavanja').click();
      await p.waitForFunction(() => !!window.__backupProbe.release);
      assert((await p.locator('#backupLine').textContent()).includes(text.writing), `${script}: delayed close claimed success`);
      results.push({ script, step: 'connected copy waits and delayed close stays writing', pass: true });
      await p.locator('#btnTheme').click();
      await p.waitForFunction(t => document.getElementById('backupLine').textContent.includes(t), text.waiting);
      await p.evaluate(() => window.__backupProbe.release());
      await p.waitForFunction(() => window.__backupProbe.closed === 1);
      assert(!(await p.locator('#backupLine').textContent()).includes(text.current), `${script}: old revision claimed newest success`);
      await p.waitForFunction(() => window.__backupProbe.calls === 2 && !!window.__backupProbe.release);
      await p.evaluate(() => window.__backupProbe.release());
      await p.waitForFunction(t => document.getElementById('backupLine').textContent.includes(t), text.current);
      const committed = await p.evaluate(async () => {
        const root = await navigator.storage.getDirectory();
        const file = await (await root.getFileHandle('synthetic-backup.json')).getFile();
        return JSON.parse(await file.text()).theme === window.__dev.S.theme;
      });
      assert(committed, `${script}: success did not correspond to newest disk content`);
      assert(await p.locator('#btnPodesavanja').getAttribute('aria-expanded') === 'false', `${script}: backup opened collapsed settings`);
      results.push({ script, step: 'only newest closed revision reports success; settings stay collapsed', pass: true });
      await p.evaluate(() => { window.__backupProbe.fail = true; });
      await p.locator('#btnTheme').click();
      await p.waitForFunction(t => document.getElementById('backupLine').textContent.includes(t), text.failed);
      const calls = await p.evaluate(() => window.__backupProbe.calls);
      assert(calls === 4, `${script}: failure retry count differs (${calls})`);
      results.push({ script, step: 'two failed attempts show failure', pass: true });
      await p.evaluate(() => { window.__backupProbe.fail = false; });
      await p.locator('#btnTheme').click();
      await p.waitForFunction(t => document.getElementById('backupLine').textContent.includes(t), text.waiting);
      await p.waitForFunction(() => !!window.__backupProbe.release);
      await p.evaluate(() => window.__backupProbe.release());
      await p.waitForFunction(t => document.getElementById('backupLine').textContent.includes(t), text.current);
      results.push({ script, step: 'later change retries and completes', pass: true });
    } finally {
      await context.close();
    }
  }
  return { passed: results.length, results };
}
