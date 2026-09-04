// Milanove odluke (04.09.2026), sve tri:
// (1) Kad se nakupe zaostala ponavljanja, brojka ne sme da izgleda kao dug: plan i dalje daje svoju
//     kvotu, pa se to i kaže („od 150 na redu, plan ti danas daje 20"). Uz upozorenje da cilj ne
//     stiže do ispita ide dugme koje novi tempo ODMAH upisuje.
// (2) Orijentacija u dugačkim spiskovima umesto straničenja: lepljiv naslov oblasti, skok na oblast,
//     povratak na vrh. (Merenja: 11.199 elemenata, 8 MB, pretraga ~1 ms — performanse nisu problem.)
// (3) „Česta pitanja" i „Zašto verovati" se spajaju u jednu karticu „O vežbaonici".
import fs from 'node:fs';
const A = new URL('../../app.js', import.meta.url), C = new URL('../../style.css', import.meta.url);
let a = fs.readFileSync(A, 'utf8'), s = fs.readFileSync(C, 'utf8');
let pao = 0;
const mk = (get, set, tag) => (o, n, ime, br = 1) => { const t = get(); const c = t.split(o).length - 1; if (c !== br) { console.log('FAIL ' + tag + ' [' + ime + '] ' + c + '/' + br); pao++; return; } set(t.split(o).join(n)); console.log('ok ' + tag + ' [' + ime + ']'); };
const rep = mk(() => a, (v) => { a = v; }, 'js');
const repS = mk(() => s, (v) => { s = v; }, 'css');

// ---------- tekstovi ----------
rep(`    planPodesi: { l: 'Podesi cilj', c: 'Подеси циљ' },`,
`    planPodesi: { l: 'Podesi cilj', c: 'Подеси циљ' },
    planOdNaRedu: { l: 'na redu ih je @1, plan ti danas daje @2', c: 'на реду их је @1, план ти данас даје @2' },
    planUskladi: { l: 'Uskladi cilj', c: 'Усклади циљ' },
    planUskladjen: { l: 'Cilj je usklađen: @1 novih i @2 ponavljanja dnevno.', c: 'Циљ је усклађен: @1 нових и @2 понављања дневно.' },
    skociNaOblast: { l: 'Skoči na oblast', c: 'Скочи на област' },
    naVrh: { l: 'Na vrh', c: 'На врх' },
    oVezbaonici: { l: 'ℹ️ O vežbaonici — poreklo, pouzdanost, česta pitanja', c: 'ℹ️ О вежбаоници — порекло, поузданост, честа питања' },`, 'tekstovi');

// ---------- (1) zaostala ponavljanja: brojka je informacija, ne dug ----------
rep(`    const ispunjen = (p.ostaloNovih === 0 || p.nemaNovih) && (p.ostaloPon === 0 || p.nemaPon);
    const ima = planIds().length;
    const naRedu = queueSplit().ready.length;`,
`    const ispunjen = (p.ostaloNovih === 0 || p.nemaNovih) && (p.ostaloPon === 0 || p.nemaPon);
    const ima = planIds().length;
    const naRedu = queueSplit().ready.length;
    // Ako je zaostalo više nego što staje u kvotu, kaže se ODAKLE dokle: dnevni cilj je kvota, ne dug,
    // pa velika brojka ne sme da izgleda kao obaveza za danas.
    const zaostatak = (!ispunjen && naRedu > p.cPon && p.cPon > 0)
      ? \`<div class="mut napomena">\${L('planOdNaRedu').split('@1').join(naRedu).split('@2').join(p.ostaloPon)}</div>\` : '';`, 'zaostatak red');
rep(`      <div class="razmakG">\${dno}</div></div>\`;
  }`,
`      \${zaostatak}<div class="razmakG">\${dno}</div></div>\`;
  }`, 'zaostatak u blok');

// „Uskladi cilj" uz upozorenje da cilj ne stiže do ispita
rep(`            delovi.push('⚠ ' + L('planPremalo').split('@1').join(S.plan.novih + ' ' + novihPitanja(S.plan.novih)).split('@2').join(S.plan.novih * dana).split('@3').join(neodg).split('@4').join(tempo));`,
`            delovi.push('⚠ ' + L('planPremalo').split('@1').join(S.plan.novih + ' ' + novihPitanja(S.plan.novih)).split('@2').join(S.plan.novih * dana).split('@3').join(neodg).split('@4').join(tempo)
              + \` <button type="button" class="secondary sBtn" id="btnUskladiCilj">\${L('planUskladi')}</button>\`);`, 'dugme uskladi');
