// Pokreće PRAVI sw.js u vm-u sa lažnim Cache/fetch i meri šta vrati offline navigacija.
// Pokretanje:  cd tools && node sw-proba.mjs
//
// Šest scenarija; ispravno je:
//   [1] veza pukla usred izdanja, pa offline  → SAGLASNA stara ljuska (ne nova bez svojih fajlova)
//   [2] install nikad nije prošao + offline   → aplikacija i dalje radi (rezerva ./?mreza)
//   [3] version.js?ts= bez mreže              → prazan 504 (nikako HTML — pregledač ga IZVRŠI)
//   [4] navigacija bez ičega u kešu           → 503 + offline strana
//   [5] slika na localhostu                   → radnik se skloni (bez keša u razvoju)
//   [6] slika na Pages-u                      → keš-prvi, jedan mrežni poziv na dva zahteva
//
// ZAMKA: lažni self.location MORA da ima origin — bez njega fetch osluškivač izađe na prvoj
// liniji (url.origin !== self.location.origin) i sve izgleda kao da radi.
import fs from 'fs';
import vm from 'vm';

const SW = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const BAZA = 'https://milanmilojevic.github.io/vozacki-a/';

function napraviSvet({ host = 'milanmilojevic.github.io', apv = 135, mreza }) {
  const kesevi = new Map();
  class Odgovor {
    constructor(telo, init = {}) { this.telo = telo; this.status = init.status ?? 200; this.headers = init.headers || {}; }
    get ok() { return this.status >= 200 && this.status < 300; }
    clone() { return new Odgovor(this.telo, { status: this.status, headers: this.headers }); }
    async text() { return this.telo; }
  }
  const kljuc = (r) => new URL(typeof r === 'string' ? r : r.url, BAZA).href;
  class Kes {
    constructor(ime) { this.ime = ime; if (!kesevi.has(ime)) kesevi.set(ime, new Map()); this.m = kesevi.get(ime); }
    async put(r, res) { this.m.set(kljuc(r), res); }
    async match(r) { return this.m.get(kljuc(r)) || undefined; }
    async addAll(l) { for (const a of l) { const res = await svet.fetch(a); if (!res.ok) throw new Error('addAll ' + a); this.m.set(kljuc(a), res); } }
  }
  const osluskivaci = {};
  const svet = {
    self: null,
    Response: Odgovor,
    URL, console,
    caches: { open: async (ime) => new Kes(ime), keys: async () => [...kesevi.keys()], delete: async (i) => kesevi.delete(i) },
    fetch: async (r) => {
      const u = kljuc(r);
      const t = mreza(u);
      if (t === null) throw new Error('offline ' + u);
      return new Odgovor(t, { status: 200 });
    },
    _kesevi: kesevi, _osluskivaci: osluskivaci, Odgovor,
  };
  svet.self = {
    importScripts: () => { svet.self.APP_V = apv; },
    location: { hostname: host, href: BAZA + 'sw.js', origin: new URL(BAZA).origin },
    addEventListener: (ime, f) => { osluskivaci[ime] = f; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
    caches: svet.caches,
    fetch: svet.fetch,
    Response: Odgovor,
    APP_V: apv,
  };
  svet.location = svet.self.location;
  svet.self.registration = {};
  vm.createContext(svet);
  vm.runInContext(SW, svet, { filename: 'sw.js' });
  return svet;
}

async function pozovi(svet, url, mode = 'no-cors') {
  let odg = null;
  const e = { request: { url, method: 'GET', mode }, respondWith: (p) => { odg = p; }, waitUntil: (p) => { odg = odg || p; } };
  svet._osluskivaci.fetch(e);
  return odg ? await odg : '(bez respondWith — pregledač sam)';
}

const HTML = (v) => `<!doctype html><html><head>
<link rel="stylesheet" href="style.css?v=${v}"><script src="version.js?v=${v}"></script>
<script src="data.js?v=${v}"></script><script src="explanations.js?v=${v}"></script>
<script src="app.js?v=${v}"></script></head><body>ljuska v${v}</body></html>`;

// ---------- 1) Scenario iz nalaza: nov HTML stigne, fajlovi ne ----------
{
  const svet = napraviSvet({ apv: 135, mreza: (u) => (u.endsWith('/') || u.includes('index.html') ? HTML(135) : 'telo ' + u) });
  const e = { waitUntil: (p) => { e._p = p; } };
  svet._osluskivaci.install(e); await e._p;               // uredna instalacija v135

  // izašlo je v136: HTML se povuče, a veza pukne pre fajlova
  svet.fetch = async (r) => {
    const u = new URL(typeof r === 'string' ? r : r.url, BAZA).href;
    if (u === BAZA) return new svet.Odgovor(HTML(136), { status: 200 });
    throw new Error('offline ' + u);
  };
  svet.self.fetch = svet.fetch;
  await pozovi(svet, BAZA, 'navigate');                    // online navigacija na nov HTML

  // sad je korisnik POTPUNO offline i otvara aplikaciju
  svet.fetch = async () => { throw new Error('offline'); };
  svet.self.fetch = svet.fetch;
  const r = await pozovi(svet, BAZA, 'navigate');
  const telo = await r.text();
  console.log('[1] offline posle prekinutog izdanja → status', r.status, '| ljuska:', (telo.match(/ljuska v(\d+)/) || [])[1] || 'offline strana');
  const kes = svet._kesevi.get('va-core-v135');
  console.log('    ključevi u kešu:', [...kes.keys()].map((k) => k.replace(BAZA, './')).join(', '));
}

// ---------- 2) Scenario „install nikad nije prošao" ----------
{
  const svet = napraviSvet({ apv: 136, mreza: (u) => (u === BAZA ? HTML(136) : 'telo ' + u) });
  await pozovi(svet, BAZA, 'navigate');                    // jedno potpuno učitavanje na mreži
  await pozovi(svet, BAZA + 'app.js?v=136');
  svet.fetch = async () => { throw new Error('offline'); };
  svet.self.fetch = svet.fetch;
  const r = await pozovi(svet, BAZA, 'navigate');
  const telo = await r.text();
  console.log('[2] install nikad + offline → status', r.status, '| ljuska:', (telo.match(/ljuska v(\d+)/) || [])[1] || 'offline strana');
}

// ---------- 3) version.js?ts= bez mreže ----------
{
  const svet = napraviSvet({ apv: 136, mreza: () => null });
  const r = await pozovi(svet, BAZA + 'version.js?ts=1758000000000');
  console.log('[3] version.js?ts= offline → status', r.status, '| tip:', (r.headers && r.headers['Content-Type']) || '(bez tipa)', '| telo:', JSON.stringify((await r.text()).slice(0, 20)));
}

// ---------- 4) navigacija bez ičega u kešu ----------
{
  const svet = napraviSvet({ apv: 136, mreza: () => null });
  const r = await pozovi(svet, BAZA, 'navigate');
  console.log('[4] navigacija bez keša → status', r.status, '| offline strana:', (await r.text()).includes('Nema interneta'));
}

// ---------- 5) slika na localhostu ----------
{
  let n = 0;
  const svet = napraviSvet({ host: 'localhost', apv: 136, mreza: () => 'slika ' + (++n) });
  const a = await pozovi(svet, BAZA + 'img/7935.jpg');
  const b = await pozovi(svet, BAZA + 'img/7935.jpg');
  console.log('[5] localhost slika → 1.:', typeof a === 'string' ? a : await a.text(), '| 2.:', typeof b === 'string' ? b : await b.text(), '| mrežnih poziva:', n);
}

// ---------- 6) slika na Pages-u (mora da ostane keš-prvi) ----------
{
  let n = 0;
  const svet = napraviSvet({ apv: 136, mreza: () => 'slika ' + (++n) });
  const a = await pozovi(svet, BAZA + 'img/7935.jpg');
  const b = await pozovi(svet, BAZA + 'img/7935.jpg');
  console.log('[6] Pages slika → 1.:', await a.text(), '| 2.:', await b.text(), '| mrežnih poziva:', n);
}
