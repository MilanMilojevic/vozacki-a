// Service worker — rad bez interneta i instalacija kao aplikacija.
//
// NAČELO: mreža je UVEK prva za kod i podatke (da ažuriranja nikad ne zaglave),
// keš služi samo kad mreže nema. Slike pitanja se, jednom viđene, čuvaju trajno
// (ne menjaju se — vezane su za broj pitanja).
self.importScripts('./version.js');

const CORE = 'va-core-v' + (self.APP_V || 0);
const IMG = 'va-img-1';

// Strana koja se vidi kad nema ni interneta ni keša. Oba pisma su tu jer service worker
// ne zna koje je izabrano u aplikaciji, a jedno pismo bi pola ljudi ostavilo bez poruke.
const OFFLINE_HTML = `<!doctype html><html lang="sr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Nema interneta</title>
<style>body{font:16px/1.5 "Segoe UI",system-ui,sans-serif;background:#eef2f6;color:#1c2733;margin:0;
display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
.k{background:#fff;border-radius:14px;padding:22px;max-width:420px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
h1{font-size:1.1rem;margin:0 0 10px}p{margin:0 0 10px}button{font:inherit;background:#2c6aa0;color:#fff;
border:none;border-radius:8px;padding:11px 16px;min-height:44px;cursor:pointer}
@media (prefers-color-scheme:dark){body{background:#131a22;color:#e2e8f0}.k{background:#1d2731}}</style>
</head><body><div class="k"><h1>Vozački A</h1>
<p>Nema interneta, a ova strana još nije sačuvana za rad bez mreže. Otvori je jednom dok imaš vezu — posle toga radi i offline.</p>
<p>Нема интернета, а ова страна још није сачувана за рад без мреже. Отвори је једном док имаш везу — после тога ради и офлајн.</p>
<button type="button" onclick="location.reload()">Pokušaj ponovo · Покушај поново</button>
</div></body></html>`;

const RAZVOJ = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (e) => {
  if (RAZVOJ) { self.skipWaiting(); return; }   // na lokalu se keš ne koristi (vidi granu ?v= niže)
  e.waitUntil((async () => {
    const c = await caches.open(CORE);
    // Spisak fajlova se ČITA iz index.html, ne prepisuje ovde. Prepisan spisak bi pre ili
    // kasnije otišao u stranu od stvarnog, addAll bi padao na 404 i izdanje nikad ne bi
    // prošlo — a tiho, jer instalacija SW-a nema ko da vidi.
    const res = await fetch('./index.html', { cache: 'reload' });
    if (!res.ok) throw new Error('index.html ' + res.status);
    const html = await res.text();
    const adrese = new Set();
    for (const m of html.matchAll(/(?:src|href)="([^"]+\?v=\d+)"/g)) adrese.add(m[1]);
    // index.html bez ijedne ?v= adrese znači pokvaren bild: bolje ne instalirati nego
    // ostaviti keš koji offline ne može ništa da posluži
    if (adrese.size < 3) throw new Error('index.html bez fajlova sa ?v=');
    const strana = () => new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    await c.put('./index.html', strana());
    await c.put('./', strana());   // navigacija na koren traži ovaj ključ
    await c.addAll([...adrese]);   // addAll, ne allSettled: pola keša je gore od nikakvog
    await self.skipWaiting();
  })());
});

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

  // Fajlovi sa brojem izdanja u adresi (app.js?v=124, explanations.js?v=124…): KEŠ PRVI.
  // Sadržaj takve adrese se ne menja — kad izađe novo izdanje, index.html (koji ide sa mreže)
  // pokazuje na NOVE adrese, pa se one i povuku. Bez ovoga se explanations.js od 2,4 MB
  // skidao pri svakom pokretanju. Provera novije verzije koristi version.js?ts=… i ne dira se.
  // NA LOKALU se ovo ne radi: tamo se fajlovi menjaju bez promene broja izdanja, pa bi keš
  // servirao staru kopiju i lagao onoga ko proverava izmenu.
  if (!RAZVOJ && url.searchParams.has('v')) {
    e.respondWith((async () => {
      const c = await caches.open(CORE);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
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
      // ?ts= nosi vreme, pa je svaki put DRUGA adresa: keširanje bi gomilalo unos po
      // proveri izdanja (na svakih 5 minuta) do sledećeg izdanja.
      if (res.ok && !url.searchParams.has('ts')) c.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await c.match(req);
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const idx = (await c.match('./index.html')) || (await c.match('./'));
        if (idx) return idx;
      }
      return new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
