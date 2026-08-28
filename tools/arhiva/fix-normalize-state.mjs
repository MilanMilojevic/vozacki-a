import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}

rep(`  function normalizeState(obj) {
    if (!obj || typeof obj !== 'object' || !obj.q || typeof obj.q !== 'object' || Array.isArray(obj.q)) return null;
    return {
      script: obj.script === 'c' ? 'c' : 'l',
      seqPos: Number.isInteger(obj.seqPos) && obj.seqPos >= 0 ? obj.seqPos : 0,
      q: obj.q,
      sims: Array.isArray(obj.sims) ? obj.sims : [],
      secPos: obj.secPos && typeof obj.secPos === 'object' && !Array.isArray(obj.secPos) ? obj.secPos : {},
      lastSec: typeof obj.lastSec === 'string' ? obj.lastSec : null,
      theme: obj.theme === 'dark' || obj.theme === 'light' ? obj.theme : null,
      fs: typeof obj.fs === 'number' && obj.fs >= 0.8 && obj.fs <= 1.4 ? obj.fs : 1,
      day: obj.day && typeof obj.day === 'object' ? obj.day : null,
      tour: obj.tour === 1 ? 1 : 0,
      guide: obj.guide === 1 ? 1 : 0,
    };
  }`,
`  // Pomoćnici: iz nepouzdanog izvora (uvezeni fajl) uzimamo SAMO brojeve u očekivanom
  // opsegu. Time nijedno polje ne može da nosi HTML koji bi se kasnije ispisao u prikaz.
  const nInt = (v, min, max, def) => (Number.isInteger(v) && v >= min && v <= max ? v : def);
  const nNum = (v, min, max, def) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : def);
  const MAXTS = 4102444800000;   // 1.1.2100 — gornja granica za vremenske oznake

  function normalizeState(obj) {
    if (!obj || typeof obj !== 'object' || !obj.q || typeof obj.q !== 'object' || Array.isArray(obj.q)) return null;

    // napredak po pitanju: samo poznata pitanja i samo brojčana polja
    const q = {};
    for (const [id, r] of Object.entries(obj.q)) {
      if (!/^\\d+$/.test(id) || !byId.has(+id)) continue;
      if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
      const rec = {
        a: nInt(r.a, 0, 1e6, 0),
        w: nInt(r.w, 0, 1e6, 0),
        streak: nInt(r.streak, 0, 1e3, 0),
        marked: r.marked ? 1 : 0,
      };
      const due = nNum(r.due, 0, MAXTS, null);
      const last = nNum(r.last, 0, MAXTS, null);
      if (due !== null) rec.due = due;
      if (last !== null) rec.last = last;
      q[id] = rec;
    }

    // simulacije: brojevi i liste identifikatora pitanja
    const sims = (Array.isArray(obj.sims) ? obj.sims : []).slice(0, 500).map((s) => {
      if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
      const ids = (x) => (Array.isArray(x) ? x.filter((v) => Number.isInteger(v) && byId.has(v)).slice(0, 200) : []);
      return {
        d: nNum(s.d, 0, MAXTS, 0),
        score: nInt(s.score, 0, 1000, 0),
        total: nInt(s.total, 0, 1000, 0),
        passed: !!s.passed,
        wrong: ids(s.wrong),
        qs: Array.isArray(s.qs) ? s.qs.slice(0, 200).map((x) => (x && Number.isInteger(x.id) && byId.has(x.id)
          ? { id: x.id, ch: ids(x.ch) } : null)).filter(Boolean) : undefined,
      };
    }).filter(Boolean);

    // pozicije po oblastima: ključ mora biti postojeća oblast/podoblast
    const secPos = {};
    if (obj.secPos && typeof obj.secPos === 'object' && !Array.isArray(obj.secPos)) {
      for (const [k, v] of Object.entries(obj.secPos)) {
        if (!/^[cs]\\d+$/.test(k)) continue;
        const p = nInt(v, 0, 1e5, null);
        if (p !== null) secPos[k] = p;
      }
    }

    const dan = obj.day && typeof obj.day === 'object' && !Array.isArray(obj.day)
      && typeof obj.day.d === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(obj.day.d)
      ? { d: obj.day.d, n: nInt(obj.day.n, 0, 1e5, 0), ok: nInt(obj.day.ok, 0, 1e5, 0) }
      : null;

    return {
      script: obj.script === 'c' ? 'c' : 'l',
      seqPos: nInt(obj.seqPos, 0, 1e5, 0),
      q,
      sims,
      secPos,
      lastSec: typeof obj.lastSec === 'string' && /^[cs]\\d+$/.test(obj.lastSec) ? obj.lastSec : null,
      theme: obj.theme === 'dark' || obj.theme === 'light' ? obj.theme : null,
      fs: nNum(obj.fs, 0.8, 1.4, 1),
      day: dan,
      tour: obj.tour === 1 ? 1 : 0,
      guide: obj.guide === 1 ? 1 : 0,
    };
  }`, 'normalizeState');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
console.log('normalizeState pooštren');
