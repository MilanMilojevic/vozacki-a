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
// Излаз су САМО БРОЈЕВИ ПИТАЊА, не текст и не HTML: значење знака ЈЕСТЕ тачан одговор тог
// питања, а data.js је већ учитан у прегледачу. Чувати исти текст још једном (и у два писма)
// значи држати исту истину на два места — app.js га чита из QUIZ-а.
// Три списка: atlas (знак → значење), situacije (сликовна питања која нису знакови) и
// zamke (нетачан понуђен одговор који је значење неког ДРУГОГ знака).
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

// Пуна мапа подобласт → картица (иста као bySub у build-explanations.mjs). Ситуације иду уз
// СВОЈУ картицу, ма која била — не само уз картице знакова. Попуњава је билд пре позива.
export const SUB_KARTICA_SVE = {};

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
  const znacenja = new Map();          // само за рачун замки — у излаз не иде
  let ukupno = 0, bezGrupe = 0;
  for (const q of Q) {
    if (!jeAtlasPitanje(q)) continue;
    const kljuc = q.sub === 159 ? ((X[q.id] && X[q.id].card) || null) : (SUB_KARTICA[q.sub] || null);
    const z = q.ch.filter((c) => c.ok).map((c) => c.t.l.trim()).join(' + ');
    if (!kljuc || !z) { bezGrupe++; continue; }
    (atlas[kljuc] = atlas[kljuc] || []).push(q.id);
    znacenja.set(q.id, z);
    ukupno++;
  }
  // Редослед бројева питања прати званични редослед знакова у Правилнику.
  for (const l of Object.values(atlas)) l.sort((a, b) => a - b);
  // Група од једне-две слике није атлас него случајна слика на дну картице — таква се одбацује
  // (подобласти 131 и 163 имају по једно такво питање).
  for (const [k, l] of Object.entries(atlas)) {
    if (l.length < 3) { delete atlas[k]; ukupno -= l.length; bezGrupe += l.length; }
  }

  // ---- SITUACIJE: сликовна питања која нису „знак → значење" ----
  // Од 704 слике у бази, 311 су знакови (атлас). Остале приказују СИТУАЦИЈУ на путу, а тачан
  // одговор каже шта се сме или мора. Уз картицу теме то је још 335 слика са испита — исте
  // оне које ће се видети на испиту, са питањем и тачним одговором.
  const uAtlasu = new Set([].concat(...Object.values(atlas)));
  const situacije = {};
  let situacijaN = 0;
  for (const q of Q) {
    if (!q.img || uAtlasu.has(q.id)) continue;
    const e = X[q.id] || {};
    const kljuc = e.card || (e.nocard ? null : (SUB_KARTICA_SVE[q.sub] || null));
    if (!kljuc) continue;
    (situacije[kljuc] = situacije[kljuc] || []).push(q.id);
    situacijaN++;
  }
  for (const l of Object.values(situacije)) l.sort((a, b) => a - b);
  for (const [k, l] of Object.entries(situacije)) {
    if (l.length < 3) { delete situacije[k]; situacijaN -= l.length; }
  }
  // ---- ZAMKE: ponuđen NETAČAN odgovor koji je zvanično značenje nekog DRUGOG znaka ----
  // Ispit sam kaže šta se sa čim meša: mamac u pitanju „krivina nalevo" je doslovno značenje
  // znaka „krivina nadesno". Zato uz odgovoreno pitanje ide slika BAŠ tog znaka — čovek vidi
  // kome je pripadao odgovor koji je zamalo izabrao. Ništa se ne pogađa: poklapanje je doslovno.
  const poZnacenju = new Map();
  for (const l of Object.values(atlas)) {
    for (const id of l) {
      const z = znacenja.get(id);
      if (!poZnacenju.has(z)) poZnacenju.set(z, []);
      poZnacenju.get(z).push(id);
    }
  }
  const zamke = {};
  let vezaUkupno = 0;
  for (const q of Q) {
    if (!uAtlasu.has(q.id)) continue;   // замке се рачунају само за знакове
    const lista = [];
    for (const c of q.ch) {
      if (c.ok) continue;
      const drugi = (poZnacenju.get(c.t.l.trim()) || []).filter((id) => id !== q.id);
      // isto značenje ume da nose i dva-tri različita znaka (pet znakova „smer kojim se vozila
      // moraju kretati"). Ide JEDAN po odgovoru — dve sličice sa istim natpisom izgledaju kao
      // greška; da ih ima više, app.js to kaže rečima (a ceo spisak stoji u atlasu kartice).
      for (const id of drugi.slice(0, 1)) if (!lista.includes(id)) lista.push(id);
    }
    if (lista.length) { zamke[q.id] = lista.slice(0, 3); vezaUkupno += Math.min(lista.length, 3); }
  }
  return { atlas, situacije, zamke, ukupno, bezGrupe, vezaUkupno, situacijaN };
}
