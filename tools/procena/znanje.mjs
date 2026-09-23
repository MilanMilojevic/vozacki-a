// PROCENA „znanje" — model stanja znanja po pitanju (pamćenje + zaborav), kalibrisan simulacijama.
//
// 1. Znanje „iz prve": iz brojača (a, w, streak) i pravila reda aplikacije rekonstruiše se da li je PRVI
//    odgovor na pitanje bio tačan (sigurno kad w=0 ili nema „viška" tačnih van završnog niza; inače Bayes).
//    Udeo tačnih iz prve (po podoblasti, skupljeno ka ukupnom sa težinom K_SUB=20 pitanja) = šta učenik zna
//    o pitanju koje još nije video. Težina pitanja je logit-normalna, SIGMA=1 logit (uobičajena IRT skala).
// 2. Dobit od učenja (PFA/DASH model, Pavlik 2009, Lindsey 2014): logit p = β_pitanja + gC·log2(1+tačnih)
//    + gW·log2(1+netačnih). gC i gW se NE pogađaju nego računaju iz učenikovih sopstvenih ponavljanja:
//    koliko često prođe potvrdu posle tačnog iz prve, i koliko često prođe ponavljanje posle greške.
//    Log-brojevi (umesto zbira) jer ponavljanja istog pitanja daju sve manju dobit.
// 3. Za svako viđeno pitanje β se procenjuje iz njegove istorije (Bayes, Gauss-Hermite po β) — pitanje na
//    kom si dvaput pao je verovatno teško za tebe, i to se pamti čak i kad je sad „naučeno".
// 4. Zaborav: naučena dobit bledi ka znanju iz prve, exp(-dani/τ). τ se ne zna unapred: prior je
//    log-ravnomeran od nedelju dana do pola godine (TAUS), a simulacije biraju τ (težine po verodostojnosti).
// 5. Simulacije: svaka je 41 pitanje izvučeno iz istih bazena kao ispit, pa je direktno merenje. Model se
//    vraća u trenutak svake simulacije (pitanja poslednji put viđena pre nje: tačno stanje; kasnije prvi
//    put viđena: neviđena; kasnije ponovljena: sadašnje stanje) i iz ishoda se procenjuje zajednička
//    korekcija δ (logit) sa robustnim Student-t priorom (skala 0,3, ν=3): mala ako model valja, velika
//    ako simulacije kažu drugačije (npr. 5 simulacija po 70 poena).
// 6. Šansa = tačna raspodela poena po 41 mestu šablona (tacnaSansa), usrednjena preko nesigurnosti τ i δ.
//    Bez simulacija i sa manje od pola ispita pokrivenog (≥3 viđena pitanja po bazenu) → null.
import { tacnaSansa } from './zajednicko.mjs';

const sig = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => { const q = Math.min(1 - 1e-9, Math.max(1e-9, p)); return Math.log(q / (1 - q)); };
const GH_X = [-4.512745863399783, -3.205429002856470, -2.076847978677830, -1.023255663789133, 0, 1.023255663789133, 2.076847978677830, 3.205429002856470, 4.512745863399783];
const GH_W = [2.234584400774658e-5, 2.789141321231769e-3, 4.991640676521788e-2, 2.440975028949394e-1, 4.063492063492063e-1, 2.440975028949394e-1, 4.991640676521788e-2, 2.789141321231769e-3, 2.234584400774658e-5];
const G5_X = [-2.856970013872806, -1.355626179974266, 0, 1.355626179974266, 2.856970013872806];
const G5_W = [0.011257411327721, 0.222075922005613, 0.533333333333333, 0.222075922005613, 0.011257411327721];
const NK = 9;
const SIGMA = 1.0;
function sredina(mu) { let m1 = 0; for (let k = 0; k < NK; k++) m1 += GH_W[k] * sig(mu + SIGMA * GH_X[k]); return m1; }
function muZa(f) { let lo = -8, hi = 8; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (sredina(m) < f) lo = m; else hi = m; } return (lo + hi) / 2; }
// gain g such that E[w(b) sig(b+g)] / E[w(b)] = target, where w = sig (first correct) or 1-sig (first wrong)
function dobitZa(mu, target, prvoTacno) {
  const val = (g) => { let n = 0, d = 0; for (let k = 0; k < NK; k++) { const b = mu + SIGMA * GH_X[k], w = GH_W[k] * (prvoTacno ? sig(b) : 1 - sig(b)); n += w * sig(b + g); d += w; } return n / d; };
  if (val(0) >= target) return 0;
  let lo = 0, hi = 4; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (val(m) < target) lo = m; else hi = m; } return (lo + hi) / 2;
}

