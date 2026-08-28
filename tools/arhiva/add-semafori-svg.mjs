import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const anchor = '<p class="mut">Zamka: zeleno NE znači';
if (s.split(anchor).length - 1 !== 1) { console.log('FAIL anchor'); process.exit(1); }
const row = `<p style="margin-top:10px"><b>Posebne vrste semafora</b> — baza ih pita, prepoznaj oblik:</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 120 62"><rect x="2" y="4" width="36" height="54" rx="6" fill="#2a333d"/><rect x="10" y="26" width="20" height="6" rx="2" fill="#fff"/>
      <rect x="42" y="4" width="36" height="54" rx="6" fill="#2a333d"/><rect x="57" y="14" width="6" height="34" rx="2" fill="#fff"/>
      <rect x="82" y="4" width="36" height="54" rx="6" fill="#2a333d"/><rect x="97" y="12" width="6" height="38" rx="2" fill="#fff" transform="rotate(35 100 31)"/></svg>
    <b>TRAMVAJSKI (bele crte)</b><span>položena ― = zabrana · uspravna i kosa = slobodan prolaz (čl. 147); važe i za autobus u zajedničkoj traci</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 100"><rect x="8" y="2" width="44" height="96" rx="8" fill="#2a333d"/>
      <circle cx="30" cy="27" r="17" fill="#c0392b"/><text x="30" y="34" text-anchor="middle" font-size="18">🚶</text>
      <circle cx="30" cy="72" r="17" fill="#1f7a3f"/><text x="30" y="79" text-anchor="middle" font-size="18">🚶</text></svg>
    <b>PEŠAČKI</b><span>dvobojni: crveno gore, zeleno dole; trepćuće zeleno = uskoro crveno (čl. 146)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 120"><rect x="8" y="2" width="44" height="116" rx="8" fill="#2a333d"/>
      <circle cx="30" cy="24" r="15" fill="#c0392b"/><text x="30" y="30" text-anchor="middle" font-size="15">🚲</text>
      <circle cx="30" cy="60" r="15" fill="#8a5a00"/><text x="30" y="66" text-anchor="middle" font-size="15">🚲</text>
      <circle cx="30" cy="96" r="15" fill="#1f7a3f"/><text x="30" y="102" text-anchor="middle" font-size="15">🚲</text></svg>
    <b>BICIKLISTIČKI</b><span>trobojni sa simbolom bicikla — za biciklističke trake/staze (čl. 140), ista značenja svetala</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 130 56"><rect x="2" y="4" width="38" height="48" rx="6" fill="#2a333d"/><path d="M12 16 L30 40 M30 16 L12 40" stroke="#c0392b" stroke-width="6" stroke-linecap="round"/>
      <rect x="46" y="4" width="38" height="48" rx="6" fill="#2a333d"/><path d="M65 14 L65 40 M65 40 L56 30 M65 40 L74 30" stroke="#1f9d55" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="90" y="4" width="38" height="48" rx="6" fill="#2a333d"/><path d="M100 14 L118 36 M118 36 L106 34 M118 36 L116 24" stroke="#d99a17" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <b>IZNAD SAOBRAĆAJNE TRAKE</b><span>crveni ✕ = traka zabranjena · zelena ↓ = slobodna · žuta trepćuća kosa = obavezno pređi u traku na koju pokazuje (čl. 145)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 96 62"><rect x="4" y="4" width="40" height="54" rx="8" fill="#2a333d"/><circle cx="24" cy="20" r="11" fill="#c0392b"/><circle cx="24" cy="44" r="11" fill="#3a3f45"/>
      <rect x="50" y="14" width="40" height="34" rx="6" fill="#2a333d"/><path d="M58 31 L80 31 M80 31 L71 23 M80 31 L71 39" stroke="#1f9d55" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <b>USLOVNA ZELENA STRELICA</b><span>uz crveno/žuto: smeš u smeru strelice, ali propuštaš SVA vozila i pešake (čl. 143)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 96 60"><rect x="10" y="6" width="76" height="48" rx="8" fill="#2a333d"/>
      <circle cx="34" cy="30" r="15" fill="#c0392b"/><circle cx="62" cy="30" r="15" fill="#5a2320"/></svg>
    <b>PRUGA — DVA CRVENA</b><span>naizmenično trepću = najava voza, OBAVEZNO zaustavljanje (čl. 101)</span>
  </div>
</div>
` + anchor;
s = s.split(anchor).join(row);
fs.writeFileSync('build-explanations.mjs', s);
console.log('semafori posebni red ubačen');
