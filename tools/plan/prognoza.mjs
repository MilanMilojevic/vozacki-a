// PROGNOZA — dnevni plan izveden iz PROJEKCIJE do dana ispita.
//
// Ideja: plan ne računa „koliko TREBA" (fiksan rok za novo gradivo pa kvote), nego „koliko STIŽEŠ"
// (procena iz tvojih poslednjih dana) i onda to vreme troši tamo gde najviše vredi za ispit.
//   1. Kapacitet: koliko pitanja dnevno stvarno uradiš (S.dani + zapamćeno koliko je plan tražio).
//      Plan nikad ne traži više od toga; simulacija koju radiš troši isti kapacitet.
//   2. Današnja lista: sva pitanja koja imaju smisla danas (na redu za ponavljanje, za osvežavanje,
//      neviđena) poređana po OČEKIVANOM DOBITKU POENA NA ISPITU po jednom odgovoru:
//      težina pitanja na ispitu (šablon SIM_SLOTS) × koliko jedan odgovor podigne verovatnoću tačnog
//      (model učenja ovog učenika: stopa prvog pogleda, stopa posle greške, dobitak od tačnog/pogrešnog
//      odgovora — izmereno procenom iz procena.js). Uzima se vrh liste do kapaciteta.
//   3. Projekcija (očekivane vrednosti, ne slučajno): isti izbor dan po dan do ispita, sa tvojim
//      tempom, tvojim danima odmora, tvojim simulacijama i pravilima reda iz app.js. Presuda i tekst
//      dolaze iz nje: šansa za prolaz na dan ispita, uz raspon ako radiš manje/više.
// Nema roka za novo gradivo, pa nema ni dana kad treba „preći sve ponovo".
import { proceni } from '../procena/isporuka.mjs';

const DAY = 864e5;
// Novi korisnik bez ijednog dana istorije: 60 pitanja ≈ sat vežbe (ispit je 41 pitanje za 45 min).
// Posle prvih dana plan prelazi na izmereno.
const PODRAZUMEVANI_KAP = 60;
// Dok gornja granica nije viđena (sve što je plan tražio je stignuto), sutra traži 15% više: to je
// otprilike dnevno kolebanje obima kod istog čoveka (Milan: 85–120, medijana 113), pa prvi dan koji
// ne stigne promaši za najviše toliko. Kad je granica jednom viđena, korak je trećina toga (5%).
const RAST = 1.15;
// Kapacitet: poslednjih 7 aktivnih dana (nedelja — ne vuče staru naviku, a ima dovoljno dana za
// kvantil); učestalost rada: 14 kalendarskih dana.
const PROZOR_AKT = 7;
const PROZOR_KAL = 14;
// Plan traži nivo koji stigneš u 4 od 5 dana (ne prosečan dan): lista je poređana po vrednosti, pa
// ono što ostane neurađeno na dobar dan najmanje vredi, a plan koji se skoro uvek stigne ne
// obeshrabruje. Izolovano merenje (cap ±20% po danu): cilj 1/2 → 27% dana zahtev >1,1× mogućeg,
// cilj 1/3 → ~20%, cilj 1/5 → ~11%, uz ~5% manje urađenog.
const NEDOSTIZNO = 0.2;
// Zaborav: 30 dana — isto središte koje koristi procena.js (T0), da plan i procena ne pričaju
// različite priče o istom pitanju.
const T_ZAB = 30;
const OSVEZI = 21;                       // dana, OSVEZI_POSLE iz app.js
// Presuda: ✅ kad je prolaz izgledan (≥70%: od tri takva ispita padne se najviše jedan), ⛔ kad je
// pad verovatniji od prolaza i sa rezervom (<40%), između ⚠.
const PRAG_OK = 0.7, PRAG_PROBLEM = 0.4;
// Neizvesnost projekcije u poenima: 2 poena = uobičajena greška modela procene (MIX u procena.js)
// + neizvesnost neviđenog dela koju procena sama računa, plus 30% onoga što projekcija očekuje od
// budućeg rada (tempo, dani odmora i parametri učenja nisu garantovani; ±20% obima u tekstu je
// dnevno kolebanje jednog čoveka, pa 30% pokriva i to i grešku modela učenja).
const NESIG_MODEL = 2, NESIG_TEMPO = 0.3;
// Kad procena još nema dovoljno podataka: slabi priori iz procena.js (PRIOR_M za gC i gW).
const PRIOR_GC = 0.3, PRIOR_GW = 1.0, PRIOR_SD = 0.8, PRIOR_MU = 0.75, PRIOR_ERR = 0.8;
const GH5 = [[-2.8569700138728, 0.0112574113277], [-1.3556261799742, 0.2220759220056], [0, 0.5333333333333], [1.3556261799742, 0.2220759220056], [2.8569700138728, 0.0112574113277]];