export const TAUS = [7, 14, 28, 56, 112, 224];
const DELTA_S = 0.3, DELTA_NU = 3; // Student-t prior on the whole-model correction (robust: small usually, large if sims demand)
const K_SUB = 20;
const MAX_SIMS = 12;
const GRUPA = 8;

// Probability that the FIRST answer to this question was correct, reconstructed from the final
// counters under the app's queue rules. w==0 -> surely correct; no "extra" correct answers outside the
// final streak -> surely wrong. Otherwise Bayes: a correct first answer that later failed has prior
// weight f*(1-c); a wrong first answer needs its extra corrects to be early/simulation answers, which
// happen at rate lam per question (measured on never-failed questions).
function prvoTacno(r, par) {
  if (r.w === 0) return 1;
  if (r.a <= r.w) return 0;
  const ex = r.a - r.w - (r.streak || 0);
  if (ex <= 0) return 0;
  if (!par) return r.w === 1 ? 1 : 1 / r.w;
  const pc = par.f * (1 - par.c), pw = (1 - par.f) * (r.w === 1 ? par.lam : 1);
  return pc / (pc + pw);
}
// canonical answer sequence consistent with (a, w, streak) and the given first outcome
function niz(r, prvi) {
  const a = r.a, w = r.w, st = Math.min(r.streak || 0, a - w);
  if (w === 0) return new Array(a).fill(1);
  const s = [prvi];
  let nW = w - (prvi ? 0 : 1), nC = a - w - st - (prvi ? 1 : 0);
  if (nC < 0) nC = 0;
  let tail = st + (nW === 0 ? nC : 0); if (nW === 0) nC = 0;
  if (prvi && nC > 0) { s.push(1); nC--; } // confirmation passed; the wrong came later
  while (nW > 0) { s.push(0); nW--; if (nC > 0 && nW > 0) { s.push(1); nC--; } }
  // leftover extras go before the final streak (they did not count toward it)
  while (nC > 0) { s.splice(s.length - 1, 0, 1); nC--; }
  for (let i = 0; i < tail; i++) s.push(1);
  while (s.length < a) s.push(1);
  return s.slice(0, a);
}

