// UX paket 2 (nalazi pregleda koje sam lično proverio):
// 1) JEDAN oblik povratne informacije — kratka traka pri dnu (poruci); do sada je isti tip radnje
//    ćutao (izvoz, brisanje, obeležavanje) ili dizao sistemski alert (provera verzije, uvoz).
// 2) Prazna stanja vode NAPRED (dugme ka radnji koja ih puni) i ne ostavljaju praznu belu karticu.
// 3) Pregled rezultata: svako pitanje je sklopljeno na jedan red (bilo je 34.000px na telefonu).
// 4) Objašnjenje dnevnog cilja: jedna rečenica + „?" za ostalo; dugmad cilja u istoj mreži.
// 5) Simulacija na telefonu: tajmer i dva dugmeta u JEDNOM redu (kao na ispitu).
// 6) Mrtva adresa kaže zašto je korisnik završio na početnoj.
// 7) Vežbanje podoblasti/oblasti preživljava osvežavanje i dugme „nazad" (#/vezba/s134).
import fs from 'node:fs';
const A = new URL('../../app.js', import.meta.url), C = new URL('../../style.css', import.meta.url);
let a = fs.readFileSync(A, 'utf8'), s = fs.readFileSync(C, 'utf8');
let pao = 0;
const mk = (get, set, tag) => (o, n, ime, br = 1) => { const t = get(); const c = t.split(o).length - 1; if (c !== br) { console.log('FAIL ' + tag + ' [' + ime + '] ' + c + '/' + br); pao++; return; } set(t.split(o).join(n)); console.log('ok ' + tag + ' [' + ime + ']'); };
const rep = mk(() => a, (v) => { a = v; }, 'js');
const repS = mk(() => s, (v) => { s = v; }, 'css');

// ---------- tekstovi ----------
rep(`    navGlavna: { l: 'Glavna navigacija', c: 'Главна навигација' },`,
`    navGlavna: { l: 'Glavna navigacija', c: 'Главна навигација' },
    porExport: { l: 'Napredak je sačuvan u fajl vozacki-a-napredak.json', c: 'Напредак је сачуван у фајл vozacki-a-napredak.json' },
    porReset: { l: 'Napredak je obrisan. Krećeš iz početka.', c: 'Напредак је обрисан. Крећеш из почетка.' },
    porUvoz: { l: 'Napredak je učitan.', c: 'Напредак је учитан.' },
    porObelezeno: { l: 'Pitanje je obeleženo · ukupno @1', c: 'Питање је обележено · укупно @1' },
    porOdobelezeno: { l: 'Oznaka je uklonjena · ukupno @1', c: 'Ознака је уклоњена · укупно @1' },
    porPovezano: { l: 'Automatsko čuvanje je uključeno.', c: 'Аутоматско чување је укључено.' },
    porNemaPitanja: { l: 'To pitanje više ne postoji u bazi.', c: 'То питање више не постоји у бази.' },
    porNemaPregleda: { l: 'Taj pregled simulacije ne postoji.', c: 'Тај преглед симулације не постоји.' },
    porSimPrekinuta: { l: 'Simulacija je prekinuta osvežavanjem — pokušaj nije sačuvan.', c: 'Симулација је прекинута освежавањем — покушај није сачуван.' },
    drillEmptyNovi: { l: 'Ovde se skupljaju pitanja koja pogrešiš — vraćaju se sutra, pa za tri dana, dok ih ne savladaš. Još nisi odgovorio nijedno pitanje.', c: 'Овде се скупљају питања која погрешиш — враћају се сутра, па за три дана, док их не савладаш. Још ниси одговорио ниједно питање.' },
    krenimo: { l: '▶ Kreni: Sva pitanja', c: '▶ Крени: Сва питања' },
    otvoriSve: { l: 'Otvori sva pitanja', c: 'Отвори сва питања' },
    zatvoriSve: { l: 'Zatvori sva pitanja', c: 'Затвори сва питања' },
    planKratko: { l: 'Ostavi oba polja prazna ako ne želiš cilj. Dugme na početnoj daje tačno toliko pitanja — prvo ponavljanja, pa nova.', c: 'Остави оба поља празна ако не желиш циљ. Дугме на почетној даје тачно толико питања — прво понављања, па нова.' },
    planDetalji: { l: 'Kako se broji dnevni cilj?', c: 'Како се броји дневни циљ?' },`, 'tekstovi');

