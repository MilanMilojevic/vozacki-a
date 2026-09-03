// Ispravke po nezavisnom pregledu v97 (15 potvrđenih nalaza; dva su već u sim-vernost.mjs).
// Sve zamene su sidrene i brojane — ako ijedno sidro ne stoji tačno jednom, ništa se ne piše.
import fs from 'node:fs';
const P = new URL('../../app.js', import.meta.url), C = new URL('../../style.css', import.meta.url);
const R = new URL('../../RAZVOJ.md', import.meta.url), T = new URL('../provera-bodovanja.js', import.meta.url);
let a = fs.readFileSync(P, 'utf8'), s = fs.readFileSync(C, 'utf8'), r = fs.readFileSync(R, 'utf8'), t = fs.readFileSync(T, 'utf8');
let pao = 0;
const mk = (get, set, tag) => (o, n, ime, br = 1) => { const txt = get(); const c = txt.split(o).length - 1; if (c !== br) { console.log('FAIL ' + tag + ' [' + ime + '] ' + c + '/' + br); pao++; return; } set(txt.split(o).join(n)); console.log('ok ' + tag + ' [' + ime + ']'); };
const rep = mk(() => a, (v) => { a = v; }, 'js');
const repS = mk(() => s, (v) => { s = v; }, 'css');
const repR = mk(() => r, (v) => { r = v; }, 'md');
const repT = mk(() => t, (v) => { t = v; }, 'test');
const BT = '`';

// [0][14] queueTip = doslovno FAQ (jedan rečnik: „na redu", „utvrđeno je i izlazi")
rep('pitanje je odmah spremno;', 'pitanje je odmah na redu;', 'queueTip l1');
rep('treći pogodak zaredom → izlazi iz reda.', 'treći pogodak zaredom → utvrđeno je i izlazi iz reda.', 'queueTip l2');
rep('питање је одмах спремно;', 'питање је одмах на реду;', 'queueTip c1');
rep('трећи погодак заредом → излази из реда.', 'трећи погодак заредом → утврђено је и излази из реда.', 'queueTip c2');

// [1] strana oblasti: „Nastavi" ide tačno od mesta — poseban tekst, ne obećanje sa Sva pitanja
rep(`    contTip: { l: 'Nastavlja redom, od prvog neodgovorenog pitanja posle mesta gde si stao.', c: 'Наставља редом, од првог неодговореног питања после места где си стао.' },`,
`    contTip: { l: 'Nastavlja redom, od prvog neodgovorenog pitanja posle mesta gde si stao.', c: 'Наставља редом, од првог неодговореног питања после места где си стао.' },
    contTipSec: { l: 'Nastavlja tačno od mesta gde si stao (uvek redom).', c: 'Наставља тачно од места где си стао (увек редом).' },`, 'contTipSec kljuc');
rep(`L('contTip'))}"` + BT + ` : ''}>`, `L('contTipSec'))}"` + BT + ` : ''}>`, 'bStart contTipSec');

// [5] dani do ispita — JEDNA funkcija (round nad dve lokalne ponoći; ceil je na zimskom vremenu davao dan više)
rep(`  const neodgovorenih = () => Q.filter(`,
`  // Dani do ispita: obe tačke su lokalna ponoć, pa je razlika ceo broj dana ±1h (letnje/zimsko
  // vreme) — zato round, nikad ceil. Ranije su sažetak (round) i „Predloži mi" (ceil) mogli da se
  // razlikuju za dan, pa i za tempo.
  function danaDoIspita() {
    if (!S.examDate) return null;
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const d = Math.round((new Date(S.examDate + 'T00:00:00') - d0) / DAY);
    return Number.isFinite(d) ? d : null;
  }
  const neodgovorenih = () => Q.filter(`, 'danaDoIspita fn');
