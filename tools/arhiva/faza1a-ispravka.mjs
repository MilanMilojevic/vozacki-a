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

// 1) OBJAŠNJENJA ISPOD ODGOVORA — uklanjanje bočne kolone (izgubljena izmena, sada zaista)
c = rep(c, `  /* Desna kolona se otvara TEK kad postoji objašnjenje — dok se odgovara, pitanje ima punu širinu. */
  #view-question #qCard:has(> .explBox) { display: grid; grid-template-columns: minmax(0, 1fr) 440px; column-gap: 26px; align-items: start; }
  #view-question #qCard > * { grid-column: 1; }
  #view-question #qCard > .explBox { grid-column: 2; grid-row: 1 / span 30; position: sticky; top: 70px; }`,
`  /* Objašnjenje ide ISPOD odgovora i na širokim ekranima (Milanova odluka) —
     kartica pitanja je samo ograničena po širini radi čitljivosti redova. */
  #view-question #qCard { max-width: 860px; margin-left: auto; margin-right: auto; }`, 'expl-ispod');

// 2) prefers-reduced-motion + stil uvećane slike (JS već postoji, stil je nedostajao)
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

// 3) GoatCounter (izgubljen — do sada NIJE merio)
a = rep(a, `  // ---------- Nagoveštaj rada bez interneta ----------`,
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

  // ---------- Nagoveštaj rada bez interneta ----------`, 'goatcounter');

// 4) storage.persist (izgubljen)
a = rep(a, `  curHash = FILE_MODE ? '#/' : (location.hash || '#/');`,
`  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { /* nije podržano — u redu */ });
  curHash = FILE_MODE ? '#/' : (location.hash || '#/');`, 'persist');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('izgubljene izmene vraćene');
