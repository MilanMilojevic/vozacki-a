import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// 1) STR ključevi
a = rep(a, "wholeCat: { l: 'Sva pitanja oblasti', c: 'Сва питања области' },",
`wholeCat: { l: 'Sva pitanja oblasti', c: 'Сва питања области' },
    tour1: { l: 'Tvoj napredak u brojkama: koliko si odgovorio, koliko pogrešnih čeka ponavljanje i koliko si obeležio.', c: 'Твој напредак у бројкама: колико си одговорио, колико погрешних чека понављање и колико си обележио.' },
    tour2: { l: 'Odavde kreće učenje: sva pitanja redom, sa objašnjenjem posle svakog odgovora.', c: 'Одавде креће учење: сва питања редом, са објашњењем после сваког одговора.' },
    tour3: { l: 'Pogrešna pitanja se sama vraćaju: odmah, pa sutradan, pa za tri dana — dok ih ne savladaš.', c: 'Погрешна питања се сама враћају: одмах, па сутрадан, па за три дана — док их не савладаш.' },
    tour4: { l: 'Simulacija je verna kopija pravog ispita: 41 pitanje, 45 minuta, prag 85%. Ostavi je za kraj pripreme.', c: 'Симулација је верна копија правог испита: 41 питање, 45 минута, праг 85%. Остави је за крај припреме.' },
    tour5: { l: 'Oblasti: klik na red otklapa podoblasti, pa vežbaš baš ono što ti treba.', c: 'Области: клик на ред отклапа подобласти, па вежбаш баш оно што ти треба.' },
    tour6: { l: 'Pojmovnik: tematske kartice sa slikama i tabelama. Iste kartice iskaču i uz pitanja na koja se odnose.', c: 'Појмовник: тематске картице са сликама и табелама. Исте картице искачу и уз питања на која се односе.' },
    tour7: { l: 'Napredak se čuva u ovom pregledaču. Ovde ga izvezi u fajl ili poveži stalno čuvanje — uradi to odmah, za svaki slučaj.', c: 'Напредак се чува у овом прегледачу. Овде га извези у фајл или повежи стално чување — уради то одмах, за сваки случај.' },
    tourNext: { l: 'Dalje', c: 'Даље' },
    tourSkip: { l: 'Preskoči', c: 'Прескочи' },
    tourDone: { l: 'Završi', c: 'Заврши' },
    tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },`, 'str');

// 2) normalizeState: tour zastavica
a = rep(a, `      day: obj.day && typeof obj.day === 'object' ? obj.day : null,
    };`,
`      day: obj.day && typeof obj.day === 'object' ? obj.day : null,
      tour: obj.tour === 1 ? 1 : 0,
    };`, 'state');

// 3) tourStart funkcija (pre renderHome)
a = rep(a, 'function renderHome() {',
`const TOUR_STEPS = [
    { sel: '#homeSummary', key: 'tour1' },
    { sel: '.menuBtn[data-nav="learn"]', key: 'tour2' },
    { sel: '.menuBtn[data-nav="drill"]', key: 'tour3' },
    { sel: '.menuBtn[data-nav="sim"]', key: 'tour4' },
    { sel: '#catBars', key: 'tour5', card: true },
    { sel: '#pojmovnikCard', key: 'tour6' },
    { sel: '#dataTools', key: 'tour7' },
  ];
  function tourStart() {
    if (document.getElementById('tourDim')) return;
    let idx = 0, spot = null;
    const dim = document.createElement('div'); dim.id = 'tourDim';
    const tip = document.createElement('div'); tip.id = 'tourTip';
    document.body.append(dim, tip);
    const clearSpot = () => { if (spot) { spot.classList.remove('tourSpot'); spot = null; } };
    const end = () => {
      clearSpot(); dim.remove(); tip.remove();
      document.removeEventListener('keydown', onKey);
      S.tour = 1; save();
    };
    const show = () => {
      clearSpot();
      const st = TOUR_STEPS[idx];
      let elx = document.querySelector(st.sel);
      if (elx && st.card) elx = elx.closest('.card') || elx;
      if (!elx) { next(); return; }
      spot = elx; spot.classList.add('tourSpot');
      spot.scrollIntoView({ block: 'center' });
      tip.innerHTML = \`<div class="tourText">\${escapeHtml(L(st.key))}</div>
        <div class="tourRow"><span class="mut">\${idx + 1} / \${TOUR_STEPS.length}</span>
        <span style="flex:1"></span>
        <button class="linklike" id="tourSkip">\${escapeHtml(L('tourSkip'))}</button>
        <button class="primary" id="tourNext">\${escapeHtml(idx === TOUR_STEPS.length - 1 ? L('tourDone') : L('tourNext'))}</button></div>\`;
      requestAnimationFrame(() => {
        const r = spot.getBoundingClientRect();
        const th = tip.offsetHeight;
        let top = r.bottom + 10;
        if (top + th > window.innerHeight - 10) top = Math.max(10, r.top - th - 10);
        tip.style.top = top + 'px';
      });
      tip.querySelector('#tourNext').addEventListener('click', next);
      tip.querySelector('#tourSkip').addEventListener('click', end);
    };
    const next = () => { idx++; if (idx >= TOUR_STEPS.length) end(); else show(); };
    const onKey = (ev) => { if (ev.key === 'Escape') end(); else if (ev.key === 'Enter' || ev.key === 'ArrowRight') next(); };
    dim.addEventListener('click', next);
    document.addEventListener('keydown', onKey);
    show();
  }
  function renderHome() {`, 'tourfn');

// 4) dugme za ponovni vodič + auto start pri prvom otvaranju
a = rep(a, `        <button class="linklike" id="btnReset">\${L('reset')}</button>`,
`        <button class="linklike" id="btnTourReplay">\${L('tourReplay')}</button>
        <button class="linklike" id="btnReset">\${L('reset')}</button>`, 'replay-btn');
a = rep(a, `<input type="file" id="fileImport" accept=".json" style="display:none">
      </div>\`;
    renderBackupLine();`,
`<input type="file" id="fileImport" accept=".json" style="display:none">
      </div>\`;
    renderBackupLine();
    el('btnTourReplay').addEventListener('click', tourStart);
    if (!S.tour && !window.__tourRan) { window.__tourRan = 1; setTimeout(tourStart, 600); }`, 'hook');

// 5) CSS
c = rep(c, `.catChev { display: inline-block; width: 15px; color: var(--mut); }`,
`.catChev { display: inline-block; width: 15px; color: var(--mut); }
#tourDim { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 999; cursor: pointer; }
#tourTip { position: fixed; left: 50%; transform: translateX(-50%); width: min(440px, calc(100vw - 32px));
  background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 12px;
  padding: 14px 16px; z-index: 1001; box-shadow: 0 8px 30px rgba(0,0,0,.35); }
.tourRow { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.tourSpot { position: relative; z-index: 1000; box-shadow: 0 0 0 3px var(--blue), 0 0 0 8px rgba(44,106,160,.35) !important; border-radius: 12px; }`, 'css');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('tura ugrađena');
