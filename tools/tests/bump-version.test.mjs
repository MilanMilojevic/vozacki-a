import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const version = 'self.APP_V = 126;\n';
const index = `<link rel="stylesheet" href="style.css?v=126">
<script src="version.js?v=126"></script>
<script src="data.js?v=126"></script>
<script src="explanations.js?v=126"></script>
<script src="app.js?v=126"></script>
`;

async function fixture(t, { vjs = version, html = index } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'vozacki-bump-'));
  t.after(async () => {
    assert.equal(path.dirname(dir), path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('vozacki-bump-'));
    await rm(dir, { recursive: true, force: true });
  });
  const root = path.join(dir, 'projekat sa razmakom');
  const tools = path.join(root, 'tools');
  const elsewhere = path.join(dir, 'elsewhere');
  await mkdir(tools, { recursive: true });
  await mkdir(elsewhere);
  const script = path.join(tools, 'bump-version.mjs');
  await writeFile(script, await readFile(new URL('../bump-version.mjs', import.meta.url)));
  if (vjs !== null) await writeFile(path.join(root, 'version.js'), vjs);
  if (html !== null) await writeFile(path.join(root, 'index.html'), html);
  const read = async (name) => {
    try { return await readFile(path.join(root, name), 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
  const run = (cwd = tools, args = [script]) => spawnSync(process.execPath, args, {
    cwd, encoding: 'utf8', windowsHide: true, timeout: 5000,
  });
  return { root, tools, elsewhere, script, read, run };
}

for (const location of ['tools', 'root', 'elsewhere']) {
  test(`increments the script's project when launched from ${location}`, async (t) => {
    const f = await fixture(t);
    const result = f.run(f[location]);
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(await f.read('version.js'), 'self.APP_V = 127;\n');
    assert.equal(await f.read('index.html'), index.replaceAll('?v=126', '?v=127'));
    assert.deepEqual((await readdir(f.root)).sort(), ['index.html', 'tools', 'version.js']);
  });
}

const invalid = [
  ['four markers', { html: index.replace('app.js?v=126', 'app.js') }],
  ['six markers', { html: index + '<script src="extra.js?v=126"></script>\n' }],
  ['mixed versions', { html: index.replace('app.js?v=126', 'app.js?v=125') }],
  ['all markers disagree', { html: index.replaceAll('?v=126', '?v=125') }],
  ['version number prefix', { html: index.replace('app.js?v=126', 'app.js?v=1260') }],
  ['nonnumeric marker', { html: index.replace('app.js?v=126', 'app.js?v=126abc') }],
  ['empty marker', { html: index.replace('app.js?v=126', 'app.js?v=') }],
  ['quoted version', { vjs: 'self.APP_V = "126";\n' }],
  ['malformed version expression', { vjs: 'self.APP_V = 126 + 1;\n' }],
  ['duplicate assignments', { vjs: version + version }],
  ['unsafe next integer', { vjs: 'self.APP_V = 9007199254740991;\n',
    html: index.replaceAll('?v=126', '?v=9007199254740991') }],
  ['missing index', { html: null }],
  ['missing version', { vjs: null }],
];

for (const [name, input] of invalid) {
  test(`rejects ${name} without changing either file`, async (t) => {
    const f = await fixture(t, input);
    const before = [await f.read('version.js'), await f.read('index.html')];
    const result = f.run();
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0, 'invalid inputs must fail');
    assert.deepEqual([await f.read('version.js'), await f.read('index.html')], before);
    const expected = ['tools', ...(before[0] === null ? [] : ['version.js']),
      ...(before[1] === null ? [] : ['index.html'])].sort();
    assert.deepEqual((await readdir(f.root)).sort(), expected);
  });
}

test('failure while preparing the second output preserves both originals', async (t) => {
  const f = await fixture(t);
  // Keep real filesystem writes; interrupt the second write after partial bytes reach disk.
  const interrupt = `
    import fs from 'node:fs';
    const write = fs.writeFileSync;
    let writes = 0;
    fs.writeFileSync = (file, ...args) => {
      if (++writes === 2) {
        write(file, 'partial output');
        throw new Error('simulated write failure');
      }
      return write(file, ...args);
    };
    await import(${JSON.stringify(pathToFileURL(f.script).href)});
  `;
  const result = f.run(f.tools, ['--input-type=module', '--eval', interrupt]);
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  assert.equal(await f.read('version.js'), version);
  assert.equal(await f.read('index.html'), index);
  assert.deepEqual((await readdir(f.root)).sort(), ['index.html', 'tools', 'version.js']);
});