rep(`      let danaDoIspita = null;
      if (S.examDate) {
        const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        danaDoIspita = Math.round((new Date(S.examDate + 'T00:00:00') - d0) / 86400000);
      }
      if (danaDoIspita !== null && danaDoIspita >= 0 && danaDoIspita <= 7) {`,
`      const doIspita = danaDoIspita();
      if (doIspita !== null && doIspita >= 0 && doIspita <= 7) {`, 'homeExtras sim dani');
rep(`    if (S.examDate) {
      const danas = new Date(); danas.setHours(0, 0, 0, 0);
      const ispit = new Date(S.examDate + 'T00:00:00');
      const dana = Math.round((ispit - danas) / 86400000);
      if (dana >= 0) {`,
`    if (S.examDate) {
      const dana = danaDoIspita();
      if (dana !== null && dana >= 0) {`, 'homeExtras odbrojavanje');
rep(`        const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        const dana = Math.ceil((new Date(S.examDate + 'T00:00:00') - d0) / 86400000);
        if (!Number.isFinite(dana) || dana < 1) { poruciUzPolje(el('examDate'), L('planDatumProsao')); return; }`,
`        const dana = danaDoIspita();
        if (dana === null || dana < 1) { poruciUzPolje(el('examDate'), L('planDatumProsao')); return; }`, 'predlog dani');

// [6] prečica → ne zavisi od natpisa dugmeta (na #/p/ID natpis je „Vežbaj podoblast…")
rep(`      nextBtn = document.createElement('button'); nextBtn.className = 'secondary';`,
`      nextBtn = document.createElement('button'); nextBtn.className = 'secondary'; nextBtn.dataset.uloga = 'dalje';`, 'nextBtn uloga');
rep(`      const b = actionBtns.find((x) => /→|Sledeće|Следеће|Preskoči|Прескочи/.test(x.textContent));`,
`      const b = actionBtns.find((x) => x.dataset.uloga === 'dalje') || actionBtns.find((x) => /→|Sledeće|Следеће|Preskoči|Прескочи/.test(x.textContent));`, 'ArrowRight po ulozi');

// [7] otvoren „?" u tamnoj temi: ista plava kao glavno dugme (kontrast)
repS(`.pomocBtn[aria-expanded="true"] { background: var(--blue); color: #fff; }`, `.pomocBtn[aria-expanded="true"] { background: var(--primaryBg); color: #fff; }`, 'pomocBtn kontrast');
// [8] istorija: uski raspored od 560px (šire kolone datuma i rezultata nisu stajale na 461–560)
repS(`@media (max-width: 460px) {`, `@media (max-width: 560px) {`, 'histRow prelom');

// [10] paukal: 2–4 traže „nova pitanja", 1/21 „novo pitanje", ostalo „novih pitanja"
rep(`  const one = (n) => n % 10 === 1 && n % 100 !== 11;   // srpski: 1, 21, 31... "pitanje/dan"`,
`  const one = (n) => n % 10 === 1 && n % 100 !== 11;   // srpski: 1, 21, 31... "pitanje/dan"
  const few = (n) => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100);   // paukal: 2, 3, 4, 22... "nova pitanja"
  const novihPitanja = (n) => (one(n) ? L('novoJd') : few(n) ? L('novaPk') : L('novihMn'));`, 'few/novihPitanja');
