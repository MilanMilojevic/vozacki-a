import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import net from 'node:net';

// Exercise the real HTTP server from a disposable directory; never serve or read a user's files.
test('local server exposes only application resources', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'vozacki-server-'));
  let child;
  t.after(async () => {
    if (child && child.exitCode === null) {
      const done = once(child, 'exit'); child.kill(); await done;
    }
    assert.equal(path.dirname(dir), path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('vozacki-server-'));
    await rm(dir, { recursive: true, force: true });
  });
  await writeFile(path.join(dir, 'serve.mjs'), await readFile(new URL('../../serve.mjs', import.meta.url)));
  for (const name of ['index.html', 'app.js', 'version.js', 'style.css', 'data.js', 'explanations.js',
    'sw.js', 'image-baseline.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'embed.html', 'plakat.html',
    'robots.txt', 'sitemap.xml']) await writeFile(path.join(dir, name), 'public-' + name);
  await mkdir(path.join(dir, 'img'));
  await writeFile(path.join(dir, 'img', '7921.jpg'), 'public-image');
  await writeFile(path.join(dir, 'private-test.json'), 'private-fixture');
  await writeFile(path.join(dir, 'img', 'private-test.json'), 'private-fixture');
  await mkdir(path.join(dir, '.git'));
  await writeFile(path.join(dir, '.git', 'config'), 'private-fixture');
  await mkdir(path.join(dir, 'tools'));
  await writeFile(path.join(dir, 'tools', 'base-A.json'), 'private-fixture');
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  child = spawn(process.execPath, ['serve.mjs'], { cwd: dir, windowsHide: true,
    env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('test server did not start')), 5000);
    child.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error('test server exited: ' + code)); });
  });
  const request = (url, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: url, method, agent: false }, (res) => {
      let body = ''; res.setEncoding('utf8'); res.on('data', (s) => { body += s; });
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject); req.end();
  });
  for (const url of ['/private-test.json', '/.git/config', '/%2egit/config', '/tools/base-A.json',
    '/img/private-test.json', '/img/../private-test.json', '/img%5c..%5cprivate-test.json', '/serve.mjs']) {
    const res = await request(url);
    assert.equal(res.status, 403, url + ' must not be served');
    assert.ok(!res.body.includes('private-fixture'), url + ' must not reveal fixture');
  }
  for (const url of ['/', '/index.html?v=126', '/app.js?v=126', '/version.js?ts=1', '/style.css',
    '/data.js', '/explanations.js', '/sw.js', '/image-baseline.js', '/manifest.webmanifest', '/icon-192.png',
    '/icon-512.png', '/embed.html', '/plakat.html', '/robots.txt', '/sitemap.xml', '/img/7921.jpg']) {
    assert.equal((await request(url)).status, 200, url + ' must remain usable');
  }
  const head = await request('/app.js', 'HEAD');
  assert.equal(head.status, 200); assert.equal(head.body, '');
  assert.equal(head.headers['x-content-type-options'], 'nosniff');
  assert.equal((await request('/%ZZ')).status, 400);
  assert.equal((await request('/app.js', 'POST')).status, 405);
  assert.equal((await request('/img/999999.jpg')).status, 404);
});
