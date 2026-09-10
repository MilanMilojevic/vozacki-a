import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../build-explanations.mjs', import.meta.url));
const atlas = await fs.readFile(new URL('../atlas.mjs', import.meta.url));
const output = fileURLToPath(new URL('../../output/generator-cwd-tests/', import.meta.url));
const questions = Array.from({ length: 6 }, (_, i) => ({
  id: 900001 + i, sub: i < 3 ? 157 : 140, img: 1,
  t: { l: i < 3 ? 'Saobraćajni znak prikazan na slici označava:' : 'Sintetička situacija za proveru putanje.', c: 'Синтетичко питање.' },
  ch: [{ id: 800001 + i * 2, ok: 1, t: { l: 'Sintetičko značenje ' + i, c: 'Синтетичко значење.' } },
    { id: 800002 + i * 2, ok: 0, t: { l: 'Sintetičko značenje ' + ((i + 1) % 3), c: 'Други одговор.' } }],
}));

async function fixture() {
  await fs.mkdir(output, { recursive: true });
  const sandbox = await fs.mkdtemp(path.join(output, 'case-'));
  const project = path.join(sandbox, 'project'), tools = path.join(project, 'tools'), unrelated = path.join(sandbox, 'elsewhere', 'deep');
  await Promise.all([fs.mkdir(tools, { recursive: true }), fs.mkdir(unrelated, { recursive: true })]);
  await Promise.all([
    fs.writeFile(path.join(tools, 'build-explanations.mjs'), source),
    fs.writeFile(path.join(tools, 'atlas.mjs'), atlas),
    fs.writeFile(path.join(project, 'data.js'), 'window.QUIZ = ' + JSON.stringify({ questions }) + ';\n'),
    fs.writeFile(path.join(tools, 'base-A.json'), JSON.stringify({ questions: questions.map(q => ({ qId: q.id, HasImage: true, subcategoryId: q.sub })) })),
    fs.writeFile(path.join(project, 'base-A.json'), 'Wrong root cwd input must not be read'),
    fs.writeFile(path.join(unrelated, 'base-A.json'), 'Wrong unrelated cwd input must not be read'),
    fs.writeFile(path.join(unrelated, 'data.js'), 'throw Error("Wrong cwd bank");'),
    fs.writeFile(path.join(sandbox, 'explanations.js'), 'outside project sentinel'),
    fs.writeFile(path.join(sandbox, 'elsewhere', 'explanations.js'), 'outside unrelated sentinel'),
  ]);
  return { sandbox, project, tools, unrelated, target: path.join(project, 'explanations.js') };
}

function run(f, cwd) {
  const result = spawnSync(process.execPath, [path.join(f.tools, 'build-explanations.mjs')], { cwd, encoding: 'utf8', timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

const oracleFixture = await fixture();
let oracle;
try {
  run(oracleFixture, oracleFixture.tools);
  oracle = await fs.readFile(oracleFixture.target);
  const context = { window: {} };
  vm.runInNewContext(oracle.toString('utf8'), context);
  assert.deepEqual(Array.from(context.window.EXPLAIN.atlas['znakovi-opasnosti']), [900001, 900002, 900003]);
  assert.deepEqual(Array.from(context.window.EXPLAIN.situacije.parkiranje), [900004, 900005, 900006]);
  assert.ok(Object.keys(context.window.EXPLAIN.zamke).length > 0);
} finally { await fs.rm(oracleFixture.sandbox, { recursive: true, force: true }); }

for (const location of ['tools', 'project', 'unrelated']) test('generator preserves exact output and reads its own inputs from ' + location + ' cwd', async () => {
  const f = await fixture();
  try {
    await fs.writeFile(f.target, 'old output sentinel');
    const stdout = run(f, f[location]);
    assert.ok((await fs.readFile(f.target)).equals(oracle), 'Every invocation must replace only the module-relative explanations.js with identical content bytes');
    assert.equal(await fs.readFile(path.join(f.sandbox, 'explanations.js'), 'utf8'), 'outside project sentinel');
    assert.equal(await fs.readFile(path.join(f.sandbox, 'elsewhere', 'explanations.js'), 'utf8'), 'outside unrelated sentinel');
    assert.match(stdout, /slikovna sa karticom 6\/6/, 'Coverage must read tools/base-A.json in every cwd');
    assert.doesNotMatch(stdout, /base-A.json nije dostupan/);
    assert.deepEqual(await fs.readFile(path.join(f.tools, 'build-explanations.mjs')), source, 'Generator source bytes must stay unchanged');
    assert.equal(source.filter(byte => byte === 0).length, 4, 'Preserve the four transliteration NUL delimiters');
  } finally { await fs.rm(f.sandbox, { recursive: true, force: true }); }
});
