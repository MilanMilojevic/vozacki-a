(function () {
'use strict';
// DNEVNI PLAN (plan.js) — kandidat v150 (tools/plan/_v150): dizajn A (pobednik suda, tools/plan/_sud) +
// tri obavezne ispravke suda + ispravke nalaza revizije P1–P18 (svaka je označena u kodu, npr. „P7").
// Klasična skripta: učitavaju je i aplikacija (index.html) i merni alati (tools/plan/_v150/isporuka.mjs →
// tools/plan-proba.mjs; tools/plan/_nezavisno/v150), pa se meri TAČNO ono što bi se isporučilo.
// Izlaz: self.VozackiPlan.planDanas(api, ctx). Procena (šansa, parametri učenja) dolazi iz procena.js.
// Ugovor izlaza (sva polja v149 ostaju; tekst je latinica, ćirilica ide kroz uCir):
//   glavno    presuda, jedna rečenica ≤ 14 reči, počinje ✅/⚠/⛔; bez dokaza ili dok je dokaza malo bez
//             znaka („Prva procena: …", ocena 'nema')
//   zadatak   šta danas (≤ 14 reči);  detalji  kratki redovi ≤ 25 reči, najvažniji prvi
//   redovi    [{l, c}] = glavno, zadatak, detalji tim redom; presudaIdx = 0 (indeks presude u redovi)
//   potrebanTempo  pitanja dnevno SA simulacijom za šansu ≥ 70% uz tvoju učestalost (null bez dokaza);
//             ISTI broj koji tekst izgovara, i sam proveren da daje ≥ 70%
//   potrebanNedostizan  UVEK false, dodatnoDana UVEK null (polja ostaju zbog ugovora). D2 (provera v150): tvrdnja
//             „ni 300 dnevno nije dosta" bila je netačna kod 263 od 357 nezavisnih učenika; nijedan prag (šansa, dani)
//             nije dao ≥ 90% tačnih na oba instrumenta, pa se ne izgovara. Umesto nje: „ne mogu pouzdano da kažem".
//   putanja   { dani, E, Emanje, Evise, Ebez, prag, Edanas, pouzdano } očekivani poeni od danas do ispita
//   pokrivenost { videno, stize, retka, retkaNaIspitu, retkaPoena, vanSablona } — videno+stize+retka+vanSablona = sva pitanja
//   ostaje    { lista, simulacija } i cilj = urađeno danas + lista + simulacija (null kad je sve 0)
//   uListi    { naRedu: dospelih ponavljanja u današnjoj listi, ukupnoNaRedu }
//   stoAko    samo uz ctx.stoAko: [{ dnevno, P, E, tvoj?, potreban? }] za ~6 dnevnih obima
//   tempo     broj sa kojim računaju presuda i tekst („ovim tempom"); kap = koliko plan danas traži
//
// Dnevni zapis plana S.plan.prognoza.tr[dan] (app.js normalizeState ga mora sačuvati CEO — vidi ZA_APP.md):
//   { n0, k, t, kap, dosta?: 1, r: 0|1, ids?: [≤ 400 celih], u?: ceo broj, s?: 0|1 }
//   r = da li je simulaciji bilo čuvano mesto; ids = pitanja iz liste pri prvom računu u danu;
//   u = koliko je od njih odgovoreno tog dana (upisuje se pri prvom računu sledećeg dana, tada se ids briše);
//   s = (samo bez rezerve, kad je bilo simulacije posle prvog računa) 1 ako je simulacija bila pre liste.
//
// Principi (iz A): jedan poredak po vrednosti na ispitu pravi i današnju listu i projekciju do ispita;
// naučeno pitanje koje nisi video IZBLEDELO dana ponovo je kandidat (održavanje, G3); koliko dnevno TREBA
// (G1) traži se na istoj projekciji; mali obim raste bar MIN_KORAK (G2); pauza je događaj, ne navika (G4).
const proceni = (S, c) => self.VozackiProcena.proceni(S, c);

const CIR = { A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', Đ: 'Ђ', E: 'Е', Ž: 'Ж', Z: 'З', I: 'И', J: 'Ј', K: 'К', L: 'Л', M: 'М', N: 'Н', O: 'О', P: 'П', R: 'Р', S: 'С', T: 'Т', Ć: 'Ћ', U: 'У', F: 'Ф', H: 'Х', C: 'Ц', Č: 'Ч', Š: 'Ш',
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', đ: 'ђ', e: 'е', ž: 'ж', z: 'з', i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т', ć: 'ћ', u: 'у', f: 'ф', h: 'х', c: 'ц', č: 'ч', š: 'ш',
  Lj: 'Љ', LJ: 'Љ', lj: 'љ', Nj: 'Њ', NJ: 'Њ', nj: 'њ', Dž: 'Џ', DŽ: 'Џ', dž: 'џ' };
const uCir = (s) => String(s).replace(/DŽ|Dž|dž|LJ|Lj|lj|NJ|Nj|nj|[A-Za-zČĆĐŠŽčćđšž]/g, (m) => CIR[m] || m);

const DAY = 864e5;
// Novi korisnik bez ijednog dana istorije: 60 pitanja ≈ sat vežbe (ispit je 41 pitanje za 45 min).
const PODRAZUMEVANI_KAP = 60;
const RAST = 1.15;
const MIN_KORAK = 2;
const MIN_TRAZI = 1;
// Kapacitet: najviše PROZOR_AKT aktivnih dana, i to samo iz poslednjih PROZOR_KAL kalendarskih dana (P8:
// bez kalendarske granice je nalet od pre mesec dana posle pauze tražio 706 dnevno uz ✅ „ovim tempom").
const PROZOR_AKT = 7;
const PROZOR_KAL = 14;
const NEDOSTIZNO = 0.2;
const PRIOR_DANA = 5;
const ODSKOK = 0.6;
// G4: pauza = bar PAUZA uzastopnih dana bez ijednog odgovora (događaj, ne navika).
const PAUZA = 7;
const PAUZA_PORUKA = 4;
const ISPIT_DAN_NAJVISE = 30;
const T_ZAB = 30;
const IZBLEDELO = 14;
const DOSTA = 0.0015;
const PRAG_OK = 0.7, PRAG_PROBLEM = 0.4;
const NESIG_MODEL = 2, NESIG_TEMPO = 0.3;
const TEMPO_MAX = 300;
// Samo za merenje (projekcija.nedostizanModel): stari uslov „ni 300 nije dosta". Tekst ga više ne izgovara (D2).
const NEDOST_P = 0.4, NEDOST_DANA = 10;
// D9/D10: potreban tempo ispod ovoliko dnevno se ne izgovara kao preporuka (Milan: „1 pitanje dnevno neće dati
// rezultat"). Kad ovim tempom već stižeš, plan kaže šta bi bilo bez vežbe; inače traži bar ovoliko (proveren broj).
const MALO_DNEVNO = 20;
// P5: učestalost simulacije se deli sa najmanje ovoliko dana — jedna probna simulacija prvog dana nije
// „simulacija svaki dan" (ranije: 1 od 1 dana = 100%, pa je plan računao sa simulacijom svaki dan).
const SIM_MIN_DANA = 5;
// P4: dok je aktivnih dana manje od TANKO_DANA i ponovljenih odgovora manje od TANKO_PON, presude nema
// (bez ✅/⚠/⛔): stope učenja su izmerene na par odgovora. Isto tako se stope vuku ka pretpostavkama
// srazmerno broju ponovljenih odgovora (težina PRIOR_N).
const TANKO_DANA = 3, TANKO_PON = 30;
// P6: „retko" se kaže samo kad neviđena pitanja zajedno donose manje od ovoliko pitanja na ispitu.
const RETKO_H = 2;
// P7: najviše ovoliko pitanja iz liste se pamti u dnevnom zapisu (za proveru „lista je urađena").
const IDS_MAX = 400;
const PRIOR_GC = 0.3, PRIOR_GW = 1.0, PRIOR_SD = 0.8, PRIOR_MU = 0.75, PRIOR_ERR = 0.8;
const GH5 = [[-2.8569700138728, 0.0112574113277], [-1.3556261799742, 0.2220759220056], [0, 0.5333333333333], [1.3556261799742, 0.2220759220056], [2.8569700138728, 0.0112574113277]];

const sg = (x) => 1 / (1 + Math.exp(-x));
const lg = (p) => { const q = Math.min(0.999, Math.max(0.001, p)); return Math.log(q / (1 - q)); };
const kvantil = (a, q) => { const s = [...a].sort((x, y) => x - y); const i = q * (s.length - 1), k = Math.floor(i); return k + 1 < s.length ? s[k] + (s[k + 1] - s[k]) * (i - k) : s[k]; };
const danaIzmedju = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / DAY);

// ---------- težina pitanja na ispitu ----------
let KES = null;
function sablon(Q, SIM_SLOTS) {
  if (KES && KES.Q === Q && KES.SL === SIM_SLOTS) return KES;
  const w = new Map(), h = new Map(), pools = [];
  for (const s of SIM_SLOTS) {
    const pool = Q.filter((q) => s.s.includes(q.sub) && q.pts === s.p);
    if (!pool.length) continue;
    pools.push({ pts: s.p });
    for (const q of pool) { w.set(q.id, (w.get(q.id) || 0) + s.p / pool.length); h.set(q.id, (h.get(q.id) || 0) + 1 / pool.length); }
  }
  KES = { Q, SL: SIM_SLOTS, w, h, pools, ukupno: pools.reduce((a, b) => a + b.pts, 0), nSim: SIM_SLOTS.length, nSablon: w.size };
  return KES;
}

// ---------- kako ovaj učenik uči ----------
const PRIOR_N = 30, PRIOR_G = 10;
function stope(S, Q, dbg) {
  let vid = 0, prvi = 0, eN = 0, eC = 0, pon = 0;
  for (const q of Q) {
    const r = S.q[q.id]; if (!r || !(r.a > 0)) continue;
    vid++; pon += r.a - 1; if (r.w === 0) prvi++; else if (r.a >= 2) { eN += r.a - 1; eC += r.a - r.w; }
  }
  // P4: dobitci od tačnog i pogrešnog odgovora (gC, gW) vuku se ka pretpostavkama srazmerno broju ponovljenih
  // odgovora (težina PRIOR_G) — prvog dana ih je ~8, a od njih je zavisila presuda ⛔/⚠/✅. Mereno (p/ablacija.mjs,
  // plan-proba, 4 scenarija × 40): težina 30 i uz to vučenje stope posle greške podigli su lažnu uzbunu
  // (kasnoPoceo 20 → 29%, velikaKap 23 → 26%); težina 10 samo na gC/gW: 22% i 18%, šansa ista. Stopa posle greške
  // ostaje izmerena (procena.js je već vuče ka 1/2).
  const wR = pon / (pon + PRIOR_G), wE = 1;
  const st = {
    mu: dbg ? dbg.mu : (prvi + PRIOR_N * PRIOR_MU) / (vid + PRIOR_N),
    pErr: dbg ? wE * dbg.posleGreske + (1 - wE) * PRIOR_ERR : (eC + PRIOR_N * PRIOR_ERR) / (eN + PRIOR_N),
    gC: dbg ? Math.max(0.05, wR * dbg.par.gC + (1 - wR) * PRIOR_GC) : PRIOR_GC,
    gW: dbg ? Math.max(0.2, wR * dbg.par.gW + (1 - wR) * PRIOR_GW) : PRIOR_GW,
    sd: dbg ? Math.min(3, Math.max(0.2, dbg.par.sd)) : PRIOR_SD,
    vid, ponovljeno: pon,
  };
  const marg = (th) => GH5.reduce((a, [z, w]) => a + w * sg(th + st.sd * z), 0);
  let lo = -8, hi = 8; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (marg(m) < st.mu) lo = m; else hi = m; }
  st.cv = GH5.map(([z, w]) => ({ om: w, l0: (lo + hi) / 2 + st.sd * z }));
  st.gNovo = st.cv.reduce((a, c) => a + c.om * dobit(sg(c.l0), st), 0);
  return st;
}
function cvorovi(r, st) {
  const a = Math.min(r.a, 4);
  if (r.w > 0) {
    const post = st.cv.map((c) => c.om * (1 - sg(c.l0))); const t = post.reduce((x, y) => x + y, 0);
    const b = st.cv.reduce((x, c, k) => x + post[k] / t * c.l0, 0);
    return [{ om: 1, b, p: sg(lg(st.pErr) + (r.streak || 0) * st.gC) }];
  }
  const post = st.cv.map((c) => c.om * Math.pow(sg(c.l0), a)); const t = post.reduce((x, y) => x + y, 0);
  return st.cv.map((c, k) => ({ om: post[k] / t, b: c.l0, p: sg(c.l0 + a * st.gC) }));
}
const zabor = (p, dt, b) => sg(b + (lg(p) - b) * Math.exp(-Math.max(0, dt) / T_ZAB));
function posle(p, st) { const l = lg(p); return { pc: sg(l + st.gC), pw: Math.min(sg(l + st.gW), Math.max(p, st.pErr)) }; }
function dobit(p, st) { const { pc, pw } = posle(p, st); return p * (pc - p) + (1 - p) * (pw - p); }
function dobitStavke(r, st, dt) { return cvorovi(r, st).reduce((a, c) => a + c.om * dobit(zabor(c.p, dt, c.b), st), 0); }