// ---------- 1) jedna povratna informacija ----------
rep(`  let upozorenONeuspehu = false;`,
`  // Kratka potvrda radnje: ista traka kao upozorenja, ali tiša i sama nestaje. Jedan oblik za
  // sve radnje — ranije je isti tip radnje čas ćutao, čas dizao sistemski prozor.
  function poruci(tekst) {
    try {
      let drz = document.getElementById('trakeDrzac');
      if (!drz) { drz = document.createElement('div'); drz.id = 'trakeDrzac'; document.body.appendChild(drz); }
      drz.querySelectorAll('.poruka').forEach((p) => p.remove());   // uvek najviše jedna
      const b = document.createElement('div');
      b.className = 'poruka';
      b.setAttribute('role', 'status');
      b.setAttribute('aria-live', 'polite');
      b.textContent = tekst;
      drz.appendChild(b);
      setTimeout(() => b.remove(), 2600);
    } catch (ignore) { /* poruka nikad ne sme da obori radnju */ }
  }
  let upozorenONeuspehu = false;`, 'poruci');
repS(`.tblScroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }`,
`/* kratka potvrda radnje — ista porodica kao traka upozorenja, ali tiša (sama nestaje) */
.poruka { background: var(--ink); color: var(--bg); border-radius: 10px; padding: 11px 16px;
  font-size: var(--fs-md); line-height: 1.4; box-shadow: 0 6px 22px rgba(0,0,0,.28); pointer-events: auto;
  animation: mekiUlaz .18s ease-out; }
.tblScroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }`, 'poruka css');

// izvoz, brisanje, uvoz, provera verzije, obeležavanje, povezivanje fajla
rep(`      a.download = 'vozacki-a-napredak.json';
      document.body.appendChild(a);
      a.click();`,
`      a.download = 'vozacki-a-napredak.json';
      document.body.appendChild(a);
      a.click();
      poruci(L('porExport'));`, 'poruka izvoz');
rep(`    cb.addEventListener('change', () => { qs(q.id).marked = cb.checked ? 1 : 0; save(); });`,
`    cb.addEventListener('change', () => {
      qs(q.id).marked = cb.checked ? 1 : 0; save();
      poruci((cb.checked ? L('porObelezeno') : L('porOdobelezeno')).split('@1').join(markedIds().length));
    });`, 'poruka obeleženo');

// ---------- 2) prazna stanja vode napred ----------
rep(`    if (!ids.length && !(isWrong && stale.length)) {
      head.innerHTML = \`<h3>\${escapeHtml(title)}</h3>
        <p class="qText" style="font-weight:normal">\${isWrong ? L('drillEmpty') : L('markedEmpty')}</p>
        <div class="qActions"><button type="button" class="secondary" data-nav="home">\${L('backHome')}</button></div>\`;
      bindNav(head);
      el('browseList').innerHTML = '';
      show('browse');
      return;
    }`,
`    if (!ids.length && !(isWrong && stale.length)) {
      // prazno stanje mora da vodi NAPRED (u radnju koja ga puni), a ne samo nazad;
      // i tekst mora da odgovara stanju: ko nije odgovorio nijedno pitanje nije ništa „savladao"
      const nista = !Q.some((q) => S.q[q.id] && S.q[q.id].a);
      const poruka = isWrong ? (nista ? L('drillEmptyNovi') : L('drillEmpty')) : L('markedEmpty');
      const dalje = isWrong && !nista
        ? \`<button type="button" class="primary" data-nav="sim">\${L('endSimBtn')}</button>\`
        : \`<button type="button" class="primary" data-nav="learn">\${L('krenimo')}</button>\`;
      head.innerHTML = \`<h3>\${escapeHtml(title)}</h3>
        <p class="qText" style="font-weight:normal">\${poruka}</p>
        <div class="qActions">\${dalje}</div>\`;
      bindNav(head);
      el('browseList').innerHTML = '';
      el('browseList').hidden = true;   // prazan .card je inače ostajao kao beli pravougaonik
      show('browse');
      return;
    }
    el('browseList').hidden = false;`, 'prazna stanja');
rep(`      el('readyCard').innerHTML = \`<h3>\${L('readyTitle')}</h3><p class="mut">\${L('readyNoData').replace('#', answered)}</p>\`;
      return;`,
`      el('readyCard').innerHTML = \`<h3>\${L('readyTitle')}</h3><p class="mut">\${L('readyNoData').replace('#', answered)}</p>
        <div class="qActions"><button type="button" class="primary" data-nav="learn">\${L('krenimo')}</button></div>\`;
      bindNav(el('readyCard'));
      return;`, 'prazna statistika');

