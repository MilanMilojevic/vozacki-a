import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const sourceUrl = new URL('../base-A.json', import.meta.url);

function findPrivateMetadata(value, path = '$', matches = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findPrivateMetadata(item, `${path}[${index}]`, matches));
    return matches;
  }

  if (!value || typeof value !== 'object') return matches;

  for (const [key, child] of Object.entries(value)) {
    if (/^practice(?:id|guid)$/i.test(key)) matches.push(`${path}.${key}`);
    findPrivateMetadata(child, `${path}.${key}`, matches);
  }
  return matches;
}

test('tracked A source contains no practice identifier metadata', async () => {
  const source = JSON.parse(await readFile(sourceUrl, 'utf8'));

  assert.deepEqual(findPrivateMetadata(source), []);
});

test('harvest public output strips private metadata and preserves question data', () => {
  const script = `
    const { sanitizeSource } = await import('./tools/harvest.mjs');
    const source = {
      practiceId: 'synthetic-private-value',
      languageId: '15',
      tree: [{ categoryId: 25, subs: [{ id: 101, desc: 'Synthetic', n: 1 }] }],
      questions: [{
        practiceId: 'synthetic-private-value',
        qId: 7001,
        Text: 'Synthetic question',
        Choices: [
          { paId: 8001, Text: 'First choice', PracticeGUID: 'synthetic-private-value' },
          { paId: 8002, Text: 'Second choice' },
        ],
      }],
    };
    process.stdout.write(JSON.stringify(sanitizeSource(source)));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    cwd: new URL('../..', import.meta.url),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    languageId: '15',
    tree: [{ categoryId: 25, subs: [{ id: 101, desc: 'Synthetic', n: 1 }] }],
    questions: [{
      qId: 7001,
      Text: 'Synthetic question',
      Choices: [
        { paId: 8001, Text: 'First choice' },
        { paId: 8002, Text: 'Second choice' },
      ],
    }],
  });
});