rep(`    examPlan: { l: 'predlog tempa: ~# novih pitanja dnevno — „Predloži mi" u podešavanjima ga upisuje kao cilj', c: 'предлог темпа: ~# нових питања дневно — „Предложи ми" у подешавањима га уписује као циљ' },
    examPlanOne: { l: 'predlog tempa: ~# novo pitanje dnevno — „Predloži mi" u podešavanjima ga upisuje kao cilj', c: 'предлог темпа: ~# ново питање дневно — „Предложи ми" у подешавањима га уписује као циљ' },
    planPremalo: { l: 'sa @1 novih dnevno do ispita prođeš ~@2 od @3 neodgovorenih — predlog: @4 dnevno', c: 'са @1 нових дневно до испита прођеш ~@2 од @3 неодговорених — предлог: @4 дневно' },`,
`    // [9] „u podešavanjima" — na ekranu ne postoji ništa tako nazvano; grupa se zove „Dnevni cilj"
    examPlan: { l: 'predlog tempa: ~# @1 dnevno — „Predloži mi" u grupi „Dnevni cilj" (dole) ga upisuje kao cilj', c: 'предлог темпа: ~# @1 дневно — „Предложи ми" у групи „Дневни циљ" (доле) га уписује као циљ' },
    novoJd: { l: 'novo pitanje', c: 'ново питање' },
    novaPk: { l: 'nova pitanja', c: 'нова питања' },
    novihMn: { l: 'novih pitanja', c: 'нових питања' },
    planPremalo: { l: 'sa @1 dnevno do ispita prođeš ~@2 od @3 neodgovorenih — predlog: @4 dnevno', c: 'са @1 дневно до испита прођеш ~@2 од @3 неодговорених — предлог: @4 дневно' },`, 'examPlan/planPremalo');
rep(`          if (!S.plan) delovi.push((one(tempo) ? L('examPlanOne') : L('examPlan')).replace('#', tempo));`,
`          if (!S.plan) delovi.push(L('examPlan').replace('#', tempo).split('@1').join(novihPitanja(tempo)));`, 'examPlan upotreba');
rep(`.split('@1').join(S.plan.novih).split('@2').join(S.plan.novih * dana)`,
`.split('@1').join(S.plan.novih + ' ' + novihPitanja(S.plan.novih)).split('@2').join(S.plan.novih * dana)`, 'planPremalo upotreba');
rep(`    waitInfo: { l: 'Današnja ponavljanja si prošao. # pitanja dolazi na red kasnije (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Данашња понављања си прошао. # питања долази на ред касније (размакнуто понављање: сутра, па за 3 дана).' },`,
`    waitInfo: { l: 'Današnja ponavljanja si prošao. Kasnije na redu: # pitanja (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Данашња понављања си прошао. Касније на реду: # питања (размакнуто понављање: сутра, па за 3 дана).' },`, 'waitInfo');
rep(`    waitInfoOne: { l: 'Današnja ponavljanja si prošao. # pitanje dolazi na red kasnije (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Данашња понављања си прошао. # питање долази на ред касније (размакнуто понављање: сутра, па за 3 дана).' },`,
`    waitInfoOne: { l: 'Današnja ponavljanja si prošao. Kasnije na redu: # pitanje (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Данашња понављања си прошао. Касније на реду: # питање (размакнуто понављање: сутра, па за 3 дана).' },`, 'waitInfoOne');
rep(`    planIspunjenJos: { l: '✅ Dnevni cilj je ispunjen. Na redu je još @1 za ponavljanje — možeš i danas, ili sutra.', c: '✅ Дневни циљ је испуњен. На реду је још @1 за понављање — можеш и данас, или сутра.' },`,
`    planIspunjenJos: { l: '✅ Dnevni cilj je ispunjen. Za ponavljanje ostaje još: @1 — možeš i danas, ili sutra.', c: '✅ Дневни циљ је испуњен. За понављање остаје још: @1 — можеш и данас, или сутра.' },`, 'planIspunjenJos');
rep(`    planPredlogGotov: { l: 'Sačuvano kao cilj: @1 novih i @2 ponavljanja dnevno. Novo gradivo se završava # dana pre ispita — ti dani ostaju za ponavljanje i simulacije. Brojeve možeš da promeniš i ponovo sačuvaš.', c: 'Сачувано као циљ: @1 нових и @2 понављања дневно. Ново градиво се завршава # дана пре испита — ти дани остају за понављање и симулације. Бројеве можеш да промениш и поново сачуваш.' },
    planPredlogUsko: { l: 'Sačuvano kao cilj: @1 novih i @2 ponavljanja dnevno. Ispit je blizu, pa nema rezerve — novo gradivo ide do poslednjeg dana.', c: 'Сачувано као циљ: @1 нових и @2 понављања дневно. Испит је близу, па нема резерве — ново градиво иде до последњег дана.' },
    planPuno: { l: 'Sačuvano — ali # pitanja dnevno je puno. Računaj oko pola sata na svakih 100 pitanja. Uvek možeš da smanjiš.', c: 'Сачувано — али # питања дневно је пуно. Рачунај око пола сата на сваких 100 питања. Увек можеш да смањиш.' },`,
`    planPredlogGotov: { l: 'Sačuvano kao cilj: @1 i @2 ponavljanja dnevno. Novo gradivo se završava # pre ispita — ti dani ostaju za ponavljanje i simulacije. Brojeve možeš da promeniš i ponovo sačuvaš.', c: 'Сачувано као циљ: @1 и @2 понављања дневно. Ново градиво се завршава # пре испита — ти дани остају за понављање и симулације. Бројеве можеш да промениш и поново сачуваш.' },
    planPredlogUsko: { l: 'Sačuvano kao cilj: @1 i @2 ponavljanja dnevno. Ispit je blizu, pa nema rezerve — novo gradivo ide do poslednjeg dana.', c: 'Сачувано као циљ: @1 и @2 понављања дневно. Испит је близу, па нема резерве — ново градиво иде до последњег дана.' },
    planPuno: { l: 'Sačuvano — ali # dnevno je puno. Računaj oko pola sata na svakih 100 pitanja. Uvek možeš da smanjiš.', c: 'Сачувано — али # дневно је пуно. Рачунај око пола сата на сваких 100 питања. Увек можеш да смањиш.' },`, 'planPredlog/planPuno tekst');