rep(`      const bpp = el('btnPlanPodesi');`,
`      // „Uskladi cilj": upisuje predloženi tempo odmah, da čovek ne mora da traži polja u podešavanjima
      const buc = el('btnUskladiCilj');
      if (buc) buc.addEventListener('click', () => {
        const dana = danaDoIspita();
        if (dana === null || dana < 1) return;
        const { novih, pon } = predlogTempa(dana, neodgovorenih());
        S.plan = { novih, pon };
        save(); renderHome();
        poruci(L('planUskladjen').split('@1').join(novih === null ? 0 : novih).split('@2').join(pon));
      });
      const bpp = el('btnPlanPodesi');`, 'uskladi handler');

// ---------- (2) orijentacija u dugačkim spiskovima ----------
rep(`  const legendHtml = () => \`<div class="mut napomena">\${L('legend')}</div>\`;`,
`  const legendHtml = () => \`<div class="mut napomena">\${L('legend')}</div>\`;
  // Spisak od 1327 pitanja nije spor (mereno: ~11.000 elemenata, 8 MB, pretraga ~1 ms) — problem je
  // ORIJENTACIJA: na pola dubine se ne zna u kojoj si oblasti. Zato: skok na oblast, lepljiv naslov
  // oblasti (CSS) i povratak na vrh. Straničenje bi pokvarilo „nastavi gde si stao" i traženje po broju.
  function skokNaOblastHtml(naslovi) {
    if (naslovi.length < 3) return '';
    return \`<div class="skokRed"><span class="mut">\${L('skociNaOblast')}:</span>\${naslovi
      .map((n, i) => \`<button type="button" class="secondary sBtn skokBtn" data-skok="\${i}">\${escapeHtml(n)}</button>\`).join('')}</div>\`;
  }
  function veziSkok(koren, spisak) {
    koren.querySelectorAll('.skokBtn').forEach((b) => b.addEventListener('click', () => {
      const c = spisak.querySelectorAll('.grupaNaslov')[+b.dataset.skok];
      if (c) c.scrollIntoView({ block: 'start' });
    }));
  }
  // dugme „na vrh" se pojavljuje tek kad se odskroluje — inače je samo smetnja
  function veziNaVrh() {
    let b = document.getElementById('btnNaVrh');
    if (!b) {
      b = document.createElement('button');
      b.id = 'btnNaVrh'; b.type = 'button'; b.className = 'secondary';
      b.textContent = '↑ ' + L('naVrh');
      b.addEventListener('click', () => window.scrollTo({ top: 0 }));
      document.body.appendChild(b);
    } else { b.textContent = '↑ ' + L('naVrh'); }
    const proveri = () => { b.hidden = window.scrollY < 1200 || !el('view-browse').classList.contains('active'); };
    if (!b._vezan) { b._vezan = true; window.addEventListener('scroll', proveri, { passive: true }); }
    proveri();
  }`, 'skok i na vrh');

rep(`    const list = el('browseList');
    list.innerHTML = \`<h3>\${L('allQuestions')}</h3>
      <input id="qSearch" type="search" class="searchBox" placeholder="\${escapeHtml(L('searchPh'))}" aria-label="\${escapeHtml(L('searchPh'))}">\` + legendHtml();
    const allIds = Q.map((q) => q.id);`,
`    const list = el('browseList');
    const imenaOblasti = [];
    { let zadnja = null; for (const q of Q) { if (q.cat !== zadnja) { zadnja = q.cat; const c = D.cats.find((x) => x.id === q.cat); imenaOblasti.push(c ? T({ l: c.l, c: c.c }) : ''); } } }
    list.innerHTML = \`<h3>\${L('allQuestions')}</h3>
      <input id="qSearch" type="search" class="searchBox" placeholder="\${escapeHtml(L('searchPh'))}" aria-label="\${escapeHtml(L('searchPh'))}">\`
      + skokNaOblastHtml(imenaOblasti) + legendHtml();
    const allIds = Q.map((q) => q.id);`, 'skok u sva pitanja');
rep(`      if (v && !vidljivih) { prazno.textContent = L('searchEmpty').split('@1').join(sb.value.trim()); prazno.style.display = ''; }
      else prazno.style.display = 'none';
    });
    show('browse');`,
`      if (v && !vidljivih) { prazno.textContent = L('searchEmpty').split('@1').join(sb.value.trim()); prazno.style.display = ''; }
      else prazno.style.display = 'none';
      // dok traje pretraga skok na oblast nema smisla — naslovi su sakriveni
      const sk = list.querySelector('.skokRed'); if (sk) sk.style.display = v ? 'none' : '';
    });
    veziSkok(list, list);
    show('browse');
    veziNaVrh();`, 'veži skok sva');
