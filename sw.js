// Service worker — rad bez interneta i instalacija kao aplikacija.
//
// Novo izdanje preuzima jezgro PRE aktivacije. Javni HTML dolazi iz spremnog
// izdanja; localhost ostaje network-first zbog razvoja bez stalnog menjanja verzije.
// Slike pitanja se preuzimaju tek kad se vide.
self.importScripts('./version.js');

const CORE = 'va-core-v' + (self.APP_V || 0);
const IMG = 'va-img-1';
const RAZVOJ = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const CORE_ASSETS = ['style.css', 'version.js', 'data.js', 'explanations.js', 'app.js'];
const CORE_FILES = [
  './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  ...CORE_ASSETS.map((file) => `./${file}?v=${self.APP_V}`),
];
const NEPOTPUNO_IZDANJE = 'Izdanje još nije potpuno objavljeno; prethodno ostaje aktivno.';

async function proveriJezgro(c) {
  const odgovori = await Promise.all(CORE_FILES.map((file) => c.match(new URL(file, self.location.href).href)));
  if (odgovori.some((response) => !response)) throw Error(NEPOTPUNO_IZDANJE);

  const html = await odgovori[0].text();
  let reference;
  try {
    reference = [...html.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)]
      .map((match) => new URL(match[2], self.location.href))
      .filter((url) => url.searchParams.has('v'))
      .map((url) => url.href);
  } catch (err) {
    throw Error(NEPOTPUNO_IZDANJE);
  }
  const ocekivane = CORE_ASSETS.map((file) => new URL(`./${file}?v=${self.APP_V}`, self.location.href).href);
  if (reference.length !== ocekivane.length || new Set(reference).size !== ocekivane.length ||
      ocekivane.some((url) => !reference.includes(url))) throw Error(NEPOTPUNO_IZDANJE);

  const versionFile = `./version.js?v=${self.APP_V}`;
  const vjs = await odgovori[CORE_FILES.indexOf(versionFile)].text();
  if (!new RegExp('^\\s*self\\.APP_V\\s*=\\s*' + self.APP_V + '\\s*;\\s*$').test(vjs)) {
    throw Error(NEPOTPUNO_IZDANJE);
  }
}

async function upisiUKesAkoMoze(c, req, res) {
  if (!res.ok) return;
  try { await c.put(req, res.clone()); } catch (err) { /* mrežni odgovor i dalje vredi */ }
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const postojalo = await caches.has(CORE);
    const c = await caches.open(CORE);
    try {
      // Postojeće jezgro istog broja može pripadati aktivnom workeru: proveri ga,
      // ali ga nikad ne prepisuj niti briši. Novi broj dobija zasebno, atomski jezgro.
      if (!postojalo) {
        await c.addAll(CORE_FILES.map((file) => new Request(new URL(file, self.location.href), { cache: 'reload' })));
      }
      await proveriJezgro(c);
    } catch (err) {
      if (!postojalo) await caches.delete(CORE);
      else throw Error('Postojeće jezgro ovog broja izdanja nije potpuno; objavi novi broj izdanja.', { cause: err });
      throw err;
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Sačuvaj i prethodno jezgro: već otvoren dokument može još tražiti svoje
    // verzionisane resurse. Izmena politike čišćenja je zaseban korak; ovaj
    // worker ne briše upotrebljivo staro izdanje usred prelaska.
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Ne preuzimaj nov HTML pre nego što njegov worker ima sve resurse. Važi
  // samo za ulaz aplikacije; embed/plakat zadržavaju svoje odvojene stranice.
  const indexUrl = new URL('./index.html', self.location.href);
  const rootUrl = new URL('./', self.location.href);
  if (!RAZVOJ && req.mode === 'navigate' && (url.pathname === indexUrl.pathname || url.pathname === rootUrl.pathname)) {
    e.respondWith((async () => (await (await caches.open(CORE)).match('./index.html')) ||
      new Response('Pripremljeno izdanje nije dostupno.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))());
    return;
  }

  // Provera verzije mora stvarno do mreže. Svaki ?ts je jedinstven; čuvanje bi
  // pravilo beskonačno mnogo zapisa, a stara kopija bi lažno najavila ažuriranje.
  const versionUrl = new URL('./version.js', self.location.href);
  if (url.pathname === versionUrl.pathname && url.searchParams.has('ts')) {
    e.respondWith(fetch(req));
    return;
  }

  // slike pitanja: keš prvi (ne menjaju se), mreža kao dopuna
  if (url.pathname.includes('/img/')) {
    e.respondWith((async () => {
      const c = await caches.open(IMG);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        await upisiUKesAkoMoze(c, req, res);
        return res;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // Fajlovi sa brojem izdanja u adresi (app.js?v=124, explanations.js?v=124…): KEŠ PRVI.
  // Sadržaj takve adrese se ne menja — pripremljeni index.html novog izdanja
  // pokazuje na NOVE adrese. Bez ovoga se explanations.js od 2,4 MB
  // skidao pri svakom pokretanju. Provera novije verzije koristi version.js?ts=… i ne dira se.
  // NA LOKALU se ovo ne radi: tamo se fajlovi menjaju bez promene broja izdanja, pa bi keš
  // servirao staru kopiju i lagao onoga ko proverava izmenu.
  if (!RAZVOJ && url.searchParams.has('v')) {
    e.respondWith((async () => {
      const requestedV = url.searchParams.get('v');
      const c = await caches.open(/^\d+$/.test(requestedV) ? 'va-core-v' + requestedV : CORE);
      const hit = await c.match(req);
      if (hit) return hit;
      // Server čuva samo najnoviji fajl: stariji ?v= ne sme dobiti današnji kod.
      if (/^\d+$/.test(requestedV) && Number(requestedV) < self.APP_V) return new Response('', { status: 504 });
      try {
        const res = await fetch(req);
        await upisiUKesAkoMoze(c, req, res);
        return res;
      } catch (err) {
        const rez = await c.match(req);
        return rez || new Response('', { status: 504 });
      }
    })());
    return;
  }

  // sve ostalo: mreža prva, keš samo kao rezerva bez interneta
  e.respondWith((async () => {
    const c = await caches.open(CORE);
    try {
      const res = await fetch(req);
      await upisiUKesAkoMoze(c, req, res);
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