const sg = (x) => 1 / (1 + Math.exp(-x));
const lg = (p) => { const q = Math.min(0.999, Math.max(0.001, p)); return Math.log(q / (1 - q)); };
// kvantil sa linearnom interpolacijom (q = 0,5 je medijana)
const kvantil = (a, q) => { const s = [...a].sort((x, y) => x - y); const i = q * (s.length - 1), k = Math.floor(i); return k + 1 < s.length ? s[k] + (s[k + 1] - s[k]) * (i - k) : s[k]; };

// ---------- težina pitanja na ispitu ----------
let KES = null;
function sablon(Q, SIM_SLOTS) {
  if (KES && KES.Q === Q && KES.SL === SIM_SLOTS) return KES;
  const w = new Map(), h = new Map(), pools = [];
  for (const s of SIM_SLOTS) {
    const pool = Q.filter((q) => s.s.includes(q.sub) && q.pts === s.p);
    if (!pool.length) continue;
    pools.push({ pts: s.p });
    // w = očekivani poeni koje pitanje nosi na ispitu po jedinici verovatnoće tačnog (Σ w·p = očekivani poeni);
    // h = verovatnoća da se pojavi u jednoj simulaciji
    for (const q of pool) { w.set(q.id, (w.get(q.id) || 0) + s.p / pool.length); h.set(q.id, (h.get(q.id) || 0) + 1 / pool.length); }
  }
  KES = { Q, SL: SIM_SLOTS, w, h, pools, ukupno: pools.reduce((a, b) => a + b.pts, 0), nSim: SIM_SLOTS.length };
  return KES;
}