// ---------- istorija: prozor za tempo (P8) ----------
// svi = aktivni dani pre danas; pauza = dana od poslednjeg aktivnog (za bleđenje znanja); prazno = CELIH dana
// bez ijednog odgovora između poslednjeg aktivnog i danas (D6: danas se ne broji — to je broj koji tekst
// izgovara i po kom se odlučuje režim pauze, D7); prozor = aktivni dani iz poslednjih PROZOR_KAL kalendarskih
// dana (najviše PROZOR_AKT); pre = do PROZOR_AKT poslednjih aktivnih dana uopšte. Sve je iz dana PRE danas.
function istorija(S, danas) {
  const svi = (S.dani || []).filter((x) => x.n > 0 && x.d < danas);
  if (!svi.length) return { svi, prozor: [], pre: [], pauza: null, prazno: null };
  const pauza = danaIzmedju(svi[svi.length - 1].d, danas);
  const prozor = svi.filter((x) => danaIzmedju(x.d, danas) <= PROZOR_KAL).slice(-PROZOR_AKT);
  return { svi, prozor, pre: svi.slice(-PROZOR_AKT), pauza, prazno: pauza - 1 };
}

// ---------- kapacitet (samo iz istorije) ----------
// Vraća { est: koliko plan danas traži, tempo: sa čim računaju presuda i tekst, izvor }.
// P1: projekcija i tekst koriste ISTI broj (tempo); nema više skrivenog ×1,15 u projekciji.
function kapacitet(S, api, danas, nSim, ist) {
  const tr0 = S.plan && S.plan.prognoza && S.plan.prognoza.tr;
  const tr = tr0 && typeof tr0 === 'object' ? tr0 : {};
  const sims = S.sims || [];
  const obs = [];
  let prethodni = null;
  for (const x of ist.prozor) {
    const z = tr[x.d];
    if (!z || typeof z !== 'object') { obs.push({ v: x.n, c: true, plan: false }); continue; }
    const tol = Math.min(Math.max(2, 0.03 * z.k), Math.floor(0.1 * z.k));
    // P7: dan je stignut kad je lista iz prvog računa urađena CELA (brojano po pitanjima, pa se računa i
    // pitanje odgovoreno u simulaciji) — ILI kad je dnevni broj dovoljan. Simulacija se od dnevnog broja
    // NE oduzima kad joj plan nije čuvao mesto (r = 0) a urađena je PRE liste (s = 1): tada troši isti dnevni obim,
    // pa je „dom → simulacija → lista" ranije svaki takav dan proglašavala nestignutim i tempo se zaključavao na ~60.
    // Simulacija posle liste (s = 0) ili uz rezervu (r = 1) je dodatak i oduzima se, kao u v149.
    const iscrpljena = Number.isFinite(z.u) && z.k > 0 && z.u >= Math.min(z.k, IDS_MAX);
    const posleSim = z.r === 0 && z.s === 1 ? 0 : sims.filter((s) => api.localDay(s.d) === x.d && s.d > z.t).reduce((a, s) => a + (Number.isFinite(s.dn) ? s.dn : nSim), 0);
    const c = iscrpljena || x.n - z.n0 - posleSim >= z.k - tol;
    if (Number.isFinite(z.kap)) prethodni = z.kap;
    if (z.dosta && c) continue;
    obs.push({ v: x.n, c, plan: true });
  }
  const planski = obs.filter((o) => o.plan);
  const skup = planski.length >= 3 ? planski : obs;
  if (!skup.length) {
    // D3 (provera v150): posle pauze duže od prozora (14+ dana bez rada) kreće se IZNOVA, kao kod novog
    // korisnika: proba od PODRAZUMEVANI_KAP. Ranije: medijana dana pre pauze, pa je učenik sa 1–3 pitanja pre
    // pauze posle povratka dobio tempo 2, presudu na 2 dnevno i praznu listu i posle simulacije.
    if (!ist.prozor.length && ist.pre.length) {
      const med = Math.round(kvantil(ist.pre.map((x) => x.n), 0.5));
      return { est: PODRAZUMEVANI_KAP, tempo: PODRAZUMEVANI_KAP, izvor: 'pauza', pre: med };
    }
    // D4 (provera v150): svi dani u prozoru su bili „lista kraća jer vrednijeg nije bilo" i urađeni — tempo nije
    // izmeren, zna se samo koliko si NAJVIŠE uradio. Taj broj (istinit) koriste i projekcija i tekst; plan i dalje
    // sme da traži više (do ranijeg zahteva, najviše PODRAZUMEVANI_KAP), a tekst to tada kaže. Ranije: tempo =
    // poslednji zahtev plana (npr. 475) i tekst „kao prethodnih dana" dok su dani bili 30–150.
    if (prethodni) {
      const m = Math.max(1, ...ist.prozor.map((x) => x.n));
      return { est: Math.max(m, Math.min(prethodni, PODRAZUMEVANI_KAP)), tempo: m, izvor: 'ranije' };
    }
    return { est: PODRAZUMEVANI_KAP, tempo: PODRAZUMEVANI_KAP, izvor: 'nema' };
  }
  const tacni = skup.filter((o) => !o.c).map((o) => o.v).sort((x, y) => x - y);
  const slobodni = obs.filter((o) => !o.plan).map((o) => o.v);
  const P = slobodni.length ? kvantil(slobodni, 0.5) : PODRAZUMEVANI_KAP;
  const M = Math.max(0, PRIOR_DANA - Math.max(0, planski.length - 1));
  let Sx = 1;
  for (let i = 0; i < tacni.length; i++) {
    if (i > 0 && tacni[i] === tacni[i - 1]) continue;
    const x = tacni[i], r = skup.filter((o) => o.v >= x).length + (x < ODSKOK * P ? M : 0), d = tacni.filter((v) => v === x).length;
    Sx *= 1 - d / r;
    if (Sx <= 1 - NEDOSTIZNO + 1e-9) return { est: Math.round(x), tempo: Math.round(x), izvor: 'mereno' };
  }
  const cenz = skup.filter((o) => o.c).map((o) => o.v);
  const planCenz = skup.filter((o) => o.c && o.plan).map((o) => o.v);
  const uPauzi = ist.prazno != null && ist.prazno >= PAUZA;
  if (planCenz.length) {
    const najv = Math.max(...planCenz);
    let est;
    // P8: dok pauza traje (7+ dana), polazi se od medijane stignutih dana, ne od najvećeg uz korak rasta
    if (uPauzi) est = kvantil(planCenz, 0.5);
    else if (tacni.length) est = Math.max(najv * (1 + (RAST - 1) / 3), tacni[tacni.length - 1]);
    else est = Math.max(najv * RAST, najv + MIN_KORAK);
    est = Math.max(1, Math.round(est));
    // P8: „u 4 od 5 dana" samo kad je Kaplan–Meier stvarno stigao do kvantila; ovde nije
    return { est, tempo: est, izvor: uPauzi ? 'pauzaKratka' : tacni.length ? 'delimicno' : 'proba' };
  }
  if (cenz.length) {
    // P2: slobodni dani (bez plana): presuda i tekst računaju sa medijanom tvojih dana; pod od 60 ostaje samo
    // kao JEDNODNEVNA PROBA liste i tekst to kaže (bez njega učenik koji je pre plana radio 15–30 dnevno a
    // može 100 rastao bi ×1,15 dnevno nedelju dana pre nego što stigne do svog tempa)
    const med = Math.max(1, Math.round(kvantil(cenz, 0.5)));
    return { est: Math.max(med, PODRAZUMEVANI_KAP), tempo: med, izvor: 'slobodno' };
  }
  return { est: PODRAZUMEVANI_KAP, tempo: PODRAZUMEVANI_KAP, izvor: 'nema' };
}
// Učestalost: udeo dana sa radom u poslednjih PROZOR_KAL dana; nizovi od bar PAUZA dana bez rada ne ulaze
// (pauza je događaj, ne navika). P9: posle povratka iz pauze, čim ima bar 3 aktivna dana od povratka,
// računa se samo od povratka. P5: simulacija se deli sa najmanje SIM_MIN_DANA dana.
function ucestalost(S, api, danas, sad) {
  const dani = (S.dani || []).filter((x) => x.n > 0 && x.d < danas);
  if (!dani.length) return { akt: 1, sim: 0, dana: 0, preskoceno7: 0, simDana: 0 };
  const od = api.localDay(sad - PROZOR_KAL * DAY);
  let pocetak = dani[0].d > od ? dani[0].d : od;
  let iRet = 0;
  for (let i = 1; i < dani.length; i++) if (danaIzmedju(dani[i - 1].d, dani[i].d) - 1 >= PAUZA) iRet = i;
  if (iRet > 0 && dani.length - iRet >= 3 && dani[iRet].d > pocetak) pocetak = dani[iRet].d;
  const raspon = Math.max(1, danaIzmedju(pocetak, danas));
  const u = dani.filter((x) => x.d >= pocetak).map((x) => x.d);
  let pauze = 0;
  const niz = (n) => { if (n >= PAUZA) pauze += n; };
  if (u.length) {
    niz(danaIzmedju(pocetak, u[0]));
    for (let i = 1; i < u.length; i++) niz(danaIzmedju(u[i - 1], u[i]) - 1);
    niz(danaIzmedju(u[u.length - 1], danas) - 1);
  } else niz(raspon);
  // P9: preskočeni dani u poslednjih 7 kalendarskih dana (bez pauza i bez dana pre početka)
  const set = new Set(u);
  let preskoceno7 = 0, praznih = 0;
  for (let k = 7; k >= 1; k--) {
    const d = api.localDay(sad - k * DAY);
    if (d < pocetak) continue;
    if (set.has(d)) { if (praznih < PAUZA) preskoceno7 += praznih; praznih = 0; } else praznih++;
  }
  if (praznih < PAUZA) preskoceno7 += praznih;
  const posl = dani.slice(-PROZOR_AKT).map((x) => x.d);
  const simDani = new Set((S.sims || []).map((s) => api.localDay(s.d)));
  // simDana = na koliko aktivnih dana počiva uc.sim (D8: „kao poslednjih dana" samo uz bar SIM_MIN_DANA)
  return { akt: Math.min(1, (u.length + 1) / (Math.max(0, raspon - pauze) + 1)), sim: posl.filter((d) => simDani.has(d)).length / Math.max(posl.length, SIM_MIN_DANA), dana: dani.length, preskoceno7, simDana: posl.length };
}

