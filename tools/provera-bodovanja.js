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

  try {
    // čisto stanje
    localStorage.removeItem('vozackiA.v1');
    location.hash = '#/';
    location.reload();
    return 'PONOVO POKRENI proveraBodovanja2() POSLE OSVEŽAVANJA';
  } finally {
    sessionStorage.setItem('provera.backup', sacuvano || '');
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

  const skip = document.getElementById('tourSkip'); if (skip) skip.click();

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

  // sledeće pa nazad — ponovni odgovor MORA da se beleži
  klikni('ledeće', document.getElementById('qCard'));
  klikni('rethodno', document.getElementById('qCard'));
  const tacanBtn = [...document.querySelectorAll('#qCard .choice')].find((b) => tacni.has(b.textContent.trim()));
  tacanBtn.click();
  klikni('dgovori', document.getElementById('qCard'));
  r = S().q[q1.id];
  ok('ponovni (tačan) odgovor se beleži: a=2, streak=1', r.a === 2 && r.streak === 1);
  const sutra = new Date(); sutra.setHours(0, 0, 0, 0); sutra.setDate(sutra.getDate() + 1);
  ok('rok posle 1. pogotka = SUTRA u 00:00 (kalendarski)', r.due === sutra.getTime());
  ok('u redu za ponavljanje dok streak < 3', window.__dev.inQueue(q1.id) === true);

  // ---- 2) SIMULACIJA: svih 41 tačno → 98/98, položeno ----
  document.querySelector('[data-nav="home"]').click();
  document.querySelector('.menuBtn[data-nav="sim"]').click();
  await cekaj(300);
  const sim = () => window.__dev.sim;
  ok('simulacija: 41 pitanje', sim() && sim().qs.length === 41);
  const ukupno = sim().qs.reduce((z, sq) => z + sq.q.pts, 0);
  ok('simulacija: zbir poena = 98', ukupno === 98);
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

  // ---- kraj: vrati pravo stanje ----
  const backup = sessionStorage.getItem('provera.backup');
  if (backup) localStorage.setItem('vozackiA.v1', backup);
  else localStorage.removeItem('vozackiA.v1');
  sessionStorage.removeItem('provera.backup');

  const pao = rez.filter((x) => x.startsWith('FAIL'));
  console.log(rez.join('\n'));
  console.log(pao.length ? '✗ PALO: ' + pao.length : '✓ SVE PROŠLO (' + rez.length + ')');
  return { rezultati: rez, palo: pao.length };
}
