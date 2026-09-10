// PROVERA BODOVANJA — pokreće se u konzoli pregledača na http://localhost:8137
// (ili je pokreće alat kroz ugrađeni pregledač pre svake objave).
// Koristi ZASEBAN test-profil bez povezanog fajla za rezervu i bez drugih tabova aplikacije.
// 1. proveraBodovanja(); posle reload-a ponovo učitaj ovaj fajl.
// 2. proveraBodovanja2(); sačuvaj ispis konzole (Preserve log), aplikacija se ponovo učitava.
// 3. Ponovo učitaj fajl i pozovi proveraBodovanjaPotvrdi() da proveriš povratak i ukloniš kopiju.
// Posle prekida: proveraBodovanjaVrati(), pa posle reload-a proveraBodovanjaPotvrdi().
// Kopija ostaje u sessionStorage dok povratak nije potvrđen; ne zatvaraj test-tab pre toga.
function proveraStranica() {
  // Ostaje isto i kada se skripta ponovo nalepi u isti dokument.
  if (!window.__proveraStranica) window.__proveraStranica = { id: crypto.randomUUID(), radi: false };
  return window.__proveraStranica;
}

function proveraKontekst(obavezan = true) {
  const raw = sessionStorage.getItem('provera.kontekst');
  if (raw === null) {
    if (obavezan) throw Error('Nema važećeg konteksta: prvo pokreni proveraBodovanja().');
    return null;
  }
  let k;
  try { k = JSON.parse(raw); } catch (_) { /* odbij oštećenu kopiju */ }
  if (!k || k.v !== 1 || k.origin !== location.origin || typeof k.stranica !== 'string' || !k.stranica ||
      !['pripremljen', 'radi', 'vracanje', 'vracen'].includes(k.faza) ||
      !k.zapisi || !['vozackiA.v1', 'vozackiA.sim'].every((key) =>
        Object.prototype.hasOwnProperty.call(k.zapisi, key) && (k.zapisi[key] === null || typeof k.zapisi[key] === 'string'))) {
    throw Error('Nevažeći kontekst provere. Sačuvaj sessionStorage kopiju za ručni oporavak; nije menjana.');
  }
  return k;
}

function proveraUpisiKontekst(k) {
  const raw = JSON.stringify(k);
  sessionStorage.setItem('provera.kontekst', raw);
  if (sessionStorage.getItem('provera.kontekst') !== raw) throw Error('Rezervna kopija konteksta nije potvrđena.');
}

function proveraZapisiVraceni(k) {
  return ['vozackiA.v1', 'vozackiA.sim'].every((key) => localStorage.getItem(key) === k.zapisi[key]);
}

async function proveraBezFajla() {
  if (!window.__dev || typeof window.__dev.proveraBezFajla !== 'function') {
    throw Error('Nema bezbednog __dev pristupa. Učitaj novu aplikaciju na localhost.');
  }
  await window.__dev.proveraBezFajla();
}

function proveraOsvezi() {
  // Testni ispit može aktivirati app-ov beforeunload dijalog. Reload je deo oporavka.
  window.addEventListener('beforeunload', (e) => e.stopImmediatePropagation(), { capture: true, once: true });
  location.reload();
}

async function proveraBodovanja() {
  await proveraBezFajla();
  if (proveraKontekst(false)) throw Error('Kontekst već postoji. Nastavi drugu fazu ili pokreni proveraBodovanjaVrati(); originalna kopija ostaje.');
  if (sessionStorage.getItem('provera.backup') !== null || sessionStorage.getItem('provera.backupSim') !== null) {
    throw Error('Postoji stara rezervna kopija provere. Sačuvaj je za ručni oporavak pre novog testa.');
  }
  const k = { v: 1, origin: location.origin, stranica: proveraStranica().id, faza: 'pripremljen', zapisi: {} };
  for (const key of ['vozackiA.v1', 'vozackiA.sim']) k.zapisi[key] = localStorage.getItem(key);
  proveraUpisiKontekst(k); // Oba originala su potvrđena PRE prve izmene.
  localStorage.removeItem('vozackiA.v1');
  localStorage.removeItem('vozackiA.sim');
  // replaceState ne šalje hashchange koji bi ponovo sačuvao stari ispit pre reload-a.
  history.replaceState(null, '', '#/');
  proveraOsvezi();
  return 'POSLE OSVEŽAVANJA ponovo učitaj skriptu i pokreni proveraBodovanja2().';
}

async function proveraBodovanja2() {
  let k = proveraKontekst(); // Bez konteksta nema ni dodira sa aplikacijom.
  if (k.faza !== 'pripremljen') throw Error('Provera je već pokrenuta ili prekinuta. Oporavak: proveraBodovanjaVrati().');
  if (k.stranica === proveraStranica().id) throw Error('Prvo osveži stranicu, pa ponovo učitaj skriptu.');
  await proveraBezFajla();
  k = proveraKontekst(); // Ponovna provera posle async inicijalizacije sprečava dva starta.
  if (k.faza !== 'pripremljen' || proveraStranica().radi) throw Error('Provera je već pokrenuta.');
  k.faza = 'radi';
  proveraUpisiKontekst(k);
  proveraStranica().radi = true;
  try {
    return await proveraBodovanjaTestovi();
  } finally {
    proveraStranica().radi = false;
    await proveraBodovanjaVrati();
  }
}