// ---------- projekcija: očekivani tokovi do jutra ispita ----------
const EXP = new Float64Array(400); for (let i = 0; i < EXP.length; i++) EXP[i] = Math.exp(-i / T_ZAB);
const ret = (dt) => (dt <= 0 ? 1 : dt < EXP.length ? EXP[dt] : 0);
const lU = (c, t) => c.b + (c.l - c.b) * ret(t - c.last);
function pocetno(S, api, K, st, sad, d0) {
  const koh = new Map(), un = [];
  let nulaNevid = 0;
  for (const q of K.Q) {
    const w = K.w.get(q.id) || 0, r = S.q[q.id], vid = r && r.a > 0;
    if (!w) { if (!vid) nulaNevid++; continue; }
    if (!vid) { un.push({ w, h: K.h.get(q.id), s: 1 }); continue; }
    const last = Math.floor(((r.last || sad) - d0) / DAY);
    let typ = 'K', sk = 0, due = 0;
    if (api.inQueue(q.id)) {
      typ = r.w > 0 ? 'Q' : 'C'; sk = r.w > 0 ? (r.streak || 0) : 0;
      const d = api.dueOf(q.id); due = d <= sad ? 0 : Math.max(0, Math.ceil((d - d0) / DAY));
    }
    const h = K.h.get(q.id);
    cvorovi(r, st).forEach((c, g) => dodaj(koh, { typ, sk, due, last, g: r.w > 0 ? -1 : g, b: c.b, n: c.om, W: w * c.om, H: h * c.om, l: lg(c.p) }));
  }
  un.sort((a, b) => b.w - a.w);
  return { koh, un, nulaNevid };
}
const TIP = { Q: 0, C: 1, K: 2 };
const vidljivo = (c) => ((TIP[c.typ] * 4 + c.sk) * 1024 + c.due) * 4096 + c.last + 2048;
function dodaj(m, c) {
  if (c.n < 1e-9) return;
  const k = vidljivo(c) * 8 + c.g + 1;
  const x = m.get(k);
  if (!x) { m.set(k, { ...c }); return; }
  const n = x.n + c.n;
  x.l = (x.l * x.n + c.l * c.n) / n; x.b = (x.b * x.n + c.b * c.n) / n; x.n = n; x.W += c.W; x.H += c.H;
}
function kopija(s0) { const koh = new Map(); for (const [k, c] of s0.koh) koh.set(k, { ...c }); return { koh, un: s0.un.map((u) => ({ ...u })), nulaNevid: s0.nulaNevid }; }
function dobitL(l, st) { const p = sg(l), pc = sg(l + st.gC), pw = Math.min(sg(l + st.gW), Math.max(p, st.pErr)); return p * (pc - p) + (1 - p) * (pw - p); }
function poeniModela(s0, st, t) {
  let E = 0; for (const c of s0.koh.values()) E += c.W * sg(lU(c, t));
  for (const u of s0.un) E += u.w * u.s * st.mu;
  return E;
}

