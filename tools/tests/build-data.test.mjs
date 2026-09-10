import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import test from 'node:test';

const original = 'synthetic original data\n';
const source = languageId => ({ languageId, tree: [25, 26].map(categoryId => ({ categoryId,
  subs: [{ id: categoryId + 1000, desc: languageId === '15' ? 'Podoblasti;': 'Подобласти;', n: 1 }] })),
  questions: [26, 25].map(categoryId => ({ qId: categoryId + 7000, categoryId, subcategoryId: categoryId + 1000,
    Text: languageId === '15' ? 'Regulisanјe' : 'Регулисање', Points: 2, ChoicesReq: 1, HasImage: categoryId === 25,
    Choices: [{ paId: categoryId + 8000, Text: languageId === '15' ? 'Prvi' : 'Први', isCorrect: true },
      { paId: categoryId + 9000, Text: languageId === '15' ? 'Drugi' : 'Други', isCorrect: false }] })) });

async function fixture(t, mutate = () => {}, failure = '') {
  const dir = await mkdtemp(path.join(tmpdir(), 'vozacki-build-'));
  t.after(async () => {
    assert.equal(path.dirname(dir), path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('vozacki-build-'));
    await rm(dir, { recursive: true, force: true });
  });
  const tools = path.join(dir, 'tools'), images = path.join(dir, 'img'), out = path.join(dir, 'data.js');
  await mkdir(tools); await mkdir(images);
  for (const file of ['build-data.mjs', 'harvest.mjs']) await copyFile(new URL('../' + file, import.meta.url), path.join(tools, file));
  const lat = source('15'), cyr = source('9');
  cyr.questions.reverse(); for (const q of cyr.questions) q.Choices.reverse();
  mutate(lat, cyr);
  await writeFile(path.join(tools, 'base-A.json'), JSON.stringify(lat));
  await writeFile(path.join(tools, 'base-A-cyr.json'), JSON.stringify(cyr));
  await writeFile(path.join(images, '7025.jpg'), Buffer.from([255, 216, 255, 217]));
  await writeFile(out, original);
  const preload = path.join(dir, 'failure.mjs'), writes = path.join(dir, 'writes.jsonl');
  await writeFile(preload, `import fs from 'node:fs/promises';
    const open=fs.open;
    fs.open=async(...args)=>{
      await fs.appendFile(${JSON.stringify(writes)}, JSON.stringify({mode:args[1]})+'\\n');
      const h=await open(...args);
      if(${JSON.stringify(failure)}!=='write')return h;
      return {writeFile:async data=>{await h.writeFile(data.slice(0,10));throw Error('synthetic write failure');},close:()=>h.close()};
    };
    if(${JSON.stringify(failure)}==='rename')fs.rename=async()=>{throw Error('synthetic rename failure');};
    globalThis.fetch=()=>{throw Error('Unexpected network request');};
  `);
  return { dir, tools, images, out,
    run(args = ['--date', '2026-09-10'], cwd = dir) {
      return spawnSync(process.execPath, ['--import', pathToFileURL(preload).href, path.join(tools, 'build-data.mjs'), ...args],
        { cwd, encoding: 'utf8', timeout: 5000, windowsHide: true });
    },
    async unchanged() {
      assert.equal(await readFile(out, 'utf8'), original);
      assert.deepEqual((await readdir(dir)).filter(file => file.endsWith('.tmp')), []);
    },
    async noWrites() { assert.equal(await readFile(writes, 'utf8').catch(() => ''), ''); },
  };
}

test('script-relative defaults align by official IDs and preserve sorting, choice order, transliteration and schema', async t => {
  const f = await fixture(t, (lat, cyr) => {
    lat.practiceId = cyr.practiceId = 'synthetic-private-value';
    lat.questions[0].practiceId = 'synthetic-private-value';
  }), result = f.run(); assert.equal(result.status, 0, result.stderr);
  const raw = await readFile(f.out, 'utf8'), context = { window: {} }; vm.runInNewContext(raw, context);
  assert.ok(!raw.includes('synthetic-private-value'));
  const data = JSON.parse(JSON.stringify(context.window.QUIZ));
  assert.deepEqual(Object.keys(data), ['generated', 'cats', 'subs', 'imageHashes', 'questions']);
  assert.equal(data.generated, '2026-09-10'); assert.equal(data.cats.length, 14);
  assert.deepEqual(data.imageHashes, {7025:createHash('sha256').update(Buffer.from([255,216,255,217])).digest('hex')});
  assert.deepEqual(data.questions.map(q => q.id), [7025, 7026]);
  assert.deepEqual(data.questions[0], { id: 7025, cat: 25, sub: 1025, pts: 2, req: 1, img: 1,
    t: { l: 'Regulisanje', c: 'Регулисање' }, ch: [
      { id: 8025, ok: 1, t: { l: 'Prvi', c: 'Први' } }, { id: 9025, ok: 0, t: { l: 'Drugi', c: 'Други' } }] });
  assert.deepEqual(data.subs['1025'], { l: 'Podoblasti', c: 'Подобласти' });
  assert.equal(f.run().status, 0); assert.equal(await readFile(f.out, 'utf8'), raw, 'explicit date makes identical inputs reproducible');
});

