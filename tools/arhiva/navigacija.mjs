// NAVIGACIJA (Milanova primedba 4 + nalazi UX pregleda):
// (a) JEDNA kontrola za povratak na početnu — brend, centriran u traci; „Početna" desno se ukida,
//     kao i „Na početnu" iz zaglavlja spiskova (ostaje na kraju spiska i u rezultatu, gde je izbor odredišta).
// (b) „nazad" je uvek na istom mestu — levo u traci, dugme pune veličine; zamenjuje sitni „‹ Spisak"
//     iznad pitanja i mrvicu „‹ Oblast" u podoblasti.
// (c) na telefonu (≤700px) DONJA traka sa pet odredišta — palac je dole, a ne na vrhu ekrana;
//     u simulaciji se sklanja (kao i podnožje), jer ispit nema navigaciju.
// (d) A−/A+ se sele u podešavanja (postavlja se jednom); u traci ostaju tema i pismo — tako traka
//     staje u JEDAN red i na 360px, a dodirne mete rastu na 44px.
import fs from 'node:fs';
const A = new URL('../../app.js', import.meta.url), C = new URL('../../style.css', import.meta.url), H = new URL('../../index.html', import.meta.url);
let a = fs.readFileSync(A, 'utf8'), s = fs.readFileSync(C, 'utf8'), h = fs.readFileSync(H, 'utf8');
let pao = 0;
const mk = (get, set, tag) => (o, n, ime, br = 1) => { const t = get(); const c = t.split(o).length - 1; if (c !== br) { console.log('FAIL ' + tag + ' [' + ime + '] ' + c + '/' + br); pao++; return; } set(t.split(o).join(n)); console.log('ok ' + tag + ' [' + ime + ']'); };
const rep = mk(() => a, (v) => { a = v; }, 'js');
const repS = mk(() => s, (v) => { s = v; }, 'css');
const repH = mk(() => h, (v) => { h = v; }, 'html');

// ---------- index.html: traka u tri zone + donja navigacija ----------
repH(`<header id="topbar">
  <button type="button" class="brand" data-nav="home" title="Почетна">🏍️ <span id="brandTitle">Возачки А</span></button>
  <div class="topActions">
    <button id="btnFontMinus" class="ghost" aria-label="Smanji slova" title="Smanji slova">A−</button>
    <button id="btnFontPlus" class="ghost" aria-label="Povećaj slova" title="Povećaj slova">A+</button>
    <button id="btnTheme" class="ghost" aria-label="Tamna/svetla tema" title="Tamna/svetla tema">🌙</button>
    <button id="btnScript" class="ghost" aria-label="Promena pisma" title="Промени писмо">lat</button>
    <button id="btnHome" class="ghost" data-nav="home">Почетна</button>
  </div>
</header>`,
`<header id="topbar">
  <div class="tbZona tbLevo"><button type="button" id="btnNazad" class="ghost" hidden>‹ <span id="btnNazadText"></span></button></div>
  <button type="button" class="brand" data-nav="home" title="Почетна">🏍️ <span id="brandTitle">Возачки А</span></button>
  <div class="tbZona tbDesno">
    <button id="btnTheme" class="ghost" aria-label="Tamna/svetla tema" title="Tamna/svetla tema">🌙</button>
    <button id="btnScript" class="ghost" aria-label="Promena pisma" title="Промени писмо">lat</button>
  </div>
</header>`, 'topbar');
repH(`<footer id="podnozje"></footer>`,
`<nav id="donjaNav" aria-label="Главна навигација">
  <button type="button" data-nav="home"><span class="dnIkona">🏠</span><span class="dnTekst" id="dnHome"></span></button>
  <button type="button" data-nav="learn"><span class="dnIkona">📖</span><span class="dnTekst" id="dnLearn"></span></button>
  <button type="button" data-nav="drill"><span class="dnIkona">🔁</span><span class="dnTekst" id="dnDrill"></span></button>
  <button type="button" data-nav="sim"><span class="dnIkona">⏱️</span><span class="dnTekst" id="dnSim"></span></button>
  <button type="button" data-nav="stats"><span class="dnIkona">📊</span><span class="dnTekst" id="dnStats"></span></button>
</nav>

<footer id="podnozje"></footer>`, 'donja nav');