// oblast: isti alat (podoblasti kao naslovi)
rep(`      b.addEventListener('click', () => {
        if (shuffleOn) rowStart(ids, idx, secTitleFn(key), origin);
        else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: idx, origin });
      });
      list.appendChild(b);
    });
    show('browse');`,
`      b.addEventListener('click', () => {
        if (shuffleOn) rowStart(ids, idx, secTitleFn(key), origin);
        else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: idx, origin });
      });
      list.appendChild(b);
    });
    if (type === 'c') {
      const naslovi = [...list.querySelectorAll('.grupaNaslov')].map((n) => n.textContent);
      const drz = document.createElement('div');
      drz.innerHTML = skokNaOblastHtml(naslovi);
      if (drz.firstChild) { list.insertBefore(drz.firstChild, list.querySelector('.grupaNaslov')); veziSkok(list, list); }
    }
    show('browse');
    veziNaVrh();`, 'skok u oblasti');

repS(`.grupaNaslov { margin: 14px 0 6px; padding-bottom: 4px; border-bottom: 1px solid var(--line);
  font-size: var(--fs-sm); font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--mut); }`,
`.grupaNaslov { margin: 14px 0 6px; padding-bottom: 4px; border-bottom: 1px solid var(--line);
  font-size: var(--fs-sm); font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--mut); }
/* U dugačkom spisku naslov oblasti ostaje na vrhu dok skroluješ kroz nju — inače na pola dubine
   ne znaš gde si. Lepi se ISPOD gornje trake. */
#browseList .grupaNaslov { position: sticky; top: 52px; z-index: 3; background: var(--card);
  margin: 14px -18px 6px; padding: 8px 18px 5px; border-top: 1px solid var(--line); }
.skokRed { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 8px 0 10px; }
.skokRed .mut { flex: 0 0 100%; font-size: var(--fs-xs); }
#btnNaVrh { position: fixed; right: 14px; bottom: 14px; z-index: 1250; box-shadow: 0 4px 14px rgba(16,24,40,.25); }
@media (max-width: 700px) { #btnNaVrh { bottom: calc(14px + 66px); } }`, 'css skok/sticky/vrh');

// ---------- (3) jedna kartica „O vežbaonici" ----------
rep(`    const tc = el('trustCard');
    if (tc) {
      tc.innerHTML = \`<div><button class="explCardBtn pojBtn istaknuto">\${L('trustTitle')}</button><div class="explCard" style="display:none">\${L('trustBody').split('@1').join(fmtDatum(BAZA_PROVERENA))}</div></div>\`;
      sklopivo(tc.querySelector('.explCardBtn'));
    }

    const fq = el('faqCard');
    if (EX.cards && EX.cards.faq) {
      fq.style.display = '';
      fq.innerHTML = \`<div><button class="explCardBtn pojBtn istaknuto">❓ \${escapeHtml(T(EX.cards.faq.t))}</button><div class="explCard" style="display:none">\${T(EX.cards.faq.h)}</div></div>\`;
      sklopivo(fq.querySelector('.explCardBtn'));
    } else fq.style.display = 'none';`,
`    // Milanova odluka (04.09.2026): „Zašto verovati" i „Česta pitanja" su se sadržajno preklapali
    // (isto pitanje imalo odgovor na dva mesta), pa su spojeni u jednu karticu — poreklo baze i
    // pouzdanost pa česta pitanja, jedno ispod drugog.
    { const tc = el('trustCard'); if (tc) { tc.innerHTML = ''; tc.style.display = 'none'; } }
    const fq = el('faqCard');
    fq.style.display = '';
    fq.innerHTML = \`<div><button class="explCardBtn pojBtn istaknuto">\${L('oVezbaonici')}</button>
      <div class="explCard" style="display:none">\${L('trustBody').split('@1').join(fmtDatum(BAZA_PROVERENA))}
      \${(EX.cards && EX.cards.faq) ? \`<div class="grupaNaslov">\${escapeHtml(T(EX.cards.faq.t))}</div>\${T(EX.cards.faq.h)}\` : ''}</div></div>\`;
    sklopivo(fq.querySelector('.explCardBtn'));`, 'jedna kartica');

if (pao) { console.log('*** NE PIŠEM (' + pao + ') ***'); process.exit(1); }
fs.writeFileSync(A, a); fs.writeFileSync(C, s);
console.log('--- upisano: app.js, style.css ---');
