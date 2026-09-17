// МЕРЕ НАД БАЗОМ — бројке у картици „Замке у понуђеним одговорима" се НЕ пишу руком.
//
// Правило је исто као за атлас (в119): што се може ИЗВЕСТИ из базе, изводи се. Овде је улог
// већи него игде: картица која каже „250 m није НИЈЕДНОМ тачно" учи човека да тај одговор
// одбаци — а 250 m ЈЕСТЕ тачан одговор у два питања (#8950, #10781: „на удаљености од 150 m
// до 250 m испред опасног места"). Ручно уписана мера се разиђе са базом ћутке, а цена те
// тишине је погрешан одговор на испиту.
//
// Отуда подела посла: РУЧНО се бира ШТА се посматра (који образац вреди проверити), а КОЛИКО
// пута је понуђен и колико пута тачан рачуна се сваки пут из data.js, при билду.
import { createRequire } from 'node:module';

let Q = null;
function pitanja() {
  if (Q) return Q;
  globalThis.window = globalThis.window || {};
  createRequire(import.meta.url)('../data.js');
  Q = globalThis.window.QUIZ.questions;
  return Q;
}

// Колико пута је образац ПОНУЂЕН и колико пута је био ТАЧАН, плус бројеви питања у којима
// јесте тачан (да се изузетак може показати именом, а не прећутати).
export function meri(re) {
  let ponudjen = 0, tacan = 0;
  const tacniId = [];
  for (const q of pitanja()) {
    for (const c of q.ch) {
      if (!re.test(c.t.l)) continue;
      ponudjen++;
      if (c.ok) { tacan++; if (!tacniId.includes(q.id)) tacniId.push(q.id); }
    }
  }
  return { ponudjen, tacan, tacniId };
}

// Табела „образац → колико пута тачан". Редови се НЕ филтрирају: ако нешто испадне тачно
// чешће него што смо мислили, то се види, а не нестане.
export function tabelaObrazaca(redovi) {
  const tel = redovi.map((r) => {
    const m = meri(r.re);
    return `<tr><td>${r.opis}</td><td>${m.tacan} od ${m.ponudjen}</td></tr>`;
  }).join('\n');
  return `<table>\n<tr><th>Obrazac u odgovoru</th><th>Tačan u bazi</th></tr>\n${tel}\n</table>`;
}

// „Бројеви-мамци": вредности које се нуде више пута. Ред иде у ЈЕДНУ од две табеле — мамац
// (никад тачан) или изузетак (ume да буде тачан, са бројевима питања). Ниједан број се не
// проглашава мамцем на реч.
export function brojeviMamci(stavke) {
  const mamci = [], izuzeci = [];
  for (const s of stavke) {
    const m = meri(s.re);
    if (!m.ponudjen) continue;                       // нема га у бази — ред нема шта да каже
    (m.tacan === 0 ? mamci : izuzeci).push({ ...s, ...m });
  }
  const poTemi = new Map();
  for (const x of mamci) {
    if (!poTemi.has(x.tema)) poTemi.set(x.tema, []);
    poTemi.get(x.tema).push(x);
  }
  const t1 = [...poTemi.entries()].map(([tema, l]) =>
    `<tr><td>${tema}</td><td>${l.map((x) => `<b>${x.vrednost}</b>`).join(' · ')}</td><td>${l.map((x) => x.ponudjen + '×').join(' · ')}</td></tr>`).join('\n');
  const tabMamci = `<table>\n<tr><th>Tema</th><th>Mamac</th><th>Koliko puta ponuđen</th></tr>\n${t1}\n</table>`;
  if (!izuzeci.length) return { tabMamci, tabIzuzeci: '', izuzeci };
  const t2 = izuzeci.map((x) =>
    `<tr><td><b>${x.vrednost}</b></td><td>${x.tacan} od ${x.ponudjen}</td><td>${x.tacniId.map((i) => '#' + i).join(', ')}</td></tr>`).join('\n');
  const tabIzuzeci = `<table>\n<tr><th>Broj</th><th>Tačan</th><th>U kom pitanju</th></tr>\n${t2}\n</table>`;
  return { tabMamci, tabIzuzeci, izuzeci };
}

// Однос „није дозвољено" наспрам „је дозвољено" — проценти се рачунају, не памте.
export function procenat(re) {
  const m = meri(re);
  return { ...m, pct: m.ponudjen ? Math.round(100 * m.tacan / m.ponudjen) : 0 };
}

// Текстуални мамци: у реченици иду и број понуда и, ако постоји, питање у ком ЈЕСТЕ тачан.
export function opisMamca(naziv, re) {
  const m = meri(re);
  const izuzetak = m.tacniId.length ? ` <b>osim</b> ${m.tacniId.map((i) => '#' + i).join(', ')}` : '';
  return `"${naziv}" (${m.ponudjen}×, tačan ${m.tacan}×${izuzetak})`;
}

// У којим подобластима се образац уопште појављује — да картица не тврди „само код X"
// ако то није тачно.
export function podoblastiObrasca(re) {
  const s = new Map();
  for (const q of pitanja()) {
    if (!q.ch.some((c) => re.test(c.t.l))) continue;
    s.set(q.sub, (s.get(q.sub) || 0) + 1);
  }
  return [...s.entries()].sort((a, b) => b[1] - a[1]);
}

// Име подобласти и укупан број питања — да картица може да каже ГДЕ се мамац јавља и на
// колико питања је мера рачуната, а да те податке не преписује одникуд.
export function imePodoblasti(sub) {
  pitanja();
  const s = globalThis.window.QUIZ.subs || {};
  const v = s[sub] || s[String(sub)];
  // назив из базе уме да се заврши са „; " — исто сечење као у app.js (subPar)
  return v ? String(v.l || v).replace(/[\s;,]+$/, '') : ('podoblast ' + sub);
}
export function ukupnoPitanja() { return pitanja().length; }