async function proveraBodovanjaVrati() {
  const k = proveraKontekst();
  if (proveraStranica().radi) throw Error('Provera još radi. Za oporavak je prvo prekini osvežavanjem.');
  k.faza = 'vracanje';
  k.stranica = proveraStranica().id;
  proveraUpisiKontekst(k);
  for (const key of ['vozackiA.v1', 'vozackiA.sim']) {
    if (k.zapisi[key] === null) localStorage.removeItem(key);
    else localStorage.setItem(key, k.zapisi[key]);
  }
  if (!proveraZapisiVraceni(k)) throw Error('Vraćanje nije potvrđeno. Kopija ostaje; ponovi proveraBodovanjaVrati().');
  k.faza = 'vracen';
  proveraUpisiKontekst(k);
  console.log('Zapisi su vraćeni; sledi reload. Posle učitavanja skripte: proveraBodovanjaPotvrdi().');
  proveraOsvezi(); // Uklanja sintetički S i njegove tajmere iz živog dokumenta.
  return 'Vraćeno u skladište; potvrdi posle osvežavanja.';
}

async function proveraBodovanjaPotvrdi() {
  const k = proveraKontekst();
  if (k.faza !== 'vracen' || k.stranica === proveraStranica().id) throw Error('Prvo vrati podatke i osveži stranicu.');
  if (!window.__dev || typeof window.__dev.proveraPotvrdiPovratak !== 'function') {
    throw Error('Nema potvrde učitavanja nove aplikacije; kopija ostaje.');
  }
  await window.__dev.proveraPotvrdiPovratak(k.zapisi);
  if (JSON.stringify(proveraKontekst()) !== JSON.stringify(k)) throw Error('Kontekst je promenjen tokom potvrde; kopija ostaje.');
  sessionStorage.removeItem('provera.kontekst');
  return 'Povratak oba zapisa potvrđen posle reload-a; rezervna kopija provere je uklonjena.';
}

