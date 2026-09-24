// PLAN „BUDŽET" — jednostavan, proverljiv rukom.
//
// 1. BUDŽET = koliko pitanja danas UKUPNO, sa simulacijom.
//    a) Plan još nema istoriju: medijana poslednjih 5 aktivnih dana, ali najmanje 80.
//    b) Dok nijedan dan plana nije ostao nedovršen, granica se ne vidi: juče traženo + 25%.
//    c) Čim se granica jednom vidi: uzmi poslednjih (do) 5 dana plana, izbaci jedan najslabiji (kad
//       ih ima bar 4) i uzmi najmanji od preostalih — broj koji si stigao u 4 od 5 dana. Dan kad si
//       završio CEO plan broji se kao traženo + 10% (možeš bar toliko, verovatno i više).
//    Ako redovno radiš simulaciju, a danas još nisi, 41 pitanje budžeta ostaje za nju.
//    Plan nikad ne traži više od budžeta.
// 2. PODELA: prvo pitanja na redu za ponavljanje (greške pa potvrde, pa osvežavanje davno naučenog),
//    ali najviše onoliki deo budžeta koliko ponavljanja nova pitanja stvaraju (iz tvoje tačnosti);
//    ostatak su nova pitanja. Kad novih nema, sve ide na ponavljanje. Ako do ispita ne stižeš sva
//    nova, nova idu po tome koliko poena nose na ispitu (šablon simulacije), ne redom baze.
// 3. PRESUDA iz projekcije: koliko novih stigneš i koliki deo ponavljanja, pa očekivani poeni i
//    šansa na dan ispita. Polazna tačka je procena šanse same aplikacije (procena.js, isto što piše
//    na početnoj); na nju se dodaje ono što će plan još doneti. ✅ šansa ≥ 2/3, ⛔ < 1/3, ⚠ između.

import { proceni } from '../procena/isporuka.mjs';

// ---------- konstante (obrazloženje uz svaku) ----------
const SIM_N = 41;           // pitanja na ispitu/simulaciji — troše isti dnevni kapacitet kao vežba
const PODRAZUMEVANO = 80;   // nov korisnik: jedna simulacija (41) + još toliko vežbe ≈ sat vremena dnevno
const PROBA = 1.1;          // završen plan se broji kao +10%: manje od običnog kolebanja iz dana u dan (±20%)
const RAMPA = 1.25;         // dok nijedan dan plana nije ostao nedovršen: +25% dnevno (80 → 200 za 4–5 dana); prvi nedovršen dan košta najviše četvrtinu preko juče
const UZORAKA = 5;          // poslednjih 5 dana sa planom: dovoljno sveže, a jedan dan ne odlučuje
const TOLER = 2;            // „završio plan" = uradio sve osim najviše 2 (lista se usput preračunava)
const PROZOR = 14;          // dve nedelje za procenu koliki deo dana stvarno radiš
const SIGURNO = 2 / 3;      // ✅ kad bi od tri ovakva ispita prošao bar dva
const LOSE = 1 / 3;         // ⛔ kad bi prošao manje od jednog od tri
const SIM_TEZINA = 2;       // (rezerva bez procena.js) račun „na papiru" vredi kao dve simulacije
const PRAG_UDEO = 0.85;     // prag ispita: 84 od 98
const JEDAN_POGLED = 0.5;   // (rezerva bez procena.js) jedan pogled + objašnjenje donosi pola dobitka, ponavljanja ostatak

let _w = null, _slotovi = null;
// koliko poena pitanje u proseku nosi na jednom ispitu: zbir (poeni slota / veličina bazena)
function tezine(api) {
  if (_w) return _w;
  _w = new Map(); _slotovi = [];
  for (const s of api.SIM_SLOTS) {
    const bazen = api.Q.filter((q) => s.s.includes(q.sub) && q.pts === s.p).map((q) => q.id);
    if (!bazen.length) continue;
    _slotovi.push({ pts: s.p, ids: bazen });
    for (const id of bazen) _w.set(id, (_w.get(id) || 0) + s.p / bazen.length);
  }
  return _w;
}
const medijana = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (x) => Math.round(100 * x) + '%';
// srpska množina: 1, 21, 31… → jednina; 2–4, 22–24… → paukal; ostalo (i 11–14) → množina
const obl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many);

