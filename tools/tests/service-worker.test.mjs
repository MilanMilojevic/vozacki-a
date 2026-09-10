import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash, webcrypto } from 'node:crypto';

const code = fs.readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');
const version = 200;
const coreAssets = ['style.css', 'version.js', 'data.js', 'explanations.js', 'app.js'];
const index = n => [
  `<link rel="stylesheet" href="style.css?v=${n}">`,
  ...coreAssets.slice(1).map(file => `<script src="${file}?v=${n}"></script>`),
].join('');
const storage = () => ({ bins: new Map() });
const sha = value => createHash('sha256').update(value).digest('hex');
const oldImage = 'unchanged-image-bytes';
const oldImageHash = sha(oldImage);

async function snapshot(store, name) {
  const bin = store.bins.get(name);
  if (!bin) return null;
  return Promise.all([...bin.entries()].sort(([a], [b]) => a.localeCompare(b)).map(async ([url, response]) => [url, await response.clone().text()]));
}

function worker(host = 'example.test', { store = storage(), appVersion = version, scopePath = '/vozacki-a/', baseline = {1:oldImageHash} } = {}) {
  const base = `https://${host}${scopePath}`;
  const { bins } = store;
  const handlers = {};
  let offline = false;
  let failFile = null;
  let httpFailure = null;
  let skipped = false;
  let remoteVersion = appVersion;
  let remoteIndex = null;
  let remoteVersionText = null;
  let putGate = null;
  let rejectPuts = false;
  let fetchCount = 0;
  const fetches = new Map();
  const imageBodies = new Map([['img/1.jpg', oldImage]]);
  const key = value => new URL(typeof value === 'string' ? value : value.url, base).href;
  const fetcher = async input => {
    const url = key(input);
    fetchCount++;
    fetches.set(url, (fetches.get(url) || 0) + 1);
    if (offline || (failFile && url.includes(failFile))) throw Error('synthetic interrupted network');
    if (httpFailure && url.includes(httpFailure.file)) return new Response('synthetic HTTP failure', { status: httpFailure.status });
    if (url.endsWith('/') || url.includes('index.html')) return new Response(remoteIndex ?? index(remoteVersion));
    if (url.includes('version.js')) return new Response(remoteVersionText ?? `self.APP_V = ${remoteVersion};`);
    const relative = new URL(url).pathname.slice(new URL(base).pathname.length);
    if (imageBodies.has(relative)) return new Response(imageBodies.get(relative), { headers: {'Content-Type':'image/jpeg'} });
    return new Response(`synthetic ${url}`);
  };
  const caches = {
    async has(name) { return bins.has(name); },
    async open(name) {
      if (!bins.has(name)) bins.set(name, new Map());
      const bin = bins.get(name);
      return {
        async match(req) { return bin.get(key(req))?.clone(); },
        async put(req, response) {
          if (putGate) await putGate;
          if (rejectPuts) throw new DOMException('Synthetic cache quota failure', 'QuotaExceededError');
          bin.set(key(req), response.clone());
        },
        async delete(req) { return bin.delete(key(req)); },
        async addAll(requests) {
          const entries = await Promise.all(requests.map(async request => [key(request), await fetcher(request)]));
          if (entries.some(([, response]) => !response.ok || response.status === 206)) throw new TypeError('Synthetic Cache.addAll HTTP rejection');
          for (const [url, response] of entries) bin.set(url, response.clone());
        },
      };
    },
    async keys() { return [...bins.keys()]; },
    async delete(name) { return bins.delete(name); },
  };
  const self = {
    APP_V: appVersion,
    location: new URL(base + 'sw.js'),
    registration: { scope: base },
    importScripts(...urls) {
      if (urls.some(url => String(url).includes('image-baseline.js'))) {
        if (baseline === null) throw Error('synthetic missing image baseline');
        self.VA_IMAGE_BASELINE = structuredClone(baseline);
      }
    },
    skipWaiting() { skipped = true; },
    clients: { async claim() {} },
    addEventListener(type, fn) { handlers[type] = fn; },
  };
  vm.runInNewContext(code, { self, caches, fetch: fetcher, URL, Request, Response, DOMException, console, crypto:webcrypto });
  return {
    base,
    bins,
    caches,
    store,
    setOffline(value) { offline = value; },
    setFailure(value) { failFile = value; },
    setHttpFailure(file, status = 500) { httpFailure = { file, status }; },
    setRemoteVersion(value) { remoteVersion = value; },
    setRemoteIndex(value) { remoteIndex = value; },
    setRemoteVersionText(value) { remoteVersionText = value; },
    setPutGate(value) { putGate = value; },
    setPutFailure(value) { rejectPuts = value; },
    setImage(path, value) { imageBodies.set(path, value); },
    removeImage(path) { imageBodies.delete(path); },
    fetchesFor(path) { return fetches.get(key(path)) || 0; },
    get fetchCount() { return fetchCount; },
    get skipped() { return skipped; },
    async event(type) {
      let promise;
      handlers[type]({ waitUntil(value) { promise = value; } });
      await promise;
    },
    async request(path, mode = 'cors') {
      let response;
      handlers.fetch({
        request: { method: 'GET', url: key(path), mode },
        respondWith(value) { response = value; },
        waitUntil() {},
      });
      return response;
    },
  };
}

