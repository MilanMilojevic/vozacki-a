// KALIBRACIJA ŠANSE ZA PROLAZ — merni alat za procenu „šansa da položiš".
//
//   cd tools && node kalibracija-sanse.mjs procena/sadasnja.mjs [procena/druga.mjs ...]
//   cd tools && node kalibracija-sanse.mjs --json procena/x.mjs     (mašinski izlaz)
//
// Zašto postoji: stara procena je savršenom učeniku (svako pitanje jednom tačno) davala
// ≈65/98 i 0,5% — isto kao Milanu, čije su poslednje četiri simulacije 93, 96, 98 i 88.
// Nijedna procena ne sme više u aplikaciju bez merenja naspram poznate istine.
//
// ISTINA se dobija iz VEŠTAČKIH učenika čije se stvarno znanje zna: svako pitanje ima
// verovatnoću tačnog odgovora koja raste kad pogreši (pročita objašnjenje), a pada kad dugo
// ne vidi pitanje. Učenik uči kroz aplikaciju ISTIM pravilima (redom, red za ponavljanje:
// greška → odmah, tačno → +1 dan → +3 dana, tri tačna zaredom → izlazi; tačno iz prve → još
// jedna potvrda za 3 dana) i radi simulacije po ISTOM šablonu od 41 mesta. Na kraju se TAČNA
// šansa za prolaz računa iz njegovog stvarnog znanja, pa se poredi sa procenom.
//
// Procena koja se meri je modul koji izvozi:
//   export function proceni(S, ctx) → { sansa: 0..1 | null, exp: očekivani poeni | null }
//   ctx = { Q, byId, SIM_SLOTS, prag, sad, DAY }
// S je stanje u istom obliku kao u aplikaciji (S.q[id] = {a, w, streak, due?, last}, S.sims[]).
//
// Pravilo iz CLAUDE.md-a, primenjeno na alat: POZITIVNA KONTROLA ide pre svega — „proročica"
// koja zna stvarno znanje mora da dobije grešku ~0, inače je alat pokvaren, ne procena.

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { tacnaSansa as _ts } from './procena/zajednicko.mjs';
const tacnaSansa = (slotP) => _ts(slotP, PRAG_UDEO);

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');
const DAY = 24 * 60 * 60 * 1000;

// ---------- baza i šablon testa, iz samih fajlova aplikacije ----------
const win = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'))(win);
const Q = win.QUIZ.questions;
const byId = new Map(Q.map((q) => [q.id, q]));
const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const SIM_SLOTS = (0, eval)(APP.match(/const SIM_SLOTS = (\[[\s\S]*?\]);/)[1]);
const PRAG_UDEO = +APP.match(/const PRAG_UDEO = ([0-9.]+)/)[1];
const prag = (total) => Math.ceil(PRAG_UDEO * total);
const POOLS = SIM_SLOTS.map((s) => ({ p: s.p, ids: Q.filter((q) => s.s.includes(q.sub) && q.pts === s.p).map((q) => q.id) }))
  .filter((s) => s.ids.length);
const REDOSLED = Q.map((q) => q.id);   // aplikacija „Uči redom" ide redom baze

