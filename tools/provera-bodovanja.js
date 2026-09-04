// PROVERA BODOVANJA — pokreće se u konzoli pregledača na http://localhost:8137
// (ili je pokreće alat kroz ugrađeni pregledač pre svake objave).
// Radi na PRIVREMENOM stanju: postojeći napredak se sačuva i vrati na kraju.
// Ispisuje PASS/FAIL po stavci i vraća zbirni rezultat.
async function proveraBodovanja() {
  if (!window.__dev) return 'GREŠKA: nema __dev (nisi na localhost?)';
  const rez = [];
  const ok = (naziv, uslov) => rez.push((uslov ? 'PASS' : 'FAIL') + ' — ' + naziv);
  const cekaj = (ms) => new Promise((r) => setTimeout(r, ms));
  const sacuvano = localStorage.getItem('vozackiA.v1');
  const sacuvanIspit = localStorage.getItem('vozackiA.sim');   // i ispit u toku, ako ga ima

  try {
    // čisto stanje
    localStorage.removeItem('vozackiA.v1');
    localStorage.removeItem('vozackiA.sim');   // inače bi se posle osvežavanja vratio ispit umesto početne
    location.hash = '#/';
    location.reload();
    return 'PONOVO POKRENI proveraBodovanja2() POSLE OSVEŽAVANJA';
  } finally {
    sessionStorage.setItem('provera.backup', sacuvano || '');
    sessionStorage.setItem('provera.backupSim', sacuvanIspit || '');
  }
}