// ---------- kako ovaj učenik uči ----------
// Pitanja nisu jednako teška: znanje na prvi pogled je logit-normalno (th, sd iz procene), pa se
// neviđeno pitanje prati kroz 5 „čvorova" (Gauss–Hermite). Bez toga projekcija računa dobitak na
// PROSEČNOM pitanju i potcenjuje ga, jer se najviše dobija baš na teškim pitanjima.
export function stope(S, Q, dbg) {
  let vid = 0, prvi = 0, eN = 0, eC = 0;
  for (const q of Q) {
    const r = S.q[q.id]; if (!r || !(r.a > 0)) continue;
    vid++; if (r.w === 0) prvi++; else if (r.a >= 2) { eN += r.a - 1; eC += r.a - r.w; }
  }
  const st = {
    mu: dbg ? dbg.mu : (prvi + 4 * PRIOR_MU) / (vid + 4),
    pErr: dbg ? dbg.posleGreske : (eC + 4 * PRIOR_ERR) / (eN + 4),
    gC: dbg ? Math.max(0.05, dbg.par.gC) : PRIOR_GC,
    gW: dbg ? Math.max(0.2, dbg.par.gW) : PRIOR_GW,
    sd: dbg ? Math.min(3, Math.max(0.2, dbg.par.sd)) : PRIOR_SD,
    vid,
  };
  // središte tako da prosek preko čvorova bude tačno izmerena stopa prvog pogleda
  const marg = (th) => GH5.reduce((a, [z, w]) => a + w * sg(th + st.sd * z), 0);
  let lo = -8, hi = 8; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (marg(m) < st.mu) lo = m; else hi = m; }
  st.cv = GH5.map(([z, w]) => ({ om: w, l0: (lo + hi) / 2 + st.sd * z }));
  st.gNovo = st.cv.reduce((a, c) => a + c.om * dobit(sg(c.l0), st), 0);
  return st;
}
// stanje viđenog pitanja kao mešavina čvorova: [{om, b (osnova za zaborav), p (odmah posle poslednjeg odgovora)}]
function cvorovi(r, st) {
  const a = Math.min(r.a, 4);
  if (r.w > 0) {   // grešilo se: stopa „posle greške" je izmerena direktno; osnova = čvorovi koji češće greše
    const post = st.cv.map((c) => c.om * (1 - sg(c.l0))); const t = post.reduce((x, y) => x + y, 0);
    const b = st.cv.reduce((x, c, k) => x + post[k] / t * c.l0, 0);
    return [{ om: 1, b, p: sg(lg(st.pErr) + (r.streak || 0) * st.gC) }];
  }
  // uvek tačno: čvorovi po verovatnoći da se to desi (lakša pitanja češće), plus dobitak od tačnih
  const post = st.cv.map((c) => c.om * Math.pow(sg(c.l0), a)); const t = post.reduce((x, y) => x + y, 0);
  return st.cv.map((c, k) => ({ om: post[k] / t, b: c.l0, p: sg(c.l0 + a * st.gC) }));
}
const zabor = (p, dt, b) => sg(b + (lg(p) - b) * Math.exp(-Math.max(0, dt) / T_ZAB));
// Dva lica dobitka od pogrešnog odgovora:
//  - za IZBOR (šta danas vredi više) posle greške se ne računa iznad izmerene stope „tačno posle
//    greške" (ista granica kao u procena.js) — oprezno, pa ponavljanje ne potiskuje nova pitanja
//    bez potrebe (merenje: bez granice ~50 neviđenih više uz isti ishod);
//  - za STANJE u projekciji važi fitovani dobitak gW bez granice — inače projekcija misli da
//    ponovljena greška ništa ne uči i potcenjuje rad (merenje: ~2 poena pesimizma kod slabijih).
function posle(p, st) { const l = lg(p); return { pc: sg(l + st.gC), pw: Math.min(sg(l + st.gW), Math.max(p, st.pErr)) }; }
function dobit(p, st) { const { pc, pw } = posle(p, st); return p * (pc - p) + (1 - p) * (pw - p); }
function dobitStavke(r, st, dt) { return cvorovi(r, st).reduce((a, c) => a + c.om * dobit(zabor(c.p, dt, c.b), st), 0); }