export function model(S, ctx) {
  const { Q, SIM_SLOTS, DAY } = ctx;
  // pass 1 with the plain rule, pass 2 with the Bayes rule fed by pass-1 rates
  let par = null, N = 0, f = 0.5, conf = 0.5, rWC = 0.5, sub = {};
  let rane = 0, n0 = 0;
  for (const q of Q) { const r = S.q[q.id]; if (r && r.a && r.w === 0) { n0++; rane += r.a - Math.min(r.a, r.streak || 0); } }
  const lam = (rane + 0.5) / (n0 + 1);
  for (let prolaz = 0; prolaz < 2; prolaz++) {
    N = 0; sub = {};
    let firstC = 0, confOk = 0, confN = 0, WC = 0, WW = 0;
    for (const q of Q) {
      const r = S.q[q.id]; if (!r || !r.a) continue;
      N++;
      const p1 = prvoTacno(r, par);
      firstC += p1;
      const s = sub[q.sub] || (sub[q.sub] = { n: 0, c: 0 }); s.n++; s.c += p1;
      if (r.a >= 2) {
        if (r.w === 0) { confOk++; confN++; }
        else {
          if (p1 > 0) { const sq = niz(r, 1); confN += p1; if (sq[1]) confOk += p1; }
          if (p1 < 1) { const sq = niz(r, 0); if (sq[1]) WC += 1 - p1; else WW += 1 - p1; }
        }
      }
    }
    f = Math.min(0.99, Math.max(0.05, (firstC + 1) / (N + 2)));
    conf = (confOk + 1) / (confN + 2); rWC = (WC + 1) / (WC + WW + 2);
    par = { f, c: conf, lam };
  }
  const mu = muZa(f);
  const gC = dobitZa(mu, conf, true), gW = dobitZa(mu, rWC, false);
  const dobit = (nc, nw) => gC * Math.log2(1 + nc) + gW * Math.log2(1 + nw);
  const fSub = (s) => { const x = sub[s]; return x ? (x.c + K_SUB * f) / (x.n + K_SUB) : f; };
  const muSub = {}; const muOf = (s) => (muSub[s] != null ? muSub[s] : (muSub[s] = muZa(fSub(s))));
  const pools = []; const poolKey = new Map(); const idx = new Map(); const qs = [];
  let ukPts = 0, pokriveno = 0;
  for (const slot of SIM_SLOTS) {
    const pool = Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p);
    if (!pool.length) continue;
    const key = slot.p + ':' + slot.s.join(',');
    let pi = poolKey.get(key);
    if (pi == null) {
      pi = pools.length; poolKey.set(key, pi);
      pools.push({ ix: pool.map((q) => { if (!idx.has(q.id)) { idx.set(q.id, qs.length); qs.push(q); } return idx.get(q.id); }) });
    }
    ukPts += slot.p;
    const vid = pool.filter((q) => S.q[q.id] && S.q[q.id].a).length;
    pokriveno += slot.p * Math.min(1, vid / 3);
  }
  const poolOf = new Map();
  for (const [, pi] of poolKey) for (const i of pools[pi].ix) if (!poolOf.has(qs[i].id)) poolOf.set(qs[i].id, pi);
  const slotsPts = []; for (const slot of SIM_SLOTS) { const key = slot.p + ':' + slot.s.join(','); if (poolKey.has(key)) slotsPts.push({ pi: poolKey.get(key), pts: slot.p }); }
  // per-question recall as a function of the remaining gain g, tabulated once per distinct history
  const TAB = 12, tabele = new Map();
  const info = qs.map((q) => {
    const r = S.q[q.id];
    if (!r || !r.a) return { seen: false, prior: fSub(q.sub) };
    const p1 = prvoTacno(r, par);
    const G = dobit(r.a - r.w, r.w);
    const key = q.sub + '|' + r.a + '|' + r.w + '|' + (r.streak || 0) + '|' + p1.toFixed(4);
    let tab = tabele.get(key);
    if (!tab) {
      const m = muOf(q.sub);
      const post = new Float64Array(NK);
      for (const [prvi, tez] of [[1, p1], [0, 1 - p1]]) {
        if (tez <= 0) continue;
        const sq = niz(r, prvi);
        for (let k = 0; k < NK; k++) {
          const b = m + SIGMA * GH_X[k]; let g = 0, L = 1, nc = 0, nw = 0;
          for (const ok of sq) { const p = sig(b + g); L *= ok ? p : 1 - p; if (ok) nc++; else nw++; g = dobit(nc, nw); }
          post[k] += tez * GH_W[k] * L;
        }
      }
      let Z = 0; for (let k = 0; k < NK; k++) Z += post[k];
      tab = new Float64Array(TAB + 1);
      for (let j = 0; j <= TAB; j++) { const g = G * j / TAB; let p = 0; for (let k = 0; k < NK; k++) p += post[k] * sig(m + SIGMA * GH_X[k] + g); tab[j] = p / Z; }
      tabele.set(key, tab);
    }
    const last = r.last || 0;
    const t1 = last - 1.5 * (r.a - 1) * DAY;
    return { seen: true, prior: fSub(q.sub), tab, last, t1, a: r.a };
  });
  return { N, f, conf, rWC, gC, gW, pools, poolOf, slotsPts, info, qs, pokrivenost: pokriveno / ukPts };
}

// recall of one question at time t, if the learned gain fades toward first-sight knowledge with time constant tau
function pAt(x, t, tau, DAY) {
  if (!x.seen) return x.prior;
  if (x.last > t) return (x.t1 > t || x.a === 1) ? x.prior : x.tab[x.tab.length - 1];
  const u = (x.tab.length - 1) * Math.exp(-(t - x.last) / DAY / tau);
  const j = Math.min(x.tab.length - 2, Math.floor(u)), fr = u - j;
  return x.tab[j] + (x.tab[j + 1] - x.tab[j]) * fr;
}
export { pAt };