// ---------- 1. budžet: samo iz istorije (S.dani + dnevnik plana), nikad iz stvarnog kapaciteta ----------
function proceniBudzet(S, log) {
  const dani = (S.dani || []).filter((x) => x && x.n > 0);
  const saPlanom = dani.filter((x) => log[x.d] != null).slice(-UZORAKA);
  if (saPlanom.length) {
    const u = saPlanom.map((x) => (x.n + TOLER >= log[x.d] ? Math.max(x.n, log[x.d]) * PROBA : x.n)).sort((a, b) => a - b);
    const zavrsio = saPlanom.filter((x) => x.n + TOLER >= log[x.d]).length;
    // dok nijedan dan plana (u celom dnevniku, 30 dana) nije ostao nedovršen, granica se još ne vidi:
    // svaki dan četvrtina više od poslednjeg. Čim se granica jednom vidi, važi oprezno pravilo ispod.
    const svi = dani.filter((x) => log[x.d] != null);
    if (svi.every((x) => x.n + TOLER >= log[x.d])) { const p = saPlanom[saPlanom.length - 1]; return { b: Math.round(Math.max(p.n, log[p.d]) * RAMPA), izvor: 'rampa', dana: saPlanom.length, zavrsio }; }
    return { b: Math.round(u[u.length >= 4 ? 1 : 0]), izvor: 'plan', dana: saPlanom.length, zavrsio };
  }
  const sv = dani.slice(-UZORAKA).map((x) => x.n);
  return { b: Math.max(PODRAZUMEVANO, sv.length ? Math.round(medijana(sv)) : 0), izvor: sv.length ? 'istorija' : 'nov', dana: sv.length, zavrsio: 0 };
}

// koji deo dana radiš i koliko često radiš simulaciju
function navike(api, danas) {
  const S = api.S, DAY = 864e5;
  const t0 = new Date(danas + 'T12:00:00').getTime();
  const aktivni = new Set((S.dani || []).filter((x) => x && x.n > 0).map((x) => x.d));
  let prvi = null; for (const d of aktivni) if (!prvi || d < prvi) prvi = d;
  let prozor = 0, rad = 0;
  for (let k = 1; k <= PROZOR; k++) {
    const d = api.localDay(t0 - k * DAY);
    if (!prvi || d < prvi) break;
    prozor++; if (aktivni.has(d)) rad++;
  }
  // +1/+1: dok je istorija kratka, pretpostavka je „radiš svaki dan"; posle dve nedelje odlučuju podaci
  const aktivnost = (rad + 1) / (prozor + 1);
  const prava = (s) => s && s.total && (s.odg == null || s.odg >= SIM_N - 5);   // prekinute se ne broje
  const simDani = new Set((S.sims || []).filter(prava).map((s) => api.localDay(s.d)));
  const posl = [...aktivni].sort().slice(-7);
  const simUdeo = posl.length ? posl.filter((d) => simDani.has(d)).length / posl.length : 0;
  return { aktivnost, simUdeo, simDanas: simDani.has(danas), prozor, rad };
}