rep(`        kaziPosle((rezerva > 0 ? L('planPredlogGotov').replace('#', rezerva) : L('planPredlogUsko'))
          .split('@1').join(novih === null ? '0' : novih).split('@2').join(pon));`,
`        const brNovih = novih === null ? 0 : novih;
        kaziPosle((rezerva > 0 ? L('planPredlogGotov').replace('#', rezerva + ' ' + (one(rezerva) ? L('examDaysOne') : L('examDays'))) : L('planPredlogUsko'))
          .split('@1').join(brNovih + ' ' + novihPitanja(brNovih)).split('@2').join(pon));`, 'planPredlog upotreba');
rep(`        kaziPosle(dnevno > 150 ? L('planPuno').replace('#', dnevno) : L('planSacuvan'));`,
`        kaziPosle(dnevno > 150 ? L('planPuno').replace('#', nQ(dnevno)) : L('planSacuvan'));`, 'planPuno upotreba');
rep(`    skokVanOpsega: { l: 'Ovaj spisak ima @2 pitanja. Unesi broj od @1 do @2.', c: 'Овај списак има @2 питања. Унеси број од @1 до @2.' },`,
`    skokVanOpsega: { l: 'Ovaj spisak ima @3. Unesi broj od @1 do @2.', c: 'Овај списак има @3. Унеси број од @1 до @2.' },`, 'skokVanOpsega tekst');
rep(`      const v = ceoBrojIzPolja(el('jumpN'), 1, max, L('skokVanOpsega'));`,
`      const v = ceoBrojIzPolja(el('jumpN'), 1, max, L('skokVanOpsega').split('@3').join(nQ(max)));`, 'skokVanOpsega upotreba');

// [11] latinično „vs" u ćirilici
rep('odstojanje vs rastojanje', 'odstojanje naspram rastojanja', 'guide vs l');
rep('одстојање vs растојање', 'одстојање наспрам растојања', 'guide vs c');