// ---------- style.css ----------
repS(`#topbar { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; justify-content: space-between;
  align-items: center; row-gap: 8px; column-gap: 8px;
  background: var(--topbar); color: #fff; padding: 10px 16px; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
.brand { font-size: var(--fs-lg); font-weight: 600; cursor: pointer; background: none; border: none; color: inherit; font-family: inherit; padding: 0; min-width: 0; }
.topActions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }`,
`/* Traka u TRI zone: levo „nazad" (kad ga ima), na sredini brend = jedina kontrola za početnu,
   desno alatke. Mreža 1fr auto 1fr drži brend u pravoj sredini bez obzira na širinu zona. */
#topbar { position: sticky; top: 0; z-index: 10; display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; column-gap: 8px;
  background: var(--topbar); color: #fff; padding: 8px 12px; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
.tbZona { display: flex; gap: 8px; align-items: center; min-width: 0; }
.tbLevo { justify-self: start; }
.tbDesno { justify-self: end; }
.brand { font-size: var(--fs-lg); font-weight: 600; cursor: pointer; background: none; border: none; color: inherit;
  font-family: inherit; padding: 8px 10px; border-radius: 8px; min-width: 0; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; min-height: 44px; }
.brand:hover { background: rgba(255,255,255,.14); }
#btnNazad { max-width: 42vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Donja navigacija — samo na telefonu; palac je dole. U simulaciji je nema (ispit nema navigaciju). */
#donjaNav { display: none; }
@media (max-width: 700px) {
  #donjaNav { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 1300;
    background: var(--card); border-top: 1px solid var(--line);
    padding: 4px 4px calc(4px + env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -2px 10px rgba(16,24,40,.10); }
  #donjaNav button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    background: none; color: var(--mut); padding: 6px 2px; min-height: 52px; border-radius: 10px; }
  #donjaNav button[aria-current="page"] { color: var(--blue); background: var(--optSel); font-weight: 600; }
  .dnIkona { font-size: 1.2rem; line-height: 1; }
  .dnTekst { font-size: var(--fs-xs); line-height: 1.1; text-align: center; }
  body.uSimulaciji #donjaNav { display: none; }
  /* sadržaj i plutajuće trake ne smeju da stanu ispod navigacije */
  main { padding-bottom: 84px; }
  body.uSimulaciji main { padding-bottom: 60px; }
  #trakeDrzac, #iosHint { bottom: calc(12px + 64px); }
  #updBar { bottom: calc(14px + 64px); }
  #repoUpd { bottom: calc(16px + 64px); }
  body.uSimulaciji #trakeDrzac, body.uSimulaciji #iosHint { bottom: 12px; }
}`, 'topbar css');
repS(`@media (max-width: 400px) {
  #topbar { padding: 7px 10px; column-gap: 6px; }
  .brand { font-size: 1rem; }
  .topActions { gap: 6px; }
  .ghost { padding: 6px 9px; font-size: var(--fs-md); }
}`,
`@media (max-width: 400px) {
  #topbar { padding: 6px 8px; column-gap: 4px; }
  .brand { font-size: 1rem; padding: 8px 6px; }
  .tbZona { gap: 4px; }
  .ghost { padding: 8px 8px; font-size: var(--fs-md); }
}`, 'topbar 400 css');
repS(`.ghost { background: rgba(255,255,255,.15); color: #fff; padding: 6px 12px; }`,
`.ghost { background: rgba(255,255,255,.15); color: #fff; padding: 9px 12px; min-height: 44px; }`, 'ghost meta');
// veličina slova u podešavanjima
repS(`.podDugmad button { width: 100%; }`,
`.podDugmad button { width: 100%; }
/* veličina slova: bila je u gornjoj traci, a podešava se jednom — sad stoji uz ostala podešavanja */
.slovaRed { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.slovaRed .sBtn { min-width: 48px; min-height: 44px; font-size: 1rem; }
.slovaRed .slovaVrednost { font-variant-numeric: tabular-nums; min-width: 4.5em; text-align: center; }`, 'slovaRed css');