// tvoja tačnost iz prve i na ponovljenim odgovorima (redosled odgovora kao u procena.js)
function tacnost(S) {
  let vid = 0, prvaOk = 0, ukupnoOk = 0, ponovljeno = 0;
  for (const id in S.q) {
    const r = S.q[id]; if (!r || !r.a) continue;
    vid++;
    const w = r.w || 0, st = Math.min(r.streak || 0, r.a - w), e = r.a - w - st;
    prvaOk += w === 0 ? 1 : e <= 0 ? 0 : w === 1 ? 1 : 0.5;
    ukupnoOk += r.a - w; ponovljeno += r.a - 1;
  }
  // slabi priori (kao 20 odgovora) samo da nov korisnik ima broj: 70% iz prve, 90% na ponavljanju
  const f = (prvaOk + 14) / (vid + 20);
  const pK = Math.max(f, (ukupnoOk - prvaOk + 18) / (ponovljeno + 20));
  // ponavljanja po novom pitanju po pravilima reda: tačno iz prve → 1 potvrda; pogrešno → 3 tačna zaredom
  const rho = f + (1 - f) * 3 / Math.max(0.5, pK);
  return { f, pK, vid, rho, udeoPon: rho / (1 + rho) };
}

function sansaIz(slotP) {
  const uk = slotP.reduce((a, s) => a + s.pts, 0);
  let r = new Float64Array(uk + 1); r[0] = 1;
  for (const s of slotP) { const n = new Float64Array(uk + 1); for (let i = 0; i <= uk; i++) { const v = r[i]; if (!v) continue; n[i] += v * (1 - s.p); if (i + s.pts <= uk) n[i + s.pts] += v * s.p; } r = n; }
  let z = 0; for (let i = Math.ceil(PRAG_UDEO * uk); i <= uk; i++) z += r[i];
  return z;
}

// ---------- 3. projekcija do ispita ----------
function projekcija(api, o) {
  const { B, R, dana, nav, acc, nova, redDug, proc, sad } = o;
  const w = tezine(api), S = api.S;
  const dnevno = Math.max(0, B - SIM_N * nav.simUdeo);            // za plan ostaje budžet bez simulacije
  const P = R + Math.max(0, dana - 1) * nav.aktivnost * dnevno;   // pitanja plana do ispita
  const N = nova.length;
  // ponavljanja novog pitanja stižu posle 1 i 3 dana: pitanje uvedeno u poslednja 4 dana svoje ne stigne
  const rho = acc.rho * Math.max(0, dana - 4) / Math.max(1, dana);
  const x = Math.min(N, Math.max(Math.floor((1 - acc.udeoPon) * P), Math.floor((P - redDug) / (1 + rho))));
  const potrebnoPon = redDug + rho * x;
  const fr = potrebnoPon > 0 ? Math.min(1, Math.max(0, P - x) / potrebnoPon) : 1;
  const stigne = new Set(nova.slice(0, x));
  // dobitak po pitanju (model „na papiru"): neviđeno f; viđeno a neutvrđeno pola puta do pK; utvrđeno pK
  const pVid = acc.f + (acc.pK - acc.f) * (JEDAN_POGLED + (1 - JEDAN_POGLED) * fr);
  const pRed = acc.f + (acc.pK - acc.f) * JEDAN_POGLED;
  // simulacije usput pokazuju i nova pitanja: pitanje koje se na ispitu pojavljuje m puta, posle K
  // simulacija je viđeno sa verovatnoćom 1 − e^(−K·m); pogrešeno ulazi u red kao i svako drugo
  const K = Math.max(0, dana - 1) * nav.aktivnost * nav.simUdeo + (o.simDanas ? 0 : nav.simUdeo >= 0.5 ? 1 : 0);
  const pItem = (id, kraj) => {
    const r = S.q[id];
    if (!r || !r.a) {
      if (!kraj) return acc.f;
      if (stigne.has(id)) return pVid;
      const m = (w.get(id) || 0) / api.byId.get(id).pts;
      return acc.f + (1 - Math.exp(-K * m)) * (pVid - acc.f);
    }
    if (api.inQueue(id)) return kraj ? pVid : pRed;
    return acc.pK;
  };
  const slotK = [], slotS = [];
  for (const s of _slotovi) {
    let a = 0, b = 0;
    for (const id of s.ids) { a += pItem(id, true); b += pItem(id, false); }
    slotK.push({ pts: s.pts, p: a / s.ids.length }); slotS.push({ pts: s.pts, p: b / s.ids.length });
  }
  let neviBroj = 0, neviPoeni = 0;
  for (const id of nova) if (!stigne.has(id)) { neviBroj++; neviPoeni += w.get(id) || 0; }
  let kraj, izvorProc;
  if (proc && proc.slotovi && proc.sansa != null) {
    // polazna tačka = procena aplikacije po slotu; dodaje se samo ono što plan još donese
    kraj = slotK.map((s, i) => ({ pts: s.pts, p: Math.min(0.999, Math.max(0.001, proc.slotovi[i].p + (s.p - slotS[i].p))) }));
    izvorProc = 'aplikacija';
  } else {
    // rezerva: sopstveni račun, ispravljen simulacijama (skupljeno ka računu dok ih je malo)
    const sims = (S.sims || []).filter((s) => s && s.total && (s.odg == null || s.odg >= SIM_N - 5) && sad - s.d < 10 * 864e5).slice(-5);
    const eSad = slotS.reduce((a, s) => a + s.pts * s.p, 0), uk = slotS.reduce((a, s) => a + s.pts, 0);
    let delta = 0;
    if (sims.length) delta = sims.length / (sims.length + SIM_TEZINA) * (sims.reduce((a, s) => a + s.score * uk / s.total, 0) / sims.length - eSad);
    kraj = slotK.map((s) => ({ pts: s.pts, p: Math.min(0.999, Math.max(0.001, s.p + delta / uk)) }));
    izvorProc = sims.length ? 'racun+sim' : 'racun';
  }
  const eKraj = kraj.reduce((a, s) => a + s.pts * s.p, 0);
  return { P, x, N, fr, eKraj, sansa: sansaIz(kraj), neviBroj, neviPoeni, izvorProc, dnevno };
}

