import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const start = s.indexOf("CARDS['slicni-pojmovi'] = {");
const endMarker = "X[7940] = { ...(X[7940]||{}), card: 'slicni-pojmovi' };";
const end = s.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) { console.log('FAIL anchors', start, end); process.exit(1); }

const block = `// crtež automobila iz ptičje perspektive (telo + vetrobran + zadnje staklo + točkovi)
const carG = (x, y, color, rot = 0) => \`<g transform="translate(\${x} \${y}) rotate(\${rot})">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="\${color}"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g>\`;
const arr = (x1, y1, x2, y2, color, w = 3.5) => {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a) => x2 - 9 * Math.cos(ang - a), hy = (a) => y2 - 9 * Math.sin(ang - a);
  return \`<path d="M\${x1} \${y1} L\${x2} \${y2} M\${hx(0.45)} \${hy(0.45)} L\${x2} \${y2} L\${hx(-0.45)} \${hy(-0.45)}" stroke="\${color}" stroke-width="\${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\`;
};
CARDS['slicni-pojmovi'] = {
  title: 'Slični pojmovi — u čemu je razlika',
  html: \`
<p><b>Četiri radnje prolaženja (čl. 7):</b> pitaj se samo — ŠTA radi onaj pored koga prolaziš?</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="25" y="0" width="60" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      \${carG(40, 66, '#2c6aa0')}\${arr(40, 42, 40, 14, '#2c6aa0')}
      \${carG(70, 32, '#c0392b', 180)}\${arr(70, 56, 70, 84, '#c0392b')}</svg>
    <b>MIMOILAŽENJE</b><span>dolazi iz SUPROTNOG smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="25" y="0" width="60" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      \${carG(70, 58, '#5f6d7a')}\${arr(70, 34, 70, 16, '#5f6d7a', 3)}
      \${carG(40, 44, '#2c6aa0')}\${arr(40, 20, 40, 4, '#2c6aa0')}</svg>
    <b>PRETICANJE</b><span>KREĆE SE u istom smeru</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="25" y="0" width="60" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      \${carG(70, 46, '#5f6d7a')}<text x="70" y="51" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold">P</text>
      \${carG(40, 80, '#2c6aa0')}<path d="M40 60 L40 46 Q40 28 55 26 Q70 24 70 12" stroke="#2c6aa0" stroke-width="3.5" fill="none" stroke-dasharray="6 5" stroke-linecap="round"/>\${arr(70, 20, 70, 8, '#2c6aa0')}</svg>
    <b>OBILAŽENJE</b><span>NE POMERA SE (vozilo, objekat, prepreka)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="0" y="26" width="110" height="40" fill="#9aa7b4"/><rect x="36" y="66" width="38" height="34" fill="#9aa7b4"/>
      <line x1="41" y1="62" x2="69" y2="62" stroke="#fff" stroke-width="3.5"/>
      \${carG(55, 84, '#2c6aa0')}
      \${carG(24, 46, '#c0392b', 90)}\${arr(48, 46, 92, 46, '#c0392b')}</svg>
    <b>PROPUŠTANJE</b><span>omogućavaš prolaz onome KO IMA PRVENSTVO — on ne menja način kretanja</span>
  </div>
</div>
<p><b>Odstojanje i rastojanje (čl. 7):</b> ista reč "udaljenost", različit pravac merenja.</p>
<div class="signRow" style="max-width:460px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 90 120"><rect x="20" y="0" width="50" height="120" fill="#9aa7b4"/>
      \${carG(45, 22, '#2c6aa0')}\${carG(45, 98, '#5f6d7a')}
      \${arr(45, 46, 45, 42, '#8a5a00')}\${arr(45, 74, 45, 78, '#8a5a00')}<line x1="45" y1="44" x2="45" y2="76" stroke="#8a5a00" stroke-width="3"/></svg>
    <b>ODSTOJANJE</b><span>UZDUŽNA udaljenost (napred-nazad)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="10" y="0" width="90" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      \${carG(32, 50, '#2c6aa0')}\${carG(78, 50, '#5f6d7a')}
      \${arr(48, 50, 44, 50, '#8a5a00')}\${arr(62, 50, 66, 50, '#8a5a00')}<line x1="46" y1="50" x2="64" y2="50" stroke="#8a5a00" stroke-width="3"/></svg>
    <b>RASTOJANJE</b><span>BOČNA udaljenost (levo-desno)</span>
  </div>
</div>
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg vgHead"><b>VIDLJIVOST</b></div><div class="vg" style="text-align:left">koliko jasno vidiš KOLOVOZ — zavisi od svetlosnih uslova (noć, magla, padavine). Smanjena: ispod 200 m van naselja, ispod 100 m u naselju</div>
  <div class="vg vgHead"><b>PREGLEDNOST</b></div><div class="vg" style="text-align:left">dokle vidiš DRUGOG UČESNIKA ili prepreku s obzirom na FIZIČKE prepreke (krivina, breg, objekat) — pri normalnoj vidljivosti</div>
  <div class="vg vgHead"><b>ZAUSTAVLJANJE</b></div><div class="vg" style="text-align:left">prekid do TRI minuta + vozač NE napušta vozilo (i nije po znaku/pravilu)</div>
  <div class="vg vgHead"><b>PARKIRANJE</b></div><div class="vg" style="text-align:left">svaki drugi prekid kretanja — i kraći od 3 minuta ako vozač NAPUSTI vozilo</div>
</div>
<p><b>Kolona (čl. 7):</b> najmanje TRI vozila, jedno iza drugog u ISTOJ traci, međusobno uslovljeno kretanje (bez mesta za ubacivanje).</p>
<div class="signRow" style="max-width:460px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 90 130"><rect x="20" y="0" width="50" height="130" fill="#9aa7b4"/>
      \${carG(45, 22, '#2c6aa0')}\${carG(45, 65, '#2c6aa0')}\${carG(45, 108, '#2c6aa0')}</svg>
    <b>✓ KOLONA</b><span>i zaustavljena vozila u traci jesu kolona</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 90 130"><rect x="20" y="0" width="50" height="130" fill="#9aa7b4"/><line x1="30" y1="0" x2="30" y2="130" stroke="#fff" stroke-width="2"/>
      \${carG(38, 22, '#5f6d7a')}\${carG(38, 65, '#5f6d7a')}\${carG(38, 108, '#5f6d7a')}
      <text x="60" y="70" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">P</text></svg>
    <b>✗ NIJE KOLONA</b><span>parkirana vozila nisu kolona</span>
  </div>
</div>\`,
};
`;
s = s.slice(0, start) + block + s.slice(end);
fs.writeFileSync('build-explanations.mjs', s);
console.log('slicni-pojmovi prerađen (carG + kolona vizuel)');