// ---------- app.js: teksovi ----------
rep(`    backHome: { l: 'Na početnu', c: 'На почетну' },`,
`    backHome: { l: 'Na početnu', c: 'На почетну' },
    navPitanja: { l: 'Pitanja', c: 'Питања' },
    navPonavljanje: { l: 'Ponavljanje', c: 'Понављање' },
    navSim: { l: 'Ispit', c: 'Испит' },
    navStats: { l: 'Statistika', c: 'Статистика' },
    slovaLbl: { l: 'Veličina slova', c: 'Величина слова' },`, 'nav tekstovi');

// ---------- app.js: „nazad" u traci ----------
rep(`  function show(v) {
    views.forEach((x) => el('view-' + x).classList.toggle('active', x === v));`,
`  // „Nazad" stoji UVEK na istom mestu — levo u traci; svaki ekran ga sam postavlja posle show(),
  // a show() ga briše, pa nikad ne ostane zalutalo dugme sa prethodnog ekrana.
  function postaviNazad(tekst, fn) {
    const b = el('btnNazad');
    if (!b) return;
    if (!tekst || !fn) { b.hidden = true; b.onclick = null; return; }
    el('btnNazadText').textContent = tekst;
    b.title = tekst; b.setAttribute('aria-label', tekst);
    b.hidden = false;
    b.onclick = () => { if (leaveSimOk()) fn(); };
  }
  // Donja navigacija: označi gde se korisnik nalazi (kao u velikim aplikacijama).
  function oznaciNav(v) {
    const nav = el('donjaNav');
    if (!nav) return;
    const h = curHash || '#/';
    let cilj = null;
    if (v === 'home') cilj = 'home';
    else if (v === 'sim') cilj = 'sim';
    else if (v === 'stats') cilj = 'stats';
    else if (h === '#/sva' || h === '#/uci') cilj = 'learn';
    else if (h === '#/lista/wrong') cilj = 'drill';
    nav.querySelectorAll('[data-nav]').forEach((b) => {
      if (b.dataset.nav === cilj) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }
  function show(v) {
    postaviNazad(null);
    views.forEach((x) => el('view-' + x).classList.toggle('active', x === v));
    oznaciNav(v);`, 'show + postaviNazad');

// pitanje: „nazad" iz trake umesto sitnog linka iznad kartice
rep(`    el('qProgress').innerHTML = \`<span class="qpTitle" title="\${escapeHtml(title)}">\${onBack ? \`<button type="button" id="backToList" class="bcLink">‹ \${escapeHtml(opts.nazadLbl || L('backToList'))}</button> &nbsp; \` : ''}\${escapeHtml(title)}</span>`,
`    el('qProgress').innerHTML = \`<span class="qpTitle" title="\${escapeHtml(title)}">\${escapeHtml(title)}</span>`, 'renderProgress bez linka');
rep(`    if (onBack) el('backToList').addEventListener('click', onBack);
    if (!el('jumpGo')) return;`,
`    postaviNazad(onBack ? (opts.nazadLbl || L('backToList')) : null, onBack);
    if (!el('jumpGo')) return;`, 'renderProgress postaviNazad');

// podoblast: mrvica ka oblasti postaje „nazad" u traci
rep(`      \${type === 's' ? \`<div class="qMeta"><span><button type="button" class="bcLink" data-bc="c\${catQ.cat}">‹ \${escapeHtml(catOf(catQ))}</button></span></div>\` : ''}
      <h3>\${escapeHtml(name)}</h3>`,
`      <h3>\${escapeHtml(name)}</h3>`, 'browse bez mrvice');
rep(`        \${shuffleBoxHtml()}
        <button type="button" class="secondary" data-nav="home">\${L('backHome')}</button>
      </div>\`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    head.querySelectorAll('.bcLink').forEach((b) => b.addEventListener('click', () => browse(b.dataset.bc)));
    const origin = () => browse(key);`,
`        \${shuffleBoxHtml()}
      </div>\`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    const origin = () => browse(key);`, 'browse bez Na pocetnu');
