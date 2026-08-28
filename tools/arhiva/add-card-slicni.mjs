import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
if (s.includes("'slicni-pojmovi'")) { console.log('FAIL: kartica postoji'); process.exit(1); }
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const block = `
// --- Kartica "Slični pojmovi" (Milanov zahtev): 4 radnje prolaženja, odstojanje/rastojanje,
// vidljivost/preglednost, kolona — sve verbatim iz ZOBS čl. 7 (t. 71-79, 86-87) ---
CARDS['slicni-pojmovi'] = {
  title: 'Slični pojmovi — u čemu je razlika',
  html: \`
<p><b>Četiri radnje prolaženja (čl. 7):</b> pitaj se samo — ŠTA radi onaj pored koga prolaziš?</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 110 95"><rect x="25" y="0" width="60" height="95" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="95" stroke="#fff" stroke-dasharray="7 6" stroke-width="2"/>
      <rect x="33" y="52" width="16" height="28" rx="4" fill="#2c6aa0"/><path d="M41 46 L41 22 M41 22 L35 30 M41 22 L47 30" stroke="#2c6aa0" stroke-width="4" fill="none"/>
      <rect x="61" y="14" width="16" height="28" rx="4" fill="#c0392b"/><path d="M69 48 L69 72 M69 72 L63 64 M69 72 L75 64" stroke="#c0392b" stroke-width="4" fill="none"/></svg>
    <b>MIMOILAŽENJE</b><span>dolazi iz SUPROTNOG smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 95"><rect x="25" y="0" width="60" height="95" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="95" stroke="#fff" stroke-dasharray="7 6" stroke-width="2"/>
      <rect x="61" y="45" width="16" height="28" rx="4" fill="#5f6d7a"/><path d="M69 40 L69 24 M69 24 L63 32 M69 24 L75 32" stroke="#5f6d7a" stroke-width="4" fill="none"/>
      <rect x="33" y="30" width="16" height="28" rx="4" fill="#2c6aa0"/><path d="M41 24 L41 4 M41 4 L35 12 M41 4 L47 12" stroke="#2c6aa0" stroke-width="4" fill="none"/></svg>
    <b>PRETICANJE</b><span>KREĆE SE u istom smeru</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 95"><rect x="25" y="0" width="60" height="95" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="95" stroke="#fff" stroke-dasharray="7 6" stroke-width="2"/>
      <rect x="61" y="34" width="16" height="28" rx="4" fill="#5f6d7a"/><text x="69" y="53" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">P</text>
      <path d="M41 88 L41 66 Q41 48 55 48 Q69 48 69 30 M69 30 L63 38 M69 30 L75 38" stroke="#2c6aa0" stroke-width="4" fill="none"/></svg>
    <b>OBILAŽENJE</b><span>NE POMERA SE (vozilo, objekat, prepreka)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 95"><rect x="0" y="30" width="110" height="35" fill="#9aa7b4"/><rect x="38" y="65" width="34" height="30" fill="#9aa7b4"/>
      <rect x="47" y="72" width="16" height="20" rx="4" fill="#2c6aa0"/><line x1="42" y1="66" x2="68" y2="66" stroke="#fff" stroke-width="3"/>
      <rect x="12" y="38" width="28" height="16" rx="4" fill="#c0392b"/><path d="M46 46 L88 46 M88 46 L80 40 M88 46 L80 52" stroke="#c0392b" stroke-width="4" fill="none"/></svg>
    <b>PROPUŠTANJE</b><span>omogućavaš prolaz onome KO IMA PRVENSTVO — on ne menja način kretanja</span>
  </div>
</div>
<p><b>Odstojanje i rastojanje (čl. 7):</b> ista reč "udaljenost", različit pravac merenja.</p>
<div class="signRow" style="max-width:420px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 90 110"><rect x="20" y="0" width="50" height="110" fill="#9aa7b4"/>
      <rect x="37" y="8" width="16" height="26" rx="4" fill="#2c6aa0"/><rect x="37" y="76" width="16" height="26" rx="4" fill="#5f6d7a"/>
      <path d="M45 38 L45 72 M45 38 L41 45 M45 38 L49 45 M45 72 L41 65 M45 72 L49 65" stroke="#8a5a00" stroke-width="3" fill="none"/></svg>
    <b>ODSTOJANJE</b><span>UZDUŽNA udaljenost (napred-nazad)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 90"><rect x="0" y="15" width="110" height="60" fill="#9aa7b4"/>
      <rect x="12" y="32" width="28" height="16" rx="4" fill="#2c6aa0"/><rect x="70" y="42" width="28" height="16" rx="4" fill="#5f6d7a"/>
      <path d="M44 45 L66 45 M44 45 L51 41 M44 45 L51 49 M66 45 L59 41 M66 45 L59 49" stroke="#8a5a00" stroke-width="3" fill="none"/></svg>
    <b>RASTOJANJE</b><span>BOČNA udaljenost (levo-desno)</span>
  </div>
</div>
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg vgHead"><b>VIDLJIVOST</b></div><div class="vg" style="text-align:left">koliko jasno vidiš KOLOVOZ — zavisi od svetlosnih uslova (noć, magla, padavine). Smanjena: ispod 200 m van naselja, ispod 100 m u naselju</div>
  <div class="vg vgHead"><b>PREGLEDNOST</b></div><div class="vg" style="text-align:left">dokle vidiš DRUGOG UČESNIKA ili prepreku s obzirom na FIZIČKE prepreke (krivina, breg, objekat) — pri normalnoj vidljivosti</div>
  <div class="vg vgHead"><b>ZAUSTAVLJANJE</b></div><div class="vg" style="text-align:left">prekid do TRI minuta + vozač NE napušta vozilo (i nije po znaku/pravilu)</div>
  <div class="vg vgHead"><b>PARKIRANJE</b></div><div class="vg" style="text-align:left">svaki drugi prekid kretanja — i kraći od 3 minuta ako vozač NAPUSTI vozilo</div>
</div>
<p><b>Kolona (čl. 7):</b> najmanje TRI vozila, jedno iza drugog u ISTOJ traci, međusobno uslovljeno kretanje (bez mesta za ubacivanje). Zaustavljena vozila u traci JESU kolona — PARKIRANA vozila NISU.</p>\`,
};
X[7940] = { ...(X[7940]||{}), card: 'slicni-pojmovi' };
X[7942] = { ...(X[7942]||{}), card: 'slicni-pojmovi' };
X[7944] = { ...(X[7944]||{}), card: 'slicni-pojmovi' };
X[7953] = { ...(X[7953]||{}), card: 'slicni-pojmovi' };
X[7948] = { ...(X[7948]||{}), card: 'slicni-pojmovi' };
X[10613] = { ...(X[10613]||{}), card: 'slicni-pojmovi' };
X[7936] = { ...(X[7936]||{}), card: 'slicni-pojmovi' };
X[7937] = { ...(X[7937]||{}), card: 'slicni-pojmovi' };
X[7938] = { ...(X[7938]||{}), card: 'slicni-pojmovi' };
X[7957] = { ...(X[7957]||{}), card: 'slicni-pojmovi' };
X[7958] = { ...(X[7958]||{}), card: 'slicni-pojmovi' };
X[7960] = { ...(X[7960]||{}), card: 'slicni-pojmovi' };
X[7961] = { ...(X[7961]||{}), card: 'slicni-pojmovi' };
X[7967] = { ...(X[7967]||{}), card: 'slicni-pojmovi' };
X[7968] = { ...(X[7968]||{}), card: 'slicni-pojmovi' };
X[7970] = { ...(X[7970]||{}), card: 'slicni-pojmovi' };
X[7971] = { ...(X[7971]||{}), card: 'slicni-pojmovi' };

`;
s = s.slice(0, ti) + block + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('kartica slicni-pojmovi + 17 veza ubačeno');
