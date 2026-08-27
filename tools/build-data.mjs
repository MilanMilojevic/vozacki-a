// Spaja latinicni i cirilicni harvest u data.js za aplikaciju.
// Upotreba: node build-data.mjs
import fs from 'node:fs/promises';

const lat = JSON.parse(await fs.readFile('base-A.json', 'utf8'));
const cyr = JSON.parse(await fs.readFile('base-A-cyr.json', 'utf8'));

// eUprava latinicni tekst sadrzi zaostala cirilicna slova (npr. "regulisanje" -> "regulisanјe").
const FIX = { 'ј': 'j', 'Ј': 'J', 'љ': 'lj', 'Љ': 'Lj', 'њ': 'nj', 'Њ': 'Nj', 'ћ': 'ć', 'Ћ': 'Ć', 'ђ': 'đ', 'Ђ': 'Đ', 'џ': 'dž', 'Џ': 'Dž' };
const fixLat = (s) => (s || '').replace(/[јЈљЉњЊћЋђЂџЏ]/g, (c) => FIX[c]);

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
for (const t of cyr.tree) for (const s of t.subs) if (subName[s.id]) subName[s.id].c = (s.desc || '').replace(/;$/, '');

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
      t: { l: fixLat(q.Text), c: qc?.Text || '' },
      ch: q.Choices.map((c) => ({ id: c.paId, ok: c.isCorrect ? 1 : 0, t: { l: fixLat(c.Text), c: cyrCh[c.paId] || '' } })),
    };
  });

// sanity
const missCyr = questions.filter((q) => !q.t.c).length;
const badCorr = questions.filter((q) => q.ch.filter((c) => c.ok).length !== q.req).length;
console.log(`pitanja: ${questions.length} | bez cir teksta: ${missCyr} | ok!=req: ${badCorr}`);
if (missCyr || badCorr) process.exit(1);

const out = { generated: new Date().toISOString().slice(0, 10), practiceId: lat.practiceId, cats, subs: subName, questions };
await fs.writeFile('../data.js', 'window.QUIZ = ' + JSON.stringify(out) + ';\n');
console.log('-> ../data.js', Math.round(JSON.stringify(out).length / 1024) + ' KB');
