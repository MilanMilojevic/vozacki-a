import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');
const version = 200;
const coreAssets = ['style.css', 'version.js', 'data.js', 'explanations.js', 'app.js'];
const index = n => [
  `<link rel="stylesheet" href="style.css?v=${n}">`,
  ...coreAssets.slice(1).map(file => `<script src="${file}?v=${n}"></script>`),
].join('');
const storage = () => ({ bins: new Map() });

async function snapshot(store, name) {
  const bin = store.bins.get(name);
  if (!bin) return null;
  return Promise.all([...bin.entries()].sort(([a], [b]) => a.localeCompare(b)).map(async ([url, response]) => [url, await response.clone().text()]));
}

function worker(host = 'example.test', { store = storage(), appVersion = version } = {}) {
  const base = `https://${host}/vozacki-a/`;
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
  const key = value => new URL(typeof value === 'string' ? value : value.url, base).href;
  const fetcher = async input => {
    const url = key(input);
    fetchCount++;
    if (offline || (failFile && url.includes(failFile))) throw Error('synthetic interrupted network');
    if (httpFailure && url.includes(httpFailure.file)) return new Response('synthetic HTTP failure', { status: httpFailure.status });
    if (url.endsWith('/') || url.includes('index.html')) return new Response(remoteIndex ?? index(remoteVersion));
    if (url.includes('version.js')) return new Response(remoteVersionText ?? `self.APP_V = ${remoteVersion};`);
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
    importScripts() {},
    skipWaiting() { skipped = true; },
    clients: { async claim() {} },
    addEventListener(type, fn) { handlers[type] = fn; },
  };
  vm.runInNewContext(code, { self, caches, fetch: fetcher, URL, Request, Response, DOMException, console });
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

test('runtime response remains pending until its successful cache write finishes', async () => {
  const w = worker();
  await w.event('install');
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  w.setPutGate(gate);
  let settled = false;
  const pending = w.request('./img/synthetic.png').then(response => { settled = true; return response; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  release();
  assert.equal((await pending).status, 200);
  assert.ok(await (await w.caches.open('va-img-1')).match('./img/synthetic.png'));
});

test('runtime cache quota failure still returns the successful network response', async () => {
  const w = worker();
  await w.event('install');
  w.setPutFailure(true);
  const response = await w.request('./img/quota.png');
  assert.equal(response.status, 200);
  assert.equal(await (await w.caches.open('va-img-1')).match('./img/quota.png'), undefined);
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
