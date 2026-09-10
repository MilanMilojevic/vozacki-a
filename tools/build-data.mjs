// Spaja latinicni i cirilicni harvest u data.js za aplikaciju.
// Putanje bez argumenata su relativne ovoj skripti, nezavisno od radnog direktorijuma.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateSource } from './harvest.mjs';

const HERE = fileURLToPath(new URL('./', import.meta.url));
const USAGE = 'Upotreba: node tools/build-data.mjs [--lat base-A.json] [--cyr base-A-cyr.json] [--images img] [--out data.js] [--date YYYY-MM-DD]';
class BuildError extends Error {}
const invalid = () => { throw new BuildError('Izvori nisu potpuni ili usklađeni; izlaz nije zamenjen.'); };
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const samePath = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;

export function argumentsFor(args) {
  const options = { lat: path.join(HERE, 'base-A.json'), cyr: path.join(HERE, 'base-A-cyr.json'),
    images: path.join(HERE, '../img'), out: path.join(HERE, '../data.js'), date: new Date().toISOString().slice(0, 10) };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const key = args[i], value = args[++i];
    if (!['--lat', '--cyr', '--images', '--out', '--date'].includes(key) || seen.has(key) ||
        !nonempty(value) || value.startsWith('--') || value.includes('\0')) throw new BuildError(USAGE);
    seen.add(key);
    options[key.slice(2)] = value;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date) || !Number.isFinite(Date.parse(options.date)) ||
      new Date(options.date).toISOString().slice(0, 10) !== options.date) throw new BuildError(USAGE);
  for (const name of ['lat', 'cyr', 'images', 'out']) options[name] = path.resolve(options[name]);
  if (samePath(options.out, options.lat) || samePath(options.out, options.cyr)) throw new BuildError(USAGE);
  return options;
}

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

export async function createCandidate(lat, cyr, images, date) {
  validateSource(lat);
  validateSource(cyr);
  if (String(lat.languageId) !== '15' || String(cyr.languageId) !== '9') invalid();
  const cyrCats = new Map(cyr.tree.map(node => [node.categoryId, node]));
  if (lat.tree.length !== cyr.tree.length || lat.questions.length !== cyr.questions.length) invalid();
  const subName = {};
  for (const node of lat.tree) {
    const other = cyrCats.get(node.categoryId);
    if (!Object.hasOwn(CAT_CYR, node.categoryId) || !other || node.subs.length !== other.subs.length) invalid();
    const otherSubs = new Map(other.subs.map(sub => [sub.id, sub]));
    for (const sub of node.subs) {
      const matched = otherSubs.get(sub.id);
      if (!matched || sub.n !== matched.n) invalid();
      const names = { l: fixLat(sub.desc).replace(/;$/, ''), c: matched.desc.replace(/;$/, '') };
      if (!nonempty(names.l) || !nonempty(names.c)) invalid();
      subName[sub.id] = names;
    }
  }
  const cyrByQ = new Map(cyr.questions.map(q => [q.qId, q]));
  const questions = lat.questions.slice()
    .sort((a, b) => a.categoryId - b.categoryId || a.subcategoryId - b.subcategoryId || a.qId - b.qId)
    .map(q => {
      const qc = cyrByQ.get(q.qId);
      if (!qc || ['categoryId', 'subcategoryId', 'Points', 'ChoicesReq'].some(key => q[key] !== qc[key]) ||
          Boolean(q.HasImage) !== Boolean(qc.HasImage) || q.Choices.length !== qc.Choices.length) invalid();
      const cyrCh = new Map(qc.Choices.map(choice => [choice.paId, choice]));
      return {
        id: q.qId, cat: q.categoryId, sub: q.subcategoryId, pts: q.Points, req: q.ChoicesReq, img: q.HasImage ? 1 : 0,
        t: { l: fixLat(q.Text), c: qc.Text },
        ch: q.Choices.map(choice => {
          const matched = cyrCh.get(choice.paId);
          if (!matched || Boolean(choice.isCorrect) !== Boolean(matched.isCorrect)) invalid();
          return { id: choice.paId, ok: choice.isCorrect ? 1 : 0, t: { l: fixLat(choice.Text), c: matched.Text } };
        }),
      };
    });
  const imageHashes = {};
  for (const q of questions) {
    if (!nonempty(q.t.l) || !nonempty(q.t.c) || q.ch.some(choice => !nonempty(choice.t.l) || !nonempty(choice.t.c))) invalid();
    if (q.img) {
      const image = await fs.readFile(path.join(images, `${q.id}.jpg`)).catch(() => null);
      if (!image?.length) throw new BuildError('Nedostaje obavezna slika ili je prazna; izlaz nije zamenjen.');
      imageHashes[q.id] = createHash('sha256').update(image).digest('hex');
    }
  }
  const cats = Object.entries(CAT_CYR).map(([id, c]) => ({ id: +id, c, l: translit(c) }));
  // generated is the build date, never a claim that the source was verified that day.
  // Only runtime fields are selected; private harvest metadata is not copied.
  return { generated: date, cats, subs: subName, imageHashes, questions };
}

export async function buildData(options) {
  const lat = JSON.parse(await fs.readFile(options.lat, 'utf8'));
  const cyr = JSON.parse(await fs.readFile(options.cyr, 'utf8'));
  const candidate = await createCandidate(lat, cyr, options.images, options.date);
  const content = 'window.QUIZ = ' + JSON.stringify(candidate) + ';\n';
  if (!(await fs.stat(path.dirname(options.out))).isDirectory()) invalid();
  const existing = await fs.lstat(options.out).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing && !existing.isFile()) invalid();
  const temporary = path.join(path.dirname(options.out), `.${path.basename(options.out)}.${randomUUID()}.tmp`);
  let handle, created = false;
  try {
    handle = await fs.open(temporary, 'wx'); created = true;
    await handle.writeFile(content, 'utf8');
    await handle.close(); handle = null;
    await fs.rename(temporary, options.out); created = false;
  } finally {
    if (handle) await handle.close().catch(() => {});
    if (created) await fs.rm(temporary, { force: true });
  }
  return candidate.questions.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(`Sačuvano pitanja: ${await buildData(argumentsFor(process.argv.slice(2)))}`);
  } catch (error) {
    console.error(error instanceof BuildError ? error.message : 'Neispravan izvor ili neuspešan upis; izlaz nije zamenjen.');
    process.exitCode = 1;
  }
}