// ---------- 3) pregled rezultata: pitanja sklopljena ----------
rep(`      { const im = card.querySelector('img.qImg'); if (im) pratiSliku(im); }
      const ex = explNode(q);
      if (ex) card.appendChild(ex);
      return card;
    };`,
`      { const im = card.querySelector('img.qImg'); if (im) pratiSliku(im); }
      const ex = explNode(q);
      if (ex) card.appendChild(ex);
      // Sklopljeno na jedan red: 40 otvorenih pregleda je pravilo stranu od 34.000px na telefonu.
      // Naslov kaže sve što treba za odluku „otvoriti ili ne": ishod, broj i početak pitanja.
      const omot = document.createElement('div');
      omot.className = 'card pregledStavka';
      const dobro = chosen && (() => { const okSet = new Set(q.ch.filter((x) => x.ok).map((x) => x.id)); return chosen.size === okSet.size && [...chosen].every((id) => okSet.has(id)); })();
      const znak = !chosen || chosen.size === 0 ? '•' : dobro ? '✓' : '✗';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'explCardBtn pojBtn pregledNaslov';
      btn.innerHTML = \`<span class="pregZnak \${dobro ? 'qOk' : (!chosen || !chosen.size ? 'qDot' : 'qBad')}">\${znak}</span> <span class="pregTekst">\${escapeHtml(T(q.t))}</span>\`;
      const telo = document.createElement('div');
      telo.className = 'explCard';
      telo.style.display = 'none';
      telo.appendChild(card);
      omot.append(btn, telo);
      sklopivo(btn);
      return omot;
    };
    // jedno dugme za sve — ko hoće da pregleda ceo test, ne otvara 40 puta
    const dugmeSve = (drzac) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'secondary sBtn razmakG';
      b.textContent = L('otvoriSve');
      b.addEventListener('click', () => {
        const stavke = [...drzac.querySelectorAll('.pregledStavka .explCard')];
        const otvaram = stavke.some((x) => x.style.display === 'none');
        stavke.forEach((x, i) => { x.style.display = otvaram ? '' : 'none'; drzac.querySelectorAll('.pregledNaslov')[i].setAttribute('aria-expanded', otvaram ? 'true' : 'false'); });
        b.textContent = otvaram ? L('zatvoriSve') : L('otvoriSve');
      });
      return b;
    };`, 'pregled sklopivo');
rep(`        hw.innerHTML = \`<h3>\${L('simWrongTitle')} (\${wrongItems.length})</h3>\`;
        wl.appendChild(hw);`,
`        hw.innerHTML = \`<h3>\${L('simWrongTitle')} (\${wrongItems.length})</h3>\`;
        hw.appendChild(dugmeSve(wl));
        wl.appendChild(hw);`, 'otvori sve pogrešna');
rep(`        ho.innerHTML = \`<h3>\${L('correctOnesTitle')} (\${okItems.length})</h3>\`;
        wl.appendChild(ho);`,
`        ho.innerHTML = \`<h3>\${L('correctOnesTitle')} (\${okItems.length})</h3>\`;
        wl.appendChild(ho);`, 'tacna zaglavlje');
repS(`.pojEntry .explCard { margin: 0 4px 18px; }`,
`.pojEntry .explCard { margin: 0 4px 18px; }
/* pregled rezultata: jedno pitanje = jedan red dok se ne otvori */
.pregledStavka { padding: 4px 12px; margin-bottom: 8px; }
.pregledNaslov { font-weight: 500; color: var(--ink); gap: 8px; }
.pregledNaslov:hover { color: var(--blue); }
.pregZnak { flex: 0 0 auto; font-weight: 700; }
.pregTekst { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.pregledStavka .explCard .card { border: none; box-shadow: none; padding: 0 0 10px; margin: 0; }`, 'pregled css');

// ---------- 4) dnevni cilj: kratko objašnjenje + „?" i dugmad u mreži ----------
rep(`        <div class="mut napomena">\${L('planObjasnjenje')}</div>
        <div class="planPolja">`,
`        <div class="mut napomena">\${L('planKratko')}
          <button type="button" class="pomocBtn" id="btnPlanPomoc" aria-label="\${escapeHtml(L('planDetalji'))}" title="\${escapeHtml(L('planDetalji'))}">?</button></div>
        <div class="mut napomena" id="planPomocTekst" style="display:none">\${L('planObjasnjenje')}</div>
        <div class="planPolja">`, 'plan kratko');
