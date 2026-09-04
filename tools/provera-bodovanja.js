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
  // NE setTimeout: sakriven tab (ugrađeni pregledač alata) prigušuje tajmere i do jednom u
  // minutu, pa je provera od 90 sekundi umela da traje POLA SATA. Zadaci kroz MessageChannel
  // se ne prigušuju; troše nešto CPU-a, ali provera radi samo lokalno.
  const cekaj = (ms) => new Promise((r) => {
    const kraj = performance.now() + ms;
    const ch = new MessageChannel();
    ch.port1.onmessage = () => { if (performance.now() >= kraj) r(); else ch.port2.postMessage(0); };
    ch.port2.postMessage(0);
  });
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
    ok('plan: kvota ponavljanja bez gradiva je ispunjena („nema na redu" + ✓)', !!pb() && pb().textContent.includes('Ponavljanja: 0 / 10 (nema na redu)') && pb().textContent.includes('✓'));
    ok('plan: nova pitanja se nude — dugme „Vežbaj po planu"', !!document.getElementById('btnPlanVezbaj'));
    document.getElementById('btnPlanVezbaj').click();
    ok('plan: spisak plana ima tačno 3 pitanja (1 od 3)', document.querySelector('#qProgress .qpPos').textContent.replace(/\s+/g, ' ').trim() === '1 od 3');
    S().plan = null;

    // ---- 0b) TEMPO: auto kvota, presuda i višak ----
    const planTekst = () => document.querySelector('#homeSummary .planBox').textContent.replace(/\s+/g, ' ');
    const naPocetnu = async () => { document.querySelector('[data-nav="home"]').click(); await cekaj(120); };
    const staroPlan = S().plan, staroDatum = S().examDate, staroDan = S().day;
    {
      const danas = new Date(); const za10 = new Date(danas.getTime() + 10 * 86400000);
      // LOKALNI datum, kao localDay() u aplikaciji — toISOString je UTC i ume da promaši dan,
      // a S().day.d koji je ranije bio prazan bi ostavio kvotu na nuli
      const dva = (n) => String(n).padStart(2, '0');
      const danasStr = danas.getFullYear() + '-' + dva(danas.getMonth() + 1) + '-' + dva(danas.getDate());
      S().examDate = za10.getFullYear() + '-' + String(za10.getMonth() + 1).padStart(2, '0') + '-' + String(za10.getDate()).padStart(2, '0');
      S().day = { d: danasStr, n: 0, ok: 0, novih: 0, pon: 0 };

      // auto: kvota se računa iz neodgovorenih i dana, ne iz upisanog broja
      S().plan = { novih: 5, pon: 5, auto: 1, prio: 0 };
      await naPocetnu();
      const neodg = 1327 - Object.keys(S().q).filter((id) => S().q[id].a).length;
      const ocekNovih = Math.max(1, Math.ceil(neodg / Math.max(1, 10 - Math.min(7, Math.floor(10 / 3)))));
      ok('tempo: auto kvota se računa iz gradiva i dana (' + ocekNovih + ' novih)', planTekst().includes('Nova pitanja: 0 / ' + ocekNovih));
      ok('tempo: auto presuda kaže da stižeš', planTekst().includes('stižeš'));

      // fiksni, premali tempo: presuda mora da kaže da NE stižeš gradivo
      S().plan = { novih: 2, pon: 30, auto: 0, prio: 0 };
      await naPocetnu();
      ok('tempo: premali tempo se prijavljuje kao prepreka', planTekst().includes('NE stižeš gradivo') && planTekst().includes('To jeste prepreka'));
      ok('tempo: uz prepreku stoji i dugme koje diže tempo', !!document.getElementById('btnLostTempo'));

      // višak preko cilja se vidi; u auto režimu uz to kaže i da snižava sutrašnju kvotu
      S().plan = { novih: 10, pon: 10, auto: 0, prio: 0 };
      S().day = { d: danasStr, n: 40, ok: 30, novih: 40, pon: 0 };
      await naPocetnu();
      ok('tempo: višak preko cilja se vidi', /preko cilja/.test(planTekst()));
      // isti višak u auto režimu: daleki datum ispita daje malu kvotu, pa 40 novih jeste višak
      const daleko = new Date(danas.getTime() + 300 * 86400000);
      S().examDate = daleko.getFullYear() + '-' + String(daleko.getMonth() + 1).padStart(2, '0') + '-' + String(daleko.getDate()).padStart(2, '0');
      S().plan = { novih: 10, pon: 10, auto: 1, prio: 0 };
      await naPocetnu();
      ok('tempo: u auto režimu višak snižava sutrašnju kvotu', /preko cilja/.test(planTekst()) && /sutrašnja kvota/i.test(planTekst()));

      // bez datuma ispita auto nema od čega da računa — i to kaže
      S().examDate = null;
      await naPocetnu();
      ok('tempo: auto bez datuma ispita kaže šta fali', planTekst().includes('bez datuma ispita'));
    }
    S().plan = staroPlan; S().examDate = staroDatum; S().day = staroDan;
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

    // ---- 2a) KARTICA UZ PITANJE prikazuje samo odeljak svoje podoblasti ----
    {
      location.hash = '#/p/9502';   // hijerarhija (sub 131) — kartica prvenstva ima 5 odeljaka
      await cekaj(400);
      const q = window.QUIZ.questions.find((x) => x.id === 9502);
      const izbori = [...document.querySelectorAll('#qCard .choice')];
      for (let i = 0; i < q.req; i++) izbori[i].click();
      document.querySelector('#qCard .qActions .primary').click();
      await cekaj(250);
      const btn = document.querySelector('#qCard .explBox .explCardBtn');
      btn.click();
      await cekaj(250);
      const cd = btn.nextElementSibling;
      ok('kartica uz pitanje: prikazan samo odeljak podoblasti (3 od 5 skrivena)',
        cd.querySelectorAll('.kSek').length === 5 && cd.querySelectorAll('.kSek.kSekSkriven').length === 3);
      const cela = cd.querySelector('.kSekNapomena button');
      cela.click(); await cekaj(150);
      ok('kartica uz pitanje: „Prikaži celu" otkriva sve odeljke', cd.querySelectorAll('.kSek.kSekSkriven').length === 0);
      document.querySelector('[data-nav="home"]').click();
      await cekaj(150);
    }

    // ---- 2b) ŠANSA DA POLOŽIŠ i pravilo o simulacijama ----
    {
      const sz = window.__dev.sansaZaProlaz;
      const slot = (p) => Array.from({ length: 41 }, (_, i) => ({ pts: i < 20 ? 3 : 2, p }));
      const sve = sz(slot(1)), nista = sz(slot(0));
      ok('šansa: sve tačno → 100%', Math.round(sve.sansa * 100) === 100);
      ok('šansa: ništa tačno → 0%', Math.round(nista.sansa * 100) === 0);
      ok('šansa: prag je 85% od zbira poena', sve.prag === Math.ceil(0.85 * sve.ukupno));
      // simetričan slučaj: p = 0.5 na svim slotovima daje šansu ispod praga (85% je visoko)
      const pola = sz(slot(0.5));
      ok('šansa: pri 50% po pitanju šansa za prag od 85% je ispod 1%', pola.sansa < 0.01);
      // monotonost: veće p nikad ne daje manju šansu
      ok('šansa: raste sa tačnošću', sz(slot(0.9)).sansa > sz(slot(0.8)).sansa);

      // pravilo: sve četiri stavke stoje tek kad su i broj, i dani, i niz, i procena na mestu
      const staroSims = S().sims;
      const dan = 86400000, sada = Date.now();
      S().sims = [1, 2, 3, 4, 5].map((i) => ({ d: sada - (6 - i) * dan, score: 95, total: 98, passed: true, wrong: [], qs: [] }));
      const sp1 = window.__dev.spremnost();
      ok('pravilo: 5 simulacija u 5 dana sa velikom marginom → broj, dani i niz stoje', sp1.brojOk && sp1.daniOk && sp1.nizOk);
      // sve u ISTOM danu: broj stoji, dani ne
      S().sims = [1, 2, 3, 4, 5].map(() => ({ d: sada, score: 95, total: 98, passed: true, wrong: [], qs: [] }));
      const sp2 = window.__dev.spremnost();
      ok('pravilo: pet simulacija u istom danu ne prolazi uslov razmaka', sp2.brojOk && !sp2.daniOk);
      // poslednja jedva prošla (manje od 5 poena preko praga) → niz pada
      S().sims = [1, 2, 3, 4, 5].map((i) => ({ d: sada - (6 - i) * dan, score: i === 5 ? 85 : 95, total: 98, passed: true, wrong: [], qs: [] }));
      const sp3 = window.__dev.spremnost();
      ok('pravilo: prolaz za dlaku ne računa se u niz', !sp3.nizOk);
      S().sims = staroSims;
    }

    // ---- 3) PRIORITET PO TEŽINI NA ISPITU ----
    // Podoblast 134 (preticanje) nosi 5 pitanja na svakom ispitu, 91 nijedno. Kad su obe
    // neodgovorene, plan bez prioriteta uzima redom po bazi (91 je ranije), a sa prioritetom 134.
    // Ovaj odeljak menja S.q i zato stoji POSLEDNJI — posle njega ništa se ne oslanja na napredak.
    {
      const Q = window.QUIZ.questions;
      const sada = Date.now();
      S().q = {};
      for (const q of Q) if (q.sub !== 91 && q.sub !== 134) S().q[q.id] = { a: 3, w: 0, streak: 3, marked: 0, last: sada };
      const dva2 = (n) => String(n).padStart(2, '0');
      const dn = new Date();
      S().day = { d: dn.getFullYear() + '-' + dva2(dn.getMonth() + 1) + '-' + dva2(dn.getDate()), n: 0, ok: 0, novih: 0, pon: 0 };
      const prviIzPlana = async (prio) => {
        S().plan = { novih: 5, pon: 0, auto: 0, prio };
        document.querySelector('[data-nav="home"]').click();
        await cekaj(150);
        document.getElementById('btnPlanVezbaj').click();
        await cekaj(200);
        const id = +document.getElementById('qCard').dataset.qid;
        document.querySelector('[data-nav="home"]').click();
        await cekaj(120);
        return Q.find((x) => x.id === id).sub;
      };
      ok('prioritet: bez njega plan ide redom po bazi (podoblast 91)', (await prviIzPlana(0)) === 91);
      ok('prioritet: sa njim plan kreće od podoblasti koju ispit najviše nosi (134)', (await prviIzPlana(1)) === 134);
    }

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
