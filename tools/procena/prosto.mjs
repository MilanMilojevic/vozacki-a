// PROCENA „prosto" — najjednostavnija procena šanse koja je i dalje kalibrisana.
//
// Četiri pravila, svako mora da zaradi svoje mesto merenjem (tools/kalibracija-sanse.mjs):
//
//  1. Pitanje koje si video: tvoja SIROVA tačnost na njemu, (tačnih)/(ukupno odgovora).
//     Bez Laplasovog +1/+2 — to je savršenog učenika (svako pitanje jednom tačno) spuštalo na 67%.
//  2. Pitanje koje nisi video: tvoja tačnost IZ PRVOG POKUŠAJA (koliko novih pitanja pogodiš
//     odmah). Iz zapisa: w=0 → prvi tačan; w=1 i bar jedan tačan pre te greške → prvi tačan;
//     w≥2 se računa kao prvi netačan (ne zna se) — zato je procena blago oprezna.
//  3. Zaborav: dokaz sa pitanja bledi ka stopi iz pravila 2 sa poluživotom od 60 dana
//     (odgovor star 60 dana vredi pola). Bez ovoga procena ne vidi da se znanje staro dva meseca
//     istrošilo; 60 dana je okrugla, namerno spora vrednost — pravi zaborav se ne vidi iz
//     podataka bez simulacija, pa ga ne sme precenjivati.
//  4. Simulacije: očekivani poeni = ponderisani prosek (procena iz pitanja kao JEDNA simulacija
//     + tvoje simulacije, svaka sa težinom koja se prepolovi na 5 dana). Simulacija je jedino
//     merenje baš onoga što se pita — slučajan ispit po zvaničnom šablonu. Simulacija sa 0 poena
//     se preskače: to je predat prazan ispit (ima ih u stvarnim podacima), ne pokušaj.
//
// Kad nema dovoljno podataka (manje od četvrtine baze viđeno i nijedna simulacija) → null.
// Šansa = tačna raspodela zbira poena po 41 mestu (tacnaSansa), iz verovatnoća po mestu.
import { tacnaSansa } from './zajednicko.mjs';

const POLUZIVOT_ZNANJA_DANA = 60;    // pravilo 3
const POLUZIVOT_SIMULACIJE_DANA = 5;  // pravilo 4
const MODEL_VREDI_SIMULACIJA = 1;     // pravilo 4
const MIN_POKRIVENOST = 0.25;        // ispod ovoga i bez simulacija → null

export function proceni(S, ctx) {
  const { Q, SIM_SLOTS, sad, DAY } = ctx;
  const q = (S && S.q) || {};

  // pravilo 2: tačnost iz prvog pokušaja
  let vidjeno = 0, prviTacni = 0;
  for (const pit of Q) {
    const r = q[pit.id];
    if (!r || !(r.a > 0)) continue;
    vidjeno++;
    if (r.w === 0 || (r.w === 1 && r.a - 1 - (r.streak || 0) >= 1)) prviTacni++;
  }
  const sims = ((S && S.sims) || []).filter((s) => s && s.total > 0 && s.score > 0 && Number.isFinite(s.d));
  if (vidjeno === 0 && !sims.length) return { sansa: null, exp: null };
  if (vidjeno / Q.length < MIN_POKRIVENOST && !sims.length) return { sansa: null, exp: null };
  const prviPokusaj = (prviTacni + 1) / (vidjeno + 2);

  // pravila 1 + 3: verovatnoća po pitanju
  const k = Math.LN2 / (POLUZIVOT_ZNANJA_DANA * DAY);
  const pOf = (pit) => {
    const r = q[pit.id];
    if (!r || !(r.a > 0)) return prviPokusaj;
    const sirovo = (r.a - r.w) / r.a;
    const starost = Math.max(0, sad - (r.last || sad));
    return prviPokusaj + (sirovo - prviPokusaj) * Math.exp(-k * starost);
  };

  let slotovi = [];
  for (const slot of SIM_SLOTS) {
    let s = 0, n = 0;
    for (const pit of Q) if (pit.pts === slot.p && slot.s.includes(pit.sub)) { s += pOf(pit); n++; }
    if (n) slotovi.push({ pts: slot.p, p: s / n });
  }
  const ukupno = slotovi.reduce((a, s) => a + s.pts, 0);
  const izPitanja = slotovi.reduce((a, s) => a + s.pts * s.p, 0);

  // pravilo 4: simulacije
  if (sims.length) {
    let tezina = MODEL_VREDI_SIMULACIJA, zbir = MODEL_VREDI_SIMULACIJA * izPitanja;
    const ks = Math.LN2 / (POLUZIVOT_SIMULACIJE_DANA * DAY);
    for (const s of sims) {
      const w = Math.exp(-ks * Math.max(0, sad - s.d));
      tezina += w; zbir += w * (s.score / s.total) * ukupno;
    }
    slotovi = pomeriNa(slotovi, zbir / tezina);
  }
  const t = tacnaSansa(slotovi);
  return { sansa: t.sansa, exp: t.exp };
}

// Sva mesta se pomere za isti iznos na logit skali, tako da zbir očekivanih poena bude `cilj`.
// (Logit, a ne sabiranje, da verovatnoća ostane između 0 i 1 i da jaka mesta ostanu jaka.)
function pomeriNa(slotovi, cilj) {
  const ogr = (p) => Math.min(1 - 1e-9, Math.max(1e-9, p));
  const lg = slotovi.map((s) => Math.log(ogr(s.p) / (1 - ogr(s.p))));
  const ocek = (m) => slotovi.reduce((a, s, i) => a + s.pts / (1 + Math.exp(-(lg[i] + m))), 0);
  let lo = -30, hi = 30;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (ocek(m) < cilj) lo = m; else hi = m; }
  const m = (lo + hi) / 2;
  return slotovi.map((s, i) => ({ pts: s.pts, p: 1 / (1 + Math.exp(-(lg[i] + m))) }));
}
