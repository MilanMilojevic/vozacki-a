// Zajedničko za merni alat i procene: TAČNA raspodela zbira poena po slotovima (isti DP kao
// sansaZaProlaz u aplikaciji). Odvojeno u svoj modul da procene ne bi uvozile sam alat
// (kružni uvoz sa top-level await se zaključa).
export function tacnaSansa(slotP, udeo = 0.85) {
  const ukupno = slotP.reduce((a, s) => a + s.pts, 0);
  let r = new Float64Array(ukupno + 1); r[0] = 1;
  for (const s of slotP) {
    const n = new Float64Array(ukupno + 1);
    for (let i = 0; i <= ukupno; i++) { const v = r[i]; if (!v) continue; n[i] += v * (1 - s.p); if (i + s.pts <= ukupno) n[i + s.pts] += v * s.p; }
    r = n;
  }
  const prag = Math.ceil(udeo * ukupno);
  let sansa = 0; for (let i = prag; i <= ukupno; i++) sansa += r[i];
  return { sansa, exp: slotP.reduce((a, s) => a + s.pts * s.p, 0), ukupno, raspodela: r };
}