test('interrupted new installation preserves the old usable core and cannot skip waiting', async () => {
  const w = worker();
  await (await w.caches.open('va-core-v199')).put('./index.html', new Response('old complete page'));
  w.setFailure('explanations.js');
  await assert.rejects(w.event('install'), /synthetic interrupted/);
  assert.equal(w.skipped, false);
  assert.equal(await (await (await w.caches.open('va-core-v199')).match('./index.html')).text(), 'old complete page');
  assert.equal(await w.caches.has('va-core-v200'), false);
});

test('an HTTP 500 core response rejects the install atomically', async () => {
  const w = worker();
  w.setHttpFailure('explanations.js');
  await assert.rejects(w.event('install'), /HTTP rejection/);
  assert.equal(w.skipped, false);
  assert.equal(await w.caches.has('va-core-v200'), false);
});

for (const host of ['example.test', 'localhost']) test(`${host}: successful install makes a fresh document usable offline`, async () => {
  const w = worker(host);
  await w.event('install');
  assert.equal(w.skipped, true);
  await w.event('activate');
  w.setOffline(true);
  const home = await w.request('./', 'navigate');
  assert.equal(home.status, 200);
  assert.equal(await home.text(), index(version));
  for (const file of coreAssets) assert.equal((await w.request(`./${file}?v=${version}`)).status, 200, file);
});

test('public navigation stays on prepared release while a newer deployment is incomplete', async () => {
  const w = worker();
  await w.event('install');
  await w.event('activate');
  w.setRemoteVersion(version + 1);
  assert.equal(await (await w.request('./', 'navigate')).text(), index(version));
});

test('public navigation fails closed when its prepared index is missing', async () => {
  const w = worker();
  await w.event('install');
  await (await w.caches.open('va-core-v200')).delete('./index.html');
  w.setRemoteVersion(version + 1);
  const response = await w.request('./', 'navigate');
  assert.equal(response.status, 503);
  assert.notEqual(await response.text(), index(version + 1));
});

test('localhost continues to show source changes without a new release number', async () => {
  const w = worker('localhost');
  await w.event('install');
  await w.event('activate');
  w.setRemoteVersion(version + 1);
  assert.equal(await (await w.request('./', 'navigate')).text(), index(version + 1));
});

test('mismatched new candidate is removed and the repaired release can retry', async () => {
  const shared = storage();
  const bad = worker('example.test', { store: shared });
  bad.setRemoteVersion(version + 1);
  await assert.rejects(bad.event('install'), /nije potpuno/);
  assert.equal(bad.skipped, false);
  assert.equal(await bad.caches.has('va-core-v200'), false);

  const repaired = worker('example.test', { store: shared });
  await repaired.event('install');
  assert.equal(repaired.skipped, true);
});