export function planDanas(api, ctx) {
  const S = api.S;
  const w = tezine(api);
  const danas = api.localDay();
  if (!S.plan) S.plan = {};
  const bz = S.plan.bz || (S.plan.bz = { log: {} });
  // budžet se računa jednom dnevno i zamrzava (kao autoKvota) — inače bi se menjao dok radiš
  if (bz.d !== danas || bz.B == null) { const p = proceniBudzet(S, bz.log); Object.assign(bz, { d: danas, B: p.b, izvor: p.izvor, uzorka: p.dana, zavrsio: p.zavrsio }); }
  const B = bz.B;
  const nav = navike(api, danas);
  const uradjeno = (S.day && S.day.d === danas) ? (S.day.n || 0) : 0;
  const rezSim = !nav.simDanas && nav.simUdeo >= 0.5 ? SIM_N : 0;   // redovno radiš simulaciju, a danas još nisi
  const R = Math.max(0, B - uradjeno - rezSim);

  // šta je na redu (pitanje već rađeno danas se ne nudi — dnevni brojači ga ionako ne broje)
  const danasRadjeno = (id) => S.q[id] && S.q[id].last && api.localDay(S.q[id].last) === danas;
  const red = api.queueSplit().ready.filter((id) => !danasRadjeno(id));
  const osv = api.zaOsvezavanje().filter((id) => !danasRadjeno(id));
  const pon = red.concat(osv);
  const noviBaza = api.Q.filter((q) => !S.q[q.id] || !S.q[q.id].a).map((q) => q.id);
  const noviTez = noviBaza.slice().sort((a, b) => (w.get(b) || 0) - (w.get(a) || 0));
  // dug reda: koliko još tačnih odgovora treba da sva pitanja iz reda izađu (+ osvežavanja)
  let redDug = osv.length;
  for (const id in S.q) { const r = S.q[id]; if (r && r.a && api.inQueue(id)) redDug += r.w > 0 ? 3 - (r.streak || 0) : 1; }

  const dana = api.danaDoIspita();
  const acc = tacnost(S);
  let pr = null, poTezini = false, proc = null;
  if (dana != null && dana >= 0) {
    try { proc = proceni(S, { Q: api.Q, byId: api.byId, SIM_SLOTS: api.SIM_SLOTS, prag: (t) => Math.ceil(PRAG_UDEO * t), sad: ctx.sad, DAY: 864e5 }); } catch (e) { proc = null; }
    const o = { B, R, dana, nav, acc, redDug, proc, sad: ctx.sad, simDanas: nav.simDanas };
    const redom = projekcija(api, { ...o, nova: noviBaza });
    poTezini = redom.x < redom.N;                                  // ne stižeš sva nova → po poenima na ispitu
    pr = poTezini ? projekcija(api, { ...o, nova: noviTez }) : redom;
  }
  const nova = poTezini ? noviTez : noviBaza;

  // ---------- 2. današnja lista ----------
  let kapPon = Math.ceil(acc.udeoPon * R);
  if (nova.length < R - kapPon) kapPon = R - nova.length;          // novih nema dovoljno → više ponavljanja
  const ponDanas = pon.slice(0, Math.min(kapPon, pon.length));
  const novaDanas = nova.slice(0, R - ponDanas.length);
  const ids = ponDanas.concat(novaDanas);
  bz.log[danas] = bz.log[danas] != null ? bz.log[danas] : uradjeno + rezSim + ids.length;
  const kljucevi = Object.keys(bz.log).sort(); while (kljucevi.length > 30) delete bz.log[kljucevi.shift()];

  // ---------- tekst ----------
  let ocena = 'nema';
  const t = [];
  const nb = bz.uzorka || 0;
  const zasto = bz.izvor === 'plan'
    ? `toliko si stigao ${nb >= 4 ? `u ${nb - 1} od ${obl(nb, 'poslednjeg', 'poslednja', 'poslednjih')} ${nb} dana plana` : nb === 1 ? 'poslednjeg dana plana' : `u svakom od poslednja ${nb} dana plana`}${bz.zavrsio ? ' (dan kad završiš ceo plan računa se sa 10% više)' : ''}`
    : bz.izvor === 'rampa' ? 'dosad si svaki dan završio ceo plan, pa danas četvrtina više — dok ne vidimo koliko stvarno stižeš'
    : bz.izvor === 'istorija' ? `koliko obično radiš, a najmanje ${PODRAZUMEVANO}; posle par dana plana računa se iz onoga što stvarno stigneš`
      : 'početna procena; posle par dana plana računa se iz onoga što stvarno stigneš';
  const pit = (n) => `${n} ${obl(n, 'pitanje', 'pitanja', 'pitanja')}`;
  if (R === 0 && uradjeno > 0) t.push(`Današnji plan je urađen (${pit(uradjeno)}). Sve preko toga je dodatna vežba.`);
  else if (!ids.length) t.push('Danas nema ničega na redu: sve je viđeno i ponovljeno na vreme. Simulacija je sada najbolja vežba.');
  else t.push(`Danas: ${pit(ids.length)} — ${[ponDanas.length ? `${ponDanas.length} ${obl(ponDanas.length, 'ponavljanje', 'ponavljanja', 'ponavljanja')}` : '', novaDanas.length ? `${novaDanas.length} ${obl(novaDanas.length, 'novo', 'nova', 'novih')}` : ''].filter(Boolean).join(', pa ')}${rezSim ? ', uz simulaciju' : ''}. Dnevni budžet je ${B} pitanja zajedno sa simulacijom: ${zasto}.`);
  if (pr) {
    const s = pr.sansa;
    ocena = s >= SIGURNO ? 'ok' : s < LOSE ? 'problem' : 'upozorenje';
    const zn = ocena === 'ok' ? '✅' : ocena === 'problem' ? '⛔' : '⚠';
    const dd = dana === 0 ? 'danas je ispit' : dana === 1 ? 'sutra je ispit' : `do ispita ${dana} ${obl(dana, 'dan', 'dana', 'dana')}`;
    if (pr.N === 0) t.push(`Sva pitanja si već video; ${dd}, ostaje ponavljanje (stigneš oko ${pct(pr.fr)} onoga što će biti na redu).`);
    else if (!poTezini) t.push(`Ovim tempom (${dd}) prođeš sva preostala nova pitanja (${pr.N})${pr.fr < 0.95 ? `, a ponavljanja stigneš oko ${pct(pr.fr)}` : ' i stigneš da ponoviš greške'}.`);
    else {
      const ost = pr.neviBroj, poeni = pr.neviPoeni < 1 ? 'manje od jednog poena (od 98)' : 'oko ' + Math.round(pr.neviPoeni) + ' od 98 poena';
      t.push(`${pr.x >= 0.9 * pr.N ? 'Stižeš skoro sve' : 'Ne stižeš sve'} (${dd}): od ${pr.N} novih pitanja stigneš oko ${pr.x}${pr.fr < 0.95 ? `, a ponavljanja oko ${pct(pr.fr)}` : ''}. Zato prvo idu pitanja koja nose najviše poena na ispitu; ${ost} ${obl(ost, 'koje ostaje nosi', 'koja ostaju nose', 'koja ostaju nose')} zajedno ${poeni}.`);
    }
    t.push(`${zn} Na dan ispita očekuj oko ${Math.round(pr.eKraj)} od 98 poena (prag 84) — šansa za prolaz oko ${pct(s)}.${pr.izvorProc === 'racun' ? ' Gruba procena: još nema dovoljno odgovora ni simulacija.' : ''}`);
    if (ocena !== 'ok' && dana >= 1) {
      const o = { R, B, dana, nav, acc, redDug, proc, sad: ctx.sad, nova: noviTez, simDanas: nav.simDanas };
      const saveti = [];
      if (nav.aktivnost < 0.85) {
        const r = projekcija(api, { ...o, nav: { ...nav, aktivnost: 1 } });
        const dn = Math.round(7 * nav.aktivnost);
        if (r.sansa > s + 0.05) saveti.push(`vežbati svaki dan (sada oko ${dn} ${obl(dn, 'dan', 'dana', 'dana')} nedeljno) → oko ${pct(r.sansa)}`);
      }
      const vise = projekcija(api, { ...o, R: Math.round(R * 1.25), B: Math.round(B * 1.25) });
      if (vise.sansa > s + 0.05) saveti.push(`oko ${Math.round(B * 1.25)} pitanja dnevno → oko ${pct(vise.sansa)}`);
      if (ocena === 'problem') {
        const kasnije = projekcija(api, { ...o, dana: dana + 7 });
        if (kasnije.sansa > s + 0.05) saveti.push(`ispit nedelju dana kasnije, istim tempom → oko ${pct(kasnije.sansa)}`);
      }
      if (saveti.length) t.push(`Šta bi pomoglo: ${saveti.join('; ')}.`);
      else t.push('Više pitanja dnevno tu malo menja: poeni se gube na pitanjima koja si već video — greške rešavaj pažljivo i čitaj objašnjenja.');
    }
  } else if (dana != null && dana < 0) t.push('Datum ispita je prošao — unesi novi da bi plan mogao da proceni da li stižeš.');
  else t.push('Unesi datum ispita da bi plan mogao da proceni da li stižeš.');
  return {
    ids, ocena, tekst: t.join(' '),
    projekcija: pr ? { budzet: B, izvorBudzeta: bz.izvor, R, udeoPon: acc.udeoPon, novih: pr.N, novihStigne: pr.x, ponavljanja: pr.fr, poeni: pr.eKraj, sansa: pr.sansa, poTezini, izvor: pr.izvorProc } : null,
  };
}
