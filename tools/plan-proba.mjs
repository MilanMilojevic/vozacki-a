// PLAN-PROBA — meri DNEVNI PLAN (cilj, kvote, presudu) na veštačkim učenicima koji ga STVARNO prate.
//
//   cd tools && node plan-proba.mjs plan/trenutni.mjs [plan/drugi.mjs ...]      (--json za mašinski izlaz)
//
// Zašto: v147 je dao plan koji je SAM SA SOBOM dosledan, ali koji je pretpostavljao da učenik sve
// odgovara tačno i da ima neograničeno vremena. Milan (09.09.): 85–120 pitanja dnevno + simulacija
// svakog dana, ~79% tačno iz prve — a plan je pred ispit tražio do 200 ponavljanja dnevno PORED
// simulacije. „Nerealno ohrabrivanje na početku, nerealno obeshrabrivanje na kraju."
//
// Učenik: znanje po pitanju koje raste kad pogreši (pročita objašnjenje) i bledi kad dugo ne vidi
// (isti model kao tools/kalibracija-sanse.mjs); ima DNEVNI KAPACITET (koliko pitanja stigne), neke dane
// preskače, neki rade simulaciju svakog dana (41 pitanje, troši kapacitet). Odgovori idu kroz PRAVI
// record() iz app.js (tools/app-vm.mjs), pa red, rokovi i dnevni brojači rade kao u aplikaciji.
//
// Plan koji se meri je modul:
//   export function planDanas(api, ctx) → { ids: [redom pitanja za danas], ocena: 'ok'|'upozorenje'|'problem'|'nema', tekst?: string }
//   api = prave funkcije aplikacije u vm-u (S, queueSplit, dueOf, record, neodgovorenih, danaDoIspita, planIds, planBlok, …)
//   ctx = { sad, dana (do ispita), Q, byId, SIM_SLOTS, POOLS, DAY }
// Učenik radi ids REDOM dok ima kapaciteta (posle simulacije, ako je radi). Plan NE zna kapacitet —
// sme da ga proceni samo iz istorije (S.dani, S.day), kao i u aplikaciji.
//
// MERE po scenariju:
//   ishod     — prosečna TAČNA šansa za prolaz na dan ispita (iz stvarnog znanja), udeo ≥ 85%
//   nerealno  — udeo dana kad je plan tražio više od kapaciteta (×1,1), najveći odnos zahtev/kapacitet
//   skok      — najveći dnevni zahtev / medijana zahteva
//   lazna_uzbuna  — udeo ⚠/⛔ dana kod učenika koji na kraju imaju šansu ≥ 80%
//   lazna_uteha   — udeo ✅ dana kod učenika koji na kraju imaju šansu < 50%
//   prvi_dan  — da li presuda PRVOG dana pogađa ishod (✅ ↔ šansa ≥ 50%)

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { napravi, strip } from './app-vm.mjs';
import { tacnaSansa } from './procena/zajednicko.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');
const DAY = 864e5;
const win = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'))(win);
const Q = win.QUIZ.questions;
const byId = new Map(Q.map((q) => [q.id, q]));
const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const SIM_SLOTS = (0, eval)(APP.match(/const SIM_SLOTS = (\[[\s\S]*?\]);/)[1]);
const POOLS = SIM_SLOTS.map((s) => ({ p: s.p, s: s.s, ids: Q.filter((q) => s.s.includes(q.sub) && q.pts === s.p).map((q) => q.id) })).filter((s) => s.ids.length);

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const sig = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => Math.log(p / (1 - p));
function normal(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const TEZINA = new Map(); { const r = rng(20260923); for (const q of Q) TEZINA.set(q.id, normal(r)); }

export const SCENARIJI = {
  // kao Milan: dosta urađeno, 13 dana do ispita, 100–130 pitanja dnevno, simulacija svaki dan
  kaoMilan:     { dana: [12, 14], vidjeno: [0.55, 0.65], kap: [100, 130], preskace: 0.08, simDnevno: 1,    sposobnost: [0.6, 2.4], zaborav: 30 },
  // kasno počeo: malo urađeno, dve nedelje, isti kapacitet — ne može sve
  kasnoPoceo:   { dana: [10, 16], vidjeno: [0.05, 0.2],  kap: [80, 130],  preskace: 0.1,  simDnevno: 0.5,  sposobnost: [0.4, 2.4], zaborav: 30 },
  // ima vremena: mesec dana od nule, manje dnevno, simulacija svaki treći dan
  imaVremena:   { dana: [28, 35], vidjeno: [0, 0.05],    kap: [60, 100],  preskace: 0.1,  simDnevno: 0.33, sposobnost: [0.2, 2.4], zaborav: 30 },
  // neredovan: preskače trećinu dana
  neredovan:    { dana: [18, 24], vidjeno: [0.2, 0.4],   kap: [90, 140],  preskace: 0.33, simDnevno: 0.5,  sposobnost: [0.4, 2.4], zaborav: 25 },
  // slabiji: više grešaka iz prve
  slabiji:      { dana: [18, 24], vidjeno: [0.2, 0.4],   kap: [100, 140], preskace: 0.1,  simDnevno: 0.5,  sposobnost: [-0.6, 1.0], zaborav: 25 },
};

function ucenik(seed, sc, modul) {
  const r = rng(seed);
  const theta = sc.sposobnost[0] + r() * (sc.sposobnost[1] - sc.sposobnost[0]);
  const ell0 = new Map(), ell = new Map(), videno = new Map();
  for (const q of Q) { const l = theta - TEZINA.get(q.id) + 0.3; ell0.set(q.id, l); ell.set(q.id, l); }
  const dana = Math.round(sc.dana[0] + r() * (sc.dana[1] - sc.dana[0]));
  const kap = Math.round(sc.kap[0] + r() * (sc.kap[1] - sc.kap[0]));
  const radiSim = r() < sc.simDnevno;          // ovaj učenik radi simulaciju svaki dan (inače svaki treći)
  const start = Date.UTC(2026, 8, 1, 8);        // 01.09. — pre-učenje ide unazad od ovog dana
  const ispit = start + dana * DAY;
  const d = new Date(ispit); const ispitStr = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  const api = napravi({ state: { q: {}, sims: [], examDate: ispitStr, plan: { auto: 1 } }, now: start - 20 * DAY });
  let sad = start - 20 * DAY;
  const pNow = (id) => { const l0 = ell0.get(id), l = ell.get(id), t = videno.get(id); if (t == null) return sig(l); const k = Math.exp(-Math.max(0, sad - t) / DAY / sc.zaborav); return sig(l0 + (l - l0) * k); };
  const odgovori = (id) => {
    const p = pNow(id); const ok = r() < p;
    ell.set(id, logit(Math.min(0.999, Math.max(0.001, p))) + (ok ? 0.5 : 1.6) * (0.6 + 0.8 * r()));
    videno.set(id, sad);
    const q = byId.get(id);
    const tacni = q.ch.filter((c) => c.ok).map((c) => c.id), netacni = q.ch.filter((c) => !c.ok).map((c) => c.id);
    api.record(id, ok, ok ? tacni : [netacni[Math.floor(r() * netacni.length)]]);
    return ok;
  };
  const postavi = (t) => { sad = t; api.setNow(t); };
  // PRE-UČENJE: deo baze redom, 20 dana pre početka plana, greške ponovljene sutradan
  const brVid = Math.round(Q.length * (sc.vidjeno[0] + r() * (sc.vidjeno[1] - sc.vidjeno[0])));
  const naDan = Math.max(1, Math.ceil(brVid / 18));
  let pos = 0;
  for (let t = 0; t < 20 && pos < brVid; t++) {
    postavi(start - (20 - t) * DAY + 10 * 3600e3); api.osveziDan();
    for (const id of api.queueSplit().ready.slice(0, 60)) odgovori(id);
    for (let k = 0; k < naDan && pos < brVid; k++) { sad += 30e3; api.setNow(sad); odgovori(Q[pos++].id); }
  }
  // PLAN: dan po dan
  const dnevnik = [];
  for (let t = 0; t < dana; t++) {
    postavi(start + t * DAY + 17 * 3600e3); api.osveziDan();
    const preskoci = r() < sc.preskace;
    let cap = preskoci ? 0 : Math.round(kap * (0.8 + 0.4 * r()));
    const kapDanas = cap;
    let sim = false;
    if (cap >= 41 && (radiSim || t % 3 === 0)) {
      sim = true;
      const qs = [], wrong = []; let score = 0, total = 0;
      for (const pool of POOLS) {
        const id = pool.ids[Math.floor(r() * pool.ids.length)]; const q = byId.get(id); total += q.pts;
        sad += 20e3; api.setNow(sad);
        const ok = odgovori(id); if (ok) score += q.pts; else wrong.push(id);
        qs.push({ id, ch: ok ? q.ch.filter((c) => c.ok).map((c) => c.id) : [q.ch.find((c) => !c.ok).id] });
      }
      api.S.sims.push({ d: sad, score, total, passed: score >= Math.ceil(0.85 * total), wrong, odg: 41, qs });
      cap -= 41;
    }
    const plan = modul.planDanas(api, { sad, dana: dana - t, Q, byId, SIM_SLOTS, POOLS, DAY, strip }) || { ids: [], ocena: 'nema' };
    const zahtev = plan.ids.length + (sim ? 41 : 0);
    let uradjeno = 0;
    for (const id of plan.ids) { if (cap <= 0) break; sad += 25e3; api.setNow(sad); odgovori(id); cap--; uradjeno++; }
    dnevnik.push({ t, kap: kapDanas, zahtev, uradjeno, ocena: plan.ocena, sim, tekst: plan.tekst });
  }
  // ISPIT: jutro dana ispita
  postavi(ispit + 8 * 3600e3);
  const slotP = POOLS.map((pool) => ({ pts: pool.p, p: pool.ids.reduce((a, id) => a + pNow(id), 0) / pool.ids.length }));
  const istina = tacnaSansa(slotP);
  const nevidjeno = Q.filter((q) => !videno.has(q.id)).length;
  return { istina: istina.sansa, exp: istina.exp, nevidjeno, dnevnik, dana, kap, radiSim };
}

export { ucenik };
function izmeri(modul, { po = 30, seme = 1, scenariji = SCENARIJI } = {}) {
  const out = {};
  for (const [ime, sc] of Object.entries(scenariji)) {
    const L = [];
    for (let i = 0; i < po; i++) L.push(ucenik(seme * 1009 + i * 7919 + ime.length * 131, sc, modul));
    const dani = L.flatMap((u) => u.dnevnik.filter((x) => x.kap > 0).map((x) => ({ ...x, istina: u.istina })));
    const nad = dani.filter((x) => x.zahtev > x.kap * 1.1).length / Math.max(1, dani.length);
    const maxOdnos = Math.max(...dani.map((x) => x.zahtev / x.kap));
    const skok = L.map((u) => { const z = u.dnevnik.filter((x) => x.kap > 0).map((x) => x.zahtev).sort((a, b) => a - b); return z.length ? z[z.length - 1] / Math.max(1, z[Math.floor(z.length / 2)]) : 1; });
    const dobri = L.filter((u) => u.istina >= 0.8), losi = L.filter((u) => u.istina < 0.5);
    const udeo = (ul, f) => { const d = ul.flatMap((u) => u.dnevnik); return d.length ? d.filter(f).length / d.length : null; };
    const prvi = L.filter((u) => u.dnevnik[0]).map((u) => ((u.dnevnik[0].ocena === 'ok') === (u.istina >= 0.5)));
    out[ime] = {
      n: L.length,
      sansa: L.reduce((a, u) => a + u.istina, 0) / L.length,
      spremnih: L.filter((u) => u.istina >= 0.85).length / L.length,
      poeni: L.reduce((a, u) => a + u.exp, 0) / L.length,
      nevidjeno: L.reduce((a, u) => a + u.nevidjeno, 0) / L.length,
      nerealnoDana: nad, maxOdnos,
      skok: skok.reduce((a, b) => a + b, 0) / skok.length,
      laznaUzbuna: udeo(dobri, (x) => x.ocena === 'upozorenje' || x.ocena === 'problem'),
      laznaUteha: udeo(losi, (x) => x.ocena === 'ok'),
      prviDanPogodak: prvi.filter(Boolean).length / Math.max(1, prvi.length),
    };
  }
  return out;
}

const fmt = (x, d = 1) => (x == null ? '—' : (100 * x).toFixed(d) + '%');
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), json = args.includes('--json');
  const po = +(args.find((a) => a.startsWith('--po=')) || '--po=30').slice(5);
  const spoljni = process.env.PLAN_SCENARIJI ? JSON.parse(fs.readFileSync(process.env.PLAN_SCENARIJI, 'utf8')) : null;
  const rez = {};
  for (const m of args.filter((a) => !a.startsWith('--'))) {
    const mod = await import(pathToFileURL(path.resolve(process.cwd(), m)).href);
    const t0 = Date.now();
    rez[m] = izmeri(mod, { po, scenariji: spoljni || SCENARIJI });
    rez[m]._ms = Date.now() - t0;
  }
  if (json) console.log(JSON.stringify(rez, null, 1));
  else for (const [m, r] of Object.entries(rez)) {
    console.log(`\n=== ${m} (${r._ms} ms)`);
    for (const [s, v] of Object.entries(r)) if (s !== '_ms') console.log(`  ${s.padEnd(12)} šansa ${fmt(v.sansa)} · spremnih ${fmt(v.spremnih, 0)} · poeni ${v.poeni.toFixed(1)} · neviđeno ${v.nevidjeno.toFixed(0)} | NEREALNO ${fmt(v.nerealnoDana, 0)} dana, max ×${v.maxOdnos.toFixed(2)}, skok ×${v.skok.toFixed(2)} | lažna uzbuna ${fmt(v.laznaUzbuna, 0)} · lažna uteha ${fmt(v.laznaUteha, 0)} · 1. dan pogađa ${fmt(v.prviDanPogodak, 0)}`);
  }
}