rep(`      list.appendChild(b);
    });
    show('browse');
  }

  // ---------- Strana "Sva pitanja" (učenje redom + filteri + spisak) ----------`,
`      list.appendChild(b);
    });
    show('browse');
    // podoblast se vraća u svoju oblast, oblast na početnu — uvek isto mesto, isti oblik
    if (type === 's') postaviNazad(catOf(catQ), () => browse('c' + catQ.cat));
    else postaviNazad(L('home'), () => renderHome());
  }

  // ---------- Strana "Sva pitanja" (učenje redom + filteri + spisak) ----------`, 'browse postaviNazad');

// Sva pitanja i spiskovi: „Na početnu" iz reda dugmadi se ukida (brend/donja traka rade to)
rep(`        \${shuffleBoxHtml()}
        <button type="button" class="secondary" data-nav="home">\${L('backHome')}</button>
      </div>\`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    el('bCont').addEventListener('click', () => startLearn(prviNeodgOd(S.seqPos)));`,
`        \${shuffleBoxHtml()}
      </div>\`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    el('bCont').addEventListener('click', () => startLearn(prviNeodgOd(S.seqPos)));`, 'browseAll bez Na pocetnu');
rep(`          : \`<button class="primary" id="bAllM">\${L('vezbaj')} (\${ids.length})\${sfx()}</button>\`}
        \${shuffleBoxHtml()}
        <button type="button" class="secondary" data-nav="home">\${L('backHome')}</button>
      </div>`,
`          : \`<button class="primary" id="bAllM">\${L('vezbaj')} (\${ids.length})\${sfx()}</button>\`}
        \${shuffleBoxHtml()}
      </div>`, 'browseSet bez Na pocetnu');
rep(`    list.appendChild(prazno);   // unutar kartice, ispod redova — tu korisnik i gleda`,
`    list.appendChild(prazno);   // unutar kartice, ispod redova — tu korisnik i gleda
    postaviNazad(L('home'), () => renderHome());`, 'browseAll nazad', 1);

// kraj spiska: traka se čisti, pa i „nazad" mora
rep(`  function endScreen(msgHtml, origin, extraHtml) {
    el('qProgress').textContent = '';`,
`  function endScreen(msgHtml, origin, extraHtml) {
    el('qProgress').textContent = '';
    postaviNazad(origin ? L('backToList') : null, origin);`, 'endScreen nazad');

// statistika i rezultat: „nazad" na početnu (statistika nema svoje dugme)
rep(`    nacrtajOblasti(el('statsBars'), { tacnost: true });
    show('stats');`,
`    nacrtajOblasti(el('statsBars'), { tacnost: true });
    show('stats');
    postaviNazad(L('home'), () => renderHome());`, 'stats nazad');

// ---------- A−/A+ u podešavanja ----------
rep(`        <div class="podDugmad">
          <button type="button" class="secondary" id="btnInstall" style="display:none">\${L('installBtn')}</button>
          <button type="button" class="secondary" id="btnCheckUpd">\${L('updRepoCheck')}</button>
          <button type="button" class="secondary" id="btnTourReplay">\${L('tourReplay')}</button>
        </div>`,
`        <div class="podDugmad">
          <button type="button" class="secondary" id="btnInstall" style="display:none">\${L('installBtn')}</button>
          <button type="button" class="secondary" id="btnCheckUpd">\${L('updRepoCheck')}</button>
          <button type="button" class="secondary" id="btnTourReplay">\${L('tourReplay')}</button>
        </div>
        <div class="slovaRed"><span class="mut">\${L('slovaLbl')}:</span>
          <button type="button" class="secondary sBtn" id="btnFontMinus">A−</button>
          <span class="slovaVrednost" id="fsVrednost"></span>
          <button type="button" class="secondary sBtn" id="btnFontPlus">A+</button></div>`, 'slova u podesavanja');
