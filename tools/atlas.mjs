// АТЛАС ЗНАКОВА — слике у појмовник, извучене из САМЕ базе питања.
//
// Начело (исто као NA_ISPITU из SIM_SLOTS у в118): веза слика↔значење се НЕ пише руком.
// У бази постоји 313 питања облика „Саобраћајни знак приказан на слици означава:" — тачан
// одговор ЈЕ званично значење тог знака, а слика већ стоји у `img/<qId>.jpg` и трајно се
// кешира (sw.js, keš va-img-1). Дакле: атлас се ГЕНЕРИШЕ, па не може да се разиђе са испитом.
//
// Свесно се НЕ сажима по значењу: пет различитих знакова дели значење „смер којим се возила
// морају кретати" (права десно, кривина десно, права лево…). Управо то шаренило се на испиту
// и меша — атлас га зато показује све одједном.
//
// Излаз су ПОДАЦИ (out.atlas), не готов HTML: цртање је у app.js, па се оквир не понавља
// 313 пута ни у латиници ни у ћирилици (186 KB → 47 KB), а исти списак служи и за траку
// „слични знакови" уз питање.
import { createRequire } from 'node:module';

// Која подобласт иде у коју картицу. Подобласт 159 (обавештења) је в117 подељена на шест
// картица по темама, па се њена питања разврставају по већ утврђеном мапирању (X[id].card).
const SUB_KARTICA = {
  131: 'prvenstvo-prolaza',
  157: 'znakovi-opasnosti',
  158: 'znakovi-naredbi',
  160: 'znakovi-porodice',    // допунске табле
  161: 'oznake-kolovoz',
  162: 'semafori',
  163: 'svetlosne-oznake',
  166: 'policajac-znaci',
};

// Питање је „слика знака → значење" ако слику има, ако пита за приказано на слици и ако се
// завршава са „означава:" / „има значење:". Тачан одговор је тада само значење, ништа друго.
function jeAtlasPitanje(q) {
  if (!q.img) return false;
  const t = q.t.l.replace(/\s+/g, ' ').trim();
  if (!/(prikazan[ao]? na slici|na slici prikazan)/i.test(t)) return false;
  return /(označava|ima značenje)\s*:?$/i.test(t);
}

// X = mapiranja pitanja na kartice iz build-explanations.mjs (za podoblast 159).
// Vraća { atlas: { kljucKartice: [{ i: qId, z: značenje }] }, ukupno, bezGrupe }.
export function napraviAtlas(X) {
  // data.js je običan skript koji upisuje window.QUIZ — učitava se preko require-a sa
  // podmetnutim window objektom (isto što radi i pregledač), bez ijedne zavisnosti.
  globalThis.window = globalThis.window || {};
  createRequire(import.meta.url)('../data.js');
  const Q = globalThis.window.QUIZ.questions;

  const atlas = {};
  let ukupno = 0, bezGrupe = 0;
  for (const q of Q) {
    if (!jeAtlasPitanje(q)) continue;
    const kljuc = q.sub === 159 ? ((X[q.id] && X[q.id].card) || null) : (SUB_KARTICA[q.sub] || null);
    const z = q.ch.filter((c) => c.ok).map((c) => c.t.l.trim()).join(' + ');
    if (!kljuc || !z) { bezGrupe++; continue; }
    (atlas[kljuc] = atlas[kljuc] || []).push({ i: q.id, z });
    ukupno++;
  }
  // Редослед бројева питања прати званични редослед знакова у Правилнику.
  for (const l of Object.values(atlas)) l.sort((a, b) => a.i - b.i);
  // Група од једне-две слике није атлас него случајна слика на дну картице — таква се одбацује
  // (подобласти 131 и 163 имају по једно такво питање).
  for (const [k, l] of Object.entries(atlas)) {
    if (l.length < 3) { delete atlas[k]; ukupno -= l.length; bezGrupe += l.length; }
  }
  return { atlas, ukupno, bezGrupe };
}