test('install rejects duplicate markers that omit a required core asset', async () => {
  const w = worker();
  w.setRemoteIndex(index(version).replace(`<script src="app.js?v=${version}"></script>`, `<script src="data.js?v=${version}"></script>`));
  await assert.rejects(w.event('install'), /nije potpuno/);
  assert.equal(w.skipped, false);
});

test('install rejects a version assignment found only in a comment', async () => {
  const w = worker();
  w.setRemoteVersionText(`// self.APP_V = ${version};`);
  await assert.rejects(w.event('install'), /nije potpuno/);
  assert.equal(w.skipped, false);
});

test('same-version worker reuses a valid core without changing any byte', async () => {
  const shared = storage();
  const first = worker('example.test', { store: shared });
  await first.event('install');
  const before = await snapshot(shared, 'va-core-v200');

  const replacement = worker('example.test', { store: shared });
  replacement.setRemoteVersion(version + 1);
  await replacement.event('install');

  assert.equal(replacement.skipped, true);
  assert.equal(replacement.fetchCount, 0);
  assert.deepEqual(await snapshot(shared, 'va-core-v200'), before);
});

test('same-version worker rejects an invalid existing core without overwriting or deleting it', async () => {
  const shared = storage();
  const setup = worker('example.test', { store: shared });
  await (await setup.caches.open('va-core-v200')).put('./index.html', new Response('existing partial core'));
  const before = await snapshot(shared, 'va-core-v200');

  const replacement = worker('example.test', { store: shared });
  await assert.rejects(replacement.event('install'), /jezgro|izdanje|potpuno/i);
  assert.equal(replacement.skipped, false);
  assert.deepEqual(await snapshot(shared, 'va-core-v200'), before);
});

test('a hash-addressed image is fetched once, verified and reused without downloading unchanged bytes', async () => {
  const w = worker();
  const path = `./img/1.jpg?h=${oldImageHash}`;
  assert.equal(await (await w.request(path)).text(), oldImage);
  w.setOffline(true);
  assert.equal(await (await w.request(path)).text(), oldImage);
  assert.equal(w.fetchesFor(path), 1);
});

test('a changed image gets a new address while an old open tab retains its verified bytes', async () => {
  const w = worker();
  const oldPath = `./img/1.jpg?h=${oldImageHash}`;
  assert.equal(await (await w.request(oldPath)).text(), oldImage);
  const changed = 'changed-image-bytes', changedHash = sha(changed);
  w.setImage('img/1.jpg', changed);
  assert.equal(await (await w.request(`./img/1.jpg?h=${changedHash}`)).text(), changed);
  assert.equal(await (await w.request(oldPath)).text(), oldImage);
});

test('hash mismatch fails closed without poisoning cache and a repaired response can retry', async () => {
  const w = worker();
  const expected = sha('future-correct-bytes'), path = `./img/1.jpg?h=${expected}`;
  w.setImage('img/1.jpg', 'wrong-bytes');
  assert.equal((await w.request(path)).status, 504);
  assert.equal(await (await w.caches.open('va-img-h1')).match(path), undefined);
  w.setImage('img/1.jpg', 'future-correct-bytes');
  assert.equal(await (await w.request(path)).text(), 'future-correct-bytes');
});

test('legacy bare image continuity requires immutable baseline bytes from cache or network', async () => {
  const cached = worker();
  await (await cached.caches.open('va-img-1')).put('./img/1.jpg', new Response(oldImage));
  cached.setOffline(true);
  assert.equal(await (await cached.request('./img/1.jpg')).text(), oldImage);

  const network = worker();
  assert.equal(await (await network.request('./img/1.jpg')).text(), oldImage);
  network.setImage('img/1.jpg', 'new-release-image');
  assert.equal(await (await network.request('./img/1.jpg')).text(), oldImage, 'verified legacy entry remains stable');

  const changedMiss = worker();
  changedMiss.setImage('img/1.jpg', 'new-release-image');
  assert.equal((await changedMiss.request('./img/1.jpg')).status, 504);
});

test('cache eviction refetches and verifies the same hash without relying on release caches', async () => {
  const w = worker();
  const path = `./img/1.jpg?h=${oldImageHash}`;
  assert.equal((await w.request(path)).status, 200);
  w.bins.delete('va-img-h1');
  assert.equal((await w.request(path)).status, 200);
  assert.equal(w.fetchesFor(path), 2);
});