rep(`    const m = el('btnFontMinus'), p = el('btnFontPlus');
    const naDnu = f <= FS_MIN + 1e-6, naVrhu = f >= FS_MAX - 1e-6;
    m.disabled = naDnu; p.disabled = naVrhu;
    m.title = naDnu ? L('fsMin') : L('fsSmaller');
    p.title = naVrhu ? L('fsMax') : L('fsBigger');
    m.setAttribute('aria-label', m.title);
    p.setAttribute('aria-label', p.title);
  }
  window.matchMedia('(max-width: 560px)').addEventListener('change', applyFont);
  el('btnFontMinus').addEventListener('click', () => { S.fs = Math.max(FS_MIN, round2((S.fs || 1) - FS_KORAK)); save(); applyFont(); });
  el('btnFontPlus').addEventListener('click', () => { S.fs = Math.min(FS_MAX, round2((S.fs || 1) + FS_KORAK)); save(); applyFont(); });`,
`    // dugmad su sada u podešavanjima — postoje samo dok je početna nacrtana
    const m = el('btnFontMinus'), p = el('btnFontPlus'), v = el('fsVrednost');
    if (!m || !p) return;
    const naDnu = f <= FS_MIN + 1e-6, naVrhu = f >= FS_MAX - 1e-6;
    m.disabled = naDnu; p.disabled = naVrhu;
    m.title = naDnu ? L('fsMin') : L('fsSmaller');
    p.title = naVrhu ? L('fsMax') : L('fsBigger');
    m.setAttribute('aria-label', m.title);
    p.setAttribute('aria-label', p.title);
    if (v) v.textContent = Math.round(f * 100) + '%';
  }
  window.matchMedia('(max-width: 560px)').addEventListener('change', applyFont);
  // delegirano: dugmad se iznova crtaju sa karticom podešavanja
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest && e.target.closest('#btnFontMinus, #btnFontPlus');
    if (!t || t.disabled) return;
    const smer = t.id === 'btnFontPlus' ? 1 : -1;
    S.fs = Math.min(FS_MAX, Math.max(FS_MIN, round2((S.fs || 1) + smer * FS_KORAK)));
    save(); applyFont();
  });`, 'applyFont delegirano');

// ---------- pismo: nazivi u traci i donjoj navigaciji ----------
rep(`    el('brandTitle').textContent = L('brand');
    el('btnHome').textContent = L('home');`,
`    el('brandTitle').textContent = L('brand');
    el('topbar').querySelector('.brand').title = L('home');
    el('topbar').querySelector('.brand').setAttribute('aria-label', L('home'));
    el('btnTheme').title = L('temaLbl'); el('btnTheme').setAttribute('aria-label', L('temaLbl'));
    el('btnScript').title = L('pismoLbl'); el('btnScript').setAttribute('aria-label', L('pismoLbl'));
    el('dnHome').textContent = L('home');
    el('dnLearn').textContent = L('navPitanja');
    el('dnDrill').textContent = L('navPonavljanje');
    el('dnSim').textContent = L('navSim');
    el('dnStats').textContent = L('navStats');
    el('donjaNav').setAttribute('aria-label', L('navGlavna'));`, 'applyScript nazivi');
rep(`    slovaLbl: { l: 'Veličina slova', c: 'Величина слова' },`,
`    slovaLbl: { l: 'Veličina slova', c: 'Величина слова' },
    temaLbl: { l: 'Tamna ili svetla tema', c: 'Тамна или светла тема' },
    pismoLbl: { l: 'Ćirilica ili latinica', c: 'Ћирилица или латиница' },
    navGlavna: { l: 'Glavna navigacija', c: 'Главна навигација' },`, 'nazivi alatki');

// donja navigacija radi preko istog bindNav-a
rep(`  el('btnScript').addEventListener('click', () => {`,
`  bindNav(el('donjaNav'));
  el('btnScript').addEventListener('click', () => {`, 'bindNav donja');

// ---------- vodič: visoka meta se ne centrira (izlazi iz ekrana) ----------
rep(`      spot = elx; spot.classList.add('tourSpot');
      spot.scrollIntoView({ block: 'center' });`,
`      spot = elx; spot.classList.add('tourSpot');
      // visok element (kartica duža od ekrana) se poravnava na VRH — centriranje bi mu
      // gurnulo početak iznad ekrana, pa korisnik gleda sredinu onoga što mu se objašnjava
      spot.scrollIntoView({ block: spot.offsetHeight > window.innerHeight * 0.6 ? 'start' : 'center' });`, 'tour scroll');

if (pao) { console.log('*** NE PIŠEM (' + pao + ') ***'); process.exit(1); }
fs.writeFileSync(A, a); fs.writeFileSync(C, s); fs.writeFileSync(H, h);
console.log('--- upisano: app.js, style.css, index.html ---');