function grupe(M, t, tau, DAY) {
  return M.pools.map((pl) => {
    const ps = new Float64Array(pl.ix.length);
    for (let j = 0; j < ps.length; j++) ps[j] = pAt(M.info[pl.ix[j]], t, tau, DAY);
    ps.sort();
    const g = Math.min(GRUPA, ps.length), out = new Float64Array(g), w = new Float64Array(g);
    for (let k = 0; k < g; k++) {
      const a = Math.floor(k * ps.length / g), b = Math.floor((k + 1) * ps.length / g);
      let s = 0; for (let j = a; j < b; j++) s += ps[j];
      out[k] = logit(s / (b - a)); w[k] = (b - a) / ps.length;
    }
    return { l: out, w };
  });
}
const poolP = (G, delta) => G.map((g) => { let s = 0; for (let k = 0; k < g.l.length; k++) s += g.w[k] * sig(g.l[k] + delta); return s; });

export function proceni(S, ctx) {
  const { sad, DAY } = ctx;
  const M = model(S, ctx);
  const sims = (S.sims || []).filter((s) => s && s.total > 0 && s.score > 0 && s.d <= sad).slice(-MAX_SIMS);
  if (M.N < 30) return { sansa: null, exp: null };
  if (!sims.length && M.pokrivenost < 0.5) return { sansa: null, exp: null };
  const obs = sims.map((s) => {
    const wrong = new Set(s.wrong || []);
    const items = (s.qs || []).map((x) => ({ pi: M.poolOf.get(x.id), ok: !wrong.has(x.id) })).filter((x) => x.pi != null);
    if (items.length < 0.8 * M.slotsPts.length) return { score: s.score / s.total };
    const ok = new Float64Array(M.pools.length), bad = new Float64Array(M.pools.length);
    for (const it of items) (it.ok ? ok : bad)[it.pi]++;
    return { ok, bad };
  });
  const ukupno = M.slotsPts.reduce((a, s) => a + s.pts, 0);
  // pass mark from the app's own rule; (prag - 0.5)/ukupno so that ceil() inside tacnaSansa lands exactly on it
  const udeo = ctx.prag ? (ctx.prag(ukupno) - 0.5) / ukupno : 0.85;
  const res = [];
  for (const tau of TAUS) {
    const Gs = sims.map((s) => grupe(M, s.d, tau, DAY));
    const Gnow = grupe(M, sad, tau, DAY);
    const ll = (delta) => {
      let lp = -0.5 * (DELTA_NU + 1) * Math.log(1 + (delta / DELTA_S) ** 2 / DELTA_NU);
      for (let k = 0; k < sims.length; k++) {
        const P = poolP(Gs[k], delta), o = obs[k];
        if (o.ok) { for (let j = 0; j < P.length; j++) { if (o.ok[j]) lp += o.ok[j] * Math.log(Math.max(1e-12, P[j])); if (o.bad[j]) lp += o.bad[j] * Math.log(Math.max(1e-12, 1 - P[j])); } }
        else {
          let mu = 0, v = 0; for (const s of M.slotsPts) { const p = P[s.pi]; mu += s.pts * p; v += s.pts * s.pts * p * (1 - p); }
          v += 1; lp += -0.5 * (o.score * ukupno - mu) ** 2 / v - 0.5 * Math.log(v);
        }
      }
      return lp;
    };
    let a = -7, b = 4; const gr = 0.6180339887;
    let c = b - gr * (b - a), d = a + gr * (b - a), fc = ll(c), fd = ll(d);
    for (let i = 0; i < 20; i++) { if (fc > fd) { b = d; d = c; fd = fc; c = b - gr * (b - a); fc = ll(c); } else { a = c; c = d; fc = fd; d = a + gr * (b - a); fd = ll(d); } }
    const m = (a + b) / 2, h = 0.05, fm = ll(m);
    const curv = -(ll(m + h) - 2 * fm + ll(m - h)) / (h * h);
    const sd = curv > 0 ? 1 / Math.sqrt(curv) : DELTA_S;
    let sansa = 0, exp = 0;
    for (let k = 0; k < 5; k++) {
      const P = poolP(Gnow, m + sd * G5_X[k]);
      const t = tacnaSansa(M.slotsPts.map((s) => ({ pts: s.pts, p: P[s.pi] })), udeo);
      sansa += G5_W[k] * t.sansa; exp += G5_W[k] * t.exp;
    }
    res.push({ tau, lz: fm + Math.log(sd), sansa, exp, m, sd });
  }
  const mx = Math.max(...res.map((r) => r.lz));
  let Z = 0, sansa = 0, exp = 0;
  for (const r of res) { const w = Math.exp(r.lz - mx); Z += w; sansa += w * r.sansa; exp += w * r.exp; }
  return { sansa: sansa / Z, exp: exp / Z, _res: res };
}