function projektuj(s0, st, o) {
  const { koh, un } = kopija(s0);
  let nulaNevid = s0.nulaNevid, novih = 0, pon = 0;
  const lErr = lg(st.pErr);
  const radi = o.capDanas > 0 || o.capDan > 0 || o.simDanas > 0 || o.simDan > 0;
  const put = o.put ? [] : null;
  let unW = 0; if (put) for (const u of un) unW += u.w * u.s;
  for (let t = 0; t < o.D; t++) {
    if (put) { let E = unW * st.mu; for (const c of koh.values()) E += c.W * sg(lU(c, t)); put.push(E); }
    if (!radi) continue;
    let cap = t === 0 ? o.capDanas : o.capDan;
    const simH = t === 0 ? o.simDanas : o.simDan;
    const novo = [];
    const odgovor = (c, x) => {
      const l = lU(c, t), p = sg(l);
      const lc = l + st.gC, lw = l + st.gW;
      const n = c.n * x, W = c.W * x, H = c.H * x, g = c.g, b = c.b;
      if (c.typ === 'Q' && c.sk + 1 < 3) novo.push({ typ: 'Q', sk: c.sk + 1, due: t + (c.sk === 0 ? 1 : 3), last: t, g, b, n: n * p, W: W * p, H: H * p, l: lc });
      else novo.push({ typ: 'K', sk: 0, due: 0, last: t, g, b, n: n * p, W: W * p, H: H * p, l: lc });
      novo.push({ typ: 'Q', sk: 0, due: t + 1, last: t, g, b, n: n * (1 - p), W: W * (1 - p), H: H * (1 - p), l: lw });
    };
    const nov = { m: 0, W: 0, H: 0 };
    const prviPut = (u, m) => { nov.m += m; nov.W += u.w * m; nov.H += u.h * m; unW -= u.w * m; };
    if (simH > 0) {
      for (const c of koh.values()) {
        const x = Math.min(1, (c.H / c.n) * simH); if (x <= 0) continue;
        const l = lU(c, t), p = sg(l);
        const lw = l + st.gW, f = x * (1 - p);
        novo.push({ typ: 'Q', sk: 0, due: t + 1, last: t, g: c.g, b: c.b, n: c.n * f, W: c.W * f, H: c.H * f, l: lw });
        const r0 = ret(t - c.last), lEkv = r0 > 1e-6 ? c.b + (l + st.gC - c.b) / r0 : c.l;
        const ost = 1 - x, tac = x * p;
        c.l = (c.l * ost + lEkv * tac) / (ost + tac);
        c.n *= 1 - f; c.W *= 1 - f; c.H *= 1 - f;
      }
      for (const u of un) { if (u.s <= 0) continue; const m = u.s * Math.min(1, u.h * simH); u.s -= m; novih += m; prviPut(u, m); }
    }
    const grupe = new Map();
    for (const c of koh.values()) {
      if (c.n < 1e-9) continue;
      if (c.typ === 'K' ? t - c.last < IZBLEDELO : c.due > t) continue;
      const k = vidljivo(c); let gr = grupe.get(k);
      if (!gr) grupe.set(k, gr = { cs: [], n: 0, v: 0, K: c.typ === 'K' });
      gr.cs.push(c); gr.n += c.n; gr.v += c.W * dobitL(lU(c, t), st);
    }
    const kand = [];
    for (const gr of grupe.values()) { const v = gr.v / gr.n; if (!gr.K || v >= DOSTA) kand.push({ cs: gr.cs, n: gr.n, v }); }
    kand.sort((a, b) => b.v - a.v);
    let j = 0, i = 0;
    while (cap > 1e-9) {
      while (i < un.length && un[i].s <= 1e-9) i++;
      const kc = kand[j], vu = i < un.length ? un[i].w * st.gNovo : -1;
      if (!kc && vu < 0) break;
      if (kc && kc.v >= vu) {
        const x = Math.min(1, cap / kc.n);
        for (const c of kc.cs) { odgovor(c, x); c.n *= 1 - x; c.W *= 1 - x; c.H *= 1 - x; }
        cap -= kc.n * x; pon += kc.n * x; j++;
      } else {
        const m = Math.min(un[i].s, cap); un[i].s -= m; cap -= m; novih += m; prviPut(un[i], m);
      }
    }
    if (nov.m > 0) st.cv.forEach((cv, g) => {
      const p = sg(cv.l0), f = cv.om, lw = Math.min(cv.l0 + st.gW, Math.max(cv.l0, lErr));
      novo.push({ typ: 'C', sk: 0, due: t + 3, last: t, g, b: cv.l0, n: nov.m * f * p, W: nov.W * f * p, H: nov.H * f * p, l: cv.l0 + st.gC });
      novo.push({ typ: 'Q', sk: 0, due: t + 1, last: t, g, b: cv.l0, n: nov.m * f * (1 - p), W: nov.W * f * (1 - p), H: nov.H * f * (1 - p), l: lw });
    });
    for (const [k, c] of koh) if (c.n < 1e-9) koh.delete(k);
    for (const c of novo) dodaj(koh, c);
  }
  let E = 0;
  for (const c of koh.values()) E += c.W * sg(lU(c, o.D));
  let nev = 0, nevH = 0, nevW = 0;
  for (const u of un) { E += u.w * u.s * st.mu; nev += u.s; nevH += u.h * u.s; nevW += u.w * u.s; }
  if (put) put.push(E);
  return { E, nevidjeno: nev, nevH, nevW, nulaNevid, novih, pon, kohorti: koh.size, put };
}

// ---------- šansa za prolaz iz očekivanih poena ----------
function sansa(slotovi, E, sd, prag) {
  const ukupno = slotovi.reduce((a, s) => a + s.pts, 0);
  const lp = slotovi.map((s) => lg(s.p));
  const pomeri = (cilj) => {
    let lo = -12, hi = 12;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (slotovi.reduce((a, s, i) => a + s.pts * sg(lp[i] + m), 0) < cilj) lo = m; else hi = m; }
    return lp.map((l) => sg(l + (lo + hi) / 2));
  };
  let P = 0;
  for (const [z, wz] of GH5) {
    const ps = pomeri(Math.min(ukupno - 0.05, Math.max(0.05, E + z * sd)));
    let r = new Float64Array(ukupno + 1); r[0] = 1;
    slotovi.forEach((s, i) => {
      const n = new Float64Array(ukupno + 1);
      for (let x = 0; x <= ukupno; x++) { const v = r[x]; if (!v) continue; n[x] += v * (1 - ps[i]); if (x + s.pts <= ukupno) n[x + s.pts] += v * ps[i]; }
      r = n;
    });
    let s = 0; for (let x = prag; x <= ukupno; x++) s += r[x];
    P += wz * s;
  }
  return P;
}

function trazi0(f, a, fa, z, fz, tol) {
  let Fa = fa, Fz = fz, pz = fz, zadnja = 0;
  while (z - a > Math.max(1, Math.floor(tol * z))) {
    let m = Math.round(a + (z - a) * (PRAG_OK - Fa) / Math.max(1e-9, Fz - Fa));
    if (!(m > a && m < z)) m = Math.floor((a + z) / 2);
    const p = f(m);
    if (p >= PRAG_OK) { z = m; Fz = pz = p; if (zadnja === 1) Fa = PRAG_OK - (PRAG_OK - Fa) / 2; zadnja = 1; }
    else { a = m; Fa = p; if (zadnja === -1) Fz = PRAG_OK + (Fz - PRAG_OK) / 2; zadnja = -1; }
  }
  return { x: z, p: pz };
}

// procenat za tekst: zaokruživanje ne sme da pređe prag presude; P3: nikad „100%" ni „0%"
const pr = (p) => {
  if (p >= 0.995) return 'preko 99%';
  if (p < 0.005) return 'ispod 1%';
  let x = Math.round(p * 100); if (p < PRAG_OK && x >= 100 * PRAG_OK) x = 100 * PRAG_OK - 1; if (p >= PRAG_OK && x < 100 * PRAG_OK) x = 100 * PRAG_OK; if (p < PRAG_PROBLEM && x >= 100 * PRAG_PROBLEM) x = 100 * PRAG_PROBLEM - 1; return x + '%';
};
const prOko = (p) => (p >= 0.995 || p < 0.005 ? pr(p) : 'oko ' + pr(p));
// P13: srpski oblik uz broj: 1 pitanje, 2–4 pitanja, 5+ pitanja (11–14 kao 5+)
const oblik = (n, jd, pk, mn) => { const d = n % 10, s = n % 100; return d === 1 && s !== 11 ? jd : d >= 2 && d <= 4 && (s < 12 || s > 14) ? pk : mn; };
const br = (n, jd, pk, mn) => n + ' ' + oblik(n, jd, pk, mn);
const pit = (n) => br(n, 'pitanje', 'pitanja', 'pitanja');
const pitGen = (n) => n + ' pitanja';   // genitiv posle „od"/„sa" („od oko 91 pitanja", „sa oko 21 pitanja")
const dana_ = (n) => br(n, 'dan', 'dana', 'dana');
// P3: poeni iznad 96,5 pišu se „97–98" (ne „98 od 98" — to bi značilo bez ijedne greške)
const poeniTxt = (E, uk) => (E >= uk - 1.5 ? `${uk - 1}–${uk}` : String(Math.round(E)));
const poen = (E, uk) => { const t = poeniTxt(E, uk); return t.includes('–') ? t + ' poena' : br(Math.round(E), 'poen', 'poena', 'poena'); };
// broj koji se izgovara kao „treba": do 30 tačno, iznad na 5 NAVIŠE
const lepo = (n) => (n <= 30 ? Math.ceil(n) : Math.ceil(n / 5) * 5);
// Sud, ispravka 3: preko 300 dnevno piše se „više od 300"
const dnevnoTxt = (n) => (n > TEMPO_MAX ? `više od ${TEMPO_MAX} dnevno` : `oko ${lepo(n)} dnevno`);
const REDNI = ['', '', 'drugi', 'treći', 'četvrti', 'peti', 'šesti', 'sedmi'];

