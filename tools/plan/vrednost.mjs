// PLAN „VREDNOST" — dnevni plan po očekivanim poenima na ispitu.
//
// Tri koraka, svaki iz podataka ovog učenika:
//  1. KAPACITET: koliko pitanja dnevno stvarno stiže (S.dani + zapis šta je plan tražio tog dana).
//     Dan kad je stao pre kraja plana = izmeren kapacitet; dan kad je plan ceo urađen = samo donja
//     granica, pa sutra plan traži malo više. Planirana simulacija se oduzima od kapaciteta.
//  2. REDOSLED: svako kandidat-pitanje (neviđeno, na redu za ponavljanje, za osvežavanje) dobija
//     vrednost = očekivani poeni na ispitu koje donosi ako se uradi DANAS:
//       pojava na ispitu (Σ 1/veličina bazena po slotovima) × poeni × (p_ispit(uradjeno) − p_ispit(nije)).
//     Popunjava se kapacitet od najvrednijeg naniže.
//  3. PRESUDA: projekcija na dan ispita — sadašnje stanje (procena.js), minus zaborav, plus dobit od
//     pitanja koja stižeš do ispita (istim tempom, istom redovnošću), pa šansa za prolaz sa neizvesnošću.
//
// Sve konstante su ispod, svaka sa razlogom. Plan NE zna stvarni kapacitet — samo istoriju.
import { proceni } from '../procena/isporuka.mjs';