// ---------- kapacitet (samo iz istorije) ----------
// Dan kad je plan STIGNUT kaže samo „mogao si bar ovoliko" (cenzurisano odozdo); dan kad NIJE kaže
// „ovoliko si mogao". Kaplan–Meier kroz oba daje nivo koji dostižeš u 4 od 5 dana (NEDOSTIZNO).
// Slobodni dani (bez plana) su cenzurisani: tu si radio koliko si hteo; dok nema dana sa planom,
// polazi se od njihove medijane (tvoja navika), a bez ikakve istorije od PODRAZUMEVANI_KAP.
// Kad gornje granice još nema (sve stignuto), sutra se traži RAST više od najboljeg stignutog dana.
function kapacitet(S, api, danas, nSim) {
  const tr = (S.plan && S.plan.prognoza && S.plan.prognoza.tr) || {};
  const sims = S.sims || [];
  const dani = (S.dani || []).filter((x) => x.n > 0 && x.d < danas).slice(-PROZOR_AKT);
  const obs = dani.map((x) => {
    const z = tr[x.d];
    if (!z) return { v: x.n, c: true, plan: false };
    const posleSim = sims.filter((s) => api.localDay(s.d) === x.d && s.d > z.t).length;
    const odPlana = x.n - z.n0 - nSim * posleSim;
    // stignut = urađen ceo zahtev (uz 2–3% za pitanje koje se istog dana ne broji dvaput)
    return { v: x.n, c: odPlana >= z.k - Math.max(2, 0.03 * z.k), plan: true };
  });
  const planski = obs.filter((o) => o.plan);
  const skup = planski.length >= 3 ? planski : obs;
  if (!skup.length) return { est: PODRAZUMEVANI_KAP, izvor: 'nema' };
  const tacni = skup.filter((o) => !o.c).map((o) => o.v).sort((x, y) => x - y);
  const q = NEDOSTIZNO;
  let Sx = 1;
  for (let i = 0; i < tacni.length; i++) {
    if (i > 0 && tacni[i] === tacni[i - 1]) continue;
    const x = tacni[i], r = skup.filter((o) => o.v >= x).length, d = tacni.filter((v) => v === x).length;
    Sx *= 1 - d / r;
    if (Sx <= 1 - q + 1e-9) return { est: Math.round(x), izvor: 'mereno' };
  }
  // gornja granica još nije dostignuta: proba iznad najboljeg stignutog plana
  const cenz = skup.filter((o) => o.c).map((o) => o.v);
  const planCenz = skup.filter((o) => o.c && o.plan).map((o) => o.v);
  // bez ijednog nestignutog dana: korak RAST; kad je bar jedan viđen, blizu smo plafona — pola koraka
  const korak = tacni.length ? 1 + (RAST - 1) / 3 : RAST;
  let est = planCenz.length ? Math.max(...planCenz) * korak : kvantil(cenz, 0.5);
  if (!tacni.length) est = Math.max(PODRAZUMEVANI_KAP, est);
  else est = Math.max(est, tacni[tacni.length - 1]);
  return { est: Math.round(est), izvor: tacni.length ? 'mereno' : planCenz.length ? 'proba' : 'slobodno' };
}
function ucestalost(S, api, danas, sad) {
  const dani = (S.dani || []).filter((x) => x.n > 0 && x.d < danas);
  if (!dani.length) return { akt: 1, sim: 0, dana: 0 };
  const od = api.localDay(sad - PROZOR_KAL * DAY);
  const prvi = dani[0].d;
  const pocetak = prvi > od ? prvi : od;
  const raspon = Math.max(1, Math.round((new Date(danas + 'T12:00:00') - new Date(pocetak + 'T12:00:00')) / DAY));
  const akt = dani.filter((x) => x.d >= pocetak).length;
  const posl = dani.slice(-PROZOR_AKT).map((x) => x.d);
  const simDani = new Set((S.sims || []).map((s) => api.localDay(s.d)));
  return { akt: Math.min(1, (akt + 1) / (raspon + 1)), sim: posl.filter((d) => simDani.has(d)).length / posl.length, dana: dani.length };
}

