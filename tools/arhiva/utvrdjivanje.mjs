import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// 1) record(): i tačno "iz prve" dobija DRUGU POTVRDU za 3 dana (jedan pogodak ≠ zapamćeno;
//    kod tri ponuđena odgovora i sreća pogađa trećinu). Druga potvrda → utvrđeno, izlazi iz reda.
rep(`    if (ok) {
      r.streak++;
      if (r.w > 0 && r.streak < 3) r.due = pocetakDanaZa(r.streak === 1 ? 1 : 3);
    } else {`,
`    if (ok) {
      r.streak++;
      if (r.w > 0 && r.streak < 3) r.due = pocetakDanaZa(r.streak === 1 ? 1 : 3);
      else if (r.w === 0 && r.streak === 1) r.due = pocetakDanaZa(3);   // utvrđivanje: druga potvrda za 3 dana
      else delete r.due;                                               // utvrđeno / izašlo iz reda
    } else {`, 'record');

// 2) red ponavljanja obuhvata i pitanja na čekanju za utvrđivanje
rep(`  const inQueue = (id) => { const r = S.q[id]; return r && r.w > 0 && r.streak < 3; };`,
`  const inQueue = (id) => {
    const r = S.q[id];
    if (!r) return false;
    if (r.w > 0) return r.streak < 3;                 // pogrešna: tri pogotka za izlaz
    return r.a >= 1 && r.streak === 1;                // tačna iz prve: čeka JEDNU potvrdu
  };
  // rok pitanja u redu; stariji zapisi bez roka (tačni iz prve od ranije) dobijaju rok = poslednji put + 3 dana
  const dueOf = (id) => {
    const r = S.q[id];
    if (!r) return 0;
    if (r.due) return r.due;
    if (r.w === 0 && r.streak === 1) return (r.last || 0) + 3 * 86400000;
    return 0;
  };`, 'inQueue');

// 3) queueSplit koristi dueOf (pokriva i stare zapise bez roka)
rep(`      ((S.q[q.id].due || 0) <= now ? ready : waiting).push(q.id);
    }
    const k = (id) => (S.q[id].streak * 1e15) + (S.q[id].due || 0);`,
`      (dueOf(q.id) <= now ? ready : waiting).push(q.id);
    }
    const k = (id) => (S.q[id].streak * 1e15) + dueOf(id);`, 'queueSplit');

// 4) naziv: "Ponovi pogrešna" → "Ponavljanje" (sad obuhvata i utvrđivanje tačnih)
rep(`    drill: { l: 'Ponovi pogrešna', c: 'Понови погрешна' },`,
`    drill: { l: 'Ponavljanje', c: 'Понављање' },`, 'naziv');

// 5) vodič: korak o ponavljanju objašnjava i utvrđivanje
rep(`      <li><b>Pusti aplikaciju da te vodi.</b> Pogrešna pitanja se sama vraćaju u <i>Ponovi pogrešna</i>: odmah, pa sutradan, pa za tri dana. Radi ih dok ne isprazniš red.</li>`,
`      <li><b>Pusti aplikaciju da te vodi.</b> U <i>Ponavljanje</i> se sama vraćaju pogrešna pitanja (odmah, pa sutradan, pa za tri dana) — ali i pitanja tačna iz prve, jednom posle tri dana: jedan pogodak još nije zapamćeno.</li>`, 'vodic-l');
rep(`      <li><b>Пусти апликацију да те води.</b> Погрешна питања се сама враћају у <i>Понови погрешна</i>: одмах, па сутрадан, па за три дана. Ради их док не испразниш ред.</li>`,
`      <li><b>Пусти апликацију да те води.</b> У <i>Понављање</i> се сама враћају погрешна питања (одмах, па сутрадан, па за три дана) — али и питања тачна из прве, једном после три дана: један погодак још није запамћено.</li>`, 'vodic-c');

// 6) dnevni predlozi: ponavljanja danas + kada simulacija
rep(`    examPlan: { l: 'predlog tempa: ~# novih pitanja dnevno', c: 'предлог темпа: ~# нових питања дневно' },`,
`    examPlan: { l: 'predlog tempa: ~# novih pitanja dnevno', c: 'предлог темпа: ~# нових питања дневно' },
    planPonavljanja: { l: 'ponavljanja danas: #', c: 'понављања данас: #' },
    planSim: { l: 'predlog: uradi simulaciju danas', c: 'предлог: уради симулацију данас' },
    planSimNedelja: { l: 'poslednja nedelja — po jedna simulacija dnevno', c: 'последња недеља — по једна симулација дневно' },`, 'plan-str');

rep(`    if (S.streakD === localDay() && S.streakN >= 2) delovi.push('🔥 ' + S.streakN + '. ' + L('streakDani'));`,
`    if (S.streakD === localDay() && S.streakN >= 2) delovi.push('🔥 ' + S.streakN + '. ' + L('streakDani'));
    const spremno = queueSplit().ready.length;
    if (spremno > 0) delovi.push('🔁 ' + L('planPonavljanja').replace('#', spremno));
    {
      // predlog simulacije: transparentno pravilo — pokrivenost ≥ 60% i nijedna simulacija danas;
      // u poslednjih 7 dana pred ispit: po jedna dnevno.
      const odgovoreno = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
      const pokrivenost = odgovoreno / Q.length;
      const zadnja = S.sims.length ? S.sims[S.sims.length - 1].d : 0;
      const simDanas = zadnja && new Date(zadnja).toDateString() === new Date().toDateString();
      let danaDoIspita = null;
      if (S.examDate) {
        const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        danaDoIspita = Math.round((new Date(S.examDate + 'T00:00:00') - d0) / 86400000);
      }
      if (danaDoIspita !== null && danaDoIspita >= 0 && danaDoIspita <= 7) {
        if (!simDanas) delovi.push('🎯 ' + L('planSimNedelja'));
      } else if (pokrivenost >= 0.6 && !simDanas && (!zadnja || Date.now() - zadnja > 2.5 * 86400000)) {
        delovi.push('🎯 ' + L('planSim'));
      }
    }`, 'plan-logika');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
console.log('utvrđivanje ugrađeno');