// ---- konstante ----
const T_ZAB = 30;        // dana: središte zaborava iz procena.js (ln T ~ N(ln 30, 0,7²)) — ista pretpostavka kao procena
const K_PIT = 4;         // snaga opšte stope ponavljanja u proceni jednog pitanja: posle ~4 sopstvena odgovora preteže sopstvena istorija
const K_BAZA = 2;        // koliko „vredi" opšta stopa prvog pogleda naspram JEDNOG sopstvenog prvog odgovora pitanja
const F_PRIOR = 0.75, F_SNAGA = 10;     // prvi pogled bez podataka: ¾ tačno (tipično za prvi prolaz kroz bazu), vredi 10 odgovora
const R_PRIOR = 0.88, R_SNAGA = 10;     // ponavljanje bez podataka: ~9 od 10 tačno, vredi 10 odgovora
const KAP_NOVI = 50;     // početna procena vežbanja za korisnika bez istorije (~40 min); simulacija se dodaje na to ako je radi
const RAST_BRZ = 1.15;   // plan ceo urađen, a granica još nikad viđena: procena je samo donja granica → korak 15% (unutar obične dnevne razlike ±15–20%, pa ni promašaj naviše nije skok)
const Q_CILJ = 0.25;     // plan se ne završi u ~1 od 4 dana: dovoljno blizu granice da se ne gubi vreme, a obično se završi
const ETA = 0.2;         // korak praćenja: ×0,85 posle nezavršenog dana, ×1,05 posle završenog (brzina prilagođavanja ~5 dana)
const MIN_DAN = 10;      // najmanji dnevni plan (~10 minuta): manje od toga nije plan, a i spor učenik to stigne
const ISTORIJA = 14;     // dana istorije za kapacitet, redovnost i naviku simulacija (dve nedelje: prati promenu navika)
const SIM_N = 41;        // pitanja na ispitu (šablon SIM_SLOTS)
const MAX_PON = 3;       // najviše korisnih ponavljanja istog pitanja do ispita (red: izlazi posle 3 tačna)
const NESIG_PROJ = 0.3;  // nesigurnost pomaka projekcije: ±30% (tempo i brzina učenja su procene iz istorije)
const OK_PRAG = 2 / 3;   // ✅: ovim tempom prolaz je bar 2 od 3
const LOS_PRAG = 1 / 3;  // ⛔: ovim tempom prolaz je najviše 1 od 3 (simetrično)
const HISTEREZA = 0.05;  // presuda se menja tek kad šansa pređe prag za 5 p.p. — procena dnevno šeta ±5 p.p. od šuma, a presuda koja skače tamo-amo zbunjuje
const MANJE = 2 / 3, VISE = 1.5; // raspon tempa za „šta ako": trećina manje / pola više (tekst tako i kaže — brojevi moraju da se zatvore)

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
function Phi(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
function PhiInv(p) { let lo = -8, hi = 8; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }

let _pools = null, _pojava = null, _Qref = null;
function bazeni(Q, SIM_SLOTS) {
  if (_Qref === Q && _pools) return;
  _Qref = Q;
  _pools = SIM_SLOTS.map((s) => ({ pts: s.p, ids: Q.filter((q) => s.s.includes(q.sub) && q.pts === s.p).map((q) => q.id) })).filter((b) => b.ids.length);
  _pojava = new Map();
  for (const b of _pools) for (const id of b.ids) _pojava.set(id, (_pojava.get(id) || 0) + 1 / b.ids.length);
}

// prvi odgovor iz (a, w, streak) — isto pravilo rekonstrukcije kao procena.js
function prviTacan(r) {
  const a = r.a, w = Math.min(r.w, a), st = Math.min(r.streak || 0, a - w);
  if (!w) return 1;
  if (a - w === st) return 0;       // sve greške pa niz tačnih
  if (w === 1) return 1;            // jedna greška posle tačnih
  return 0.5;
}

function statistika(S, Q) {
  let fN = 0, fC = 0, rN = 0, rC = 0;
  for (const q of Q) {
    const r = S.q[q.id]; if (!r || !r.a) continue;
    const fc = prviTacan(r); fN++; fC += fc;
    rN += r.a - 1; rC += (r.a - Math.min(r.w, r.a)) - fc;
  }
  const f = (fC + F_PRIOR * F_SNAGA) / (fN + F_SNAGA);
  const pr = clamp((rC + R_PRIOR * R_SNAGA) / (rN + R_SNAGA), 0.5, 0.99);
  return { f, pr, fN };
}

// koliko pitanje zna SADA i na čemu „leži" kad zaboravi (sopstveni prvi pogled)
function stanjePitanja(r, st, sad, DAY) {
  if (!r || !r.a) return { p: st.f, b: st.f, vidjeno: false };
  const fc = prviTacan(r);
  const b = (fc + K_BAZA * st.f) / (1 + K_BAZA);
  const pf = (r.a - Math.min(r.w, r.a) + K_PIT * st.pr) / (r.a + K_PIT);
  const dt = r.last ? Math.max(0, (sad - r.last) / DAY) : 0;
  return { p: b + (pf - b) * Math.exp(-dt / T_ZAB), b, vidjeno: true };
}

// p na dan ispita posle k ponavljanja od danas do ispita (k=0: bez ponavljanja, samo zaborav).
// Dobit od jednog odgovora je iz modela učenja KOJI JE procena.js FITOVALA NA OVOM UČENIKU (PFA):
// logit raste za gC posle tačnog, za gW posle pogrešnog (pročitano objašnjenje); očekivanje po ishodu.
const sgm = (x) => 1 / (1 + Math.exp(-x));
const lgt = (p) => Math.log(p / (1 - p));
function pPosle(p, k, m) {
  for (let i = 0; i < k; i++) { const l = lgt(clamp(p, 1e-3, 1 - 1e-3)); p = p * sgm(l + m.gC) + (1 - p) * sgm(l + m.gW); }
  return p;
}
function pIspit(s, k, m, D) {
  if (!k) return s.b + (s.p - s.b) * Math.exp(-D / T_ZAB);
  return s.b + (pPosle(s.p, k, m) - s.b) * Math.exp(-D / ((k + 1) * T_ZAB));   // poslednje ponavljanje ~D·k/(k+1) od danas
}

// ---- 1. kapacitet ----
// Stanje je JEDAN broj: A = koliko pitanja ukupno (sa simulacijom) plan računa za dan. Čuva se uz zapis
// dana (S.plan.vr[dan] = {n0: urađeno pre plana, ask: traženo, A, g: granica viđena, o: presuda}), pa se sutra ažurira iz ishoda:
//  - plan ceo urađen (n ≥ n0 + ask): A raste — brzo (×RAST_BRZ) dok granica nikad nije viđena, posle
//    polako (×(1 + ETA·Q_CILJ));
//  - stao pre kraja (n < n0 + ask): A pada ×(1 − ETA·(1 − Q_CILJ)), a najniže na n tog dana (izmeren kapacitet).
// To je klasično praćenje kvantila: A se ustali tamo gde učenik NE završi plan u Q_CILJ dana — plan je
// dan koji se obično završi, ne prosečan dan (koji se ne završi u pola slučajeva).
function kapacitet(S, danas, dayMs, localDay, bazaNovi) {
  const vr = (S.plan && S.plan.vr) || {};
  const dani = (Array.isArray(S.dani) ? S.dani : []).filter((h) => h && h.n > 0 && h.d < danas);
  const granica = localDay(dayMs - ISTORIJA * 864e5);
  const skor = dani.filter((h) => h.d >= granica);
  // poslednji dan sa zapisom plana i sa arhivom (preskočen dan nema arhivu → ne menja ništa)
  let A = null, vidjenaGranica = false, merenih = 0;
  const poD = new Map(dani.map((h) => [h.d, h]));
  const zapisi = Object.keys(vr).filter((d) => d < danas).sort();
  for (let i = zapisi.length - 1; i >= 0; i--) {
    const rec = vr[zapisi[i]];
    if (rec.A == null) continue;
    const h = poD.get(zapisi[i]);
    if (!h) { A = rec.A; vidjenaGranica = !!rec.g; break; }        // zapis bez rada tog dana: A ostaje
    // stao pre kraja: korak naniže, a ako je stao DALEKO ispod plana, odmah na izmereno (h.n je taj dan tačno kapacitet)
    if (h.n < rec.n0 + rec.ask) { A = Math.min(rec.A * (1 - ETA * (1 - Q_CILJ)), h.n); vidjenaGranica = true; }
    else A = Math.max(rec.A, h.n) * (rec.g ? 1 + ETA * Q_CILJ : RAST_BRZ);
    if (rec.g) vidjenaGranica = true;
    break;
  }
  const bezIstorije = A == null && !skor.length;
  let izPriora = false;
  if (A == null) {
    // prvi dan plana: medijana dosadašnjih dana (dan bez plana = koliko je sam hteo), ne manje od početne
    const ns = skor.map((h) => h.n).sort((a, b) => a - b);
    const med = ns.length ? ns[Math.floor(ns.length / 2)] : 0;
    izPriora = med < bazaNovi;
    A = Math.max(bazaNovi, med);
  }
  A = Math.max(A, MIN_DAN);   // pod: ni posle loše nedelje plan ne pada ispod MIN_DAN
  for (const h of skor) if (vr[h.d] && h.n < vr[h.d].n0 + vr[h.d].ask) merenih++;
  // redovnost: udeo aktivnih dana u prozoru, sa priorom 0,85 (6 od 7 dana) težine 3 dana
  // prozor počinje od prvog dana plana (dani pre plana su drugačije navike), a bez plana od prvog aktivnog dana
  const prviPlan = zapisi.find((d) => d >= granica);
  const pocetak = prviPlan || (skor.length ? skor[0].d : danas);
  const aktivnih = skor.filter((h) => h.d >= pocetak).length;
  const prozor = Math.min(ISTORIJA, Math.max(0, Math.round((Date.parse(danas) - Date.parse(pocetak)) / 864e5)));
  const redovnost = clamp((aktivnih + 0.85 * 3) / (prozor + 3), 0.2, 1);
  return { E: Math.round(A), A, izPriora, bezIstorije, vidjenaGranica, merenih, redovnost, aktivnih: skor.length, prozor };
}

function navikaSim(S, sad, DAY, aktivnih, localDay) {
  const od = sad - ISTORIJA * DAY;
  const dani = new Set((S.sims || []).filter((s) => s.d >= od && s.d <= sad && (s.odg == null || s.odg >= 30)).map((s) => localDay(s.d)));
  const danasUradjena = dani.has(localDay(sad));
  const ranije = [...dani].filter((d) => d !== localDay(sad)).length;
  return { stopa: aktivnih ? clamp(ranije / aktivnih, 0, 1) : 0, danasUradjena };
}

// ---- 3. projekcija ----
function projekcija(stanja, M, D, budzet) {
  // dobit po (pitanje, k): razlika očekivanih poena; uzima se najboljih `budzet` (konkavno po k)
  const K = Math.max(1, Math.min(MAX_PON, Math.floor(D / 2) || 1));
  const dob = [];
  for (const s of stanja) {
    const p0 = pIspit(s, 0, M, D); s.pe = p0;
    if (!s.w) continue;
    let pret = p0, lim = Infinity;
    for (let k = 1; k <= K; k++) {
      const pk = pIspit(s, k, M, D); const dp = Math.min(lim, Math.max(0, pk - pret));
      lim = dp; pret = pk;
      if (dp > 0) dob.push({ s, g: dp * s.w, dp });
    }
  }
  dob.sort((a, b) => b.g - a.g);
  const n = Math.min(dob.length, Math.max(0, Math.round(budzet)));
  const dp = new Map();
  for (let i = 0; i < n; i++) dp.set(dob[i].s, (dp.get(dob[i].s) || 0) + dob[i].dp);
  return dp;
}

function sansaIzSlotova(slotP, prag, sigma) {
  let E = 0, V = 0;
  for (const s of slotP) { E += s.pts * s.p; V += s.pts * s.pts * s.p * (1 - s.p); }
  return { E, V, P: Phi((E - (prag - 0.5)) / Math.sqrt(V + sigma * sigma)) };
}

// osnova: slotovi iz procena.js (kalibrisano) + njen model učenja; bez dovoljno podataka: sopstvena procena
function osnovaZa(api, S, Q, SIM_SLOTS, sad, DAY, stanja) {
  const prag = Math.ceil(0.85 * _pools.reduce((a, b) => a + b.pts, 0));
  let pc = null, par = null;
  try { pc = proceni(S, { Q, byId: api.byId, SIM_SLOTS, prag: (t) => Math.ceil(0.85 * t), sad, DAY, _dbg: (d) => { par = d && d.par; } }); } catch (e) { pc = null; }
  const ima = !!(pc && pc.sansa != null && pc.slotovi);
  // model učenja: fit iz procena.js; bez fita njeni priori (gC 0,3, gW 1,0)
  const M = ima && par ? { gC: clamp(par.gC, 0, 3), gW: clamp(par.gW, 0, 4) } : { gC: 0.3, gW: 1.0 };
  const poId = new Map(stanja.map((s) => [s.id, s]));
  const slot = ima ? pc.slotovi.map((x) => ({ pts: x.pts, p: x.p }))
    : _pools.map((b) => ({ pts: b.pts, p: b.ids.reduce((a, id) => a + poId.get(id).p, 0) / b.ids.length }));
  const s0 = sansaIzSlotova(slot, prag, 0);
  let sigma0 = 4;   // bez procene: ~4 poena nesigurnosti modela (≈ širina koju procena.js daje sa malo podataka)
  if (ima && pc.sansa > 0.02 && pc.sansa < 0.98) {
    // nesigurnost modela preuzeta iz procene: σ za koji normalna aproksimacija daje ISTU šansu kao procena.js
    const z = PhiInv(pc.sansa), m = s0.E - (prag - 0.5);
    if (Math.abs(z) > 0.05 && Math.sign(z) === Math.sign(m)) sigma0 = clamp(Math.sqrt(Math.max(0, (m / z) ** 2 - s0.V)), 1, 10);
  }
  return { slot, sigma0, poId, M, prag, Esada: s0.E, Psada: ima ? pc.sansa : null, izProcene: ima };
}

function proj(osn, stanja, D, budzet) {
  const dp = projekcija(stanja, osn.M, D, budzet);
  const slotP = _pools.map((b, i) => {
    let d = 0;
    for (const id of b.ids) { const s = osn.poId.get(id); d += (s.pe + (dp.get(s) || 0)) - s.p; }
    return { pts: b.pts, p: clamp(osn.slot[i].p + d / b.ids.length, 0.001, 0.999) };
  });
  const E1 = slotP.reduce((a, s) => a + s.pts * s.p, 0);
  const sigma = Math.sqrt(osn.sigma0 ** 2 + (NESIG_PROJ * (E1 - osn.Esada)) ** 2);
  const r = sansaIzSlotova(slotP, osn.prag, sigma);
  return { P: r.P, E: r.E, sigma, Esada: osn.Esada, Psada: osn.Psada, prag: osn.prag };
}

export function planDanas(api, ctx) {
  const S = api.S; const Q = api.Q; const DAY = (ctx && ctx.DAY) || 864e5;
  const sad = (ctx && ctx.sad) || Date.now();
  const SIM_SLOTS = api.SIM_SLOTS || ctx.SIM_SLOTS;
  bazeni(Q, SIM_SLOTS);
  const danas = api.localDay(sad);
  const D = api.danaDoIspita();
  if (D == null || D < 0) return { ids: [], ocena: 'nema', tekst: D == null ? 'Unesi datum ispita da bih napravio plan.' : 'Datum ispita je prošao — unesi novi datum.' };
  const nDanas = (S.day && S.day.d === danas) ? (S.day.n || 0) : 0;

  // ---- 1. kapacitet ----
  const odDana = api.localDay(sad - ISTORIJA * DAY);
  const aktivnih0 = (Array.isArray(S.dani) ? S.dani : []).filter((h) => h && h.n > 0 && h.d < danas && h.d >= odDana).length;
  const sim = navikaSim(S, sad, DAY, aktivnih0, api.localDay);
  const radiSim = sim.stopa >= 0.5;
  const kap = kapacitet(S, danas, sad, api.localDay, KAP_NOVI + ((sim.danasUradjena || radiSim) ? SIM_N : 0));
  // simulacija se preporučuje svaki dan samo kad ne pojede više od pola dana (tek ostatak donosi najvrednija pitanja)
  const simSvakiDan = kap.A >= 2 * SIM_N;
  const rezerva = (radiSim && simSvakiDan && !sim.danasUradjena && D >= 1) ? SIM_N : 0;   // na dan ispita nema simulacije za vežbu
  const zabelezeno = S.plan && S.plan.vr && S.plan.vr[danas];
  const ask = zabelezeno ? Math.max(0, zabelezeno.ask - Math.max(0, nDanas - zabelezeno.n0)) : Math.max(0, kap.E - nDanas - rezerva);

  // ---- 2. vrednost kandidata ----
  const st = statistika(S, Q);
  const stanja = [];
  const poId = new Map();
  for (const q of Q) {
    const s = stanjePitanja(S.q[q.id], st, sad, DAY);
    s.id = q.id; s.w = (_pojava.get(q.id) || 0) * q.pts;
    stanja.push(s); poId.set(q.id, s);
  }
  const osn = osnovaZa(api, S, Q, SIM_SLOTS, sad, DAY, stanja);
  const M = osn.M;
  const danasVidjeno = (id) => { const r = S.q[id]; return r && r.last && api.localDay(r.last) === danas; };
  const kand = new Set();
  for (const q of Q) if (!S.q[q.id] || !S.q[q.id].a) kand.add(q.id);
  for (const id of api.queueSplit().ready) kand.add(id);
  for (const id of api.zaOsvezavanje()) kand.add(id);
  const vr = [];
  for (const id of kand) {
    if (danasVidjeno(id)) continue;
    const s = poId.get(id); if (!s.w) continue;
    vr.push({ id, v: s.w * (pIspit(s, 1, M, D) - pIspit(s, 0, M, D)), novo: !s.vidjeno });
  }
  vr.sort((a, b) => b.v - a.v);
  const izbor = vr.slice(0, ask);
  const ids = izbor.map((x) => x.id);
  if (!zabelezeno) { S.plan = S.plan || {}; S.plan.vr = S.plan.vr || {}; S.plan.vr[danas] = { n0: nDanas, ask: ids.length, A: kap.A, g: kap.vidjenaGranica ? 1 : 0 }; ocisti(S.plan.vr, danas); }

  // ---- 3. projekcija ----
  const netoDnevno = Math.max(0, kap.E - SIM_N * Math.min(1, sim.stopa));
  const buduci = Math.max(0, D - 1) * kap.redovnost * netoDnevno;
  const pr = proj(osn, stanja, D, ids.length + buduci);
  const prM = proj(osn, stanja, D, ids.length + buduci * MANJE);
  const prV = proj(osn, stanja, D, ids.length + buduci * VISE);
  const P = pr.P;
  const juce = prethodnaOcena(S, danas);
  let ocena = P >= OK_PRAG ? 'ok' : P < LOS_PRAG ? 'problem' : 'upozorenje';
  if (juce === 'ok' && ocena === 'upozorenje' && P >= OK_PRAG - HISTEREZA) ocena = 'ok';
  if (juce === 'problem' && ocena === 'upozorenje' && P < LOS_PRAG + HISTEREZA) ocena = 'problem';
  if (juce === 'upozorenje' && ocena === 'ok' && P < OK_PRAG + HISTEREZA) ocena = 'upozorenje';
  if (juce === 'upozorenje' && ocena === 'problem' && P >= LOS_PRAG - HISTEREZA) ocena = 'upozorenje';
  S.plan.vr[danas].o = ocena;

  const nNovih = izbor.filter((x) => x.novo).length;
  const neodg = Q.filter((q) => !S.q[q.id] || !S.q[q.id].a).length;
  const tekst = napisi({ ocena, ids, nNovih, nDanas, kap, radiSim, simSvakiDan, rezerva, simDanas: sim.danasUradjena, D, pr, prM, prV, neodg, buduci, netoDnevno });
  return { ids, ocena, tekst, projekcija: { sansa: P, poeni: pr.E, sada: pr.Esada, sansaSada: pr.Psada, sansaManje: prM.P, sansaVise: prV.P, kapacitet: kap.E, redovnost: kap.redovnost, budzet: Math.round(ids.length + buduci), f: st.f, pr: st.pr, gC: M.gC, gW: M.gW } };
}

function prethodnaOcena(S, danas) {
  const vr = (S.plan && S.plan.vr) || {};
  const d = Object.keys(vr).filter((x) => x < danas && vr[x].o).sort().pop();
  return d ? vr[d].o : null;
}
function ocisti(vr, danas) { const g = Date.parse(danas) - 30 * 864e5; for (const d of Object.keys(vr)) if (Date.parse(d) < g) delete vr[d]; }

const pct = (x) => Math.round(100 * clamp(x, 0.01, 0.99)) + '%';   // nikad „0%" ni „100%": nije sigurno ni jedno ni drugo
const zaok = (x) => Math.round(x);
const oblik = (n, jedan, dva, pet) => { const d = n % 10, s = n % 100; return n + ' ' + (d === 1 && s !== 11 ? jedan : d >= 2 && d <= 4 && (s < 12 || s > 14) ? dva : pet); };
const danaTxt = (d) => oblik(d, 'dan', 'dana', 'dana');
const pitanja = (n) => oblik(n, 'pitanje', 'pitanja', 'pitanja');
function napisi(o) {
  const { ocena, ids, nNovih, nDanas, kap, radiSim, simSvakiDan, rezerva, simDanas, D, pr, prM, prV, neodg, buduci } = o;
  const delovi = [];
  if (D === 0) delovi.push(`Ispit je danas. ${ocena === 'ok' ? 'Spreman si koliko se iz vežbanja vidi.' : ocena === 'problem' ? 'Po vežbanju, prolaz nije verovatan — ali ispit odlučuje, ne procena.' : 'Po vežbanju je tesno.'}`);
  else delovi.push(ocena === 'ok' ? `✅ Stižeš: ovim tempom prolaz je verovatan. Do ispita: ${danaTxt(D)}.`
    : ocena === 'problem' ? `⛔ Ovim tempom verovatno ne stižeš. Do ispita: ${danaTxt(D)}.`
    : `⚠ Tesno: ovim tempom prolaz je neizvestan. Do ispita: ${danaTxt(D)}.`);
  // šta danas — brojevi se zatvaraju: urađeno + još + simulacija = ukupno za danas
  const sastav = `${oblik(nNovih, 'novo', 'nova', 'novih')}, ${oblik(ids.length - nNovih, 'ponavljanje', 'ponavljanja', 'ponavljanja')}`;
  const ukupno = nDanas + ids.length + rezerva;
  if (D === 0) {
    if (ids.length) delovi.push(`Ako imaš vremena pre ispita: ${pitanja(ids.length)} koja najverovatnije grešiš, a često dolaze.`);
  } else if (!ids.length) {
    delovi.push(`Za danas si uradio koliko obično stižeš (${nDanas}) — sve preko toga je bonus.`);
  } else {
    let t = nDanas
      ? `Danas ukupno ${pitanja(ukupno)}: ${nDanas} već urađeno${simDanas ? ' (sa simulacijom)' : ''}, još ${ids.length} (${sastav}), najvrednija prva`
      : `Danas: ${pitanja(ids.length)} (${sastav}), najvrednija prva`;
    if (rezerva) t += `, pa simulacija ispita (${SIM_N}) — ukupno ${ukupno}`;
    delovi.push(t + '.');
    delovi.push(kap.izPriora
      ? 'Još ne znam koliko stižeš, pa je ovo početna mera; ako završiš, sutra dajem više.'
      : `Toliko po poslednjim danima obično stigneš${kap.vidjenaGranica ? '' : '; ako završiš, sutra dajem više'}.`);
  }
  // stanje i projekcija
  delovi.push(`Sada: oko ${zaok(pr.Esada)} od 98 poena u proseku, za prolaz treba ${pr.prag}${pr.Psada != null ? ` (šansa da bi danas prošao: oko ${pct(pr.Psada)})` : ''}.`);
  if (D > 0) {
    const raspon = buduci > 0 ? ` Sa trećinom manje rada: ${pct(prM.P)}; sa pola više: ${pct(prV.P)}.` : '';
    delovi.push(`Ako ovako nastaviš do ispita: oko ${zaok(pr.E)} poena, šansa za prolaz oko ${pct(pr.P)}.${raspon}`);
    const stize = Math.round(ids.length + buduci);
    if (neodg > stize) delovi.push(`Do ispita stižeš još oko ${pitanja(stize)} (sa ponavljanjima), a neviđenih je ${neodg} — sva ne stižeš, pa plan bira ona koja češće dolaze na ispit i koja najverovatnije grešiš.`);
    if (ocena === 'problem') delovi.push('Najviše pomaže više pitanja dnevno i bez preskočenih dana; ako to ne ide, razmisli o kasnijem datumu ispita.');
    else if (ocena === 'upozorenje') delovi.push('Razliku pravi redovnost: svaki preskočen dan se oseti.');
    if (!radiSim && !simDanas && simSvakiDan) delovi.push('Preporuka: simulacija ispita svaki dan ili bar svaki drugi — najbolja je provera spremnosti.');
    else if (!simSvakiDan && !simDanas) delovi.push(`Simulacija uzima 41 pitanje od tvojih ~${kap.E} dnevno, pa je dovoljna jednom-dvaput nedeljno, kao provera.`);
  }
  return delovi.join(' ');
}
