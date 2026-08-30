import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// 1) OBJAŠNJENJA NAZAD ISPOD ODGOVORA (Milanova odluka) — uklanjamo bočnu kolonu na širokim ekranima
c = rep(c, `  /* Desna kolona se otvara TEK kad postoji objašnjenje — dok se odgovara, pitanje ima punu širinu. */
  #view-question #qCard:has(> .explBox) { display: grid; grid-template-columns: minmax(0, 1fr) 440px; column-gap: 26px; align-items: start; }
  #view-question #qCard > * { grid-column: 1; }
  #view-question #qCard > .explBox { grid-column: 2; grid-row: 1 / span 30; position: sticky; top: 70px; }`,
`  /* Objašnjenje ide ISPOD odgovora i na širokim ekranima (Milanova odluka, 29.08.2026) —
     samo ograničimo širinu kartice da redovi ne budu predugački za čitanje. */
  #view-question #qCard { max-width: 860px; margin-left: auto; margin-right: auto; }`, 'expl-ispod');

// 2) POŠTOVANJE prefers-reduced-motion (vestibularni poremećaji; svetska UX lista)
c += `
/* Korisnici koji su isključili animacije u sistemu — bez prelaza i glatkog skrola */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; scroll-behavior: auto !important; }
}
/* Uvećanje slike pitanja na dodir/klik */
.qImg { cursor: zoom-in; }
#imgZoom { position: fixed; inset: 0; background: rgba(8, 14, 20, .92); z-index: 1500;
  display: flex; align-items: center; justify-content: center; cursor: zoom-out; padding: 18px; }
#imgZoom img { max-width: 100%; max-height: 100%; border-radius: 8px; }
`;

// 3) GoatCounter — anonimna statistika poseta, SAMO na javnoj adresi, poštuje Do Not Track
a = rep(a, `  // ---------- Instalacija kao aplikacija (PWA) ----------`,
`  // ---------- Anonimna statistika poseta (GoatCounter — bez kolačića) ----------
  // Broji samo posete i koji se delovi aplikacije koriste; nikakvi lični podaci ni napredak.
  // Učitava se ISKLJUČIVO na javnoj adresi (nikad lokalno ni sa file://) i poštuje "Do Not Track".
  if (location.protocol === 'https:' && location.hostname !== 'localhost' && navigator.doNotTrack !== '1') {
    window.goatcounter = { no_onload: true };
    const gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://gc.zgo.at/count.js';
    gs.dataset.goatcounter = 'https://vozacki.goatcounter.com/count';
    gs.addEventListener('load', () => {
      const broji = () => { try { window.goatcounter.count({ path: '/' + (curHash || '#/') }); } catch (e) { /* statistika nije presudna */ } };
      broji();
      window.addEventListener('hashchange', broji);
    });
    document.head.appendChild(gs);
  }

  // ---------- Instalacija kao aplikacija (PWA) ----------`, 'goatcounter');

// 4) Trajnost napretka: zamoli pregledač da NE briše lokalne podatke pod pritiskom prostora
a = rep(a, `  curHash = FILE_MODE ? '#/' : (location.hash || '#/');`,
`  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { /* nije podržano — u redu */ });
  curHash = FILE_MODE ? '#/' : (location.hash || '#/');`, 'persist');

// 5) Uvećanje slike pitanja klikom (delegirano — radi za svako pitanje, i u simulaciji)
a = rep(a, `  document.addEventListener('keydown', (ev) => {`,
`  // Klik na sliku pitanja otvara uvećan prikaz preko celog ekrana; drugi klik (ili Escape) zatvara.
  document.addEventListener('click', (ev) => {
    const slika = ev.target.closest && ev.target.closest('img.qImg');
    if (slika) {
      const z = document.createElement('div');
      z.id = 'imgZoom';
      const im = document.createElement('img');
      im.src = slika.src; im.alt = slika.alt;
      z.appendChild(im);
      z.addEventListener('click', () => z.remove());
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { z.remove(); document.removeEventListener('keydown', esc); }
      });
      document.body.appendChild(z);
      return;
    }
    const z = document.getElementById('imgZoom');
    if (z && !z.contains(ev.target)) z.remove();
  });

  document.addEventListener('keydown', (ev) => {`, 'zoom');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('faza1a primenjena');
