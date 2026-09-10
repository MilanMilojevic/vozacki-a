import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = new URL('../../', import.meta.url);
// Git checkouts may use LF or CRLF; line endings do not change the runtime helper.
const app = fs.readFileSync(new URL('app.js', root), 'utf8').replace(/\r\n/g, '\n');
const dataSource = fs.readFileSync(new URL('data.js', root), 'utf8');
const baselineSource = fs.readFileSync(new URL('image-baseline.js', root), 'utf8');
const helperSource = app.match(/  function putanjaSlike\(id\) \{[\s\S]*?\n  \}\n  function slikeUHtml\(html\) \{[\s\S]*?\n  \}/)?.[0];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function assignment(source, receiver, name) {
  const match = source.match(new RegExp('^(?:\\s*//[^\\r\\n]*\\r?\\n)?\\s*' + receiver + '\\.' + name + '\\s*=\\s*(\\{[\\s\\S]*\\})\\s*;\\s*$'));
  assert.ok(match, name + ' must remain a plain public assignment');
  return JSON.parse(match[1]);
}

function helper(fileMode, imageHashes, expression) {
  assert.ok(helperSource, 'runtime image helper must be extractable');
  const context = { D:{imageHashes}, FILE_MODE:fileMode, result:null };
  vm.runInNewContext(`${helperSource}\nresult=${expression};`, context);
  return context.result;
}

test('current data hashes cover exactly the current image questions and actual public bytes', () => {
  const data = assignment(dataSource, 'window', 'QUIZ');
  const ids = data.questions.filter(question => question.img).map(question => String(question.id)).sort((a,b)=>Number(a)-Number(b));
  assert.deepEqual(Object.keys(data.imageHashes).sort((a,b)=>Number(a)-Number(b)), ids);
  for (const id of ids) assert.equal(data.imageHashes[id], digest(fs.readFileSync(new URL(`img/${id}.jpg`, root))), id);
});

test('frozen v153 baseline has its independent pinned shape and provenance', () => {
  const baseline = assignment(baselineSource, 'self', 'VA_IMAGE_BASELINE');
  assert.equal(Object.keys(baseline).length, 704);
  assert.ok(Object.entries(baseline).every(([id,hash]) => /^[1-9]\d*$/.test(id) && /^[a-f0-9]{64}$/.test(hash)));
  assert.match(baselineSource, /40e06b8575875773d66c6c4b54381f1d43014a7c/);
  assert.equal(digest(JSON.stringify(baseline)), '9566212743a1292021b662a819a6bd82d7373a2a724b34b981bae773569e76d0');
});

test('HTTP image URLs carry exact content hashes while file URLs stay query-free', () => {
  const hash = digest('image');
  assert.equal(helper(false,{7:hash},'putanjaSlike(7)'),`img/7.jpg?h=${hash}`);
  assert.equal(helper(true,{},'putanjaSlike(7)'),'img/7.jpg');
  assert.equal(helper(false,{7:hash},`slikeUHtml('<img src="img/7.jpg"><a href=img/7.jpg>')`),
    `<img src="img/7.jpg?h=${hash}"><a href=img/7.jpg?h=${hash}>`);
  assert.equal(helper(false,{7:hash},`slikeUHtml('<span>img/7.jpg</span><i style="background:url(\\'img/7.jpg\\')"></i>')`),
    `<span>img/7.jpg</span><i style="background:url('img/7.jpg?h=${hash}')"></i>`);
  assert.equal(helper(true,{7:hash},`slikeUHtml('<img src="img/7.jpg">')`),'<img src="img/7.jpg">');
  assert.throws(()=>helper(false,{},'putanjaSlike(7)'),/hash/i);
  assert.throws(()=>helper(false,{7:'bad'},'putanjaSlike(7)'),/hash/i);
});

test('all runtime image construction paths use the central helper', () => {
  assert.doesNotMatch(app, /(?:src=["']|\.src\s*=\s*["'])img\//);
  assert.equal((app.match(/slikeUHtml\(T\([^\n]*\.h\)\)/g)||[]).length,4);
  const embed=fs.readFileSync(new URL('embed.html',root),'utf8');
  assert.match(embed,/\.jpg\?h=' \+ imageHash/);
});