function planDanas(api, ctx) {
  const S = api.S, Q = ctx.Q || api.Q, SIM_SLOTS = ctx.SIM_SLOTS || api.SIM_SLOTS;
  const sad = ctx.sad, danas = api.localDay(sad);
  const dIsp = api.danaDoIspita();
  if (dIsp == null || dIsp < 0) {
    const l = dIsp == null ? 'Unesi datum ispita da bi plan znao koliko vremena imaš.' : 'Datum ispita je prošao — unesi novi ako polažeš ponovo.';
    return { ids: [], ocena: 'nema', tekst: l, glavno: l, zadatak: '', detalji: [], redovi: [{ l, c: uCir(l) }], presudaIdx: 0, potrebanTempo: null, potrebanNedostizan: false, dodatnoDana: null,
      putanja: null, pokrivenost: null, ostaje: { lista: 0, simulacija: 0 }, uListi: null, stoAko: null, cilj: null };
  }
  const D = Math.max(1, dIsp);
  const K = sablon(Q, SIM_SLOTS);
  const prag = Math.ceil(0.85 * K.ukupno);
  const d0 = new Date(sad); d0.setHours(0, 0, 0, 0);
  const t0 = d0.getTime();
  const ispit = new Date(S.examDate + 'T09:00:00').getTime();

  let dbg = null;
  const pro = proceni(S, { Q, byId: ctx.byId || api.byId, SIM_SLOTS, prag: (t) => Math.ceil(0.85 * t), sad: ispit, DAY, _dbg: (d) => { dbg = d; } });
  const imaDokaza = !!(pro && pro.sansa != null);
  const st = stope(S, Q, imaDokaza ? dbg : null);

  // ---------- dnevni zapis: P7 — prvi račun u danu ocenjuje liste prethodnih dana ----------
  if (!S.plan) S.plan = {};
  const pg = S.plan.prognoza && typeof S.plan.prognoza === 'object' ? S.plan.prognoza : (S.plan.prognoza = { tr: {} });
  if (!pg.tr || typeof pg.tr !== 'object' || Array.isArray(pg.tr)) pg.tr = {};
  const prviDanas = !pg.tr[danas];
  if (prviDanas) {
    // pitanje sa liste dana X je „urađeno" ako mu je poslednji odgovor tog dana ili kasnije (ocenjuje se pri
    // prvom računu sledećeg dana, pa „kasnije" može biti samo ono što je danas odgovoreno pre tog računa)
    for (const [d, z] of Object.entries(pg.tr)) {
      if (d >= danas || !z || !Array.isArray(z.ids)) continue;
      const od = new Date(d + 'T00:00:00').getTime();
      z.u = z.ids.filter((id) => { const r = S.q[id]; return !!(r && r.last && r.last >= od); }).length;
      // bez rezerve: da li je simulacija (posle prvog računa) urađena PRE liste? Tada je trošila isti dnevni obim
      // (lista se skratila) i ne oduzima se; posle liste je dodatak i oduzima se kao u v149 (s = 1 / 0)
      if (z.r === 0) {
        const t1 = (S.sims || []).filter((s) => api.localDay(s.d) === d && s.d > z.t).reduce((m, s) => Math.min(m, s.d), Infinity);
        if (t1 < Infinity) { const odg = z.ids.map((id) => S.q[id]).filter((r) => r && r.last && api.localDay(r.last) === d); z.s = odg.filter((r) => r.last < t1).length < 0.5 * odg.length || !odg.length ? 1 : 0; }
      }
      delete z.ids;
    }
  }

  // tempo i učestalost
  const ist = istorija(S, danas);
  const kap = kapacitet(S, api, danas, K.nSim, ist);
  if (ctx.minKap > kap.est) { kap.est = Math.round(ctx.minKap); kap.tempo = Math.max(kap.tempo, kap.est); kap.izvor = 'podesavanje'; }
  const tempo = kap.tempo;
  const uc = ucestalost(S, api, danas, sad);
  const dan = S.day && S.day.d === danas ? S.day : { n: 0 };
  const simDanas = (S.sims || []).some((s) => api.localDay(s.d) === danas);
  const radiSim = uc.sim >= 0.5;
  const danIspita = dIsp === 0;
  const rezerva = radiSim && !simDanas && !danIspita && kap.est >= 2 * K.nSim ? K.nSim : 0;
  const traziP = Math.max(0, Math.round(Math.min(kap.est - (dan.n || 0) - rezerva, danIspita ? ISPIT_DAN_NAJVISE : Infinity)));
  const trazi = Math.max(traziP, (dan.n || 0) < MIN_TRAZI && !danIspita ? MIN_TRAZI - (dan.n || 0) : 0);

  // današnja lista: vrednost = težina na ispitu × dobitak od jednog odgovora
  const { ready } = api.queueSplit();
  const osv = api.zaOsvezavanje();
  const u = new Set(), kand = [];
  const stavi = (id, vrsta) => {
    if (u.has(id)) return; u.add(id);
    const r = S.q[id], w = K.w.get(id) || 0;
    const g = vrsta === 'n' ? st.gNovo : dobitStavke(r, st, (sad - (r.last || sad)) / DAY);
    const v = w * g;
    kand.push({ id, vrsta, v, ok: vrsta === 'r' || (vrsta === 'n' && w > 0) || v >= DOSTA, red: kand.length });
  };
  for (const id of ready) stavi(id, 'r');
  for (const id of osv) stavi(id, 'o');
  for (const q of Q) { const r = S.q[q.id]; if (r && r.a > 0 && r.last && sad - r.last >= IZBLEDELO * DAY && !api.inQueue(q.id)) stavi(q.id, 'o'); }
  for (const q of Q) if (!S.q[q.id] || !S.q[q.id].a) stavi(q.id, 'n');
  kand.sort((a, b) => b.ok - a.ok || b.v - a.v || a.red - b.red);
  let nVredno = 0; while (nVredno < kand.length && kand[nVredno].ok) nVredno++;
  const osnovni = kand.slice(0, Math.min(trazi, nVredno));
  const dostaDanas = osnovni.length < trazi;
  const izbor = ctx.jos > 0 ? kand.slice(0, osnovni.length + ctx.jos) : osnovni;
  const ids = izbor.map((k) => k.id);
  const nNov = osnovni.filter((k) => k.vrsta === 'n').length, nPon = osnovni.length - nNov;

  if (prviDanas) {
    const vecDanas = (id) => { const r = S.q[id]; return !!(r && r.last && api.localDay(r.last) === danas); };
    const nova = osnovni.filter((x) => !vecDanas(x.id));
    pg.tr[danas] = { n0: dan.n || 0, k: nova.length, t: sad, kap: kap.est, ...(dostaDanas ? { dosta: 1 } : {}), r: rezerva ? 1 : 0, ids: nova.slice(0, IDS_MAX).map((x) => x.id) };
    const kl = Object.keys(pg.tr).sort(); while (kl.length > PROZOR_KAL) delete pg.tr[kl.shift()];
  }

  // ---------- projekcija ----------
  const s0 = pocetno(S, api, K, st, sad, t0);
  const stop = projektuj(s0, st, { D, capDanas: 0, capDan: 0, simDanas: 0, simDan: 0, put: true });
  // P10: simulacija u projekciji staje u tempo (ne više od c/41 dnevno); P1: projekcija računa sa istim brojem
  // (tempo) koji tekst izgovara; P17: dan 0 je današnja lista (i simulacija ako joj je čuvano mesto)
  const simZa = (c) => Math.min(uc.sim, c / K.nSim);
  const scen = (f, dodatnoDana = 0, put = false) => {
    const c = tempo * f, s = simZa(c);
    return projektuj(s0, st, { D: D + dodatnoDana, capDanas: Math.round(osnovni.length * Math.min(1, f)), simDanas: rezerva ? 1 : 0, put,
      capDan: Math.max(0, c - K.nSim * s) * uc.akt, simDan: s * uc.akt });
  };
  const scenC = (c, put = false) => {
    const ost = Math.max(0, c - (dan.n || 0));
    const rez = radiSim && !simDanas && c >= 2 * K.nSim ? K.nSim : 0;
    const s = simZa(c);
    return projektuj(s0, st, { D, capDanas: danIspita ? Math.min(ost, ISPIT_DAN_NAJVISE) : ost - rez, simDanas: rez && !danIspita ? 1 : 0, put,
      capDan: Math.max(0, c - K.nSim * s) * uc.akt, simDan: s * uc.akt });
  };
  const baza = scen(1, 0, true);
  // P3: sidro (kalibrisana procena aplikacije) preko preostalog GUBITKA (98 − E), ne kao pomak u poenima — očekivani
  // poeni ne mogu preko 98. Kad je procena iznad modela (L0 < Ls): gubitak = L0 · (udeo gubitka modela)^(Ls/L0).
  // Nagib je 1 kod sidra (mali dobitak ostaje isti kao pomak), a vrh se savija ka 98. Mereno (p/ablacijaN.mjs,
  // nezavisni učenik): LINEARNI udeo (98 − L0·udeo) smanjivao je svaki dobitak od rada za L0/Ls i podigao lažnu
  // uzbunu ranoZavrsioR 19 → 44%, ovaj oblik 22%. Kad je procena ispod modela, pomak ostaje (vrh tada nije problem).
  const L0 = imaDokaza && pro.exp != null ? K.ukupno - pro.exp : null, Ls = K.ukupno - stop.E;
  const sidro = (x) => {
    if (L0 == null) return Math.min(K.ukupno, Math.max(0, x));
    if (L0 < Ls) return Math.min(K.ukupno, Math.max(0, K.ukupno - L0 * Math.pow(Math.max(0, K.ukupno - x) / Math.max(1e-6, Ls), Ls / Math.max(0.05, L0))));
    return Math.min(K.ukupno, Math.max(0, x + (pro.exp - stop.E)));
  };
  const slotovi = pro && pro.slotovi ? pro.slotovi.map((s) => ({ pts: s.pts, p: Math.min(0.999, Math.max(0.001, s.p)) })) : K.pools.map((s) => ({ pts: s.pts, p: 0.85 }));
  const sd0 = Math.sqrt(NESIG_MODEL * NESIG_MODEL + (dbg && imaDokaza && Number.isFinite(dbg.varNevidjeno) ? dbg.varNevidjeno : 0));
  const Estop = sidro(stop.E);
  const ocene = (r) => { const E = sidro(r.E); const sd = Math.hypot(sd0, NESIG_TEMPO * Math.max(0, E - Estop)); return { E, P: sansa(slotovi, E, sd, prag) }; };
  const cLo = Math.max(1, Math.round(0.8 * tempo)), cHi = Math.min(TEMPO_MAX, Math.max(cLo + 1, Math.round(1.2 * tempo)));
  const imaVise = cHi > tempo;   // završni pregled v150: iznad ~250 dnevno „više" (najviše 300) ume da bude MANJE od tempa
  const loR = scenC(cLo, true), hiR = imaVise ? scenC(cHi, true) : baza;
  const b = ocene(baza), lo = ocene(loR), hi = imaVise ? ocene(hiR) : { ...b }, so = ocene(stop);
  // D10: projekcija ume da da par desetih poena MANJE uz više rada (usrednjavanje kohorti) — to je šum modela, ne
  // savet. Šanse uz manje/više rada se zato slažu po obimu (manje ≤ ovim tempom ≤ više), kao i stoAko ispod.
  lo.P = Math.min(lo.P, b.P); lo.E = Math.min(lo.E, b.E); if (imaVise) { hi.P = Math.max(hi.P, b.P); hi.E = Math.max(hi.E, b.E); }
  // D7: režim pauze se odlučuje SAMO iz dana pre danas — isti je ceo dan, i posle prvog odgovora (ranije se
  // presuda prevrtala posle jednog odgovora, jer je osnova prelazila sa „bez rada" na „ovim tempom").
  const uPauzi = ist.prazno != null && ist.prazno >= PAUZA;
  const pres = uPauzi ? so : b;
  // P4: dok je dokaza malo (manje od 3 aktivna dana i manje od 30 ponovljenih odgovora), presude nema
  const aktDana = ist.svi.length + ((dan.n || 0) > 0 ? 1 : 0);
  const tanko = imaDokaza && aktDana < TANKO_DANA && st.ponovljeno < TANKO_PON;
  const ocena = !imaDokaza || tanko ? 'nema' : pres.P >= PRAG_OK ? 'ok' : pres.P >= PRAG_PROBLEM ? 'upozorenje' : 'problem';

  // ---------- koliko dnevno TREBA (G1) ----------
  let potrebanTempo = null, pTempo = null, sa300 = null, malo = false;
  const potrebanNedostizan = false, dodatnoDana = null;   // D2: ne tvrdi se (vidi zaglavlje)
  if (!danIspita && imaDokaza) {
    // D10: i tvoj tempo je poznata tačka (šansa „ovim tempom" iz presude) — potreban broj ne sme da ga preskoči
    const memo = new Map([[0, so.P], [cLo, lo.P], ...(imaVise ? [[cHi, hi.P]] : [])]);
    if (!memo.has(tempo) && tempo <= TEMPO_MAX) memo.set(tempo, b.P);
    const Pc = (c) => { if (!memo.has(c)) memo.set(c, ocene(scenC(c)).P); return memo.get(c); };
    if (so.P >= PRAG_OK) { potrebanTempo = 0; pTempo = so.P; }
    else {
      const poz = [...memo.entries()].sort((x, y) => x[0] - y[0]);
      const i = poz.findIndex(([, p]) => p >= PRAG_OK);
      let r = null;
      if (i > 0) r = trazi0(Pc, poz[i - 1][0], poz[i - 1][1], poz[i][0], poz[i][1], 0.04);
      else {
        // D10: iznad poznatih tačaka ide se istom mrežom kao stoAko (1,5×, 2×, 3× tempo, pa 300). Ranije se gledalo
        // samo 300: kad projekcija na vrhu opadne (šum), tekst je govorio „ne mogu pouzdano" dok je stoAko pokazivao
        // 120 dnevno → 72%.
        let [a, pa] = poz[poz.length - 1];
        const mreza = [...new Set([1.5, 2, 3].map((f) => Math.min(TEMPO_MAX, lepo(f * tempo))).concat(TEMPO_MAX))].filter((c) => c > a).sort((x, y) => x - y);
        for (const c of mreza) { const pc = Pc(c); if (pc >= PRAG_OK) { r = trazi0(Pc, a, pa, c, pc, 0.04); break; } a = c; pa = pc; }
      }
      if (r) {
        // Sud, ispravka 2: izgovoreni broj = polje, i taj isti broj mora sam da da ≥ 70% (zaokruži naviše, proveri)
        let x = Math.min(TEMPO_MAX, lepo(r.x)), p = Pc(x);
        for (let k = 0; k < 3 && p < PRAG_OK && x < TEMPO_MAX; k++) { x = Math.min(TEMPO_MAX, lepo(x + 1)); p = Pc(x); }
        if (p >= PRAG_OK) {
          // D10: najmanji „lep" broj koji daje ≥ 70% (pretraga ima toleranciju 4%, pa je 150 ranije stajalo uz 145 → 70,6%)
          for (let k = 0; k < 3; k++) { const y = x > 30 ? x - 5 : x - 1; if (y < 1) break; const py = Pc(y); if (py < PRAG_OK) break; x = y; p = py; }
          // D10: i nikad više od obima koji tekst već izgovara kao dovoljan („sa više (oko 42) oko 71%" uz „treba oko 45")
          for (const c of [cLo, tempo, cHi]) if (c < x && memo.get(c) >= PRAG_OK) { x = c; p = memo.get(c); }
          // provera v150: ni od obima iz „šta ako" (lab: „treba 300" uz red „110 dnevno → 73%") — ista mreža kao stoAko
          const mrezaSA = [...new Set([0.25, 0.5, 0.75, 1.5, 2, 3].map((f) => Math.min(TEMPO_MAX, Math.max(1, lepo(f * tempo)))))].filter((c) => c >= MALO_DNEVNO && c < x).sort((u, w) => u - w);
          for (const c of mrezaSA) { const pc = Pc(c); if (pc >= PRAG_OK) { x = c; p = pc; break; } }
          if (x >= MALO_DNEVNO) { potrebanTempo = x; pTempo = p; }
          else {
            // D9: sićušan obim se ne izgovara kao dovoljan. Ako ovim tempom već stižeš — broja nema (tekst kaže šta bi
            // bilo bez vežbe); inače plan traži bar MALO_DNEVNO, i to samo ako je proveren (≥ 70%).
            malo = true;
            const pm = Pc(MALO_DNEVNO);
            if (b.P < PRAG_OK && pm >= PRAG_OK) { potrebanTempo = MALO_DNEVNO; pTempo = pm; }
          }
        }
      }
      if (potrebanTempo == null && !malo) sa300 = Pc(TEMPO_MAX);
    }
  }
  const nedostizanModel = sa300 != null && sa300 < NEDOST_P && D <= NEDOST_DANA && !tanko;

  // ---------- šta se promenilo (G4) ----------
  const izbledelo = ist.prazno != null && ist.prazno >= PAUZA_PORUKA ? Math.max(0, poeniModela(s0, st, -ist.pauza) - poeniModela(s0, st, 0)) : 0;
  const skoroSve = s0.un.length <= 0.1 * K.nSablon;
  const grubo = imaDokaza && st.vid >= 300 && st.ponovljeno < Math.max(100, 0.15 * st.vid);

  // ---------- pokrivenost (zatvara se: videno + stize + retka + vanSablona = sva pitanja) ----------
  const nevSab = s0.un.length;
  const stize = Math.min(nevSab, Math.max(0, Math.round(baza.novih)));
  const pokrivenost = { videno: Q.length - nevSab - s0.nulaNevid, stize, retka: nevSab - stize,
    retkaNaIspitu: Math.round(10 * baza.nevH) / 10, retkaPoena: Math.round(10 * baza.nevW) / 10, vanSablona: s0.nulaNevid };

  // ---------- tekst (latinica, obične reči, „oko" umesto „~", oblik imenice uz broj) ----------
  const uk = K.ukupno;
  const E = b.E, Etx = poeniTxt(E, uk);
  const imaSim = rezerva > 0;
  const ptTxt = potrebanTempo;                     // već zaokružen: polje = izgovoreni broj
  const znak = ocena === 'ok' ? '✅' : ocena === 'upozorenje' ? '⚠' : '⛔';
  const pauzaTxt = uPauzi ? ist.prazno + ' dana' : '';   // genitiv: „posle 30 dana pauze"; D6: dani bez rada, bez danas
  const polaNovo = !imaDokaza && !danIspita && kap.izvor !== 'nema' && dIsp > 0 && nevSab > 0 && Math.round(pokrivenost.retkaNaIspitu) > K.nSim / 2;
  const trebaDnevno = D > 0 ? 2 * nevSab / D : 0;
  const kazeTreba = !imaDokaza && !danIspita && dIsp > 0 && nevSab > 0 && Math.round(pokrivenost.retkaNaIspitu) > 0 && tempo < trebaDnevno;
  let glavno;
  if (danIspita) glavno = ocena === 'nema' ? 'Ispit je danas: najviše ' + ISPIT_DAN_NAJVISE + ' pitanja, bez simulacije.' : `${znak} Ispit je danas: procena oko ${Etx} od ${uk} poena (prag ${prag}).`;
  else if (!imaDokaza) {
    const nPrvi = Math.round(pokrivenost.retkaNaIspitu);
    const ovim = kap.izvor === 'nema' ? `sa ${tempo} dnevno` : 'ovim tempom';
    // v150 (Milanov primer „jedno pitanje dnevno"): kad izmereni tempo ne stiže ni do pola ispita, to stoji GORE,
    // brojevima koji se mogu izbrojati (koliko pitanja ispita bi bilo novo, koliko dnevno treba da svako vidiš i
    // jednom ponoviš) — bez šanse, jer bez dokaza šanse nema. Ranije: „Prva procena: …36 od 41…" 29 dana zaredom,
    // a broj koji treba stajao je iza „Zašto".
    glavno = polaNovo ? `Ovim tempom ne vidiš ni pola ispita: na ispitu bi oko ${nPrvi} od ${K.nSim} ${oblik(nPrvi, 'bilo novo', 'bila nova', 'bilo novo')}. Da svako vidiš i jednom ponoviš: ${dnevnoTxt(2 * nevSab / D)}.`
      : nPrvi > 0 ? `Prva procena: ${ovim}, na ispitu bi oko ${nPrvi} od ${K.nSim} ${oblik(nPrvi, 'bilo novo', 'bila nova', 'bilo novo')}.${kazeTreba ? ` Da svako vidiš i jednom ponoviš: ${dnevnoTxt(trebaDnevno)}.` : ''}`
      : `Prva procena: ${ovim} do ispita vidiš ${pokrivenost.retka ? 'skoro sva' : 'sva'} pitanja koja se izvlače.`;
  }
  // P4: malo dokaza — poeni bez znaka i bez šanse, uz rok kad će biti pouzdanije
  else if (tanko) glavno = `Prva procena: ovim tempom oko ${Etx} od ${uk} poena; posle 2–3 dana biće pouzdanija.`;
  // Provera v150, B2: šansa „bez vežbe" je optimistična (plan-proba: obećano 76%, stvarno 72%), pa se ne izgovara
  // kao broj uz ✅; kaže se šansa ako nastaviš, i da znanje bledi.
  else if (uPauzi) glavno = ocena === 'ok' ? `✅ Posle ${pauzaTxt} pauze znanje ti je još dobro; ako nastaviš, šansa ${pr(b.P)}.`
    : ocena === 'upozorenje' ? `⚠ Posle ${pauzaTxt} pauze: bez vežbe si na ivici; ako nastaviš, šansa ${pr(b.P)}.`
    : `⛔ Posle ${pauzaTxt} pauze: bez vežbe ne stižeš; ako nastaviš, šansa ${pr(b.P)}.`;
  else if (ocena === 'ok') glavno = `✅ Ovim tempom stižeš: oko ${Etx} od ${uk} poena, šansa ${pr(b.P)}.`;
  else if (ptTxt == null && sa300 != null) glavno = `${znak} ${ocena === 'upozorenje' ? 'Na ivici' : 'Ovim tempom ne stižeš'} (šansa ${pr(b.P)}): svaki dan vežbe je podiže.`;
  else if (ptTxt == null) glavno = ocena === 'upozorenje' ? `⚠ Na ivici: šansa za sada ${prOko(b.P)}.` : `⛔ Ovim tempom ne stižeš: šansa za sada ${prOko(b.P)}.`;
  else if (ocena === 'upozorenje') glavno = `⚠ Na ivici (šansa ${pr(b.P)}): za sigurniji prolaz treba oko ${pit(ptTxt)} dnevno.`;
  else glavno = `⛔ Ovim tempom ne stižeš (šansa ${pr(b.P)}): treba oko ${pit(ptTxt)} dnevno.`;

  const ucimTempo = kap.izvor === 'nema' || kap.izvor === 'proba' || kap.izvor === 'slobodno' || kap.izvor === 'pauza';
  let zadatak;
  const sastav = nPon && nNov ? ` (${br(nPon, 'ponavljanje', 'ponavljanja', 'ponavljanja')}, ${br(nNov, 'novo', 'nova', 'novih')})` : nNov ? (nNov === 1 ? ', novo' : ', sva nova') : (nPon === 1 ? ', ponavljanje' : ', sva ponavljanja');
  if (danIspita) zadatak = osnovni.length ? `Pre ispita: ${pit(osnovni.length)}${sastav}, bez simulacije.` : 'Danas ništa ne moraš: odmori se pred ispit.';
  else if (osnovni.length) zadatak = `Danas${(dan.n || 0) > 0 ? ' još' : ''}: ${pit(osnovni.length)}${sastav}${imaSim ? ', pa simulacija' : ''}.`;
  else if ((dan.n || 0) > 0 && (traziP === 0 || nVredno > 0)) zadatak = rezerva ? 'Lista za danas je urađena — ostaje još simulacija.'
    : ucimTempo ? 'Za danas si uradio koliko je plan tražio.'
    : `Za danas gotovo (${pit(dan.n)})${kand.length ? ' — po želji još 20.' : '.'}`;
  else zadatak = imaSim ? 'Danas samo simulacija: ništa drugo još nije izbledelo.' : 'Za danas je dosta: sve naučeno je još sveže.';

  const det = [];
  const preskace = uc.akt < 0.85 && uc.preskoceno7 > 0;
  const uDanima = preskace ? ' u danima kad vežbaš' : '';
  const sadaRadis = kap.izvor === 'nema' ? `plan za sada računa sa oko ${tempo}` : `sada oko ${tempo}`;
  if (!danIspita) {
    if (!imaDokaza) {
      det.push(`Šansu računam kad pokriješ bar trećinu ispita${pro && Number.isFinite(pro.pokriveno) ? ` (sada ${Math.round(100 * pro.pokriveno)}%)` : ''} ili posle jedne simulacije (${pit(K.nSim)}).`);
      if (nevSab > 0 && dIsp > 0 && !polaNovo && !kazeTreba) det.push(`Sa ispita je još ${br(nevSab, 'neviđeno pitanje', 'neviđena pitanja', 'neviđenih pitanja')}: da svako vidiš i jednom ponoviš do ispita, to je ${dnevnoTxt(2 * nevSab / D)}${kap.izvor !== 'nema' ? ` (sada oko ${tempo})` : ''}.`);
    }
    else if (tanko) {
      det.push(`Za sada malo znam o tome koliko brzo učiš i zaboravljaš: tek ${br(st.ponovljeno, 'ponovljen odgovor', 'ponovljena odgovora', 'ponovljenih odgovora')}.`);
      if (ptTxt != null && ptTxt > 0) det.push(`Po prvoj proceni, za šansu 70% treba oko ${pit(ptTxt)} dnevno${uDanima}.`);
    }
    else if (grubo && (ocena === 'upozorenje' || ocena === 'problem')) det.push(`${ptTxt ? `Po grubom računu za šansu 70% treba oko ${pit(ptTxt)} dnevno. ` : ''}Ponavljaj svaki dan: plan daje najvrednija prvo.`);
    else if (ptTxt == null && sa300 != null) det.push('Koliko tačno dnevno treba, ne mogu pouzdano da kažem. Radi koliko stigneš i ne preskači dane.');
    else if (uPauzi && ptTxt != null) det.push(ptTxt === 0
      ? `Ako od danas nastaviš tempom od oko ${pitGen(tempo)} dnevno: oko ${poen(E, uk)}, šansa ${pr(b.P)}.`
      : `Za šansu 70% dovoljno je oko ${pit(ptTxt)} dnevno od danas.`);
    else if ((ocena === 'upozorenje' || ocena === 'problem') && ptTxt != null) det.push(`Za šansu 70% treba oko ${pit(ptTxt)} dnevno${uDanima} (${sadaRadis}). Kad završiš listu, nastavi sa „Još 20".`);
    else if (ptTxt === 0) det.push('Već dosta znaš, ali bez vežbe znanje do ispita bledi: redovna vežba ga čuva.');
    // D9: jak učenik — nikad „dovoljno je i malo"; kaže se šta bi bilo bez vežbe i da redovna vežba to čuva i podiže
    else if (malo && ocena === 'ok') det.push('Bez vežbe znanje do ispita bledi; redovnom vežbom šansu čuvaš i podižeš.');
    // Provera v150, B1: „Granica: sa manje od N šansa pada ispod 70%" bila je tačna u 26–47% slučajeva (učenik
    // radi 0,8·N) — model potcenjuje manji obim. Rečenica je izbačena; razliku pokazuje red „sa manje / sa više rada".
  }
  if (!danIspita && grubo && ptTxt !== 0) det.push('Procena je za sada gruba: tek posle nekoliko dana ponavljanja vidim koliko brzo učiš i zaboravljaš.');
  // D6: broje se celi dani bez rada (bez danas), i rečenica ide samo dok danas još nisi vežbao
  if (izbledelo >= 0.5 && !((dan.n || 0) > 0)) det.push(`Nisi vežbao ${dana_(ist.prazno)}: za to vreme izbledelo je oko ${br(Math.max(1, Math.round(izbledelo)), 'poen', 'poena', 'poena')} znanja.${osnovni.length && nPon >= osnovni.length / 2 ? ' Zato je danas u listi najviše ponavljanja.' : ''}`);
  if (uPauzi && ptTxt !== 0 && imaDokaza && !tanko) det.push(`Ako od danas radiš oko ${pit(tempo)} dnevno: oko ${poen(E, uk)}, šansa ${pr(b.P)}.`);
  if (!uPauzi && !danIspita && dIsp >= 7 && imaDokaza && !tanko && skoroSve && so.P < PRAG_OK && b.P - so.P >= 0.1)
    det.push('Ako sada potpuno staneš, do ispita znanje izbledi i šansa pada ispod 70%. Svaki dan ponavljanja to koči.');
  // tempo: P1/P2/P8 — broj u tekstu je isti broj sa kojim računa presuda
  const aktTxt = preskace ? `; vežbaš otprilike ${br(Math.max(1, Math.round(uc.akt * 7)), 'dan', 'dana', 'dana')} u nedelji` : '';
  // D5: „danas plan traži X" samo kad lista stvarno toliko ima (ne uz listu od 1 pitanja jer vrednijeg nema)
  const probaVise = kap.est > tempo && !dostaDanas && (dan.n || 0) + osnovni.length > tempo;
  const sSim = uc.sim > 0 ? ' sa simulacijom' : '';
  if (!danIspita) det.push(kap.izvor === 'podesavanje'
    ? `Plan računa da dnevno uradiš oko ${pit(tempo)}${sSim} — tvoj najmanji tempo iz podešavanja${aktTxt}.`
    : kap.izvor === 'nema'
    ? `Tvoj tempo još ne znam, pa plan računa sa tempom od oko ${pitGen(tempo)} dnevno; posle par dana ravna se po tebi.`
    : kap.izvor === 'pauza'
    ? `Posle duže pauze kreće se iznova: plan računa sa oko ${pitGen(tempo)} dnevno${kap.pre > tempo ? ` (pre pauze oko ${kap.pre})` : ''} i posle par dana ravna se po tebi.`
    : kap.izvor === 'slobodno'
    ? (probaVise
      ? `Obično uradiš oko ${pit(tempo)} dnevno, s tim računam. Danas plan traži ${kap.est}, da vidi možeš li više.`
      : `Plan računa sa onim što obično uradiš: oko ${pit(tempo)} dnevno${sSim}${aktTxt}.`)
    : kap.izvor === 'proba'
    ? `Sve što je plan tražio si stigao, pa probno računa sa malo više: oko ${pit(tempo)} dnevno${sSim}${aktTxt}.`
    : kap.izvor === 'pauzaKratka'
    ? `Plan računa sa tempom od oko ${pitGen(tempo)} dnevno${sSim}: toliko si obično stizao pre pauze${aktTxt}.`
    : kap.izvor === 'delimicno'
    ? `Plan računa sa tempom od oko ${pitGen(tempo)} dnevno${sSim}; tempo se još meri${aktTxt}.`
    : kap.izvor === 'ranije'
    ? `Plan računa sa oko ${pitGen(tempo)} dnevno${sSim}: najviše što si uradio poslednjih dana${aktTxt}.${probaVise ? ` Danas traži ${kap.est}, da vidi možeš li više.` : ''}`
    : `Plan računa da dnevno uradiš oko ${pit(tempo)}${sSim} — toliko stigneš u 4 od 5 dana${aktTxt}.`);
  if (!danIspita && dostaDanas && osnovni.length) det.push('Lista je danas kraća: ostala pitanja su još sveža ili se na ispitu ne izvlače.');
  // P15: dok plan uči tvoj tempo, prazna lista posle urađenog nije „koliko obično stižeš"
  if (!danIspita && !osnovni.length && !rezerva && (dan.n || 0) > 0 && traziP === 0 && ucimTempo) det.push('Sve preko toga pomaže planu da nauči tvoj tempo — „Još 20" uzima sledeća po vrednosti.');
  // P5/P10: simulacija se računa samo koliko je stvarno radiš, i to se kaže
  if (!danIspita && uc.sim > 0) {
    const N = Math.round(1 / uc.sim);
    // D8: „kao poslednjih dana" samo kad iza toga stoji bar SIM_MIN_DANA aktivnih dana (ne jedna probna simulacija)
    const kao = uc.simDana >= SIM_MIN_DANA && !uPauzi ? ', kao poslednjih dana' : '';
    det.push(uc.sim >= 0.85 ? 'Računam da radiš simulaciju svaki dan — poslednjih dana jesi.'
      : N <= 1 ? `Računam sa simulacijom skoro svaki dan${kao}.`
      : N >= 2 && N <= 7 ? `Računam sa simulacijom otprilike svaki ${REDNI[N]} dan${kao}.`
      : `Računam sa simulacijom ponekad${kao}.`);
  }
  // šta ostaje do ispita — isti brojevi kao u pokrivenost (P6: koliko ih stvarno dođe na ispitu i koliko nose)
  const vanS = pokrivenost.vanSablona;
  const neIzvl = vanS ? `; još ${br(vanS, 'pitanje se ne izvlači', 'pitanja se ne izvlače', 'pitanja se ne izvlače')}` : '';
  if (dIsp > 0 && !uPauzi) {
    // D5: bez broja ponavljanja do ispita — projekcija ga je potcenjivala (37 do ispita uz 60 ponavljanja danas)
    if (nevSab === 0) det.push(`Sva pitanja koja se izvlače već si video: do ispita (${dana_(D)}) plan daje samo ponavljanja.`);
    else det.push(stize > 0
      ? `Do ispita (${dana_(D)}) ovim tempom vidiš još oko ${br(stize, 'novo pitanje', 'nova pitanja', 'novih pitanja')}${pokrivenost.retka === 0 ? ' — sva koja se izvlače' : ''}.`
      : `Do ispita (${dana_(D)}) ovim tempom ne stižeš do novih pitanja: sve vreme ide na ponavljanje.`);
    const h = pokrivenost.retkaNaIspitu, wP = pokrivenost.retkaPoena;
    if (pokrivenost.retka > 0) det.push(h < RETKO_H
      ? `Neviđeno ostaje ${br(pokrivenost.retka, 'pitanje koje se izvlači', 'pitanja koja se izvlače', 'pitanja koja se izvlače')}, ali retko: na ispitu u proseku ${h < 0.5 ? 'manje od jednog' : 'oko ' + Math.round(h)} od ${K.nSim}${neIzvl}.`
      : `Neviđeno ostaje ${br(pokrivenost.retka, 'pitanje koje se izvlači', 'pitanja koja se izvlače', 'pitanja koja se izvlače')}: na ispitu u proseku oko ${Math.round(h)} od ${K.nSim}, oko ${br(Math.round(wP), 'poen', 'poena', 'poena')}${neIzvl}.`);
    else if (vanS) det.push(`Neviđeno ostaje samo ${br(vanS, 'pitanje koje se na ispitu ne izvlači', 'pitanja koja se na ispitu ne izvlače', 'pitanja koja se na ispitu ne izvlače')}.`);
  }
  if (dIsp > 0 && !uPauzi && imaDokaza && !tanko && Math.abs(hi.P - lo.P) >= 0.05) det.push(imaVise ? `Sa manje rada (oko ${cLo} dnevno) šansa je ${prOko(lo.P)}, sa više (oko ${cHi}) ${prOko(hi.P)}.` : `Sa manje rada (oko ${cLo} dnevno) šansa je ${prOko(lo.P)}.`);
  if (!danIspita && !rezerva && uc.sim > 0 && !simDanas && osnovni.length) det.push('Ako danas radiš i simulaciju, uradi je pre liste — lista se onda sama skrati.');
  if (danIspita) det.push(`Najviše ${ISPIT_DAN_NAJVISE} pitanja i bez simulacije: umor pred ispit košta više nego što vežba donese.`);

  const proj = { D, kapacitet: kap.est, tempo, izvor: kap.izvor, aktivnost: uc.akt, simulacija: uc.sim, poeni: pres.E, sansa: pres.P, poeniNastavak: b.E, sansaNastavak: b.P, sansaManje: lo.P, sansaVise: hi.P, sansaStop: so.P, poeniBezRada: so.E,
    nevidjeno: nevSab - stize + vanS, ponavljanja: baza.pon, novih: baza.novih, trazi, poeniSad: pro ? pro.exp : null, poeniStop: Estop, nesigurnost: sd0, izbledelo, pauza: ist.pauza, prazno: ist.prazno, uPauzi, sansaPotreban: pTempo, nedostizanModel, sansaSa300: sa300, tanko };
  const put = (r) => r.put.map((x) => Math.round(10 * sidro(x)) / 10);
  const brT = dIsp + 1;
  const putanja = brT > 1
    ? { dani: Array.from({ length: brT }, (_, k) => api.localDay(t0 + k * DAY + 12 * 3600e3)), E: put(baza), Emanje: put(loR), Evise: put(hiR), Ebez: put(stop), prag }
    : { dani: [danas], E: [Math.round(10 * b.E) / 10], Emanje: [Math.round(10 * lo.E) / 10], Evise: [Math.round(10 * hi.E) / 10], Ebez: [Math.round(10 * so.E) / 10], prag };
  putanja.Edanas = putanja.E[0];
  putanja.pouzdano = imaDokaza && !tanko;

  let stoAko = null;
  if (ctx.stoAko && !danIspita) {
    const v = new Set([tempo]);
    if (potrebanTempo > 0) v.add(potrebanTempo);
    // D9: sićušni obimi se ne nude kao opcija (osim tvog tempa)
    for (const f of [0.5, 1.5, 2, 0.75, 3, 0.25]) { if (v.size >= 6) break; const c = Math.min(TEMPO_MAX, Math.max(1, lepo(f * tempo))); if (c >= MALO_DNEVNO) v.add(c); }
    stoAko = [...v].sort((x, y) => x - y).map((c) => { const r = c === tempo ? b : ocene(scenC(c)); return { dnevno: c, P: imaDokaza ? r.P : null, E: Math.round(10 * r.E) / 10, ...(c === tempo ? { tvoj: true } : {}), ...(c === potrebanTempo ? { potreban: true } : {}) }; });
    // D10: više rada ne sme da pokaže manju šansu (šum projekcije) — slaže se naviše po obimu
    for (let k = 1; k < stoAko.length; k++) { const a = stoAko[k - 1], z = stoAko[k]; if (z.P != null && a.P != null && z.P < a.P) z.P = a.P; if (z.E < a.E) z.E = a.E; }
  }

  const ostaje = { lista: osnovni.length, simulacija: rezerva ? K.nSim : 0 };
  const ukupnoDanas = (dan.n || 0) + ostaje.lista + ostaje.simulacija;
  const red = [glavno, zadatak, ...det];
  return { ids, ocena, tekst: red.join(String.fromCharCode(10)), redovi: red.map((l) => ({ l, c: uCir(l) })), presudaIdx: 0, glavno, zadatak, detalji: det,
    potrebanTempo, potrebanNedostizan, dodatnoDana, putanja, pokrivenost, ostaje,
    uListi: { naRedu: osnovni.filter((k) => k.vrsta === 'r').length, ukupnoNaRedu: ready.length }, stoAko, grubo, tanko,
    projekcija: proj, kap: kap.est, tempo, trazi, rezerva, simDanas, nemaNaRedu: !kand.length, dosta: dostaDanas,
    cilj: ukupnoDanas > 0 ? ukupnoDanas : null };
}

self.VozackiPlan = { planDanas, uCir, RAST, pr };
})();
