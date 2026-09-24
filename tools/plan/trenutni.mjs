// ISTORIJA: stari auto (v147–v148) — lista iz planIds(), presuda iz planBlok(). Merljiv samo na app.js
// pre v149 (git show v148:app.js); od v149 auto je plan.js i meri se kroz plan/isporuka.mjs.
// Njegovi brojevi (NEREALNO 61–96% dana, do ×48) stoje u RAZVOJ.md, zapis v149.
export function planDanas(api, ctx) {
  const ids = api.planIds();
  const b = ctx.strip(api.planBlok());
  const ocena = /⛔/.test(b) ? 'problem' : /⚠/.test(b) ? 'upozorenje' : /✅/.test(b) ? 'ok' : 'nema';
  return { ids, ocena, tekst: b };
}
