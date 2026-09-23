// PROCENA „simulacije" — šansa za prolaz: simulacije su MERENJE, model po pitanjima je POLAZNA
// PRETPOSTAVKA (prior), a kombinuju se Bajesovski.
//
// Zašto: simulacija je tačan uzorak ispita (isti šablon od 41 mesta) u trenutku kad je rađena, ali je
// bučna (±5 poena po simulaciji) i zastareva (posle nje se uči, a naučeno se i zaboravlja). Model po
// pitanjima vidi sve odgovore, ali mora da pogađa koliko se znanje promenilo. Zato:
//
//  1. MODEL PO PITANJU (sve stope se mere iz SOPSTVENIH odgovora učenika, ne iz napamet uzetih brojeva):
//     f  = koliko često je PRVI odgovor na novo pitanje tačan (prvi odgovor se rekonstruiše iz a/w/streak
//          po pravilima reda iz app.js; kad je dvosmisleno — 50:50);
//     rC = koliko često je DRUGI odgovor tačan kad je prvi bio tačan;
//     rW = koliko često su tačni odgovori POSLE prve greške (posle greške se čita objašnjenje i uči).
//     Iz f i rC sledi Beta(α, β) raspodela „težine" pitanja za tog učenika (Polya urna), pa pitanje
//     tačno k puta bez greške vredi (α+k)/(α+β+k). Pitanje sa greškom: Beta sa sredinom rW, ažurirana
//     odgovorima posle prve greške. Neviđeno pitanje: f po podoblasti, skupljeno ka ukupnom f.
//  2. ZABORAV (Ebbinghaus): naučeno se eksponencijalno vraća ka nivou „pre učenja" (f podoblasti), sa
//     vremenskom konstantom T. T se iz ovih podataka NE MOŽE pouzdano izmeriti (aplikacija čuva samo
//     poslednji odgovor), pa se uprosečava preko T ∈ {10, 30, 90} dana, podjednako (log-ravnomerno od
//     ~nedelju i po do tri meseca). Tu je najveća preostala nesigurnost procene.
//  3. SIMULACIJE KAO PODACI: nepoznat je i sistematski pomak modela d (u logitima, isti za sva
//     pitanja). Prior d ~ Student-t(ν=3, σ): σ = 0,4 (≈ ±3,5 poena kod 90% znanja) plus nesigurnost
//     f kad je malo baze viđeno; teški repovi da bi SAGLASNE simulacije mogle da nadjačaju model.
//     Svaka simulacija se poredi sa modelom U TRENUTKU KAD JE RAĐENA (pitanja viđena posle nje se tada
//     računaju kao neviđena — tako se uračunava učenje posle simulacije; zaborav do tada po T), preko
//     normalne aproksimacije raspodele zbira. Težina simulacije e^(−starost/10 dana), gde se starost
//     meri od POSLEDNJE AKTIVNOSTI učenika, ne od sata (znanje menjaju učenje i zaborav, a zaborav do
//     „sada" je već u modelu). Robusno: 5% verovatnoće da simulacija ne odražava znanje (prekid,
//     nepažnja). Simulacija ispod nivoa nasumičnog klikanja (≈30/98) nije merenje — ne računa se.
//  4. ŠANSA = tačna raspodela zbira po 41 mestu (isti DP kao u aplikaciji), uprosečena po posteriornoj
//     raspodeli (d, T). Nema dovoljno podataka → null: bez simulacija i ispod 30 odgovorenih pitanja,
//     ili bez simulacija a viđeno < 20% gradiva koje ulazi u ispit.
//
// Konstante (sve izabrane unapred iz značenja, ne podešavane prema simulatoru; osetljivost proverena):
//   τ = 10 dana (starenje simulacije), ε = 0,05 (neverodostojna simulacija), σ0 = 0,4 i ν = 3 (koliko
//   se veruje modelu), M = 10 (pseudo-odgovora ka ukupnoj tačnosti za retke stope), K = 20 (pseudo-
//   pitanja ka ukupnom f za podoblast), g0 = 1 dan (stope su merene ~dan posle odgovora, zaborav se
//   broji posle toga), T ∈ {10, 30, 90}, najviše 12 najnovijih simulacija (brzina; starije su ionako
//   pale na < e^−1 težine), prag pokrivenosti 20%.