async function proveraBodovanjaTestovi() {
  if (!proveraStranica().radi || proveraKontekst().faza !== 'radi') throw Error('Testovi zahtevaju proveraBodovanja2() i važeći kontekst.');
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
  const el2 = (id) => document.getElementById(id);
  const klikni = (tekst, koren) => {
    const b = [...(koren || document).querySelectorAll('button')].find((x) => x.textContent.includes(tekst));
    if (b) b.click();
    return !!b;
  };

  // Javni proveraBodovanja2() poseduje try/finally za povratak i reload čak i pri grešci.
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
      // testovi menjaju datum/režim DIREKTNO (mimo UI-ja), pa moraju i sami da bace zamrznutu
      // dnevnu auto kvotu — UI to radi kroz ponistiAutoKvotu()
      const svezaKvota = () => { if (S().day) { delete S().day.autoN; delete S().day.autoP; } };
      S().examDate = za10.getFullYear() + '-' + String(za10.getMonth() + 1).padStart(2, '0') + '-' + String(za10.getDate()).padStart(2, '0');
      S().day = { d: danasStr, n: 0, ok: 0, novih: 0, pon: 0 };

      // auto: kvota se računa iz neodgovorenih i dana, ne iz upisanog broja
      S().plan = { novih: 5, pon: 5, auto: 1, prio: 0 };
      await naPocetnu();
      const neodg = 1327 - Object.keys(S().q).filter((id) => S().q[id].a).length;
      const ocekNovih = Math.max(1, Math.ceil(neodg / Math.max(1, 10 - Math.min(7, Math.floor(10 / 3)))));
      ok('tempo: auto kvota se računa iz gradiva i dana (' + ocekNovih + ' novih)', planTekst().includes('Nova pitanja: 0 / ' + ocekNovih));
      ok('tempo: auto presuda kaže da stižeš', planTekst().includes('stižeš'));
      // ZAMRZNUTA kvota: odgovor na novo pitanje NE sme da smanji današnju metu.
      // Proba ide na POSLEDNJE pitanje baze (odeljak 1 koristi prva tri) i briše se za sobom.
      ok('tempo: kvota je zamrznuta u S.day', S().day && S().day.autoN === ocekNovih);
      const probno = window.QUIZ.questions[window.QUIZ.questions.length - 1].id;
      window.__dev.record(probno, true);
      await naPocetnu();
      ok('tempo: meta ne beži unazad dok radiš', planTekst().includes('/ ' + ocekNovih));
      delete S().q[probno];
      S().day = { d: danasStr, n: 0, ok: 0, novih: 0, pon: 0, autoN: S().day.autoN, autoP: S().day.autoP };

      // fiksni, premali tempo: presuda mora da kaže da NE stižeš gradivo
      S().plan = { novih: 2, pon: 30, auto: 0, prio: 0 };
      await naPocetnu();
      ok('tempo: premali tempo se prijavljuje kao prepreka', planTekst().includes('NE stižeš gradivo') && planTekst().includes('To jeste prepreka'));
      ok('tempo: uz prepreku stoji i dugme koje diže tempo', !!document.getElementById('btnLostTempo'));

      S().plan = { novih: null, pon: 30, auto: 0, prio: 0 };
      await naPocetnu();
      ok('tempo: samo ponavljanje uz neotvorena pitanja ne obećava da stižeš gradivo', planTekst().includes('NE stižeš gradivo') && !planTekst().includes('Ovim tempom stižeš:'));
      ok('tempo: plan samo za ponavljanje nudi podizanje tempa', !!document.getElementById('btnLostTempo'));

      // višak preko cilja se vidi; u auto režimu uz to kaže i da snižava sutrašnju kvotu
      S().plan = { novih: 10, pon: 10, auto: 0, prio: 0 };
      S().day = { d: danasStr, n: 40, ok: 30, novih: 40, pon: 0 };
      await naPocetnu();
      ok('tempo: višak preko cilja se vidi', /preko cilja/.test(planTekst()));
      // isti višak u auto režimu: daleki datum ispita daje malu kvotu, pa 40 novih jeste višak
      const daleko = new Date(danas.getTime() + 300 * 86400000);
      S().examDate = daleko.getFullYear() + '-' + String(daleko.getMonth() + 1).padStart(2, '0') + '-' + String(daleko.getDate()).padStart(2, '0');
      S().plan = { novih: 10, pon: 10, auto: 1, prio: 0 };
      svezaKvota();
      await naPocetnu();
      ok('tempo: u auto režimu višak snižava sutrašnju kvotu', /preko cilja/.test(planTekst()) && /sutrašnja kvota/i.test(planTekst()));

      // bez datuma ispita auto nema od čega da računa — i to kaže
      S().examDate = null;
      await naPocetnu();
      ok('tempo: auto bez datuma ispita kaže šta fali', planTekst().includes('bez datuma ispita'));

      // ---- 0c) RUBNI SLUČAJEVI DATUMA ----
      const sazetak = () => document.getElementById('homeSummary').textContent.replace(/\s+/g, ' ');
      const prosli = new Date(danas.getTime() - 3 * 86400000);
      S().examDate = prosli.getFullYear() + '-' + dva(prosli.getMonth() + 1) + '-' + dva(prosli.getDate());
      S().plan = { novih: null, pon: null, auto: 1, prio: 0 };
      svezaKvota();
      await naPocetnu();
      ok('datum: prošao datum se kaže naglas (auto)', sazetak().includes('je prošao') && !planTekst().includes('bez datuma'));
      S().plan = { novih: 20, pon: 20, auto: 0, prio: 0 };
      await naPocetnu();
      ok('datum: prošao datum se kaže naglas i u fiksnom režimu', sazetak().includes('je prošao'));
      S().examDate = danasStr;   // ispit je DANAS
      S().plan = { novih: null, pon: null, auto: 1, prio: 0 };
      await naPocetnu();
      ok('datum: na sam dan ispita nema pogrešne poruke o datumu', !planTekst().includes('bez datuma') && !sazetak().includes('je prošao'));
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

    // ---- 1e) PLAN-ZASTAVICE i BROJAČ PONAVLJANJA ----
    {
      // prio preživljava normalizaciju (učitavanje/uvoz)
      const NS = window.__dev.normalizeState;
      const n1 = NS({ q: {}, plan: { prio: 1 } });
      ok('plan: prio sam za sebe preživljava učitavanje', !!(n1.plan && n1.plan.prio === 1));
      // ručni upis brojeva NE gasi prekidače (spread u svim upisima)
      const staroPlanZ = S().plan;
      S().plan = { novih: 5, pon: 5, auto: 0, prio: 1 };
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
      document.getElementById('btnPodesavanja').click(); await cekaj(150);
      el2('planNovih').value = '7'; el2('planPon').value = '7';
      document.getElementById('btnPlanSave').click(); await cekaj(150);
      ok('plan: „Sačuvaj cilj" čuva prio prekidač', S().plan.prio === 1 && S().plan.novih === 7);
      S().plan = staroPlanZ;

      // brojač ponavljanja: prelistavanje utvrđenog pitanja NE puni kvotu
      const utvrdjeno = window.QUIZ.questions.find((q) => S().q[q.id] && S().q[q.id].streak >= 3 && !window.__dev.inQueue(q.id));
      if (utvrdjeno) {
        const preP = (S().day && S().day.pon) || 0;
        window.__dev.record(utvrdjeno.id, true);
        ok('brojač: prelistavanje utvrđenog ne puni kvotu ponavljanja', ((S().day && S().day.pon) || 0) === preP);
      } else {
        ok('brojač: prelistavanje utvrđenog ne puni kvotu ponavljanja (nema utvrđenog za probu)', true);
      }
    }

    // ---- 1f) ISTEKAO ISPIT BEZ ODGOVORA SE ODBACUJE ----
    {
      const brojSimova = S().sims.length;
      window.__dev.proveraPostaviIspit({
        v: 1, d: Date.now() - 60000, i: 0, r: 0,
        qs: window.QUIZ.questions.slice(0, 41).map((q) => ({ id: q.id, o: q.ch.map((c) => c.id), c: [], m: 0 })),
      });
      location.hash = '#/sim';
      await cekaj(400);
      ok('ispit: istekao BEZ odgovora se odbacuje, ne upisuje pad', S().sims.length === brojSimova && localStorage.getItem('vozackiA.sim') === null);
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
    }

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

    // ---- 2ab) ATLAS ZNAKOVA: slika i značenje se IZVODE iz baze, ne prepisuju ----
    {
      const EXA = (window.EXPLAIN && window.EXPLAIN.atlas) || {};
      const grupe = Object.keys(EXA);
      const poId = new Map(window.QUIZ.questions.map((q) => [q.id, q]));
      let uk = 0, lose = 0;
      for (const k of grupe) {
        if (!window.EXPLAIN.cards[k]) lose++;
        for (const id of EXA[k]) {
          uk++;
          const q = poId.get(id);
          // svaka stavka je BROJ pitanja sa slikom čiji tačan odgovor JESTE značenje znaka;
          // tekst se ne čuva u explanations.js nego se čita iz baze (jedan izvor istine)
          const tacno = q && q.ch.filter((c) => c.ok).map((c) => c.t.l.trim()).join(' + ');
          if (!q || !q.img || !tacno) lose++;
        }
      }
      ok('atlas: svaka slika ima pitanje sa slikom i tačan odgovor kao značenje (' + uk + ' slika)', uk > 250 && lose === 0);
      ok('atlas: u explanations.js stoje SAMO brojevi (tekst se čita iz baze)',
        grupe.every((k) => EXA[k].every((x) => typeof x === 'number')));
      ok('atlas: nijedna grupa nije sitna niti bez svoje kartice',
        grupe.length >= 10 && grupe.every((k) => window.EXPLAIN.cards[k] && EXA[k].length >= 3));

      // uz pitanje: kartica dobija podkarticu sa slikama, NA VRHU i sklopljenu
      location.hash = '#/p/10783';   // opasna krivina nalevo (sub 157)
      await cekaj(400);
      const q2 = window.QUIZ.questions.find((x) => x.id === 10783);
      const izb = [...document.querySelectorAll('#qCard .choice')];
      for (let i = 0; i < q2.req; i++) izb[i].click();
      document.querySelector('#qCard .qActions .primary').click();
      await cekaj(250);
      const b2 = document.querySelector('#qCard .explBox .explCardBtn');
      b2.click(); await cekaj(250);
      const cd2 = b2.nextElementSibling;
      const pod = cd2.querySelector('.kPod');
      ok('atlas: podkartica sa slikama stoji na VRHU kartice', !!pod && cd2.firstChild === pod);
      const ab = pod && pod.querySelector('button');
      ok('atlas: sklopljena je dok se ne zatraži', !!ab && ab.getAttribute('aria-expanded') === 'false'
        && cd2.querySelectorAll('.znCell').length === 0);
      ab.click(); await cekaj(300);
      ok('atlas: otvaranje pravi sve slike grupe (' + EXA['znakovi-opasnosti'].length + ')',
        cd2.querySelectorAll('.znCell').length === EXA['znakovi-opasnosti'].length);
      ok('atlas: svaka slika je dugme koje otvara uvećanje',
        cd2.querySelectorAll('.znCell .qImgBtn img.qImg').length === EXA['znakovi-opasnosti'].length);
      document.querySelector('[data-nav="home"]').click();
      await cekaj(150);
    }

    // ---- 2ac) TEME UNUTAR KARTICE (kPodH -> sklopivi odeljak) ----
    {
      const sveKartice = Object.values(window.EXPLAIN.cards);
      const saTemama = sveKartice.filter((c) => /kPodNaslov/.test(c.h.l));
      ok('teme: velike kartice su podeljene na teme (' + saTemama.length + ' kartica)', saTemama.length >= 10);
      ok('teme: naslov tema postoji i u ćirilici',
        saTemama.every((c) => (c.h.l.match(/kPodNaslov/g) || []).length === (c.h.c.match(/kPodNaslov/g) || []).length));

      // u pojmovniku: kPodH postaje dugme + sklopljeno telo
      document.querySelector('[data-nav="home"]').click(); await cekaj(200);
      const bp = el2('btnPojmovnik');
      if (bp.getAttribute('aria-expanded') !== 'true') { bp.click(); await cekaj(250); }
      const bk = document.querySelector('[data-poj="znakovi-opasnosti"]');
      bk.click(); await cekaj(300);
      const cd3 = bk.nextElementSibling;
      const teme = [...cd3.querySelectorAll('.kPod')];
      ok('teme: nijedan kPodH ne ostaje neoživljen', cd3.querySelectorAll('.kPodH').length === 0);
      ok('teme: svaka tema ima dugme sa imenom i sklopljeno telo', teme.length >= 5
        && teme.every((p) => p.querySelector('button') && p.querySelector('button').textContent.trim().length > 2
          && p.querySelector('.kPodTelo') && p.querySelector('.kPodTelo').style.display === 'none'));
      const preVisina = cd3.getBoundingClientRect().height;
      teme[1].querySelector('button').click(); await cekaj(250);
      ok('teme: otvaranje teme pokazuje njen sadržaj', cd3.getBoundingClientRect().height > preVisina + 100);
      bk.click(); await cekaj(150);
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
    }

    // ---- 2ac2) SITUACIJE SA ISPITA: slikovna pitanja koja nisu znakovi ----
    {
      const SIT = window.EXPLAIN.situacije || {};
      const A3 = window.EXPLAIN.atlas || {};
      const uAtlasu = new Set([].concat(...Object.values(A3)));
      const poId3 = new Map(window.QUIZ.questions.map((q) => [q.id, q]));
      let uk3 = 0, lose3 = 0;
      for (const [k, lista] of Object.entries(SIT)) {
        if (!window.EXPLAIN.cards[k]) lose3++;
        for (const id of lista) {
          uk3++;
          const q = poId3.get(id);
          // mora biti pitanje SA SLIKOM, van atlasa (atlas su znakovi), sa tačnim odgovorom
          if (!q || !q.img || uAtlasu.has(id) || !q.ch.some((c) => c.ok)) lose3++;
        }
      }
      ok('situacije: svaka slika je pitanje sa slikom van atlasa (' + uk3 + ' slika)', uk3 > 300 && lose3 === 0);

      // u pojmovniku: podkartica stoji i puni se tek kad se otvori
      document.querySelector('[data-nav="home"]').click(); await cekaj(200);
      const bp3 = el2('btnPojmovnik');
      if (bp3.getAttribute('aria-expanded') !== 'true') { bp3.click(); await cekaj(250); }
      const bk3 = document.querySelector('[data-poj="preticanje"]');
      bk3.click(); await cekaj(300);
      const cd5 = bk3.nextElementSibling;
      const dugmeS = [...cd5.querySelectorAll('.kPod > button')].find((x) => /Situacije|Ситуације/.test(x.textContent));
      ok('situacije: kartica ima podkarticu sa slikama sa ispita', !!dugmeS
        && cd5.querySelectorAll('.znCell').length === 0);
      dugmeS.click(); await cekaj(350);
      const cel = [...cd5.querySelectorAll('.znCell')];
      ok('situacije: otvaranje pravi sve slike grupe (' + SIT['preticanje'].length + ')',
        cel.length === SIT['preticanje'].length);
      ok('situacije: uz svaku sliku stoji i pitanje i tačan odgovor',
        cel.every((c) => c.querySelector('span i') && c.querySelector('span b')
          && c.querySelector('span b').textContent.trim().length > 0));
      bk3.click(); await cekaj(120);
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
    }

    // ---- 2ad) ZAMKE: netačan odgovor je značenje DRUGOG znaka ----
    {
      const Z = window.EXPLAIN.zamke || {};
      const A2 = window.EXPLAIN.atlas || {};
      const znac = new Map();
      for (const l of Object.values(A2)) for (const id of l) {
        const q0 = window.QUIZ.questions.find((x) => x.id === id);
        if (q0) znac.set(id, q0.ch.filter((c) => c.ok).map((c) => c.t.l.trim()).join(' + '));
      }
      const poId2 = new Map(window.QUIZ.questions.map((q) => [q.id, q]));
      let veza = 0, lose = 0;
      for (const [qid, lista] of Object.entries(Z)) {
        const q = poId2.get(Number(qid));
        const netacni = q ? q.ch.filter((c) => !c.ok).map((c) => c.t.l.trim()) : [];
        const tacni = q ? q.ch.filter((c) => c.ok).map((c) => c.t.l.trim()) : [];
        for (const id of lista) {
          veza++;
          const z = znac.get(id);
          // svaka veza mora da pokazuje na DRUGI znak čije je značenje baš jedan od NETAČNIH
          // ponuđenih odgovora — nikad tačan odgovor i nikad samo pitanje
          if (!z || id === Number(qid) || !netacni.includes(z) || tacni.includes(z)) lose++;
        }
      }
      ok('zamke: svaka veza je drugi znak čije je značenje netačan ponuđen odgovor (' + veza + ')', veza > 250 && lose === 0);

      // uz pitanje: traka sa slikama, posle odgovora
      location.hash = '#/p/10825';   // pruga SA branicima — mamci su „bez branika" i „tramvajska"
      await cekaj(400);
      const q3 = window.QUIZ.questions.find((x) => x.id === 10825);
      const izb3 = [...document.querySelectorAll('#qCard .choice')];
      for (let i = 0; i < q3.req; i++) izb3[i].click();
      document.querySelector('#qCard .qActions .primary').click();
      await cekaj(300);
      const zb = document.querySelector('#qCard .explBox .zamkaBox');
      ok('zamke: traka stoji uz odgovoreno pitanje', !!zb && zb.querySelectorAll('.znCell').length === Z[10825].length);
      ok('zamke: svaka sličica je dugme za uvećanje',
        !!zb && zb.querySelectorAll('.znCell .qImgBtn img.qImg').length === Z[10825].length);
      ok('zamke: natpis nikad ne curi kao markup u aria-label',
        !!zb && [...zb.querySelectorAll('.qImgBtn')].every((x) => !/[<>]/.test(x.getAttribute('aria-label') || '')));
      document.querySelector('[data-nav="home"]').click();
      await cekaj(150);
    }

    // ---- 2ae) I SLIKA I REČ, i uvećanje crteža ----
    {
      // uz sličicu znaka u tabeli stoji i opis rečima (Milan 07.09: „ne mora UMESTO")
      const ko = window.EXPLAIN.cards['znakovi-opasnosti'].h.l;
      const slika = (ko.match(/znTdImg/g) || []).length;
      const rec = (ko.match(/znOpis/g) || []).length;
      ok('i slika i reč: svaka sličica u tabeli ima i opis rečima (' + slika + ')', slika >= 35 && slika === rec);

      // crtež u kartici je dugme i otvara uvećanje kao fotografija
      document.querySelector('[data-nav="home"]').click(); await cekaj(200);
      const bp2 = el2('btnPojmovnik');
      if (bp2.getAttribute('aria-expanded') !== 'true') { bp2.click(); await cekaj(250); }
      const bk2 = document.querySelector('[data-poj="brzine"]');
      bk2.click(); await cekaj(300);
      const cd4 = bk2.nextElementSibling;
      [...cd4.querySelectorAll('.kPod > button')].forEach((x) => x.click());
      await cekaj(250);
      const crt = cd4.querySelector('svg[data-zum]');
      ok('crtež: svaki crtež u kartici je dugme (uloga, fokus, opis)',
        !!crt && crt.getAttribute('role') === 'button' && crt.getAttribute('tabindex') === '0'
        && /Uveć|Увећ/.test(crt.getAttribute('aria-label') || ''));
      crt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await cekaj(350);
      const zz = document.getElementById('imgZoom');
      const zim = zz && zz.querySelector('img');
      ok('crtež: dodir otvara uvećanje preko celog ekrana', !!zim && zim.className === 'crtezZum');
      ok('crtež: u uvećanju je isti crtež, sa upisanom bojom (radi i u tamnoj temi)',
        !!zim && zim.src.startsWith('data:image/svg+xml') && decodeURIComponent(zim.src).includes('color:'));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await cekaj(200);
      ok('crtež: Escape zatvara uvećanje', !document.getElementById('imgZoom'));
      bk2.click(); await cekaj(120);
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
    }

    // ---- 2af) ČITLJIVOST CRTEŽA I ANIMACIJE ----
    // Stvarno ograniči probno telo na najviše 306px, pa meri SVG transformaciju.
    // Odnos širina pogrešno umanjuje već ograničen SVG i zanemaruje fiksnu visinu.
    // Prave prozore od 320/375px zasebno proverava tools/tests/drawing.browser.js.
    {
      const presek = (a, b) => {
        const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        return (w <= 0 || h <= 0) ? 0 : (w * h) / Math.min(a.width * a.height, b.width * b.height);
      };
      document.querySelector('[data-nav="home"]').click(); await cekaj(200);
      const bp4 = el2('btnPojmovnik');
      if (bp4.getAttribute('aria-expanded') !== 'true') { bp4.click(); await cekaj(250); }
      let svgUk = 0, sitnih = 0, sudara = 0, prelivi = 0, animUk = 0, animBezPravila = 0, najmanji = 99;
      for (const b of [...document.querySelectorAll('[data-poj]')]) {
        b.click(); await cekaj(140);
        const cd = b.nextElementSibling;
        for (let i = 0; i < 4; i++) {
          const z = [...cd.querySelectorAll('.kPod > button')].filter((x) => x.getAttribute('aria-expanded') === 'false'
            && !/Slike iz baze|Слике из базе|Situacije|Ситуације/.test(x.textContent));
          if (!z.length) break;
          z.forEach((x) => x.click());
          await cekaj(160);
        }
        const stilPre = cd.style.cssText;
        cd.style.width = Math.min(306, cd.getBoundingClientRect().width) + 'px';
        cd.style.maxWidth = 'none';
        try {
          for (const s of cd.querySelectorAll('svg')) {
            const r = s.getBoundingClientRect();
            const vb = (s.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
            if (!r.width || vb.length !== 4 || !vb[2]) continue;
            svgUk++;
            for (const el of s.querySelectorAll('[class*="anim"]')) {
              animUk++;
              if (getComputedStyle(el).animationName === 'none') animBezPravila++;
            }
            const txt = [...s.querySelectorAll('text')].filter((x) => x.textContent.trim());
            if (!txt.length) continue;
            const bb = txt.map((x) => { try { return x.getBBox(); } catch (e) { return null; } });
            for (let a = 0; a < bb.length; a++) for (let c = a + 1; c < bb.length; c++)
              if (bb[a] && bb[c] && bb[a].width && bb[c].width && presek(bb[a], bb[c]) > 0.15) sudara++;
            prelivi += bb.filter((x) => x && x.width > 0 && (x.x < vb[0] - 0.5 || x.x + x.width > vb[0] + vb[2] + 0.5)).length;
            for (const x of txt) {
              const m = x.getScreenCTM();
              const px = parseFloat(getComputedStyle(x).fontSize) * Math.hypot(m.c, m.d);
              najmanji = Math.min(najmanji, px);
              if (px < 10) sitnih++;
            }
          }
        } finally { cd.style.cssText = stilPre; }
        b.click(); await cekaj(60);
      }
      ok('crteži: nijedan tekst nije ispod 10px u probnom telu do 306px (' + svgUk + ' crteža, najmanji ' + Math.round(najmanji * 10) / 10 + 'px)', svgUk > 150 && sitnih === 0);
      ok('crteži: nijedan natpis se ne preklapa sa drugim', sudara === 0);
      ok('crteži: nijedan natpis ne izlazi iz okvira crteža', prelivi === 0);
      ok('animacije: svaka anim klasa u karticama ima svoje pravilo u style.css (' + animUk + ')', animUk > 20 && animBezPravila === 0);
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
    }

    // ---- 2ag) DNEVNIK PO DANIMA i tačnost u dnevnom cilju ----
    {
      // arhiviranje: kad se pređe ponoć, jučerašnji dan mora da završi u S.dani
      const S0 = S();
      const staroDani = S0.dani, staroDay = S0.day;
      const juce = new Date(); juce.setDate(juce.getDate() - 1);
      const dva2 = (n) => String(n).padStart(2, '0');
      const juceStr = juce.getFullYear() + '-' + dva2(juce.getMonth() + 1) + '-' + dva2(juce.getDate());
      S0.dani = [];
      S0.day = { d: juceStr, n: 7, ok: 5, novih: 4, pon: 3 };
      // bilo koji odgovor danas mora da zatvori jučerašnji dan
      const qq = window.QUIZ.questions[window.QUIZ.questions.length - 2];
      window.__dev.record(qq.id, true);
      const arh = (S().dani || []).find((x) => x.d === juceStr);
      ok('dnevnik: prelazak ponoći arhivira jučerašnji dan', !!arh && arh.n === 7 && arh.ok === 5 && arh.novih === 4 && arh.pon === 3);
      ok('dnevnik: današnji dan počinje od nule', S().day && S().day.d !== juceStr && S().day.n === 1);
      // normalizacija: smeće u dnevniku se odbacuje, ispravni redovi ostaju
      const n2 = window.__dev.normalizeState({ q: {}, dani: [{ d: '2026-09-01', n: 5, ok: 3, novih: 2, pon: 1 }, { d: 'juče', n: 9 }, 'smeće'] });
      ok('dnevnik: normalizacija čuva ispravne redove i odbacuje smeće',
        Array.isArray(n2.dani) && n2.dani.length === 1 && n2.dani[0].d === '2026-09-01' && n2.dani[0].ok === 3);

      // prikaz: tačnost danas stoji uz dnevni cilj
      S().plan = { novih: 10, pon: 10, auto: 0, prio: 0 };
      document.querySelector('[data-nav="home"]').click(); await cekaj(200);
      ok('dnevnik: tačnost danas stoji uz dnevni cilj', /Tačnost danas|Тачност данас/.test(planTekst()));

      // strana „po danima": crtež i tabela
      S().dani = [
        { d: '2026-09-01', n: 40, ok: 26, novih: 30, pon: 10 },
        { d: '2026-09-02', n: 52, ok: 44, novih: 35, pon: 17 },
      ];
      location.hash = '#/stats'; await cekaj(400);
      const bd = el2('btnDani');
      ok('dnevnik: statistika ima stranu „po danima"', !!bd);
      bd.click(); await cekaj(350);
      const telo = el2('daniTelo');
      const svg = telo.querySelector('svg');
      ok('dnevnik: crta se trend sa stubićem po danu', !!svg && svg.querySelectorAll('rect').length === 3);
      ok('dnevnik: tabela ima red po danu', telo.querySelectorAll('tbody tr').length === 3);
      // isto pravilo čitljivosti kao za crteže pojmovnika
      if (svg) {
        const stilPre = telo.style.cssText;
        telo.style.width = Math.min(306, telo.getBoundingClientRect().width) + 'px';
        telo.style.maxWidth = 'none';
        try {
          const najm = Math.min(...[...svg.querySelectorAll('text')].map((x) => {
            const m = x.getScreenCTM();
            return parseFloat(getComputedStyle(x).fontSize) * Math.hypot(m.c, m.d);
          }));
          ok('dnevnik: tekst u trendu nije ispod 10px u probnom telu do 306px (' + Math.round(najm * 10) / 10 + 'px)', najm >= 10);
        } finally { telo.style.cssText = stilPre; }
      }
      S().dani = staroDani; S().day = staroDay;
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
    }

    // ---- 2ah) ŽIVOTNI CIKLUS DNEVNOG CILJA ----
    // Tri greške koje je Milan prijavio 07.09.2026, svaka sa svojom proverom.
    {
      const S1 = S();
      const dva3 = (n) => String(n).padStart(2, '0');
      const za = new Date(); za.setDate(za.getDate() + 40);
      S1.examDate = za.getFullYear() + '-' + dva3(za.getMonth() + 1) + '-' + dva3(za.getDate());
      S1.plan = { novih: 60, pon: 60, auto: 1, prio: 0 };
      if (S1.day) { delete S1.day.autoN; delete S1.day.autoP; }   // pomoćnik svezaKvota živi u drugom bloku
      document.querySelector('[data-nav="home"]').click(); await cekaj(250);
      const otvoriPod = async () => {
        const telo = el2('podesavanjaTelo');
        if (telo && telo.style.display === 'none') { el2('btnPodesavanja').click(); await cekaj(200); }
      };
      await otvoriPod();
      // (1) u auto režimu ručna polja NE primaju broj i to se vidi
      ok('cilj: auto režim zaključava ručna polja i dugmad',
        el2('planNovih').disabled && el2('planPon').disabled && el2('btnPlanSave').disabled && el2('btnPlanPredlog').disabled);
      ok('cilj: piše ZAŠTO su zaključana', /ne koriste|не користе/.test(el2('podesavanjaTelo').textContent));

      // (2) promena datuma NE zatvara podešavanja, a kvota se prilagodi
      const preTekst = planTekst();
      const za15 = new Date(); za15.setDate(za15.getDate() + 15);
      const inp3 = el2('examDate');
      inp3.value = za15.getFullYear() + '-' + dva3(za15.getMonth() + 1) + '-' + dva3(za15.getDate());
      inp3.dispatchEvent(new Event('change', { bubbles: true }));
      await cekaj(350);
      ok('cilj: promena datuma ne zatvara podešavanja', el2('podesavanjaTelo').style.display !== 'none');
      ok('cilj: promena datuma menja auto kvotu', planTekst() !== preTekst);

      // (3) kad se auto ugasi, ručni brojevi ODMAH važe i polja se otključavaju
      await otvoriPod();
      el2('btnPlanAuto').click(); await cekaj(350);
      await otvoriPod();
      ok('cilj: gašenje auta otključava polja', !el2('planNovih').disabled && !el2('btnPlanSave').disabled);
      ok('cilj: posle gašenja auta važe ručni brojevi (60)', planTekst().includes('/ 60'));

      // ručni upis se ODMAH vidi gore
      el2('planNovih').value = '25'; el2('planPon').value = '35';
      el2('btnPlanSave').click(); await cekaj(350);
      ok('cilj: ručni upis se odmah vidi u dnevnom cilju', planTekst().includes('/ 25') && planTekst().includes('/ 35'));
      ok('cilj: podešavanja ostaju otvorena i posle čuvanja', el2('podesavanjaTelo').style.display !== 'none');
      document.querySelector('[data-nav="home"]').click(); await cekaj(150);
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

      ok('model: nepoznata verovatnoća se ne pretvara u nulu', sz([{ pts: 1, p: null }]) === null);
      const staroQ = S().q;
      try {
        const Q = window.QUIZ.questions;
        const usko150 = Q.filter((q) => q.sub === 159).concat(Q.filter((q) => q.sub === 160)).slice(0, 150);
        for (const uzorak of [Q.slice(0, 30), usko150]) {
          S().q = Object.fromEntries(uzorak.map((q) => [q.id, { a: 1, w: 0 }]));
          const sp = window.__dev.spremnost();
          ok('model: ' + uzorak.length + ' tačnih iz uskog dela baze ne daje procenu za ostatak', sp.sansa === null && !sp.sansaOk && sp.nedostaje === Q.length - uzorak.length);
        }
      } finally { S().q = staroQ; }

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

      // ---- 3b) SVE GRADIVO OTVORENO: presuda sudi samo ponavljanjima ----
      {
        const juce = Date.now() - 26 * 3600 * 1000;
        Q.forEach((q, i) => { S().q[q.id] = i < 700 ? { a: 2, w: 1, streak: 1, marked: 0, due: Date.now() - 1000, last: juce } : { a: 3, w: 0, streak: 3, marked: 0, last: juce }; });
        const za3 = new Date(Date.now() + 3 * 86400000);
        const dva3 = (n) => String(n).padStart(2, '0');
        S().examDate = za3.getFullYear() + '-' + dva3(za3.getMonth() + 1) + '-' + dva3(za3.getDate());
        S().plan = { novih: null, pon: null, auto: 1, prio: 0 };
        if (S().day) { delete S().day.autoN; delete S().day.autoP; }
        document.querySelector('[data-nav="home"]').click();
        await cekaj(200);
        const pt = document.querySelector('#homeSummary .planBox').textContent.replace(/\s+/g, ' ');
        ok('sve otvoreno: presuda kaže da zaostala ponavljanja ne staju', pt.includes('Sve gradivo je otvoreno') && pt.includes('ne staju'));
      }
    }

  } catch (e) {
    rez.push('FAIL - provera je pukla usred rada: ' + ((e && e.message) || e));
    console.error(e);
  }

  const pao = rez.filter((x) => x.startsWith('FAIL'));
  console.log(rez.join('\n'));
  console.log(pao.length ? '✗ PALO: ' + pao.length : '✓ SVE PROŠLO (' + rez.length + ')');
  return { rezultati: rez, palo: pao.length };
}