// ---------- projekcija: očekivani tokovi do jutra ispita ----------
// Kohorta = pitanja u istoj VIDLJIVOJ situaciji (tip, niz, rok, poslednji put) i istom čvoru težine.
// Tip: Q = u redu posle greške (niz sk), C = tačno iz prve čeka potvrdu, K = izašlo iz reda.
// l = logit verovatnoće tačnog u trenutku poslednjeg odgovora; b = osnova ka kojoj zaborav vuče.
const EXP = new Float64Array(400); for (let i = 0; i < EXP.length; i++) EXP[i] = Math.exp(-i / T_ZAB);
const ret = (dt) => (dt <= 0 ? 1 : dt < EXP.length ? EXP[dt] : 0);
const lU = (c, t) => c.b + (c.l - c.b) * ret(t - c.last);          // logit danas (dan t)
export function pocetno(S, api, K, st, sad, d0) {
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
const vidljivo = (c) => c.typ + c.sk + '|' + c.due + '|' + c.last;
function dodaj(m, c) {
  if (c.n < 1e-9) return;
  const k = vidljivo(c) + '|' + c.g;
  const x = m.get(k);
  if (!x) { m.set(k, { ...c }); return; }
  const n = x.n + c.n;
  x.l = (x.l * x.n + c.l * c.n) / n; x.b = (x.b * x.n + c.b * c.n) / n; x.n = n; x.W += c.W; x.H += c.H;
}
function kopija(s0) { const koh = new Map(); for (const [k, c] of s0.koh) koh.set(k, { ...c }); return { koh, un: s0.un.map((u) => ({ ...u })), nulaNevid: s0.nulaNevid }; }
function dobitL(l, st) { const p = sg(l), pc = sg(l + st.gC), pw = Math.min(sg(l + st.gW), Math.max(p, st.pErr)); return p * (pc - p) + (1 - p) * (pw - p); }

// dan po dan: [0] danas (ostatak današnjeg zahteva), zatim tvoj prosečan dan
export function projektuj(s0, st, o) {
  const { koh, un } = kopija(s0);
  let nulaNevid = s0.nulaNevid, novih = 0, pon = 0;
  const lErr = lg(st.pErr);
  const radi = o.capDanas > 0 || o.capDan > 0 || o.simDanas > 0 || o.simDan > 0;
  for (let t = 0; radi && t < o.D; t++) {
    let cap = t === 0 ? o.capDanas : o.capDan;
    const simH = t === 0 ? o.simDanas : o.simDan;
    const novo = [];
    const odgovor = (c, x) => {   // deo x kohorte c odgovoren danas, po pravilima reda
      const l = lU(c, t), p = sg(l);
      const lc = l + st.gC, lw = l + st.gW;
      const n = c.n * x, W = c.W * x, H = c.H * x, g = c.g, b = c.b;
      if (c.typ === 'Q' && c.sk + 1 < 3) novo.push({ typ: 'Q', sk: c.sk + 1, due: t + (c.sk === 0 ? 1 : 3), last: t, g, b, n: n * p, W: W * p, H: H * p, l: lc });
      else novo.push({ typ: 'K', sk: 0, due: 0, last: t, g, b, n: n * p, W: W * p, H: H * p, l: lc });
      novo.push({ typ: 'Q', sk: 0, due: t + 1, last: t, g, b, n: n * (1 - p), W: W * (1 - p), H: H * (1 - p), l: lw });
    };
    // prvi susret: današnje neviđeno se skuplja u jedan zbir i deli po čvorovima jednom dnevno
    const nov = { m: 0, W: 0, H: 0 };
    const prviPut = (u, m) => { nov.m += m; nov.W += u.w * m; nov.H += u.h * m; };
    // 1. simulacija = vežba: tačan odgovor ne pomera raspored (ostaje u istoj kohorti, osvežen),
    //    pogrešan vraća pitanje u red za sutra
    if (simH > 0) {
      for (const c of koh.values()) {
        const x = Math.min(1, (c.H / c.n) * simH); if (x <= 0) continue;
        const l = lU(c, t), p = sg(l);
        const lw = l + st.gW, f = x * (1 - p);
        novo.push({ typ: 'Q', sk: 0, due: t + 1, last: t, g: c.g, b: c.b, n: c.n * f, W: c.W * f, H: c.H * f, l: lw });
        // tačan deo: osveženo znanje, preračunato nazad na „poslednji put" kohorte (isti zaborav)
        const r0 = ret(t - c.last), lEkv = r0 > 1e-6 ? c.b + (l + st.gC - c.b) / r0 : c.l;
        const ost = 1 - x, tac = x * p;
        c.l = (c.l * ost + lEkv * tac) / (ost + tac);
        c.n *= 1 - f; c.W *= 1 - f; c.H *= 1 - f;
      }
      for (const u of un) { if (u.s <= 0) continue; const m = u.s * Math.min(1, u.h * simH); u.s -= m; novih += m; prviPut(u, m); }
    }
    // 2. plan: najveći očekivani dobitak po odgovoru, dok ima kapaciteta. Bira se po VIDLJIVOM
    //    stanju (red, rok, istorija): koji je čvor pitanje, aplikacija ne zna — ne sme ni projekcija.
    const grupe = new Map();
    for (const c of koh.values()) {
      if (c.n < 1e-9) continue;
      if (c.typ === 'K' ? t - c.last <= OSVEZI : c.due > t) continue;
      const k = vidljivo(c); let gr = grupe.get(k);
      if (!gr) grupe.set(k, gr = { cs: [], n: 0, v: 0 });
      gr.cs.push(c); gr.n += c.n; gr.v += c.W * dobitL(lU(c, t), st);
    }
    const kand = [...grupe.values()].map((gr) => ({ cs: gr.cs, n: gr.n, v: gr.v / gr.n })).sort((a, b) => b.v - a.v);
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
    // pitanja kojih nema na ispitu dolaze na red tek kad sve ostalo ponestane
    if (cap > 0 && nulaNevid > 0) nulaNevid = Math.max(0, nulaNevid - cap);
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
  let nev = 0;
  for (const u of un) { E += u.w * u.s * st.mu; nev += u.s; }
  return { E, nevidjeno: nev, nulaNevid, novih, pon, kohorti: koh.size };
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

const pr = (p) => Math.round(p * 100) + '%';
// srpski oblik uz broj: 1 pitanje, 2–4 pitanja, 5+ pitanja (11–14 kao 5+)
const br = (n, jd, pk, mn) => { const d = n % 10, s = n % 100; return n + ' ' + (d === 1 && s !== 11 ? jd : d >= 2 && d <= 4 && (s < 12 || s > 14) ? pk : mn); };

export function planDanas(api, ctx) {
  const S = api.S, Q = ctx.Q || api.Q, SIM_SLOTS = ctx.SIM_SLOTS || api.SIM_SLOTS;
  const sad = ctx.sad, danas = api.localDay(sad);
  const dIsp = api.danaDoIspita();
  if (dIsp == null || dIsp < 0) return { ids: [], ocena: 'nema', tekst: dIsp == null ? 'Unesi datum ispita da bi plan znao koliko vremena imaš.' : 'Datum ispita je prošao — unesi novi ako polažeš ponovo.' };
  // dan ispita: ostaje još jedno kratko ponavljanje pre polaganja, računa se kao poslednji dan
  const D = Math.max(1, dIsp);
  const K = sablon(Q, SIM_SLOTS);
  const prag = Math.ceil(0.85 * K.ukupno);
  const d0 = new Date(sad); d0.setHours(0, 0, 0, 0);
  const t0 = d0.getTime();
  const ispit = new Date(S.examDate + 'T09:00:00').getTime();

  // procena (ista kao u aplikaciji) za jutro ispita ako se od sada ništa ne radi + parametri učenja
  let dbg = null;
  const pro = proceni(S, { Q, byId: ctx.byId || api.byId, SIM_SLOTS, prag: (t) => Math.ceil(0.85 * t), sad: ispit, DAY, _dbg: (d) => { dbg = d; } });
  const st = stope(S, Q, pro && pro.sansa != null ? dbg : null);

  // tempo
  const kap = kapacitet(S, api, danas, K.nSim);
  const uc = ucestalost(S, api, danas, sad);
  const dan = S.day && S.day.d === danas ? S.day : { n: 0 };
  const simDanas = (S.sims || []).some((s) => api.localDay(s.d) === danas);
  const radiSim = uc.sim >= 0.5;
  const rezerva = radiSim && !simDanas ? K.nSim : 0;
  const trazi = Math.max(0, Math.round(kap.est - (dan.n || 0) - rezerva));

  // današnja lista: vrednost = težina na ispitu × dobitak od jednog odgovora
  const { ready } = api.queueSplit();
  const osv = api.zaOsvezavanje();
  const u = new Set(), kand = [];
  const stavi = (id, vrsta) => {
    if (u.has(id)) return; u.add(id);
    const r = S.q[id], w = K.w.get(id) || 0;
    const g = vrsta === 'n' ? st.gNovo : dobitStavke(r, st, (sad - (r.last || sad)) / DAY);
    kand.push({ id, vrsta, v: w * g, red: kand.length });
  };
  for (const id of ready) stavi(id, 'p');
  for (const id of osv) stavi(id, 'p');
  for (const q of Q) if (!S.q[q.id] || !S.q[q.id].a) stavi(q.id, 'n');
  kand.sort((a, b) => b.v - a.v || a.red - b.red);
  const izbor = kand.slice(0, trazi);
  const ids = izbor.map((k) => k.id);
  const nPon = izbor.filter((k) => k.vrsta === 'p').length, nNov = ids.length - nPon;

  // zapamti koliko je plan tražio (prvi poziv u danu) — sutra se iz toga vidi da li je stignuto
  if (!S.plan) S.plan = {};
  const pg = S.plan.prognoza || (S.plan.prognoza = { tr: {} });
  if (!pg.tr[danas]) {
    pg.tr[danas] = { n0: dan.n || 0, k: ids.length, t: sad };
    const kl = Object.keys(pg.tr).sort(); while (kl.length > PROZOR_KAL) delete pg.tr[kl.shift()];
  }

  // projekcija
  const s0 = pocetno(S, api, K, st, sad, t0);
  const stop = projektuj(s0, st, { D, capDanas: 0, capDan: 0, simDanas: 0, simDan: 0 });
  // dok gornja granica nije izmerena, plan sam podiže zahtev čim ga stigneš — projekcija računa sa
  // sledećim korakom, ne sa današnjim (koji je samo donja granica)
  const kapNapred = kap.izvor === 'mereno' ? kap.est : kap.est * RAST;
  const scen = (f, dodatnoDana = 0, simF = 1, akt = uc.akt) => projektuj(s0, st, {
    D: D + dodatnoDana, capDanas: trazi * Math.min(1, f), simDanas: rezerva ? 1 : 0,
    capDan: Math.max(0, kapNapred * f - K.nSim * uc.sim * simF) * akt, simDan: uc.sim * akt * simF,
  });
  const baza = scen(1);
  const osnova = pro && pro.exp != null ? pro.exp - stop.E : 0;          // sidro: kalibrisana procena aplikacije
  const slotovi = pro && pro.slotovi ? pro.slotovi.map((s) => ({ pts: s.pts, p: Math.min(0.999, Math.max(0.001, s.p)) })) : K.pools.map((s) => ({ pts: s.pts, p: 0.85 }));
  // neizvesnost samog sidra: greška modela procene (2 poena) + neizvesnost neviđenog dela koju procena
  // sama računa (stopa prvog pogleda iz malo odgovora → široko; kad je skoro sve viđeno → usko)
  const sd0 = Math.sqrt(NESIG_MODEL * NESIG_MODEL + (dbg && pro && pro.sansa != null && Number.isFinite(dbg.varNevidjeno) ? dbg.varNevidjeno : 0));
  const ocene = (r) => { const E = Math.min(K.ukupno, Math.max(0, r.E + osnova)); const sd = Math.hypot(sd0, NESIG_TEMPO * Math.max(0, r.E - stop.E)); return { E, P: sansa(slotovi, E, sd, prag) }; };
  const b = ocene(baza), lo = ocene(scen(0.8)), hi = ocene(scen(1.2));
  // bez dovoljno dokaza (procena aplikacije vraća null: < 30 odgovora i bez simulacije) nema presude —
  // broj bi bio samo odjek pretpostavki, a to je nerealno i ohrabrivanje i obeshrabrivanje
  const imaDokaza = !!(pro && pro.sansa != null);
  const ocena = !imaDokaza ? 'nema' : b.P >= PRAG_OK ? 'ok' : b.P >= PRAG_PROBLEM ? 'upozorenje' : 'problem';

  // tekst (latinica)
  const E = Math.round(b.E);
  const red = [];
  if (dIsp === 0) red.push('Ispit je danas: plan nudi kratko ponavljanje onoga što najviše vredi.');
  const glava = `procena za dan ispita je ≈ ${E} od ${K.ukupno} poena (prag ${prag}), šansa za prolaz oko ${pr(b.P)}`;
  red.push(ocena === 'nema' ? 'Procenu šanse dajem kad uradiš bar tridesetak pitanja iz više oblasti ili jednu simulaciju — pre toga bi broj bio nagađanje.' : ocena === 'ok' ? `✅ Stižeš: ovim tempom ${glava}.` : ocena === 'upozorenje' ? `⚠ Na ivici: ovim tempom ${glava}.` : `⛔ Ovim tempom ne stižeš do praga: ${glava}.`);
  red.push(ids.length
    ? `Danas: ${br(ids.length, 'pitanje', 'pitanja', 'pitanja')} (${br(nPon, 'ponavljanje', 'ponavljanja', 'ponavljanja')}, ${br(nNov, 'novo', 'nova', 'novih')}), poređana po tome koliko vrede na ispitu — ako stigneš više, samo nastavi redom.` + (rezerva ? ` Uz to simulacija, kao i obično.` : simDanas ? ' Simulacija za danas je urađena.' : '')
    : 'Danas si već uradio koliko obično stižeš — sve preko toga je dodatak.');
  const simTxt = radiSim ? ' zajedno sa simulacijom' : '';
  const aktTxt = uc.akt < 0.85 ? `; radiš otprilike ${Math.round(uc.akt * 7)} od 7 dana` : '';
  red.push(kap.izvor === 'nema'
    ? `Tvoj tempo još ne znam, pa plan polazi od ${PODRAZUMEVANI_KAP} pitanja dnevno; posle par dana ravna se po tebi.`
    : kap.izvor === 'slobodno'
      ? `Plan polazi od tvojih poslednjih dana: ~${kap.est} pitanja dnevno${simTxt}${aktTxt}; posle par dana sa planom ravna se po tome koliko stvarno stigneš.`
    : kap.izvor === 'proba'
      ? `Sve što je plan tražio si stigao, pa sada traži ~${kap.est} dnevno${simTxt}${aktTxt}. Pravi tempo se tek meri — ako radiš više, procena raste.`
      : `Plan računa sa ~${kap.est} pitanja dnevno${simTxt} — toliko stigneš u 4 od 5 dana${aktTxt}.`);
  const nev = Math.round(baza.nevidjeno), nevUk = nev + Math.round(baza.nulaNevid), novihDo = Math.round(baza.novih), ponDo = Math.round(baza.pon);
  const dTxt = D === 1 ? 'do ispita (1 dan)' : `do ispita (${D} dana)`;
  if (dIsp > 0) red.push(nevUk === 0
    ? `Ovim tempom ${dTxt} vidiš sva pitanja i uradiš ~${br(ponDo, 'ponavljanje', 'ponavljanja', 'ponavljanja')}.`
    : `Ovim tempom ${dTxt}: još ~${br(novihDo, 'novo pitanje', 'nova pitanja', 'novih pitanja')}${ponDo ? ` i ~${br(ponDo, 'ponavljanje', 'ponavljanja', 'ponavljanja')}` : ''}; ostaje ~${br(nevUk, 'neviđeno', 'neviđena', 'neviđenih')} — ${nev <= nevUk / 2 ? 'uglavnom onih kojih nema u šablonu ispita' : 'ona koja najređe dolaze na ispit'}.`);
  if (dIsp > 0 && ocena !== 'nema' && Math.abs(hi.P - lo.P) >= 0.05) red.push(`Ako radiš manje (~${Math.round(kap.est * 0.8)} dnevno) oko ${pr(lo.P)}, ako više (~${Math.round(kap.est * 1.2)}) oko ${pr(hi.P)}.`);
  const proj = { D, kapacitet: kap.est, izvor: kap.izvor, aktivnost: uc.akt, simulacija: uc.sim, poeni: b.E, sansa: b.P, sansaManje: lo.P, sansaVise: hi.P, nevidjeno: nevUk, ponavljanja: baza.pon, novih: baza.novih, trazi, poeniSad: pro ? pro.exp : null, poeniStop: stop.E + osnova, nesigurnost: sd0 };
  if (ocena === 'upozorenje' || ocena === 'problem') {
    // šta bi stvarno pomoglo: svaka poluga je ista projekcija sa jednom promenom
    const poluge = [{ txt: `~20% više pitanja dnevno (~${Math.round(kap.est * 1.2)})`, r: hi }];
    if (uc.akt < 0.85) poluge.push({ txt: 'rad svaki dan umesto preskakanja', r: ocene(scen(1, 0, 1, 1)) });
    if (radiSim) poluge.push({ txt: 'simulacija svaki drugi dan umesto svakog (više vremena za ponavljanja)', r: ocene(scen(1, 0, 0.5)) });
    const kor = poluge.filter((x) => x.r.E - b.E >= 0.7).sort((x, y) => y.r.E - x.r.E).slice(0, 2);
    if (kor.length) red.push('Najviše bi pomoglo: ' + kor.map((x) => `${x.txt} → ≈ ${Math.round(x.r.E)} poena, šansa oko ${pr(x.r.P)}`).join('; ') + '.');
    if (Math.max(hi.P, ...kor.map((x) => x.r.P)) < PRAG_PROBLEM) {
      const nedelja = ocene(scen(1, 7));
      red.push(`Realno: ${kor.length ? 'ni to' : 'ni ~20% više pitanja dnevno'} ne dovodi sigurno do praga. Sa nedeljom više do ispita, istim tempom: ≈ ${Math.round(nedelja.E)} poena, šansa oko ${pr(nedelja.P)}.`);
      proj.sansaNedeljaVise = nedelja.P;
    }
  }
  return { ids, ocena, tekst: red.join(String.fromCharCode(10)), projekcija: proj };
}