test('changing image bytes changes only that image fingerprint and preserves all question data', async t => {
  const f=await fixture(t), first=f.run(); assert.equal(first.status,0,first.stderr);
  const before={window:{}};vm.runInNewContext(await readFile(f.out,'utf8'),before);
  await writeFile(path.join(f.images,'7025.jpg'),Buffer.from([255,216,1,255,217]));
  const second=f.run();assert.equal(second.status,0,second.stderr);
  const after={window:{}};vm.runInNewContext(await readFile(f.out,'utf8'),after);
  assert.notEqual(after.window.QUIZ.imageHashes[7025],before.window.QUIZ.imageHashes[7025]);
  assert.deepEqual(JSON.parse(JSON.stringify(after.window.QUIZ.questions)),JSON.parse(JSON.stringify(before.window.QUIZ.questions)));
});

test('explicit CLI paths support spaces and default generated is the UTC build date', async t => {
  const f = await fixture(t), output = path.join(f.dir, 'other output.js');
  const before = new Date().toISOString().slice(0, 10);
  const result = f.run(['--lat', path.join(f.tools, 'base-A.json'), '--cyr', path.join(f.tools, 'base-A-cyr.json'),
    '--images', f.images, '--out', output], f.tools);
  assert.equal(result.status, 0, result.stderr);
  const context = { window: {} }; vm.runInNewContext(await readFile(output, 'utf8'), context);
  assert.ok([before, new Date().toISOString().slice(0, 10)].includes(context.window.QUIZ.generated));
  await f.unchanged();
});

const invalid = {
  empty: (l, c) => { l.tree = c.tree = []; l.questions = c.questions = []; },
  malformed: l => { l.questions = {}; },
  'missing-question': (l, c) => { c.questions.pop(); c.tree[1].subs[0].n = 0; },
  'different-question-ID': (l, c) => { c.questions[0].qId = 9999; },
  'duplicate-question': (l, c) => { c.questions.push(structuredClone(c.questions[0])); },
  'missing-choice': (l, c) => { c.questions[0].Choices = c.questions[0].Choices.filter(a => a.isCorrect); },
  'different-choice-ID': (l, c) => { c.questions[0].Choices[0].paId = 9999; },
  'duplicate-choice': (l, c) => { c.questions[0].Choices[0].paId = c.questions[0].Choices[1].paId; },
  'extra-category': (l, c) => { c.tree.push({ categoryId: 27, subs: [] }); },
  'extra-subcategory': (l, c) => { c.tree[0].subs.push({ id: 2000, desc: 'Extra', n: 0 }); },
  'subcategory-owner': (l, c) => { l.tree[0].subs.push({ id: 2000, desc: 'Extra', n: 0 }); c.tree[1].subs.push({ id: 2000, desc: 'Extra', n: 0 }); },
  classification: (l, c) => {
    c.questions[0].categoryId = 26; c.questions[0].subcategoryId = 1026;
    c.questions[1].categoryId = 25; c.questions[1].subcategoryId = 1025;
  },
  points: (l, c) => { c.questions[0].Points = 3; },
  required: (l, c) => { c.questions[0].ChoicesReq = 2; c.questions[0].Choices.forEach(a => { a.isCorrect = true; }); },
  correct: (l, c) => { c.questions[0].Choices.forEach(a => { a.isCorrect = !a.isCorrect; }); },
  image: (l, c) => { c.questions[0].HasImage = false; },
  'empty-Latin-question': l => { l.questions[0].Text = ' '; },
  'empty-Cyrillic-question': (l, c) => { c.questions[0].Text = ''; },
  'empty-Latin-answer': l => { l.questions[0].Choices[0].Text = ''; },
  'empty-Cyrillic-answer': (l, c) => { c.questions[0].Choices[0].Text = ' '; },
  'empty-Latin-subname': l => { l.tree[0].subs[0].desc = ';'; },
  'empty-Cyrillic-subname': (l, c) => { c.tree[0].subs[0].desc = ';'; },
  'wrong-language': (l, c) => { c.languageId = '15'; },
};
for (const [name, mutate] of Object.entries(invalid)) test(`invalid source preserves previous output: ${name}`, async t => {
  const f = await fixture(t, mutate), result = f.run([], f.tools);
  assert.equal(result.status, 1, result.stderr); await f.unchanged(); await f.noWrites();
});

for (const mode of ['missing-image', 'empty-image', 'directory-image', 'invalid-json', 'write', 'rename']) test(`failed build preserves output and cleans temporary files: ${mode}`, async t => {
  const f = await fixture(t, undefined, mode);
  const image = path.join(f.images, '7025.jpg');
  if (mode === 'missing-image' || mode === 'directory-image') await rm(image);
  if (mode === 'directory-image') await mkdir(image);
  if (mode === 'empty-image') await writeFile(image, '');
  if (mode === 'invalid-json') await writeFile(path.join(f.tools, 'base-A.json'), '{');
  const result = f.run([], f.tools); assert.equal(result.status, 1, result.stderr); await f.unchanged();
  if (!['write', 'rename'].includes(mode)) await f.noWrites();
});

test('questions without images do not require unused image files', async t => {
  const f = await fixture(t, (lat, cyr) => { for (const s of [lat, cyr]) s.questions.forEach(q => { q.HasImage = false; }); });
  await rm(path.join(f.images, '7025.jpg'));
  const result = f.run(); assert.equal(result.status, 0, result.stderr);
});

test('invalid or ambiguous CLI options do not change output', async t => {
  const f = await fixture(t);
  for (const args of [['--unknown'], ['--lat'], ['--date', '2026-02-30'], ['--date', '2026-1-1'],
    ['--date', '2026-09-10', '--date', '2026-09-11'], ['--out', path.join(f.tools, 'base-A.json')]]) {
    const result = f.run(args, f.tools); assert.equal(result.status, 1, result.stderr); await f.unchanged();
    await f.noWrites();
  }
});