// ---------- seme i pomoćne ----------
function rng(seed) {   // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const sig = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => Math.log(p / (1 - p));
function normal(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// TAČNA raspodela zbira poena — ista funkcija koju koriste i procene (procena/zajednicko.mjs)
export { tacnaSansa };

// ---------- veštački učenik ----------
// Težina pitanja je STALNA po pitanju (ista za sve učenike), izvedena iz broja pitanja.
const TEZINA = new Map();
{ const r = rng(20260923); for (const id of REDOSLED) TEZINA.set(id, normal(r) * 1.0); }

// Scenariji simulatora — procena mora da radi u SVIMA, ne da se namesti na jedan.
export const SCENARIJI = {
  osnovni:      { ucenjeGreska: 1.6, ucenjeTacno: 0.5, zaborav: 30, sposobnost: [-0.6, 2.8], dana: [6, 45], simDnevno: 0.25 },
  sporoUci:     { ucenjeGreska: 0.8, ucenjeTacno: 0.3, zaborav: 20, sposobnost: [-0.8, 2.2], dana: [6, 45], simDnevno: 0.2 },
  brzoZaboravi: { ucenjeGreska: 1.6, ucenjeTacno: 0.5, zaborav: 8,  sposobnost: [-0.6, 2.8], dana: [10, 50], simDnevno: 0.25 },
  bezSimulacija:{ ucenjeGreska: 1.6, ucenjeTacno: 0.5, zaborav: 30, sposobnost: [-0.6, 2.8], dana: [6, 45], simDnevno: 0 },
  mnogoSim:     { ucenjeGreska: 1.4, ucenjeTacno: 0.4, zaborav: 25, sposobnost: [-0.6, 2.8], dana: [15, 45], simDnevno: 0.7 },
};

function napraviUcenika(seed, sc) {
  const r = rng(seed);
  const theta = sc.sposobnost[0] + r() * (sc.sposobnost[1] - sc.sposobnost[0]);
  const ell0 = new Map(), ell = new Map(), videno = new Map();
  // dodatni točkići za skrivene scenarije; podrazumevane vrednosti daju TAČNO isto ponašanje
  // (dodatni slučajni brojevi se vuku samo kad je subOdstupanje > 0, pa se niz ne pomera)
  const tezSkala = sc.tezinaSkala ?? 1, pomak = sc.pomak ?? 0.3, subOds = sc.subOdstupanje ?? 0;
  const subPomak = new Map();
  if (subOds > 0) for (const q of Q) if (!subPomak.has(q.sub)) subPomak.set(q.sub, normal(r) * subOds);
  for (const id of REDOSLED) { const l = theta - TEZINA.get(id) * tezSkala + pomak + (subPomak.get(byId.get(id).sub) || 0); ell0.set(id, l); ell.set(id, l); }
  const dana = Math.round(sc.dana[0] + r() * (sc.dana[1] - sc.dana[0]));
  const novihDnevno = Math.round(15 + r() * 70);
  const start = Date.UTC(2026, 7, 1, 9);
  const S = { q: {}, sims: [] };
  let sad = start, pos = 0;
  const dan = (d) => start + d * DAY;
  // trenutna verovatnoća uz zaborav: vraća se ka početnom znanju sa vremenskom konstantom
  const pNow = (id) => {
    const l0 = ell0.get(id), l = ell.get(id), t = videno.get(id);
    if (t == null) return sig(l);
    const k = Math.exp(-Math.max(0, sad - t) / DAY / sc.zaborav);
    return sig(l0 + (l - l0) * k);
  };
  const odgovori = (id) => {
    const p = pNow(id);
    const ok = r() < p;
    // znanje posle odgovora: polazi od TRENUTNOG (sa zaboravom), pa uči
    const lsad = logit(Math.min(0.999, Math.max(0.001, p)));
    ell.set(id, lsad + (ok ? sc.ucenjeTacno : sc.ucenjeGreska) * (0.6 + 0.8 * r()));
    videno.set(id, sad);
    return ok;
  };
  // ISTA pravila reda kao record() u aplikaciji
  const inQueue = (rec) => (rec.w > 0 ? rec.streak < 3 : rec.a >= 1 && rec.streak === 1);
  const zabelezi = (id, ok) => {
    const rec = S.q[id] || (S.q[id] = { a: 0, w: 0, streak: 0, marked: 0 });
    const bioURedu = inQueue(rec) && rec.a > 0;
    const preRoka = ok && rec.a > 0 && bioURedu && (rec.due || 0) > sad;
    rec.a++; rec.last = sad;
    if (preRoka) return;
    if (ok) {
      rec.streak++;
      if (rec.w > 0 && rec.streak < 3) rec.due = sad + (rec.streak === 1 ? 1 : 3) * DAY;
      else if (rec.w === 0 && rec.streak === 1) rec.due = sad + 3 * DAY;
      else delete rec.due;
    } else { rec.w++; rec.streak = 0; rec.due = sad; }
  };
  const simulacija = () => {
    const qs = [], wrong = []; let score = 0, total = 0;
    for (const pool of POOLS) {
      const id = pool.ids[Math.floor(r() * pool.ids.length)];
      const q = byId.get(id); total += q.pts;
      const ok = odgovori(id);
      if (ok) score += q.pts; else wrong.push(id);
      const tacni = q.ch.filter((c) => c.ok).map((c) => c.id);
      const netacni = q.ch.filter((c) => !c.ok).map((c) => c.id);
      qs.push({ id, ch: ok ? tacni : [netacni[Math.floor(r() * netacni.length)]] });
      zabelezi(id, ok);
    }
    S.sims.push({ d: sad, score, total, passed: score >= prag(total), wrong, qs });
  };
  for (let d = 0; d < dana; d++) {
    sad = dan(d);
    // ponavljanja koja su na redu
    for (const id of Object.keys(S.q).map(Number)) {
      const rec = S.q[id];
      if (inQueue(rec) && (rec.due || 0) <= sad) { const ok = odgovori(id); zabelezi(id, ok); }
    }
    // nova pitanja redom
    for (let k = 0; k < novihDnevno && pos < REDOSLED.length; k++) {
      sad += 20 * 1000;
      const id = REDOSLED[pos++]; const ok = odgovori(id); zabelezi(id, ok);
    }
    if (r() < sc.simDnevno) { sad += 3600 * 1000; simulacija(); }
  }
  // ISPIT: dan posle poslednjeg dana učenja
  sad = dan(dana) + 9 * 3600 * 1000;
  const slotP = POOLS.map((pool) => ({ pts: pool.p, p: pool.ids.reduce((a, id) => a + pNow(id), 0) / pool.ids.length }));
  const istina = tacnaSansa(slotP);
  return { S, sad, istina, theta, dana, odgovoreno: Object.keys(S.q).length, sims: S.sims.length, pNow };
}

// ---------- merenje jedne procene ----------
// KALIBRACIJA_SCENARIJI=<put do JSON-a> zamenjuje scenarije — za ocenjivanje na scenarijima
// koje autor procene nije video (da se otkrije procena nameštena na ovaj simulator).
const SPOLJNI = process.env.KALIBRACIJA_SCENARIJI ? JSON.parse(fs.readFileSync(process.env.KALIBRACIJA_SCENARIJI, 'utf8')) : null;
function izmeri(proceni, { studenata = 160, seme = SPOLJNI ? 9 : 1 } = {}) {
  const ctx0 = { Q, byId, SIM_SLOTS, prag, DAY };
  const poSc = {};
  const sviParovi = [];
  for (const [ime, sc] of Object.entries(SPOLJNI || SCENARIJI)) {
    const parovi = [];
    for (let i = 0; i < studenata; i++) {
      const u = napraviUcenika(seme * 100003 + i * 7919 + ime.length * 31, sc);
      if (u.odgovoreno < 30) continue;
      const est = proceni(u.S, { ...ctx0, sad: u.sad });
      if (!est || est.sansa == null) { parovi.push({ istina: u.istina.sansa, proc: null, expI: u.istina.exp, expP: null, sims: u.sims }); continue; }
      parovi.push({ istina: u.istina.sansa, proc: est.sansa, expI: u.istina.exp, expP: est.exp, sims: u.sims });
    }
    const vazeci = parovi.filter((p) => p.proc != null);
    const mae = vazeci.reduce((a, p) => a + Math.abs(p.proc - p.istina), 0) / vazeci.length;
    const pristr = vazeci.reduce((a, p) => a + (p.proc - p.istina), 0) / vazeci.length;
    const maeExp = vazeci.filter((p) => p.expP != null).reduce((a, p) => a + Math.abs(p.expP - p.expI), 0) / Math.max(1, vazeci.filter((p) => p.expP != null).length);
    const velikih = vazeci.filter((p) => Math.abs(p.proc - p.istina) > 0.25).length;
    poSc[ime] = { n: parovi.length, bezProcene: parovi.length - vazeci.length, mae, pristrasnost: pristr, maePoena: maeExp, promasajPreko25pp: velikih };
    sviParovi.push(...vazeci);
  }
  // kalibracija po korpama procene
  const korpe = [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0001].slice(0, -1).map((od, i, a) => ({ od, do: [0.1, 0.3, 0.5, 0.7, 0.9, 1.0001][i] }));
  const kalibracija = korpe.map((k) => {
    const u = sviParovi.filter((p) => p.proc >= k.od && p.proc < k.do);
    return { korpa: `${Math.round(k.od * 100)}–${Math.round(Math.min(1, k.do) * 100)}%`, n: u.length,
      procena: u.length ? u.reduce((a, p) => a + p.proc, 0) / u.length : null, istina: u.length ? u.reduce((a, p) => a + p.istina, 0) / u.length : null };
  });
  const ukupnoMae = sviParovi.reduce((a, p) => a + Math.abs(p.proc - p.istina), 0) / sviParovi.length;
  return { poScenariju: poSc, kalibracija, ukupnoMae };
}

// ---------- probe: slučajevi sa očiglednim odgovorom ----------
function probe(proceni) {
  const ctx = { Q, byId, SIM_SLOTS, prag, DAY, sad: Date.UTC(2026, 8, 20) };
  const out = {};
  // 1) savršen učenik: svako pitanje jednom tačno, bez simulacija → istina ~100%
  { const S = { q: {}, sims: [] }; for (const q of Q) S.q[q.id] = { a: 1, w: 0, streak: 1, last: ctx.sad - 2 * DAY, due: ctx.sad + DAY }; out.savrsenJednomTacno = proceni(S, ctx); }
  // 2) savršen učenik utvrđen (tri tačna) → ~100%
  { const S = { q: {}, sims: [] }; for (const q of Q) S.q[q.id] = { a: 3, w: 0, streak: 3, last: ctx.sad - 2 * DAY }; out.savrsenUtvrdjen = proceni(S, ctx); }
  // 3) nasumično pogađa (svako pitanje dvaput, pola pogrešno) → istina ~0%
  { const S = { q: {}, sims: [] }; let i = 0; for (const q of Q) S.q[q.id] = (i++ % 2) ? { a: 2, w: 2, streak: 0, last: ctx.sad - DAY, due: ctx.sad } : { a: 2, w: 1, streak: 1, last: ctx.sad - DAY, due: ctx.sad + DAY }; out.polaPogresno = proceni(S, ctx); }
  // 4) tek počeo: 40 pitanja, sva tačna, bez simulacija → procena mora da bude oprezna, ne 99%
  { const S = { q: {}, sims: [] }; for (const q of Q.slice(0, 40)) S.q[q.id] = { a: 1, w: 0, streak: 1, last: ctx.sad - DAY, due: ctx.sad + 2 * DAY }; out.tekPoceo40Tacnih = proceni(S, ctx); }
  // 5) pet položenih simulacija 95+ u poslednjih 5 dana, a pola baze neviđeno → visoko
  { const S = { q: {}, sims: [] }; for (const q of Q.slice(0, 660)) S.q[q.id] = { a: 1, w: 0, streak: 1, last: ctx.sad - 3 * DAY, due: ctx.sad + DAY };
    for (let k = 0; k < 5; k++) S.sims.push({ d: ctx.sad - (5 - k) * DAY, score: 95, total: 98, passed: true, wrong: [], qs: [] });
    out.petSimPo95 = proceni(S, ctx); }
  // 6) pet simulacija ispod praga (70), sve viđeno i tačno jednom → nisko/oprezno
  { const S = { q: {}, sims: [] }; for (const q of Q) S.q[q.id] = { a: 1, w: 0, streak: 1, last: ctx.sad - 3 * DAY, due: ctx.sad + DAY };
    for (let k = 0; k < 5; k++) S.sims.push({ d: ctx.sad - (5 - k) * DAY, score: 70, total: 98, passed: false, wrong: [], qs: [] });
    out.petSimPo70 = proceni(S, ctx); }
  for (const k of Object.keys(out)) { const v = out[k]; out[k] = v ? { sansa: v.sansa == null ? null : +(100 * v.sansa).toFixed(1), exp: v.exp == null ? null : +v.exp.toFixed(1) } : null; }
  return out;
}

// ---------- Milanovi stvarni podaci (lični, NE idu u repo — .gitignore: vozacki-a-napredak*.json) ----------
function stvarni(proceni) {
  const fajlovi = [];
  for (const dir of [path.join(ROOT, '.tmp-mera'), path.join(ROOT, '..')]) {
    try { for (const f of fs.readdirSync(dir)) if (/^vozacki-a-napredak.*\.json$/.test(f)) fajlovi.push(path.join(dir, f)); } catch (e) { /* nema */ }
  }
  return fajlovi.map((f) => {
    const S = JSON.parse(fs.readFileSync(f, 'utf8'));
    // 'sad' = dan posle POSLEDNJEG odgovora u snimku, ne datum fajla: kopija istog snimka je
    // inače izgledala kao drugo stanje (isti podaci, 8 dana kasnije → 71% umesto 83%)
    const posl = Math.max(0, ...Object.values(S.q || {}).map((r) => r.last || 0), ...(S.sims || []).map((s) => s.d || 0));
    const sadM = posl + DAY;
    const est = proceni(S, { Q, byId, SIM_SLOTS, prag, DAY, sad: sadM });
    const sims = (S.sims || []).filter((s) => s.score > 0).map((s) => s.score);
    return { fajl: path.basename(f), gledanoNa: new Date(sadM).toISOString().slice(0, 10), procenaSansa: est && est.sansa != null ? +(100 * est.sansa).toFixed(1) : null, procenaPoena: est && est.exp != null ? +est.exp.toFixed(1) : null,
      simulacijePoslednje6: sims.slice(-6), prosekPoslednje4: sims.length >= 4 ? +(sims.slice(-4).reduce((a, b) => a + b, 0) / 4).toFixed(2) : null };
  });
}

// ---------- pozitivna kontrola alata: proročica zna stvarno znanje ----------
function kontrolaAlata() {
  const sc = SCENARIJI.osnovni; let maks = 0;
  for (let i = 0; i < 20; i++) {
    const u = napraviUcenika(777 + i, sc);
    const slotP = POOLS.map((pool) => ({ pts: pool.p, p: pool.ids.reduce((a, id) => a + u.pNow(id), 0) / pool.ids.length }));
    maks = Math.max(maks, Math.abs(tacnaSansa(slotP).sansa - u.istina.sansa));
  }
  return maks;
}

// ---------- glavni ----------
const args = process.argv.slice(2);
const json = args.includes('--json');
const moduli = args.filter((a) => !a.startsWith('--'));
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const kont = kontrolaAlata();
  if (kont > 1e-9) { console.error('ALAT POKVAREN: proročica ima grešku ' + kont); process.exit(2); }
  // raspon istine — da se vidi da skup učenika pokriva i slabe i jake
  const rasp = { ispod10: 0, izmedju: 0, iznad90: 0 };
  for (const [ime, sc] of Object.entries(SCENARIJI)) for (let i = 0; i < 40; i++) { const u = napraviUcenika(5 + i * 13 + ime.length, sc); const s = u.istina.sansa; if (s < 0.1) rasp.ispod10++; else if (s > 0.9) rasp.iznad90++; else rasp.izmedju++; }
  const izvestaj = { kontrolaAlata: 'proročica: greška 0 (alat ispravan)', rasponIstine: rasp, procene: {} };
  for (const m of moduli) {
    const mod = await import(pathToFileURL(path.resolve(process.cwd(), m)).href);
    const t0 = Date.now();
    const mera = izmeri(mod.proceni);
    izvestaj.procene[m] = { ...mera, probe: probe(mod.proceni), milan: stvarni(mod.proceni), ms: Date.now() - t0 };
  }
  if (json) { console.log(JSON.stringify(izvestaj, null, 1)); }
  else {
    console.log(izvestaj.kontrolaAlata, '| raspon istine (200 učenika):', JSON.stringify(rasp));
    for (const [m, r] of Object.entries(izvestaj.procene)) {
      console.log('\n=== ' + m + '  (ukupna prosečna greška šanse: ' + (100 * r.ukupnoMae).toFixed(1) + ' p.p., ' + r.ms + ' ms)');
      for (const [s, v] of Object.entries(r.poScenariju)) console.log(`  ${s.padEnd(14)} n=${v.n} greška ${(100 * v.mae).toFixed(1)} p.p. | pristrasnost ${(100 * v.pristrasnost >= 0 ? '+' : '') + (100 * v.pristrasnost).toFixed(1)} p.p. | poeni ±${v.maePoena.toFixed(1)} | promašaj >25 p.p.: ${v.promasajPreko25pp}${v.bezProcene ? ' | bez procene: ' + v.bezProcene : ''}`);
      console.log('  kalibracija: ' + r.kalibracija.filter((k) => k.n).map((k) => `${k.korpa}: ${(100 * k.procena).toFixed(0)}→${(100 * k.istina).toFixed(0)} (n=${k.n})`).join(' · '));
      console.log('  probe: ' + Object.entries(r.probe).map(([k, v]) => `${k} ${v ? v.sansa + '% / ' + v.exp : '—'}`).join(' · '));
      for (const x of r.milan) console.log(`  Milan ${x.fajl} (gledano ${x.gledanoNa}): procena ${x.procenaSansa}% / ${x.procenaPoena} poena | poslednje simulacije ${x.simulacijePoslednje6.join(', ')} (prosek poslednje 4: ${x.prosekPoslednje4})`);
    }
  }
}