const sig = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => Math.log(p / (1 - p));
const clamp = (p) => Math.min(0.995, Math.max(0.005, p));

export const PARAM = {
  tau: 10, eps: 0.05, sigma0: 0.4, nu: 3, M: 10, K: 20, g0: 1, Tgrid: [10, 30, 90],
  minPokrivenost: 0.2, maxSim: 12, dStep: 0.1, dMax: 6, GH: 0.5,
};

// ---------- šablon ispita (keš po bazi) ----------
let kes = null;
function bazeno(Q, SIM_SLOTS) {
  if (kes && kes.Q === Q && kes.SIM_SLOTS === SIM_SLOTS) return kes;
  const slotovi = [];
  for (const slot of SIM_SLOTS) {
    const qs = Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p);
    if (qs.length) slotovi.push({ pts: slot.p, qs });
  }
  // nivo nasumičnog klikanja: očekivani poeni kad se pogađa (jedan tačan: 1/n; više tačnih: 1/(2^n−1))
  let slepo = 0;
  for (const s of slotovi) {
    let t = 0;
    for (const x of s.qs) { const n = x.ch.length, k = x.ch.filter((c) => c.ok).length; t += k === 1 ? 1 / n : 1 / (2 ** n - 1); }
    slepo += s.pts * t / s.qs.length;
  }
  kes = { Q, SIM_SLOTS, slotovi, ukupno: slotovi.reduce((a, s) => a + s.pts, 0), slepo };
  return kes;
}

// ---------- P(zbir ≥ prag): ista tačna raspodela zbira kao zajednicko.tacnaSansa, bez alokacija ----------
let bufA = new Float64Array(0), bufB = new Float64Array(0);
function sansaIz(slotP, ukupno, pr) {
  if (bufA.length < ukupno + 1) { bufA = new Float64Array(ukupno + 1); bufB = new Float64Array(ukupno + 1); }
  let r = bufA, n = bufB, hi = 0;
  r.fill(0); r[0] = 1;
  for (const s of slotP) {
    n.fill(0, 0, Math.min(ukupno, hi + s.pts) + 1);
    const p = s.p, q = 1 - p;
    for (let i = 0; i <= hi; i++) { const v = r[i]; if (!v) continue; n[i] += v * q; n[i + s.pts] += v * p; }
    hi = Math.min(ukupno, hi + s.pts); const t = r; r = n; n = t;
  }
  let ps = 0; for (let i = pr; i <= ukupno; i++) ps += r[i];
  return ps;
}

// standardna normalna raspodela (Abramowitz–Stegun 7.1.26, greška < 1,5e−7)
function Fi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? 0.5 * (1 + e) : 0.5 * (1 - e);
}

// Logiti pitanja jednog mesta sabijeni u korpe širine 0,2 (greška zanemarljiva, računanje višestruko brže).
const P_BIN = 5, NB = 12 * P_BIN + 1;
const zb = new Float64Array(NB), br = new Int32Array(NB);
function grupisi(arr, fn) {
  zb.fill(0); br.fill(0);
  for (let i = 0; i < arr.length; i++) {
    const v = fn(arr[i]); let k = Math.round(v * P_BIN) + 6 * P_BIN;
    if (k < 0) k = 0; else if (k >= NB) k = NB - 1;
    zb[k] += v; br[k]++;
  }
  const a = []; let n = 0;
  for (let k = 0; k < NB; k++) if (br[k]) { a.push(zb[k] / br[k], br[k]); n += br[k]; }
  return { a, n };
}
function slotP(grupe, slotovi, d) {
  return grupe.map((g, j) => { let t = 0; const a = g.a; for (let i = 0; i < a.length; i += 2) t += a[i + 1] * sig(a[i] + d); return { pts: slotovi[j].pts, p: t / g.n }; });
}

