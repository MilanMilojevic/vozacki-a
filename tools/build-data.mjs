// Spaja latinicni i cirilicni harvest u data.js za aplikaciju.
// Upotreba: node build-data.mjs
import fs from 'node:fs/promises';

const lat = JSON.parse(await fs.readFile('base-A.json', 'utf8'));
const cyr = JSON.parse(await fs.readFile('base-A-cyr.json', 'utf8'));

// eUprava latinicni tekst sadrzi zaostala cirilicna slova (npr. "regulisanje" -> "regulisanјe").
const FIX = { 'ј': 'j', 'Ј': 'J', 'љ': 'lj', 'Љ': 'Lj', 'њ': 'nj', 'Њ': 'Nj', 'ћ': 'ć', 'Ћ': 'Ć', 'ђ': 'đ', 'Ђ': 'Đ', 'џ': 'dž', 'Џ': 'Dž' };
const fixLat = (s) => (s || '').replace(/[јЈљЉњЊћЋђЂџЏ]/g, (c) => FIX[c]);

// Isti problem u DRUGOM smeru: ćirilični tekst sa eUprave ima zaostala latinična slova
// ("Oсновне", "проценe", "тешкe трициклe"). Dira se SAMO latinično slovo koje stoji
// neposredno uz ćirilično — samostalne oznake (km, h, kW, mg/ml, cm, t, R, mm, TWI, BUS,
// STOP) tako ostaju netaknute, jer su okružene razmakom ili ciframa.
const FIX_C = { a: 'а', e: 'е', o: 'о', O: 'О', j: 'ј', c: 'с', p: 'р', x: 'х', y: 'у',
  A: 'А', B: 'В', C: 'С', E: 'Е', H: 'Н', K: 'К', M: 'М', P: 'Р', T: 'Т', X: 'Х' };
const fixCyr = (s) => (s || '')
  .replace(/(?<=[Ѐ-ӿ])([A-Za-z])|([A-Za-z])(?=[Ѐ-ӿ])/g, (m) => FIX_C[m] ?? m)
  .replace(/(^|\s)je(?=[\s,.:;]|$)/g, '$1је')
  // obrnut slučaj: oznaka na pneumatiku je LATINIČNA i ostaje takva u oba pisma (#8829)
  .replace(/ТWI/g, 'TWI');

// Puna transliteracija cir -> lat (za nazive oblasti kojih nema u lat harvestu).
const TR = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','е':'e','ж':'ž','з':'z','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'ć','у':'u','ф':'f','х':'h','ц':'c','ч':'č','џ':'dž','ш':'š',
  'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Ђ':'Đ','Е':'E','Ж':'Ž','З':'Z','И':'I','Ј':'J','К':'K','Л':'L','Љ':'Lj','М':'M','Н':'N','Њ':'Nj','О':'O','П':'P','Р':'R','С':'S','Т':'T','Ћ':'Ć','У':'U','Ф':'F','Х':'H','Ц':'C','Ч':'Č','Џ':'Dž','Ш':'Š',
};
const translit = (s) => (s || '').replace(/[Ѐ-ӿ]/g, (c) => TR[c] ?? c);

const CAT_CYR = {
  25: 'Основе безбедности саобраћаја', 26: 'Возач', 27: 'Трајање управљања возилом', 28: 'Пут',
  29: 'Возило и технички услови', 30: 'Правила саобраћаја', 31: 'Остали учесници у саобраћају',
  32: 'Саобраћајна сигнализација', 33: 'Превоз терета и лица', 34: 'Возачке дозволе',
  35: 'Дужности у случају незгоде', 36: 'Посебне мере и овлашћења', 37: 'Радње возилом', 38: 'Последице непоштовања прописа',
};

const cyrByQ = Object.fromEntries(cyr.questions.map((q) => [q.qId, q]));

// nazivi podoblasti: lat tree (sa fixom) + cyr tree
const subName = {};
for (const t of lat.tree) for (const s of t.subs) subName[s.id] = { l: fixLat(s.desc).replace(/;$/, ''), c: '' };
for (const t of cyr.tree) for (const s of t.subs) if (subName[s.id]) subName[s.id].c = fixCyr(s.desc || '').replace(/;$/, '');

const cats = Object.entries(CAT_CYR).map(([id, c]) => ({ id: +id, c, l: translit(c) }));

const questions = lat.questions
  .slice()
  .sort((a, b) => a.categoryId - b.categoryId || a.subcategoryId - b.subcategoryId || a.qId - b.qId)
  .map((q) => {
    const qc = cyrByQ[q.qId];
    const cyrCh = Object.fromEntries((qc?.Choices || []).map((c) => [c.paId, c.Text]));
    return {
      id: q.qId,
      cat: q.categoryId,
      sub: q.subcategoryId,
      pts: q.Points,
      req: q.ChoicesReq,
      img: q.HasImage ? 1 : 0,
      t: { l: fixLat(q.Text), c: fixCyr(qc?.Text || '') },
      ch: q.Choices.map((c) => ({ id: c.paId, ok: c.isCorrect ? 1 : 0, t: { l: fixLat(c.Text), c: fixCyr(cyrCh[c.paId] || '') } })),
    };
  });

// sanity
const mesano = (s) => ((s || '').match(/(?<=[Ѐ-ӿ])[A-Za-z]|[A-Za-z](?=[Ѐ-ӿ])/g) || []).length;
const mesanihC = questions.reduce((a, q) => a + mesano(q.t.c) + q.ch.reduce((b, c) => b + mesano(c.t.c), 0), 0)
  + Object.values(subName).reduce((a, s) => a + mesano(s.c), 0);
const missCyr = questions.filter((q) => !q.t.c).length;
const badCorr = questions.filter((q) => q.ch.filter((c) => c.ok).length !== q.req).length;
console.log(`pitanja: ${questions.length} | bez cir teksta: ${missCyr} | ok!=req: ${badCorr} | mešanih slova u ćirilici: ${mesanihC}`);
if (missCyr || badCorr) process.exit(1);

// practiceId se namerno NE upisuje u data.js — to je lični identifikator kandidata
// „generated" je datum ŽETVE baze, a ne datum pravljenja data.js. Ako se data.js samo
// prepravlja iz ISTE žetve (jezička ispravka, novo polje), datum se ZADRŽAVA — inače bi
// aplikacija u podnožju tvrdila da je baza sveža, a nije. Nova žetva: --nova-zetva.
let generated = new Date().toISOString().slice(0, 10);
if (!process.argv.includes('--nova-zetva')) {
  try {
    const m0 = (await fs.readFile('../data.js', 'utf8')).slice(0, 200).match(/"generated":"(\d{4}-\d{2}-\d{2})"/);
    if (m0) generated = m0[1];
  } catch (e) { /* prvi build — ostaje današnji datum */ }
}
const out = { generated, cats, subs: subName, questions };
await fs.writeFile('../data.js', 'window.QUIZ = ' + JSON.stringify(out) + ';\n');
console.log('-> ../data.js', Math.round(JSON.stringify(out).length / 1024) + ' KB');
