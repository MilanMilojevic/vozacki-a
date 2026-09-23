(function () {
'use strict';
// PROCENA ŠANSE ZA PROLAZ (procena.js) — iz tools/procena/bayes.mjs, pobednika merenja v145.
// Klasična skripta: učitavaju je i aplikacija (index.html) i merni alat (tools/kalibracija-sanse.mjs),
// pa se meri TAČNO ono što se isporučuje. Izlaz: self.VozackiProcena.proceni(S, ctx).
//
// Originalni opis:
// PROCENA „bayes" — empirijski Bayes po pitanju, sa modelom učenja i zaborava.
//
// Ideja u jednoj rečenici: iz (a, w, streak, last) se rekonstruiše redosled odgovora za svako
// pitanje, na SVIM pitanjima zajedno se proceni kako ovaj učenik uči (koliko zna na prvi pogled,
// koliko se pitanja razlikuju, koliko pomaže tačan a koliko pogrešan odgovor), pa se za svako
// pitanje izračuna koliko ga zna DANAS; simulacije služe kao provera i ispravka modela.
//
// 1. Rekonstrukcija. Iz (a, w, streak) i pravila reda iz aplikacije: w=0 → sve tačno; a−w=streak →
//    prvo sve greške pa niz tačnih; w=1 i višak tačnih → prvi odgovor tačan; w≥2 i višak → dva
//    moguća redosleda, svaki sa težinom ½. Razmaci između odgovora su iz pravila reda (posle greške
//    1 dan, posle tačnog 1 ili 3 dana, posle izlaska iz reda 21 dan = OSVEZI_POSLE iz aplikacije).
// 2. Model (Performance Factors Analysis + eksponencijalni zaborav, standardni model iz literature o
//    učenju): logit P(tačno) = l0 + D, gde je l0 = „znanje na prvi pogled" tog pitanja, a D zbir
//    dobitaka od prethodnih odgovora (gC posle tačnog, gW posle pogrešnog = pročitano objašnjenje),
//    koji blede sa vremenskom konstantom T. l0 ~ N(th + δ_podoblast, sd²): to je EMPIRIJSKI BAYES
//    PRIOR — njegovo središte i širina se procenjuju iz podataka ISTOG učenika (svih ~1300 pitanja),
//    a ne fiksira se na Beta(1,1) kao u staroj formuli. th, sd, gC, gW = najverovatnije vrednosti
//    (uz slabe priore, samo da bi degenerisani podaci imali konačan odgovor).
// 3. Po pitanju: posterior od l0 iz sopstvenog niza odgovora tog pitanja → verovatnoća danas, sa
//    zaboravom od poslednjeg odgovora. Neviđeno pitanje = stopa prvog pogleda svoje podoblasti,
//    skupljena ka ukupnoj (Beta-binomni EB, snaga iz rasipanja među podoblastima).
// 4. Zaborav T se iz reda za ponavljanje ne vidi (razmaci su samo 1–3 dana; probano da se fituje —
//    procene su skakale od 10 do 430 dana), pa se ne pogađa: rezultat je prosek preko
//    ln T ~ N(ln 30, 0,7²) (tri tačke: 9, 30, 101 dan).
// 5. Simulacije: svaka je uzorak ispita. Porede se sa onim što je model očekivao U TRENUTKU
//    simulacije; zajednička greška modela b se procenjuje iz tih razlika (a priori: 90% N(0, 2²),
//    10% N(0, 8²) poena; starije simulacije nose manje: +1 poen² varijanse po danu starosti).
//    Simulacije daju i težine granama zaborava (Bayes: grana čiji je model bolje pogodio simulacije
//    dobija više), sa kaljenjem ½. Poznata slabost: nivo može da objasni i b i T, pa kad model greši
//    iz drugog razloga, pomeri i T; kaljenje to ublažava (bez njega mnogoSim ima 7 promašaja >25 p.p.).
// 6. Šansa = tačna raspodela zbira poena po šablonu (isti DP kao aplikacija), usrednjena preko
//    neizvesnosti (greška modela, neviđena pitanja). Premalo dokaza → null.


// tačna raspodela zbira poena po slotovima (isti DP kao sansaZaProlaz u app.js)
function tacnaSansa(slotP, udeo) {
  const ukupno = slotP.reduce((a, s) => a + s.pts, 0);
  let r = new Float64Array(ukupno + 1); r[0] = 1;
  for (const s of slotP) {
    const n = new Float64Array(ukupno + 1);
    for (let i = 0; i <= ukupno; i++) { const v = r[i]; if (!v) continue; n[i] += v * (1 - s.p); if (i + s.pts <= ukupno) n[i + s.pts] += v * s.p; }
    r = n;
  }
  const prag = Math.ceil(udeo * ukupno);
  let sansa = 0; for (let i = prag; i <= ukupno; i++) sansa += r[i];
  return { sansa };
}

// ---------- konstante (sve fiksirane unapred, obrazloženje uz svaku) ----------
const T0 = 30;              // dana: središte priora za zaborav (mesec dana; bez simulacija se ne može izmeriti)
const SD_LNT = 0.7;         // neizvesnost zaborava: ±√3·0,7 → 9 do 101 dan (faktor ~3 u oba smera)
// a priori greška modela b (poena), mešavina: u 9 od 10 slučajeva model je tačan do ~2 poena (toliko
// greši u proveri kad su mu pretpostavke tačne), u 1 od 10 učenikove navike ruše pretpostavke (npr.
// uči i van aplikacije, ponavlja odmah) i greška je reda 8 poena. Teški rep znači: male razlike
// između simulacija i modela se pripisuju šumu simulacija, a velike i dosledne se prihvataju.
const MIX = [[0.9, 2], [0.1, 8]];
const DRIFT = 1.0;          // poena²/dan: simulacija stara 25 dana ima dvostruko veću varijansu od sveže
// simulacije kao dokaz o zaboravu vrede POLA: razlike uzastopnih simulacija dele istu grešku modela u
// tom trenutku, pa nisu nezavisni dokazi (kaljena verodostojnost, „safe Bayes")
const KALJENJE = 0.5;
const K_SIM = 10;
const A_MAX = 20;           // najviše odgovora po pitanju koje procena gleda (iznad toga: sporo, a ništa ne menja)
// Simulacija sa više od MAX_NEODG neodgovorenih pitanja je PREKINUTA (predata posle par pitanja,
// ostavljena da istekne) — nije uzorak znanja. Jedna takva je Milanovu procenu obarala sa 71% na 13%.
const MAX_NEODG = 5;           // poslednjih 10 simulacija (starije ionako skoro ništa ne nose)
const POKRIVENOST_MIN = 1 / 3;   // bez simulacija: bar trećina poena ispita mora imati bar 10 viđenih pitanja
const RAZMAK_IZLAZ = 21;    // dana: aplikacija vraća utvrđeno pitanje posle 21 dan (OSVEZI_POSLE)
// slabi priori za fit [th, ln sd, gC, gW] — samo da degenerisani podaci (npr. sve prvo pogrešno)
// imaju konačan odgovor; sa ~1000 pitanja podaci ih nadjačaju
const PRIOR_M = [0.5, Math.log(0.8), 0.3, 1.0];
const PRIOR_S = [2.0, 0.7, 1.0, 1.0];

const lg = (p) => Math.log(p / (1 - p));
const sg = (x) => 1 / (1 + Math.exp(-x));
// brza logistička funkcija (tabela, korak 1/64, linearno) — za fit i tabele, greška < 1e-4
const SGT_K = 64, SGT_M = 16, SGT = new Float64Array(2 * SGT_M * SGT_K + 2);
for (let i = 0; i < SGT.length; i++) SGT[i] = 1 / (1 + Math.exp(-(i / SGT_K - SGT_M)));
const sgBrzo = (x) => { let u = (x + SGT_M) * SGT_K; if (u <= 0) return SGT[0]; if (u >= 2 * SGT_M * SGT_K) return SGT[2 * SGT_M * SGT_K]; const i = u | 0; const f = u - i; return SGT[i] + (SGT[i + 1] - SGT[i]) * f; };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// mreža za N(0,1) (13 tačaka, korak 0,75) — podintegralne funkcije su glatke
const NZ = 13;
const Z = new Float64Array(NZ), ZV = new Float64Array(NZ);
{ let t = 0; for (let i = 0; i < NZ; i++) { Z[i] = -4.5 + i * 0.75; ZV[i] = Math.exp(-Z[i] * Z[i] / 2); t += ZV[i]; } for (let i = 0; i < NZ; i++) ZV[i] /= t; }
// verovatnosni Gauss–Hermite, 9 čvorova (integral preko neizvesnosti ukupnih poena)
const GH9 = [[-4.5127458633997, 2.23484e-5], [-3.2054290028565, 0.00278914], [-2.0768479786778, 0.0499164], [-1.0232556637892, 0.244098], [0, 0.406349], [1.0232556637892, 0.244098], [2.0768479786778, 0.0499164], [3.2054290028565, 0.00278914], [4.5127458633997, 2.23484e-5]];
{ const s = GH9.reduce((a, x) => a + x[1], 0); for (const x of GH9) x[1] /= s; }   // zbir tačno 1 (bio je 1,00000078)
const RET_N = 8;            // tabela verovatnoće po zadržanosti ret ∈ [0,1], linearna interpolacija

// ---------- rekonstrukcija redosleda odgovora ----------
function redosledi(a, w, st) {
  const s = Math.min(st, a - w), e = a - w - s;
  const C = (n) => Array(n).fill(1), W = (n) => Array(n).fill(0);
  if (w === 0) return [{ x: C(a), t: 1 }];
  if (e === 0) return [{ x: [...W(w), ...C(s)], t: 1 }];
  if (w === 1) return [{ x: [...C(e), 0, ...C(s)], t: 1 }];
  const rasporedi = (k) => {   // k dodatnih tačnih u w−1 razmaka između grešaka (nizovi ≤2, pa preliv)
    const g = Array(w - 1).fill(0); let i = 0;
    while (k > 0) { if (g[i] < 2 || g.every((y) => y >= 2)) { g[i]++; k--; } i = (i + 1) % g.length; }
    const x = []; for (let j = 0; j < w; j++) { x.push(0); if (j < w - 1) x.push(...C(g[j])); }
    return [...x, ...C(s)];
  };
  return [{ x: [1, ...rasporedi(e - 1)], t: 0.5 }, { x: rasporedi(e), t: 0.5 }];
}
function razmaci(x) {   // dana između uzastopnih odgovora, po pravilima reda iz aplikacije
  const g = new Float64Array(Math.max(0, x.length - 1)); let imaW = false, st = 0;
  for (let i = 0; i < x.length - 1; i++) {
    if (x[i]) st++; else { imaW = true; st = 0; }
    g[i] = !x[i] ? 1 : imaW ? (st === 1 ? 1 : st === 2 ? 3 : RAZMAK_IZLAZ) : (st === 1 ? 3 : RAZMAK_IZLAZ);
  }
  return g;
}

// Nelder–Mead (maksimizacija), sa ranim zaustavljanjem
function nm(f, x0, korak, iter, tol) {
  const n = x0.length; let pts = [x0.slice()];
  for (let i = 0; i < n; i++) { const p = x0.slice(); p[i] += korak[i]; pts.push(p); }
  let val = pts.map(f);
  for (let it = 0; it < iter; it++) {
    const idx = val.map((_, i) => i).sort((a, b) => val[b] - val[a]);
    pts = idx.map((i) => pts[i]); val = idx.map((i) => val[i]);
    if (val[0] - val[n] < tol) break;
    const c = new Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += pts[i][j] / n;
    const tacka = (t) => c.map((cj, j) => cj + t * (pts[n][j] - cj));
    const xr = tacka(-1), fr = f(xr);
    if (fr > val[0]) { const xe = tacka(-2), fe = f(xe); if (fe > fr) { pts[n] = xe; val[n] = fe; } else { pts[n] = xr; val[n] = fr; } }
    else if (fr > val[n - 1]) { pts[n] = xr; val[n] = fr; }
    else {
      const xc = tacka(0.5), fc = f(xc);
      if (fc > val[n]) { pts[n] = xc; val[n] = fc; }
      else for (let i = 1; i <= n; i++) { pts[i] = pts[i].map((p, j) => pts[0][j] + 0.5 * (p - pts[0][j])); val[i] = f(pts[i]); }
    }
  }
  let b = 0; for (let i = 1; i <= n; i++) if (val[i] > val[b]) b = i;
  return pts[b];
}

// bazeni šablona se računaju jednom po (Q, SIM_SLOTS)
const kesBazena = new WeakMap();
function bazeniZa(Q, SIM_SLOTS) {
  let m = kesBazena.get(Q); if (!m) { m = new WeakMap(); kesBazena.set(Q, m); }
  let b = m.get(SIM_SLOTS);
  if (!b) { b = SIM_SLOTS.map((slot) => ({ pts: slot.p, subs: slot.s, pool: Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p) })).filter((x) => x.pool.length); m.set(SIM_SLOTS, b); }
  return b;
}

function proceni(S, ctx) {
  const { Q, SIM_SLOTS, sad, DAY } = ctx;
  const bazeni = bazeniZa(Q, SIM_SLOTS);
  const ukupno = bazeni.reduce((a, b) => a + b.pts, 0);
  const udeo = ctx.prag ? ctx.prag(ukupno) / ukupno : 0.85;

  // ---------- 1. obrasci odgovora + prvi pogled ----------
  const obrasci = new Map();
  const obrazac = (a, w, st) => {
    const k = a + '/' + w + '/' + Math.min(st, a - w);
    let o = obrasci.get(k);
    if (!o) {
      o = { k, n: 0, red: redosledi(a, w, st).map((y) => ({ x: Uint8Array.from(y.x), t: y.t, g: razmaci(y.x) })) };
      o.prvi = o.red.reduce((acc, y) => acc + y.t * y.x[0], 0);
      o.poslednjaGreska = o.red.every((y) => !y.x[y.x.length - 1]);
      obrasci.set(k, o);
    }
    return o;
  };
  const vidjeno = [], poId = new Map();
  const fs = {}; let fN = 0, fC = 0;
  for (const q of Q) {
    const r = S.q && S.q[q.id]; if (!r || !(r.a > 0)) continue;
    const a = Math.min(r.a | 0, A_MAX), w = Math.min(Math.max(0, r.w | 0), a), st = Math.max(0, r.streak | 0);
    const o = obrazac(a, w, st); o.n++;
    const x = fs[q.sub] || (fs[q.sub] = { n: 0, c: 0 }); x.n++; x.c += o.prvi; fN++; fC += o.prvi;
    const e = { q, o, last: Number.isFinite(r.last) ? Math.min(r.last, sad) : sad };
    vidjeno.push(e); poId.set(q.id, e);
  }
  const maxNeodg = Number.isFinite(ctx._maxNeodg) ? ctx._maxNeodg : MAX_NEODG;
  const neodgovoreno = (s) => {
    if (Number.isFinite(s.odg) && Array.isArray(s.qs)) return s.qs.length - s.odg;           // zapis od v145 nosi broj odgovorenih
    if (!Array.isArray(s.qs) || !s.qs.length || s.qs.every((e) => !e.ch || !e.ch.length)) return 0;   // pre v127 izbori su brisani — ne zna se
    return s.qs.filter((e) => !e.ch || !e.ch.length).length;
  };
  const sims = (S.sims || []).filter((s) => s && s.total > 0 && s.score > 0 && s.score <= s.total && Number.isFinite(s.d) && s.d <= sad && neodgovoreno(s) <= maxNeodg)
    .sort((a, b) => a.d - b.d).slice(-K_SIM);
  const pokriveno = bazeni.reduce((a, b) => {
    const subs = new Set(b.pool.map((q) => q.sub)); let n = 0; for (const s of subs) n += fs[s] ? fs[s].n : 0;
    return a + b.pts * Math.min(1, n / 10);
  }, 0) / ukupno;
  if (!sims.length && (fN < 30 || pokriveno < POKRIVENOST_MIN)) return { sansa: null, exp: null, pokriveno, odgovoreno: fN };

  // ---------- 2. fit modela učenja (T = T0 tokom fita: razmaci u redu su 1–3 dana, pa T tu malo znači) ----------
  const lista = [...obrasci.values()];
  const maxLen = lista.reduce((a, o) => Math.max(a, o.red[0].x.length), 1);
  const Dbuf = new Float64Array(maxLen + 1), sj = new Float64Array(NZ);
  const eg = new Map();
  const pad = (g) => { let v = eg.get(g); if (v === undefined) { v = Math.exp(-g / T0); eg.set(g, v); } return v; };
  const logPost = (v) => {
    const th = v[0], sd = Math.exp(v[1]), gC = Math.max(0, v[2]), gW = v[3];
    let ll = 0;
    for (let i = 0; i < 4; i++) ll -= 0.5 * ((v[i] - PRIOR_M[i]) / PRIOR_S[i]) ** 2;
    for (const o of lista) {
      sj.fill(0);
      for (const y of o.red) {
        const x = y.x, n = x.length; let D = 0;
        for (let i = 0; i < n; i++) { Dbuf[i] = D; D += x[i] ? gC : gW; if (i < n - 1) D *= pad(y.g[i]); }
        for (let j = 0; j < NZ; j++) {
          const l0 = th + sd * Z[j]; let L = y.t;
          for (let i = 0; i < n; i++) { const p = sgBrzo(l0 + Dbuf[i]); L *= x[i] ? p : 1 - p; }
          sj[j] += L;
        }
      }
      let mm = 0; for (let j = 0; j < NZ; j++) mm += ZV[j] * sj[j];
      ll += o.n * Math.log(mm > 1e-300 ? mm : 1e-300);
    }
    return ll;
  };
  const v0 = [lg(clamp((fC + 1) / (fN + 2), 0.02, 0.98)) + 0.3, Math.log(0.8), 0.3, 1.0];
  const fit = fN ? nm(logPost, v0, [0.5, 0.3, 0.3, 0.5], 600, 1e-3) : PRIOR_M.slice();
  const th = fit[0], sd = Math.exp(fit[1]), gC = Math.max(0, fit[2]), gW = fit[3];

  // gornja granica za pitanje čiji je poslednji odgovor bio pogrešan: sopstvena stopa „ispravio posle
  // greške". Model sabira dobitke, pa bi pitanje pogrešeno dvaput proglasio naučenim; to nije viđeno.
  let pgN = 0, pgC = 0;
  for (const o of lista) for (const y of o.red) for (let i = 0; i + 1 < y.x.length; i++) if (!y.x[i]) { pgN += o.n * y.t; pgC += o.n * y.t * y.x[i + 1]; }
  const posleGreske = (pgC + 1) / (pgN + 2);

  // ---------- 3. podoblasti: EB stopa prvog pogleda ----------
  const mu = (fC + 1) / (fN + 2);
  let m = 20;   // dok nema bar 3 podoblasti sa ≥5 pitanja: skupljanje kao da je viđeno 20 pitanja
  { const ks = Object.values(fs).filter((x) => x.n >= 5);
    if (ks.length >= 3) {
      const ps = ks.map((x) => x.c / x.n), mp = ps.reduce((a, b) => a + b, 0) / ps.length;
      const vo = ps.reduce((a, p) => a + (p - mp) ** 2, 0) / (ps.length - 1);
      const vs = ks.reduce((a, x) => a + mp * (1 - mp) / x.n, 0) / ks.length;
      m = clamp(mp * (1 - mp) / Math.max(1e-4, vo - vs) - 1, 2, 200);
    } }
  const marg = (l) => { let s = 0; for (let j = 0; j < NZ; j++) s += ZV[j] * sg(l + sd * Z[j]); return s; };
  const margTh = marg(th);
  const bSub = (sub) => { const x = fs[sub] || { n: 0, c: 0 }; return (x.c + m * mu) / (x.n + m); };
  const delta = new Map(), nov = new Map();
  const deltaZa = (sub) => {
    let d = delta.get(sub);
    if (d === undefined) {
      const cilj = clamp(margTh + (bSub(sub) - mu), 0.005, 0.995);
      let lo = -10, hi = 10; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (marg(th + mid) < cilj) lo = mid; else hi = mid; }
      d = (lo + hi) / 2; delta.set(sub, d);
    }
    return d;
  };
  const pNovo = (sub) => { let p = nov.get(sub); if (p === undefined) { p = marg(th + deltaZa(sub)); nov.set(sub, p); } return p; };

  // ---------- 4. verovatnoća po pitanju za dati T (posterior l0 iz sopstvenog niza) ----------
  // tabela po (podoblast, obrazac): P(tačno) kao funkcija zadržanosti ret = e^(−dt/T), 9 tačaka
  const napraviTabelu = (T, sub, o) => {
    const l = th + deltaZa(sub); const post = []; let tot = 0;
    for (const y of o.red) {
      const n = y.x.length; let D = 0;
      for (let i = 0; i < n; i++) { Dbuf[i] = D; D += y.x[i] ? gC : gW; if (i < n - 1) D *= Math.exp(-y.g[i] / T); }
      for (let j = 0; j < NZ; j++) {   // log-verodostojnost (dugi nizovi ne smeju da podlegnu nuli)
        const l0 = l + sd * Z[j]; let lL = Math.log(ZV[j] * y.t);
        for (let i = 0; i < n; i++) { const p = sgBrzo(l0 + Dbuf[i]); lL += Math.log(y.x[i] ? p : 1 - p); }
        post.push(l0, D, lL);
      }
    }
    let mx = -Infinity; for (let i = 2; i < post.length; i += 3) if (post[i] > mx) mx = post[i];
    for (let i = 2; i < post.length; i += 3) { post[i] = Math.exp(post[i] - mx); tot += post[i]; }
    const tb = new Float64Array(RET_N + 1);
    for (let r = 0; r <= RET_N; r++) {
      const ret = r / RET_N; let p = 0;
      for (let i = 0; i < post.length; i += 3) p += post[i + 2] * sgBrzo(post[i] + post[i + 1] * ret);
      tb[r] = o.poslednjaGreska ? Math.min(p / tot, posleGreske) : p / tot;
    }
    return tb;
  };
  const pTab = (tb, T, dt) => {
    const u = Math.exp(-(dt > 0 ? dt : 0) / T) * RET_N;
    const i = u >= RET_N ? RET_N - 1 : Math.floor(u), f = u - i;
    return tb[i] * (1 - f) + tb[i + 1] * f;
  };
  // stanje pitanja u trenutku t: {o, dt} ili null (još neviđeno). Ako je odgovarano i posle t,
  // hoda se unazad po razmacima iz pravila reda.
  const stanjeU = (e, t) => {
    if (e.last <= t) return [e.o, (t - e.last) / DAY];
    const y = e.o.red[0]; let tau = e.last, i = y.x.length - 1;
    while (i >= 0 && tau > t) { if (i > 0) tau -= y.g[i - 1] * DAY; i--; }
    if (i < 0) return null;
    let w = 0, st = 0; for (let j = 0; j <= i; j++) { if (y.x[j]) st++; else { w++; st = 0; } }
    return [obrazac(i + 1, w, st), (t - tau) / DAY];
  };
  // ln T ~ N(ln T0, SD_LNT²), Gauss–Hermite u 3 tačke: 9, 30 i 101 dan sa težinama 1/6, 2/3, 1/6
  const TGRANE = (() => { const s3 = Math.sqrt(3) * SD_LNT; return [[T0 * Math.exp(-s3), 1 / 6], [T0, 2 / 3], [T0 * Math.exp(s3), 1 / 6]]; })();
  // očekivanje po slotovima u trenutku t, za sve tri grane odjednom
  const slotoviU = (t) => {
    const zb = TGRANE.map(() => new Float64Array(bazeni.length));
    bazeni.forEach((b, bi) => {
      for (const q of b.pool) {
        const e = poId.get(q.id); const stn = e ? stanjeU(e, t) : null;
        if (!stn) { const p = pNovo(q.sub); for (let k = 0; k < TGRANE.length; k++) zb[k][bi] += p; continue; }
        const [o, dt] = stn;
        let tbs = o.tb && o.tb.get(q.sub);
        if (!tbs) { if (!o.tb) o.tb = new Map(); tbs = TGRANE.map(([T]) => napraviTabelu(T, q.sub, o)); o.tb.set(q.sub, tbs); }
        for (let k = 0; k < TGRANE.length; k++) zb[k][bi] += pTab(tbs[k], TGRANE[k][0], dt);
      }
    });
    return zb.map((z) => bazeni.map((b, bi) => ({ pts: b.pts, p: z[bi] / b.pool.length })));
  };
  const ocek = (sl) => sl.reduce((a, s) => a + s.pts * s.p, 0);
  const varS = (sl) => sl.reduce((a, s) => a + s.pts * s.pts * s.p * (1 - s.p), 0);

  // ---------- 5. neizvesnost neviđenog dela (stopa prvog pogleda i razlike među podoblastima) ----------
  const tezinaNevidjenog = new Map(); let unseenW = 0;
  for (const b of bazeni) for (const q of b.pool) if (!poId.has(q.id)) {
    const w = b.pts / b.pool.length; unseenW += w; tezinaNevidjenog.set(q.sub, (tezinaNevidjenog.get(q.sub) || 0) + w);
  }
  let varNevidjeno = unseenW * unseenW * mu * (1 - mu) / (fN + 3);
  for (const [sub, w] of tezinaNevidjenog) { const b = bSub(sub), n = fs[sub] ? fs[sub].n : 0; varNevidjeno += w * w * b * (1 - b) / (n + m + 1); }

  // ---------- 6. grane po zaboravu; simulacije procenjuju grešku modela b u svakoj grani ----------
  const sada = slotoviU(sad);
  const grane = TGRANE.map(([T, w], k) => ({ T, w, slotovi: sada[k], E: ocek(sada[k]), A: 0, B: 0 }));
  for (const s of sims) {
    const tada = slotoviU(s.d - 1);   // šta je model očekivao u trenutku simulacije
    const starost = DRIFT * Math.max(0, (sad - s.d) / DAY), rez = s.score * ukupno / s.total;
    grane.forEach((g, k) => { const nv = varS(tada[k]) + starost, r = rez - ocek(tada[k]); g.A += 1 / nv; g.B += r / nv; g.Q = (g.Q || 0) + r * r / nv + Math.log(nv); });
  }
  // greška modela b: posterior mešavine (MIX) uz Gausove razlike simulacija — opet mešavina, zatvoren oblik
  for (const g of grane) {
    const komp = MIX.map(([pi, s]) => { const A = 1 / (s * s) + g.A; return { lw: Math.log(pi) - 0.5 * Math.log(s * s * A) + 0.5 * g.B * g.B / A, m: g.B / A, v: 1 / A }; });
    const mx = Math.max(...komp.map((c) => c.lw)); let t = 0; for (const c of komp) { c.w = Math.exp(c.lw - mx); t += c.w; } for (const c of komp) c.w /= t;
    g.komp = komp; g.bMean = komp.reduce((a, c) => a + c.w * c.m, 0);
    g.logL = -0.5 * (g.Q || 0) + mx + Math.log(t);
  }
  // posterior po zaboravu: grane čiji je model bolje pogodio simulacije dobijaju veću težinu
  if (sims.length) { const mx = Math.max(...grane.map((g) => g.logL)); let t = 0; for (const g of grane) { g.w *= Math.exp(KALJENJE * (g.logL - mx)); t += g.w; } for (const g of grane) g.w /= t; }

  // ---------- 7. šansa: tačna raspodela po šablonu, usrednjena preko neizvesnosti ----------
  let sansa = 0, exp = 0, wUk = 0;
  const pSlot = new Float64Array(bazeni.length);   // prosek po granama, pomeren na očekivanje grane
  const dZaGranu = (g, cilj) => { const lp = g.slotovi.map((s) => lg(clamp(s.p, 1e-4, 1 - 1e-4))); let lo = -12, hi = 12; for (let i = 0; i < 36; i++) { const mid = (lo + hi) / 2; if (g.slotovi.reduce((a, s, j) => a + s.pts * sg(lp[j] + mid), 0) < cilj) lo = mid; else hi = mid; } const d = (lo + hi) / 2; return lp.map((l) => sg(l + d)); };
  for (const g of grane) {
    const lp = g.slotovi.map((s) => lg(clamp(s.p, 1e-4, 1 - 1e-4)));
    const pomeri = (d) => g.slotovi.map((s, i) => ({ pts: s.pts, p: sg(lp[i] + d) }));
    const dZa = (cilj) => { let lo = -12, hi = 12; for (let i = 0; i < 36; i++) { const mid = (lo + hi) / 2; if (ocek(pomeri(mid)) < cilj) lo = mid; else hi = mid; } return (lo + hi) / 2; };
    for (const c of g.komp) {
      if (c.w < 1e-4) continue;
      const cilj0 = g.E + c.m, sdE = Math.sqrt(c.v + varNevidjeno);
      let sgr = 0;
      for (const [x, w] of GH9) sgr += w * tacnaSansa(pomeri(dZa(clamp(cilj0 + x * sdE, 0.05, ukupno - 0.05))), udeo).sansa;
      sansa += g.w * c.w * sgr; wUk += g.w * c.w;
    }
    exp += g.w * (g.E + g.bMean);
    const pg = dZaGranu(g, clamp(g.E + g.bMean, 0.05, ukupno - 0.05)); for (let i = 0; i < pg.length; i++) pSlot[i] += g.w * pg[i];
  }
  if (ctx._dbg) ctx._dbg({ par: { th, sd, gC, gW }, mu, m, posleGreske, pokriveno, varNevidjeno, grane: grane.map((g) => ({ T: +g.T.toFixed(1), E: +g.E.toFixed(1), b: +g.bMean.toFixed(2), rep: +g.komp[g.komp.length - 1].w.toFixed(3) })) });
  const slotovi = bazeni.map((b, i) => ({ pts: b.pts, subs: b.subs, p: pSlot[i] }));
  exp = slotovi.reduce((a, s) => a + s.pts * s.p, 0);   // uvek u [0, ukupno] — isto što i zbir tabele gubitaka
  return { sansa: Math.min(1, Math.max(0, sansa / wUk)), exp, slotovi };
}

self.VozackiProcena = { proceni };
})();