export function proceni(S, ctx) {
  const { Q, SIM_SLOTS, prag, DAY, sad } = ctx;
  const P = PARAM;
  const { slotovi, ukupno, slepo } = bazeno(Q, SIM_SLOTS);
  const q = (S && S.q) || {};
  // prvi odgovor tačan? siguran za w=0 i w=1 (tačni pre jedine greške), za w≥2 vidi dole
  const prvoTacno = (r) => r.w === 0 || (r.w === 1 && r.a - 1 - r.streak >= 1);

  // ---------- 1. stope iz sopstvene istorije ----------
  let n = 0, nfc = 0, cW = 0, aW = 0, c2 = 0, n2 = 0, ta = 0, tw = 0, posl = 0;
  const poSub = {};
  for (const x of Q) {
    const r = q[x.id]; if (!r || !r.a) continue;
    n++; ta += r.a; tw += r.w; if (r.last > posl) posl = r.last;
    const fc = prvoTacno(r);
    // w≥2: ako tačnih pre poslednje greške nema, prvi je sigurno bio pogrešan; inače se ne zna → 50:50
    const fcw = fc ? 1 : (r.w >= 2 && r.a - r.w - r.streak >= 1 ? 0.5 : 0);
    nfc += fcw;
    const s = poSub[x.sub] || (poSub[x.sub] = { n: 0, fc: 0 }); s.n++; s.fc += fcw;
    if (r.w > 0) { const pre = fc ? 1 : 0; cW += r.a - r.w - pre; aW += r.a - 1 - pre; }
    if (fc && r.a >= 2) { n2++; if (!(r.w >= 1 && r.a - r.w - r.streak === 1)) c2++; }
  }
  const sims = ((S && S.sims) || []).filter((s) => s && s.total > 0 && s.d != null && s.score / s.total > slepo / ukupno);
  for (const sm of sims) if (sm.d > posl) posl = sm.d;
  if (n < 30 && !sims.length) return { sansa: null, exp: null };
  if (!posl) posl = sad;
  const acc = (ta - tw + 1) / (ta + 2);
  const f = (nfc + P.M * acc) / (n + P.M);
  const rW = (cW + P.M * acc) / (aW + P.M);
  const rC = (c2 + P.M * acc) / (n2 + P.M);
  // Beta(α, β) koja daje P(1. tačno) = f i P(2. tačno | 1. tačno) = rC: α+β = (1−rC)/(rC−f)
  let sB = rC > f ? (1 - rC) / (rC - f) : 1e6; sB = Math.min(1e6, Math.max(0.2, sB));
  const aB = f * sB;
  const vUsub = {};
  for (const x of Q) if (!(x.sub in vUsub)) { const s = poSub[x.sub]; vUsub[x.sub] = logit(clamp(s ? (s.fc + P.K * f) / (s.n + P.K) : f)); }
  // znanje pitanja odmah posle poslednjeg odgovora
  const hiOf = (r) => {
    if (r.w === 0) return logit(clamp((aB + r.a) / (sB + r.a)));
    const pre = prvoTacno(r) ? 1 : 0;
    return logit(clamp((rW * sB + (r.a - r.w - pre)) / (sB + (r.a - 1 - pre))));
  };
  // kada je pitanje prvi put viđeno: unazad iz pravila reda (app.js record(): tačno iz prve → potvrda
  // za 3 dana; greška → ponovo odmah/sutra, pa +1, pa +3 dana); pitanje iz simulacije viđeno je do tada
  const uSim = new Map();
  for (const sm of sims) for (const x of sm.qs || []) { const t = uSim.get(x.id); if (t == null || sm.d < t) uSim.set(x.id, sm.d); }
  const prvi = (id, r, last) => {
    const span = r.w === 0 ? (r.a >= 2 ? 3 : 0) : (prvoTacno(r) ? 3 : 0) + r.w + (r.streak >= 2 ? 1 : 0) + (r.streak >= 3 ? 3 : 0);
    let t = last - span * DAY;
    const ts = uSim.get(id); if (ts != null && ts < t) t = ts;
    return t;
  };
  let pokriv = 0;
  const info = slotovi.map((s) => {
    let vid = 0;
    const arr = s.qs.map((x) => {
      const r = q[x.id]; const lo = vUsub[x.sub];
      if (!(r && r.a)) return { lo, hi: lo, last: 0, prvi: Infinity };
      vid++;
      const last = r.last != null ? r.last : posl;   // stari zapis bez vremena: poslednja aktivnost
      return { lo, hi: hiOf(r), last, prvi: prvi(x.id, r, last) };
    });
    pokriv += s.pts * vid / s.qs.length;
    return arr;
  });
  pokriv /= ukupno;
  if (!sims.length && pokriv < P.minPokrivenost) return { sansa: null, exp: null };

  // ---------- 2. zaborav: logit pitanja u trenutku t, za vremensku konstantu T ----------
  const vredn = (e, t, T) => {
    if (!(t > e.prvi)) return e.lo;                                   // tada još neviđeno
    const k = Math.exp(-Math.max(0, (t - e.last) / DAY - P.g0) / T);
    return e.lo + (e.hi - e.lo) * k;
  };

  // ---------- 3. simulacije kao podaci ----------
  const tez = sims.map((sm) => Math.exp(-Math.max(0, posl - sm.d) / DAY / P.tau));
  const aktivne = sims.map((_, k) => k).filter((k) => tez[k] > 0.01).sort((a, b) => sims[b].d - sims[a].d).slice(0, P.maxSim);
  const varF = 1 / Math.max(1, n * f * (1 - f));
  const sigma = Math.sqrt(P.sigma0 ** 2 + (1 - pokriv) ** 2 * varF);
  const pr = prag(ukupno);
  // log-verodostojnost simulacija je glatka u d: računa se na gruboj mreži (korak 0,5) i kubno
  // interpolira (Lagrange kroz 4 tačke) — isti rezultat, višestruko jeftinije
  const GH = P.GH, G0 = -P.dMax - 2 * GH, GN = Math.round((2 * P.dMax + 4 * GH) / GH) + 1;
  const logPost = [], spSve = [], expv = [];
  for (const T of P.Tgrid) {
    const gSad = info.map((arr) => grupisi(arr, (e) => vredn(e, sad, T)));
    const Lg = new Float64Array(GN);
    for (const k of aktivne) {
      const sm = sims[k];
      const g = info.map((arr) => grupisi(arr, (e) => vredn(e, sm.d, T)));
      const sc = sm.total / ukupno;
      for (let gi = 0; gi < GN; gi++) {
        const spk = slotP(g, slotovi, G0 + gi * GH);
        let m = 0, v = 0; for (const x of spk) { m += x.pts * x.p; v += x.pts * x.pts * x.p * (1 - x.p); }
        const sd = Math.sqrt(v) * sc + 1e-6;
        const pm = Math.max(1e-300, Fi((sm.score + 0.5 - m * sc) / sd) - Fi((sm.score - 0.5 - m * sc) / sd));
        Lg[gi] += tez[k] * Math.log((1 - P.eps) * pm + P.eps / (sm.total + 1));
      }
    }
    const Lsim = (d) => {
      if (!aktivne.length) return 0;
      const u = (d - G0) / GH, i0 = Math.min(GN - 4, Math.max(0, Math.floor(u) - 1)), t = u - i0;
      const y0 = Lg[i0], y1 = Lg[i0 + 1], y2 = Lg[i0 + 2], y3 = Lg[i0 + 3];
      return -y0 * (t - 1) * (t - 2) * (t - 3) / 6 + y1 * t * (t - 2) * (t - 3) / 2 - y2 * t * (t - 1) * (t - 3) / 2 + y3 * t * (t - 1) * (t - 2) / 6;
    };
    for (let d = -P.dMax; d <= P.dMax + 1e-9; d += P.dStep) {
      const sp = slotP(gSad, slotovi, d);
      logPost.push(-0.5 * (P.nu + 1) * Math.log(1 + (d / sigma) ** 2 / P.nu) + Lsim(d));
      spSve.push(sp); expv.push(sp.reduce((a, s) => a + s.pts * s.p, 0));
    }
  }

  // ---------- 4. šansa = prosek tačne šanse po posteriornoj raspodeli (d, T) ----------
  let mx = -Infinity; for (const lp of logPost) if (lp > mx) mx = lp;
  let Z = 0, sa = 0, ex = 0;
  for (let i = 0; i < logPost.length; i++) {
    const w = Math.exp(logPost[i] - mx);
    if (w < 1e-9) continue;                          // DP samo tamo gde posterior ima težinu
    Z += w; sa += w * sansaIz(spSve[i], ukupno, pr); ex += w * expv[i];
  }
  return { sansa: sa / Z, exp: ex / Z };
}
