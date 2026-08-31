import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let h = fs.readFileSync('../../index.html', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// ---------- AUDIT ISPRAVKE ----------
// kod pitanja: ukodirane sive → tokeni teme (svetla je padala na 2.56:1); veća dodirna meta
c = rep(c, `.qNum { color: #94a3b8; font-size: .8rem; cursor: help; border-bottom: 1px dotted #cbd5e1; }`,
`.qNum { color: var(--mut); font-size: .8rem; cursor: pointer; border-bottom: 1px dotted var(--mut);
  display: inline-block; padding: 4px 2px; margin: -4px -2px; }`, 'qnum-kontrast');

// strelica podoblasti: 22×20 → najmanje 26×26 (WCAG 24px minimum)
c = rep(c, `.catChevBtn, .catChevSpacer { flex: 0 0 22px; width: 22px; box-sizing: border-box; }`,
`.catChevBtn, .catChevSpacer { flex: 0 0 26px; width: 26px; box-sizing: border-box; }`, 'chev-meta');
c = rep(c, `.catChevBtn { background: none; border: none; color: var(--mut); font-size: .8rem; padding: 4px 3px; border-radius: 6px; cursor: pointer; line-height: 1; text-align: center; }`,
`.catChevBtn { background: none; border: none; color: var(--mut); font-size: .8rem; padding: 8px 3px; border-radius: 6px; cursor: pointer; line-height: 1; text-align: center; min-height: 26px; }`, 'chev-visina');

// ---------- TEKSTOVI ----------
a = rep(a, "    linkCopied: { l: 'kopirano ✓', c: 'копирано ✓' },",
`    linkCopied: { l: 'kopirano ✓', c: 'копирано ✓' },
    offline: { l: 'Bez interneta — vežbanje radi i dalje, sve je sačuvano na uređaju.', c: 'Без интернета — вежбање ради и даље, све је сачувано на уређају.' },
    streakDani: { l: 'dan učenja zaredom', c: 'дан учења заредом' },
    examDateLabel: { l: 'Datum ispita (za odbrojavanje):', c: 'Датум испита (за одбројавање):' },
    examIn: { l: 'do ispita', c: 'до испита' },
    examDays: { l: 'dana', c: 'дана' },
    examPlan: { l: 'predlog tempa: ~# novih pitanja dnevno', c: 'предлог темпа: ~# нових питања дневно' },`, 'str');

// ---------- STANJE ----------
a = rep(a, "      iosSeen: obj.iosSeen === 1 ? 1 : 0,",
`      iosSeen: obj.iosSeen === 1 ? 1 : 0,
      streakD: typeof obj.streakD === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(obj.streakD) ? obj.streakD : null,
      streakN: nInt(obj.streakN, 0, 10000, 0),
      examDate: typeof obj.examDate === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(obj.examDate) ? obj.examDate : null,`, 'state');

// ---------- NIZ DANA (bez kazne: prekid samo tiho kreće od 1) ----------
a = rep(a, `    const today = localDay();
    if (!S.day || S.day.d !== today) S.day = { d: today, n: 0, ok: 0 };
    S.day.n++; if (ok) S.day.ok++;
    save();`,
`    const today = localDay();
    if (!S.day || S.day.d !== today) S.day = { d: today, n: 0, ok: 0 };
    S.day.n++; if (ok) S.day.ok++;
    if (S.streakD !== today) {
      const juce = new Date(); juce.setDate(juce.getDate() - 1);
      const juceStr = juce.getFullYear() + '-' + String(juce.getMonth() + 1).padStart(2, '0') + '-' + String(juce.getDate()).padStart(2, '0');
      S.streakN = S.streakD === juceStr ? S.streakN + 1 : 1;
      S.streakD = today;
    }
    save();`, 'streak');

// ---------- POČETNA: niz + odbrojavanje do ispita ----------
a = rep(a, `  function renderHome() {`,
`  function homeExtras() {
    const delovi = [];
    if (S.streakD === localDay() && S.streakN >= 2) delovi.push('🔥 ' + S.streakN + '. ' + L('streakDani'));
    if (S.examDate) {
      const danas = new Date(); danas.setHours(0, 0, 0, 0);
      const ispit = new Date(S.examDate + 'T00:00:00');
      const dana = Math.round((ispit - danas) / 86400000);
      if (dana >= 0) {
        delovi.push('📅 ' + L('examIn') + ': ' + dana + ' ' + L('examDays'));
        const neodg = Q.filter((q) => !S.q[q.id] || !S.q[q.id].a).length;
        if (dana > 0 && neodg > 0) delovi.push(L('examPlan').replace('#', Math.ceil(neodg / dana)));
      }
    }
    return delovi.length ? '<div class="homeExtras">' + delovi.join(' &nbsp;·&nbsp; ') + '</div>' : '';
  }

  function renderHome() {`, 'home-extras-fn');

if (fails) { console.log('NE PIŠEM (prvi deo)'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../index.html', h);
fs.writeFileSync('../../style.css', c);
console.log('faza2a — prvi deo primenjen');