test('malformed image hashes, extra query parameters and unknown bare legacy images fail closed', async () => {
  const w = worker();
  for (const path of ['./img/1.jpg?h=bad', `./img/1.jpg?h=${oldImageHash}&x=1`, './img/2.jpg']) {
    const before=w.fetchCount;
    assert.ok([400,504].includes((await w.request(path)).status), path);
    assert.equal(w.fetchCount,before,path);
  }
});

test('legacy cache can promote verified bytes to the stable hash cache', async () => {
  const w = worker();
  await (await w.caches.open('va-img-1')).put(`./img/1.jpg?h=${oldImageHash}`, new Response(oldImage));
  w.setOffline(true);
  const path=`./img/1.jpg?h=${oldImageHash}`;
  assert.equal(await (await w.request(path)).text(),oldImage);
  assert.equal(await (await (await w.caches.open('va-img-h1')).match(path)).text(),oldImage);
});

test('shared image cache keeps fork scopes isolated by their complete request URLs', async () => {
  const shared=storage();
  const a=worker('example.test',{store:shared,scopePath:'/fork-a/'}), b=worker('example.test',{store:shared,scopePath:'/fork-b/'});
  const path=`./img/1.jpg?h=${oldImageHash}`;
  assert.equal((await a.request(path)).status,200);
  assert.equal((await b.request(path)).status,200);
  a.setOffline(true); b.setOffline(true);
  assert.equal((await a.request(path)).status,200);
  assert.equal((await b.request(path)).status,200);
});

test('missing or malformed imported baseline prevents a worker from starting', () => {
  assert.throws(()=>worker('example.test',{baseline:null}),/baseline|osnovna mapa/i);
  for(const baseline of [{}, {1:'bad'}, {bad:oldImageHash}]) assert.throws(()=>worker('example.test',{baseline}),/baseline|osnovna mapa/i);
});

test('frozen baseline coverage is independent from later hash-addressed image coverage', async () => {
  const w=worker('example.test',{baseline:{99:sha('historic-only-image')}});
  assert.equal((await w.request(`./img/1.jpg?h=${oldImageHash}`)).status,200);
  assert.equal((await w.request('./img/1.jpg')).status,504);
});

test('runtime response remains pending until its successful cache write finishes', async () => {
  const w = worker();
  await w.event('install');
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  w.setPutGate(gate);
  let settled = false;
  const pending = w.request(`./img/1.jpg?h=${oldImageHash}`).then(response => { settled = true; return response; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  release();
  assert.equal((await pending).status, 200);
  assert.ok(await (await w.caches.open('va-img-h1')).match(`./img/1.jpg?h=${oldImageHash}`));
});

test('runtime cache quota failure still returns the successful network response', async () => {
  const w = worker();
  await w.event('install');
  w.setPutFailure(true);
  const response = await w.request(`./img/1.jpg?h=${oldImageHash}`);
  assert.equal(response.status, 200);
  assert.equal(await (await w.caches.open('va-img-h1')).match(`./img/1.jpg?h=${oldImageHash}`), undefined);
});

test('cache-busted version checks are network-only and never grow the core cache', async () => {
  const w = worker();
  await w.event('install');
  const before = await snapshot(w.store, 'va-core-v200');
  assert.equal((await w.request('./version.js?ts=1')).status, 200);
  assert.equal((await w.request('./version.js?ts=2')).status, 200);
  assert.deepEqual(await snapshot(w.store, 'va-core-v200'), before);
  w.setOffline(true);
  await assert.rejects(w.request('./version.js?ts=3'), /synthetic interrupted/);
});

test('an older document gets its own cached code, never current code under an old version URL', async () => {
  const w = worker();
  await (await w.caches.open('va-core-v199')).put('./app.js?v=199', new Response('old application code'));
  await w.event('install');
  await w.event('activate');
  assert.equal(await (await w.request('./app.js?v=199')).text(), 'old application code');
  assert.equal((await w.request('./data.js?v=199')).status, 504);
});