// [13] RAZVOJ: broj stavki testa ne održava se na dva mesta
repR('свих 14 ставки мора PASS', 'све ставке морају PASS (број пише на крају излаза: „✓ SVE PROŠLO (N)")', 'RAZVOJ 14');
repR(`- **Симулација** — текст „Изаберите одговора: N" (` + BT + `chooseN` + BT + `) остаје САМО у симулацији,
  јер није проверено како гласи на правом испиту; вежба користи ` + BT + `chooseNVezba` + BT + `.`,
`- **Симулација = званична страна, дословно.** Копија званичне странице симулације еУправе
  (KioskHtml/Index) и њеног JS-а је сачувана (scratchpad: mysim.html + ep.js; чињенице су у
  memory). Одатле: заглавље „Питање: 3/41" и „Број поена: 2"; курзивна плава ознака
  „Број потребних одговора: 2" ИСПОД текста питања; дугмад „Крај испита", „Извештај", „Назад";
  „Обележите питање"; тајмер m:ss без водеће нуле; питање са непотпуним бројем одговора не
  пушта даље („Нисте означили потребан број одговора."); потврда краја без бројања
  неодговорених; извештај са колоном поена; исход „Испит је завршен! Честитамо…/Нажалост…".
  Званична страна је вежба-симулација и има „Прикажи одговор" (тачан + објашњење) — то је
  помоћ које на правом испиту нема и НЕ преслика се (Миланово правило: без олакшица).
  Вежба користи ` + BT + `chooseNVezba` + BT + `; ` + BT + `chooseN` + BT + `/` + BT + `markSim` + BT + `/` + BT + `simConfirm` + BT + ` су само за симулацију.`, 'RAZVOJ sim');

// [3][4] testovi: plan bez gradiva + Nastavi preskače odgovorena
repT(`  const skip = document.getElementById('tourSkip'); if (skip) skip.click();`,
`  const skip = document.getElementById('tourSkip'); if (skip) skip.click();

  // ---- 0) DNEVNI CILJ na čistom stanju: kvota bez gradiva je ispunjena, plan nudi tačno toliko novih ----
  S().plan = { novih: 3, pon: 10 };
  document.querySelector('[data-nav="home"]').click();
  const pb = () => document.querySelector('#homeSummary .planBox');
  ok('plan: kvota ponavljanja bez gradiva je ispunjena („nema na redu" + ✓)', !!pb() && pb().textContent.includes('0 / 10 ponavljanja (nema na redu)') && pb().textContent.includes('✓'));
  ok('plan: nova pitanja se nude — dugme „Vežbaj po planu"', !!document.getElementById('btnPlanVezbaj'));
  document.getElementById('btnPlanVezbaj').click();
  ok('plan: spisak plana ima tačno 3 pitanja (1 od 3)', document.querySelector('#qProgress .qpPos').textContent.replace(/\\s+/g, ' ').trim() === '1 od 3');
  S().plan = null;
  document.querySelector('[data-nav="home"]').click();`, 'test plan');
repT(`  ok('pogrešan PRE roka VAŽI: w=1, streak=0, odmah na redu', r3.w === 1 && r3.streak === 0 && r3.due <= Date.now());`,
`  ok('pogrešan PRE roka VAŽI: w=1, streak=0, odmah na redu', r3.w === 1 && r3.streak === 0 && r3.due <= Date.now());

  // ---- 1c) „Nastavi" na Sva pitanja preskače već odgovorena: Q[0..2] su rešena, seqPos=2 → nudi 4. ----
  document.querySelector('[data-nav="home"]').click();
  document.querySelector('.menuBtn[data-nav="learn"]').click();
  ok('Nastavi preskače već odgovorena: nudi (4/1327)', document.getElementById('bCont').textContent.includes('(4/1327)'));
  document.getElementById('bCont').click();
  ok('Nastavi otvara 4. pitanje (prvo neodgovoreno)', document.querySelector('#qProgress .qpPos').textContent.replace(/\\s+/g, ' ').trim() === '4 od 1327');`, 'test Nastavi');

if (pao) { console.log('*** NE PIŠEM (' + pao + ') ***'); process.exit(1); }
fs.writeFileSync(P, a); fs.writeFileSync(C, s); fs.writeFileSync(R, r); fs.writeFileSync(T, t);
console.log('--- upisano: app.js, style.css, RAZVOJ.md, provera-bodovanja.js ---');
