// SADAŠNJA procena iz aplikacije (readiness + sansaZaProlaz, v143), prepisana doslovno —
// osnovica prema kojoj se meri svaka nova. Laplace (+1/+2) po pitanju: pitanje tačno jednom
// dobija 2/3, pa savršen učenik izgleda kao učenik od 67%.
import { tacnaSansa } from './zajednicko.mjs';
export function proceni(S, { Q, SIM_SLOTS }) {
  let ta = 0, tw = 0;
  for (const q of Q) { const r = S.q[q.id]; if (r) { ta += r.a; tw += r.w; } }
  const overall = ta >= 20 ? (ta - tw) / ta : null;
  const subAcc = {};
  for (const q of Q) { const r = S.q[q.id]; if (r && r.a) { const s = subAcc[q.sub] = subAcc[q.sub] || { a: 0, w: 0 }; s.a += r.a; s.w += r.w; } }
  const pOf = (q) => {
    const r = S.q[q.id];
    if (r && r.a) return (r.a - r.w + 1) / (r.a + 2);
    const s = subAcc[q.sub];
    if (s && s.a >= 5) return (s.a - s.w) / s.a;
    if (overall != null) return overall;
    return 0.45;
  };
  const slotovi = [];
  for (const slot of SIM_SLOTS) {
    const pool = Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p);
    if (!pool.length) continue;
    slotovi.push({ pts: slot.p, p: pool.reduce((a, q) => a + pOf(q), 0) / pool.length });
  }
  const answered = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
  if (answered < 30) return { sansa: null, exp: null };
  const t = tacnaSansa(slotovi);
  return { sansa: t.sansa, exp: t.exp };
}
