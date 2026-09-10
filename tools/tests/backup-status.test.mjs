import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const start = source.indexOf('  function renderBackupLine()');
const end = source.indexOf('  // ---------- Početna', start);
assert.notEqual(start, -1, 'renderBackupLine is missing');
assert.notEqual(end, -1, 'renderBackupLine boundary is missing');
const renderSource = source.slice(start, end);

test('connected-file status distinguishes waiting, writing, current and failed copies', () => {
  const line = { textContent: '', innerHTML: '' };
  const slot = { style: {}, innerHTML: '' };
  const settings = { style: { display: 'none' } };
  const settingsButton = { calls: [], setAttribute(...args) { this.calls.push(args); } };
  const context = vm.createContext({
    line,
    slot,
    settings,
    settingsButton,
    escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;'),
    L: key => `[${key}]`,
  });
  vm.runInContext(`
    let FSA=true, fsHandle={name:'copy<&.json'}, fsPending=null, backupFaza='ceka';
    const el=id=>id==='backupLine'?line:id==='backupSlot'?slot:id==='podesavanjaTelo'?settings:id==='btnPodesavanja'?settingsButton:null;
    function resumeBackup(){}
    function connectBackup(){}
    ${renderSource}
    globalThis.renderPhase=phase=>{backupFaza=phase;line.textContent='';line.innerHTML='';renderBackupLine();return line.innerHTML||line.textContent;};
  `, context);
  const expected = {
    ceka: ['⏳', '[backupCeka]'],
    upisuje: ['⏳', '[backupUpisuje]'],
    uspesno: ['✅', '[backupUspesno]'],
    greska: ['⚠', '[backupGreska]'],
  };
  for (const [phase, fragments] of Object.entries(expected)) {
    const rendered = context.renderPhase(phase);
    for (const fragment of fragments) assert.match(rendered, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(rendered, /copy&lt;&amp;\.json/);
  }
  assert.equal(settings.style.display, 'none');
  assert.deepEqual(settingsButton.calls, []);
});