rep(`          <button type="button" class="secondary" id="btnPlanSave">\${L('planSacuvaj')}</button>
          <button type="button" class="secondary" id="btnPlanPredlog">\${L('planPredlozi')}</button>
          \${S.plan ? \`<button type="button" class="secondary" id="btnPlanOff">\${L('planIskljuci')}</button>\` : ''}
        </div>`,
`        </div>
        <div class="podDugmad">
          <button type="button" class="secondary" id="btnPlanSave">\${L('planSacuvaj')}</button>
          <button type="button" class="secondary" id="btnPlanPredlog">\${L('planPredlozi')}</button>
          \${S.plan ? \`<button type="button" class="secondary" id="btnPlanOff">\${L('planIskljuci')}</button>\` : ''}
        </div>`, 'plan dugmad mreža');
rep(`    renderBackupLine();
    applyFont();`,
`    renderBackupLine();
    { const bp = el('btnPlanPomoc'); if (bp) sklopivo(bp, null, el('planPomocTekst')); }
    applyFont();`, 'plan pomoc veza');

// ---------- 5) simulacija na telefonu: jedan red ----------
repS(`.simTop { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }`,
`.simTop { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
/* na telefonu tajmer i oba dugmeta staju u JEDAN red — na ispitu su takođe u jednom */
@media (max-width: 560px) {
  .simTop { gap: 8px; padding: 12px; }
  .simTop .simTimer { font-size: 1.25rem; min-width: 74px; }
  .simTop button { padding: 10px 12px; }
}`, 'simTop 560');

// ---------- 6) mrtva adresa kaže zašto ----------
rep(`  function goHomeReplace() {
    if (FILE_MODE) { renderHome(); return; }
    location.replace('#/');
  }`,
`  function goHomeReplace(kljuc) {
    // korisnik koji je otvorio deljenu adresu mora da zna zašto gleda početnu
    if (kljuc) setTimeout(() => poruci(L(kljuc)), 60);
    if (FILE_MODE) { renderHome(); return; }
    location.replace('#/');
  }`, 'goHomeReplace poruka');
rep(`      if (byId.has(qid)) return startList([qid], () => '#' + qid, null, 'filter', { origin: () => renderHome(), nazadLbl: L('backHome'), jedno: true, hash: h });
      return goHomeReplace();`,
`      if (byId.has(qid)) return startList([qid], () => '#' + qid, null, 'filter', { origin: () => renderHome(), nazadLbl: L('backHome'), jedno: true, hash: h });
      return goHomeReplace('porNemaPitanja');`, 'ruta pitanje poruka');
rep(`      if (S.sims[i]) return renderSimReview(S.sims[i], false);
      return goHomeReplace();`,
`      if (S.sims[i]) return renderSimReview(S.sims[i], false);
      return goHomeReplace('porNemaPregleda');`, 'ruta pregled poruka');
rep(`    if (h === '#/sim') {
      if (sim) { show('sim'); sim.showReport ? renderSimReport() : renderSimQ(); return; }
      return goHomeReplace();
    }`,
`    if (h === '#/sim') {
      if (sim) { show('sim'); sim.showReport ? renderSimReport() : renderSimQ(); return; }
      return goHomeReplace('porSimPrekinuta');
    }`, 'ruta sim poruka');

// ---------- 7) vežba podoblasti preživljava osvežavanje ----------
rep(`    if (h.startsWith('#/sek/')) return browse(h.slice(6));`,
`    if (h.startsWith('#/sek/')) return browse(h.slice(6));
    // vežbanje oblasti/podoblasti ima svoju adresu: osvežavanje i „nazad" vraćaju na isto mesto
    if (h.startsWith('#/vezba/')) {
      const key = h.slice(8);
      if (/^[cs]\\d+$/.test(key) && secInfo(key).ids.length) {
        const si = secInfo(key);
        return startList(si.ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0, origin: () => browse(key), hash: h });
      }
      return goHomeReplace();
    }`, 'ruta vezba/kljuc');
rep(`      if (shuffleOn) startList(maybeShuffle(ids), shufTag(secTitleFn(key)), null, 'filter', { origin });
      else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0, origin });`,
`      if (shuffleOn) startList(maybeShuffle(ids), shufTag(secTitleFn(key)), null, 'filter', { origin });
      else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0, origin, hash: '#/vezba/' + key });`, 'bStart hash');
rep(`    const so = el('bStartOver'); if (so) so.addEventListener('click', () => startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: 0, origin }));`,
`    const so = el('bStartOver'); if (so) so.addEventListener('click', () => startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: 0, origin, hash: '#/vezba/' + key }));`, 'bStartOver hash');

if (pao) { console.log('*** NE PIŠEM (' + pao + ') ***'); process.exit(1); }
fs.writeFileSync(A, a); fs.writeFileSync(C, s);
console.log('--- upisano: app.js, style.css ---');
