// Service worker — rad bez interneta i instalacija kao aplikacija.
//
// NAČELO: mreža je UVEK prva za kod i podatke (da ažuriranja nikad ne zaglave),
// keš služi samo kad mreže nema. Slike pitanja se, jednom viđene, čuvaju trajno
// (ne menjaju se — vezane su za broj pitanja).
self.importScripts('./version.js');

const CORE = 'va-core-v' + (self.APP_V || 0);
const IMG = 'va-img-1';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // počisti keševe starijih verzija (slike ostaju)
    for (const k of await caches.keys()) {
      if (k.startsWith('va-core-') && k !== CORE) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // slike pitanja: keš prvi (ne menjaju se), mreža kao dopuna
  if (url.pathname.includes('/img/')) {
    e.respondWith((async () => {
      const c = await caches.open(IMG);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // sve ostalo: mreža prva, keš samo kao rezerva bez interneta
  e.respondWith((async () => {
    const c = await caches.open(CORE);
    try {
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await c.match(req);
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const idx = (await c.match('./index.html')) || (await c.match('./'));
        if (idx) return idx;
      }
      return new Response('Нема интернета, а страница још није у кешу.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