async function proveraBodovanja2() {
  const rez = [];
  const ok = (naziv, uslov) => rez.push((uslov ? 'PASS' : 'FAIL') + ' — ' + naziv);
  const cekaj = (ms) => new Promise((r) => setTimeout(r, ms));
  const S = () => window.__dev.S;
  const klikni = (tekst, koren) => {
    const b = [...(koren || document).querySelectorAll('button')].find((x) => x.textContent.includes(tekst));
    if (b) b.click();
    return !!b;
  };

  // Telo je u try/finally: pravi napredak razvijaoca se vraća i kad neka tvrdnja pukne usred
  // rada. Ranije je vraćanje bilo poslednja naredba, pa je greška u sredini ostavljala obrisano
  // stanje, a jedinu kopiju u sessionStorage.
  try {
    const skip = document.getElementById('tourSkip'); if (skip) skip.click();

    // ---- 0a) NORMALIZACIJA STANJA — jedina brana od tuđeg ili oštećenog fajla ----
    const NS = window.__dev.normalizeState;
    ok('normalizacija: smeće bez pitanja se odbija', NS(null) === null && NS({}) === null && NS({ q: [] }) === null);
    ok('normalizacija: veličina slova u opsegu se čuva', NS({ q: {}, fs: 1.16 }).fs === 1.16);
    ok('normalizacija: veličina slova van opsega pada na 1', NS({ q: {}, fs: 9 }).fs === 1 && NS({ q: {}, fs: 'x' }).fs === 1);
    ok('normalizacija: nepoznato pitanje se odbacuje', Object.keys(NS({ q: { 999999: { a: 1 } } }).q).length === 0);
    ok('normalizacija: tema prima samo poznate vrednosti', NS({ q: {}, theme: '<b>x</b>' }).theme === null && NS({ q: {}, theme: 'dark' }).theme === 'dark');
    ok('normalizacija: preko 500 simulacija čuva NAJNOVIJE', (() => {
      const ulaz = { q: {}, sims: Array.from({ length: 520 }, (_, i) => ({ d: i + 1, score: 0, total: 98, passed: false, wrong: [] })) };
      const n = NS(ulaz).sims;
      return n.length === 500 && n[n.length - 1].d === 520 && n[0].d === 21;
    })());

    // ---- 0) DNEVNI CILJ na čistom stanju: kvota bez gradiva je ispunjena, plan nudi tačno toliko novih ----
    S().plan = { novih: 3, pon: 10 };
    document.querySelector('[data-nav="home"]').click();
    const pb = () => document.querySelector('#homeSummary .planBox');
    ok('plan: kvota ponavljanja bez gradiva je ispunjena („nema na redu" + ✓)', !!pb() && pb().textContent.includes('0 / 10 ponavljanja (nema na redu)') && pb().textContent.includes('✓'));
    ok('plan: nova pitanja se nude — dugme „Vežbaj po planu"', !!document.getElementById('btnPlanVezbaj'));
    document.getElementById('btnPlanVezbaj').click();
    ok('plan: spisak plana ima tačno 3 pitanja (1 od 3)', document.querySelector('#qProgress .qpPos').textContent.replace(/\s+/g, ' ').trim() === '1 od 3');
    S().plan = null;
    document.querySelector('[data-nav="home"]').click();

    // ---- 1) UČENJE: tačan, netačan, ponovni odgovor, dnevni brojači, rok ----
    document.querySelector('.menuBtn[data-nav="learn"]').click();
    document.getElementById('bCont').click();
    const q1 = window.QUIZ.questions[0];
    const tacni = new Set(q1.ch.filter((c) => c.ok).map((c) => c.t.l.trim()));
    // namerno POGREŠAN odgovor
    const izbori = [...document.querySelectorAll('#qCard .choice')];
    const pogresan = izbori.find((b) => !tacni.has(b.textContent.trim()));
    pogresan.click();
    klikni('dgovori', document.getElementById('qCard'));
    let r = S().q[q1.id];
    ok('pogrešan odgovor: a=1, w=1, streak=0', r && r.a === 1 && r.w === 1 && r.streak === 0);
    ok('pogrešan odgovor: due = ODMAH (u redu za ponavljanje)', r.due <= Date.now());
    ok('dnevni brojač: n=1, ok=0', S().day && S().day.n === 1 && S().day.ok === 0);

    // sledeće pa nazad — ISPRAVKA pogrešnog odgovora važi (pitanje je NA REDU: due je "odmah")
    klikni('ledeće', document.getElementById('qCard'));
    klikni('rethodno', document.getElementById('qCard'));
    const tacanBtn = [...document.querySelectorAll('#qCard .choice')].find((b) => tacni.has(b.textContent.trim()));
    tacanBtn.click();
    klikni('dgovori', document.getElementById('qCard'));
    r = S().q[q1.id];
    ok('ispravka na roku se beleži: a=2, streak=1', r.a === 2 && r.streak === 1);
    const sutra = new Date(); sutra.setHours(0, 0, 0, 0); sutra.setDate(sutra.getDate() + 1);
    ok('rok posle 1. pogotka = SUTRA u 00:00 (kalendarski)', r.due === sutra.getTime());
    ok('u redu za ponavljanje dok streak < 3', window.__dev.inQueue(q1.id) === true);
    ok('dnevni brojač: isto pitanje se broji JEDNOM dnevno (n i dalje 1)', S().day.n === 1);
    // rok je sada SUTRA — još jedan tačan odgovor PRE roka je vežbanje, ne sme da pomeri raspored
    klikni('ledeće', document.getElementById('qCard'));
    klikni('rethodno', document.getElementById('qCard'));
    [...document.querySelectorAll('#qCard .choice')].find((b) => tacni.has(b.textContent.trim())).click();
    klikni('dgovori', document.getElementById('qCard'));
    r = S().q[q1.id];
    ok('PRE roka: odgovor se broji (a=3) ali streak i rok stoje', r.a === 3 && r.streak === 1 && r.due === sutra.getTime());
    ok('PRE roka: i dalje u redu za ponavljanje', window.__dev.inQueue(q1.id) === true);

    // ---- 1b) UTVRĐIVANJE: tačno IZ PRVE → druga potvrda za 3 dana; posle druge potvrde utvrđeno ----
    klikni('ledeće', document.getElementById('qCard'));
    const q2 = window.QUIZ.questions[1];
    const tacni2 = new Set(q2.ch.filter((c) => c.ok).map((c) => c.t.l.trim()));
    for (const b of document.querySelectorAll('#qCard .choice')) if (tacni2.has(b.textContent.trim())) b.click();
    klikni('dgovori', document.getElementById('qCard'));
    let r2 = S().q[q2.id];
    const za3 = window.__dev.pocetakDanaZa(3);
    ok('tačno iz prve: zakazana potvrda za 3 dana', r2 && r2.w === 0 && r2.streak === 1 && r2.due === za3);
    ok('tačno iz prve: u redu za utvrđivanje', window.__dev.inQueue(q2.id) === true);
    ok('dnevni brojač: drugo pitanje danas → n=2', S().day.n === 2);
    // MILANOVA ODLUKA (2026-09-02): potvrda odmah posle prvog pogotka je PRE roka —
    // broji se kao vežbanje, ali NE utvrđuje pitanje (ranije je utvrđivala za 20 sekundi)
    // (poslednji odgovor „juče": dnevni brojači bi inače isto pitanje svakako preskočili)
    S().q[q2.id].last = Date.now() - 86400000;
    klikni('ledeće', document.getElementById('qCard'));
    klikni('rethodno', document.getElementById('qCard'));
    for (const b of document.querySelectorAll('#qCard .choice')) if (tacni2.has(b.textContent.trim())) b.click();
    klikni('dgovori', document.getElementById('qCard'));
    r2 = S().q[q2.id];
    ok('potvrda PRE roka NE utvrđuje: streak=1, rok stoji, u redu', r2.a === 2 && r2.streak === 1 && r2.due === za3 && window.__dev.inQueue(q2.id) === true);
    ok('PRE roka: NE puni kvotu ponavljanja dnevnog cilja (pon=0)', (S().day.pon || 0) === 0);
    // kad rok STIGNE (pomeramo ga u prošlost), ista potvrda VAŽI → utvrđeno
    S().q[q2.id].due = Date.now() - 1000;
    S().q[q2.id].last = Date.now() - 86400000;
    klikni('ledeće', document.getElementById('qCard'));
    klikni('rethodno', document.getElementById('qCard'));
    for (const b of document.querySelectorAll('#qCard .choice')) if (tacni2.has(b.textContent.trim())) b.click();
    klikni('dgovori', document.getElementById('qCard'));
    r2 = S().q[q2.id];
    ok('potvrda NA ROKU: utvrđeno, van reda, bez roka', r2.streak === 2 && !r2.due && window.__dev.inQueue(q2.id) === false);
    ok('NA ROKU: puni kvotu ponavljanja dnevnog cilja (pon=1)', S().day.pon === 1);
    // pogrešan odgovor važi UVEK, i pre roka: vraća pitanje u red odmah
    const q3 = window.QUIZ.questions[2];
    const tacni3 = new Set(q3.ch.filter((c) => c.ok).map((c) => c.t.l.trim()));
    klikni('ledeće', document.getElementById('qCard'));
    for (const b of document.querySelectorAll('#qCard .choice')) if (tacni3.has(b.textContent.trim())) b.click();
    klikni('dgovori', document.getElementById('qCard'));
    klikni('ledeće', document.getElementById('qCard'));
    klikni('rethodno', document.getElementById('qCard'));
    // pitanje traži DVA odgovora — biramo jedan tačan i jedan netačan (ukupno pogrešno)
    const svi3 = [...document.querySelectorAll('#qCard .choice')];
    svi3.find((b) => tacni3.has(b.textContent.trim())).click();
    svi3.find((b) => !tacni3.has(b.textContent.trim())).click();
    klikni('dgovori', document.getElementById('qCard'));
    const r3 = S().q[q3.id];
    ok('pogrešan PRE roka VAŽI: w=1, streak=0, odmah na redu', r3.w === 1 && r3.streak === 0 && r3.due <= Date.now());

    // ---- 1c) „Nastavi" na Sva pitanja preskače već odgovorena: Q[0..2] su rešena, seqPos=2 → nudi 4. ----
    document.querySelector('[data-nav="home"]').click();
    document.querySelector('.menuBtn[data-nav="learn"]').click();
    ok('Nastavi preskače već odgovorena: nudi (4/1327)', document.getElementById('bCont').textContent.includes('(4/1327)'));
    document.getElementById('bCont').click();
    ok('Nastavi otvara 4. pitanje (prvo neodgovoreno)', document.querySelector('#qProgress .qpPos').textContent.replace(/\s+/g, ' ').trim() === '4 od 1327');

    // ---- 1d) SKOK NA BROJ u spisku pa odgovor: mora da se BELEŽI ----
    // (čuvar od dvostrukog beleženja je vezan za „prolaz|pozicija"; skok koji ga ne poništi
    // tiho je gutao odgovor — prikaz kaže „Tačno!", a brojači stoje)
    const podoblast = (() => {
      const broj = {};
      for (const q of window.QUIZ.questions) broj[q.sub] = (broj[q.sub] || 0) + 1;
      return Object.keys(broj).find((k) => broj[k] >= 3);
    })();
    location.hash = '#/vezba/s' + podoblast;
    await cekaj(200);
    const prvoPitanje = +document.getElementById('qCard').dataset.qid;
    const trazi = window.QUIZ.questions.find((q) => q.id === prvoPitanje).req;
    const odgovori = () => {
      const izbori = [...document.querySelectorAll('#qCard .choice')];
      for (let i = 0; i < trazi; i++) izbori[i].click();
      document.querySelector('#qCard .qActions .primary').click();
    };
    const preSkoka = (S().q[prvoPitanje] || {}).a || 0;
    odgovori();
    await cekaj(50);
    const posleOdgovora = S().q[prvoPitanje].a;
    const skoci = (n) => { document.getElementById('jumpN').value = String(n); document.getElementById('jumpGo').click(); };
    skoci(3); await cekaj(50);
    skoci(1); await cekaj(50);
    odgovori();
    await cekaj(50);
    ok('skok na broj pa odgovor se BELEŽI (a raste)', posleOdgovora === preSkoka + 1 && S().q[prvoPitanje].a === preSkoka + 2);
    document.querySelector('[data-nav="home"]').click();

    // ---- 2) SIMULACIJA: svih 41 tačno → 98/98, položeno ----
    document.querySelector('[data-nav="home"]').click();
    document.querySelector('.menuBtn[data-nav="sim"]').click();
    await cekaj(300);
    const sim = () => window.__dev.sim;
    ok('simulacija: 41 pitanje', sim() && sim().qs.length === 41);
    const ukupno = sim().qs.reduce((z, sq) => z + sq.q.pts, 0);
    ok('simulacija: zbir poena = 98', ukupno === 98);
    // ispit u toku mora da bude upisan — inače ga osvežavanje strane briše
    const zapisIspita = () => { try { return JSON.parse(localStorage.getItem('vozackiA.sim') || 'null'); } catch (e) { return null; } };
    ok('simulacija: tok ispita je upisan (41 pitanje + rok)', (() => {
      const z = zapisIspita();
      return !!z && z.qs.length === 41 && typeof z.d === 'number' && z.d > Date.now();
    })());
    for (let i = 0; i < 41; i++) {
      const sq = sim().qs[sim().i];
      const okIds = new Set(sq.q.ch.filter((c) => c.ok).map((c) => c.t.l.trim()));
      for (const b of document.querySelectorAll('#simQCard .choice')) {
        if (okIds.has(b.textContent.trim()) && !sq.chosen.has(sq.q.ch.find((c) => c.t.l.trim() === b.textContent.trim()).id)) b.click();
      }
      if (i < 40) klikni('›', document.getElementById('simQCard').parentElement);
      await cekaj(30);
    }
    const staraPotvrda = window.confirm; window.confirm = () => true;
    document.getElementById('btnFinishSim').click();
    window.confirm = staraPotvrda;
    await cekaj(300);
    const zapis = S().sims[S().sims.length - 1];
    ok('sve tačno → rezultat 98/98', zapis && zapis.score === 98 && zapis.total === 98);
    ok('sve tačno → POLOŽENO', zapis.passed === true);
    ok('sve tačno → nula pogrešnih', (zapis.wrong || []).length === 0);
    ok('završen ispit briše zapis o toku', zapisIspita() === null);

  } catch (e) {
    rez.push('FAIL - provera je pukla usred rada: ' + ((e && e.message) || e));
    console.error(e);
  } finally {
    // ---- kraj: vrati pravo stanje ----
    const backup = sessionStorage.getItem('provera.backup');
    if (backup) localStorage.setItem('vozackiA.v1', backup);
    else localStorage.removeItem('vozackiA.v1');
    const backupSim = sessionStorage.getItem('provera.backupSim');
    if (backupSim) localStorage.setItem('vozackiA.sim', backupSim);
    else localStorage.removeItem('vozackiA.sim');
    sessionStorage.removeItem('provera.backup');
    sessionStorage.removeItem('provera.backupSim');
  }

  const pao = rez.filter((x) => x.startsWith('FAIL'));
  console.log(rez.join('\n'));
  console.log(pao.length ? '✗ PALO: ' + pao.length : '✓ SVE PROŠLO (' + rez.length + ')');
  return { rezultati: rez, palo: pao.length };
}
