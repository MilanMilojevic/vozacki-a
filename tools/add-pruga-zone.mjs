import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = s.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  s = s.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// --- 1) PRUGA: vizuelni set znakova i uređaja ---
rep('<p><b>Prelaz bez branika i uredjaja:</b> zaustavi se, pogledaj oba smera, pređi tek kad si siguran da voz ne nailazi.</p>',
`<p><b>Prelaz bez branika i uredjaja:</b> zaustavi se, pogledaj oba smera, pređi tek kad si siguran da voz ne nailazi.</p>
<p style="margin-top:10px"><b>Šta ćeš videti na putu</b> — prepoznaj svaki znak:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="4" y="4" width="112" height="112" rx="8" fill="#fff" stroke="#c0392b" stroke-width="6"/>
      <path d="M26 26 L94 94 M94 26 L26 94" stroke="#111" stroke-width="9" stroke-linecap="round"/></svg>
    <b>ANDREJIN KRST — jedan kolosek</b><span>obeležava sam prelaz; postavlja se neposredno pred prugu</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="4" y="4" width="112" height="112" rx="8" fill="#fff" stroke="#c0392b" stroke-width="6"/>
      <path d="M26 34 L94 84 M94 34 L26 84 M26 56 L94 106 M94 56 L26 106" stroke="#111" stroke-width="8" stroke-linecap="round"/></svg>
    <b>DVOSTRUKI KRST — dva ili više koloseka</b><span>posle prvog voza može naići i drugi iz suprotnog smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="4" y="4" width="112" height="112" rx="8" fill="#fff" stroke="#c0392b" stroke-width="5"/>
      <rect x="18" y="24" width="84" height="18" rx="4" fill="#fff" stroke="#c0392b" stroke-width="5"/>
      <rect x="18" y="52" width="84" height="18" rx="4" fill="#fff" stroke="#c0392b" stroke-width="5"/>
      <rect x="18" y="80" width="84" height="18" rx="4" fill="#fff" stroke="#c0392b" stroke-width="5"/></svg>
    <b>KOSNICI — 240 · 160 · 80 m</b><span>tri crte = 240 m do pruge, dve = 160 m, jedna = 80 m (odbrojavanje)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="0" y="70" width="120" height="50" fill="#9aa7b4"/>
      <rect x="10" y="30" width="100" height="12" rx="4" fill="#c0392b"/><rect x="10" y="30" width="25" height="12" fill="#fff"/><rect x="60" y="30" width="25" height="12" fill="#fff"/>
      <circle cx="24" cy="58" r="9" fill="#c0392b"/><circle cx="52" cy="58" r="9" fill="#5a2320"/></svg>
    <b>BRANIK + DVA CRVENA</b><span>spušten ili se spušta branik, odnosno naizmenično trepću crvena svetla = obavezno stajanje</span>
  </div>
</div>`, 'pruga');

// --- 2) ZNAKOVI: princip "precrtano = kraj važenja" ---
rep('<p class="mut" style="text-align:center">Zabrane i obaveze su zajedno jedna zakonska porodica',
`<p style="margin-top:10px"><b>Zone i prestanak važenja</b> — jedan princip pokriva desetine znakova:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 110 130"><rect x="4" y="4" width="102" height="122" rx="8" fill="#fff" stroke="#2c6aa0" stroke-width="5"/>
      <circle cx="55" cy="52" r="30" fill="#fff" stroke="#c0392b" stroke-width="7"/><text x="55" y="63" text-anchor="middle" font-size="27" font-weight="bold" fill="#111">30</text>
      <text x="55" y="107" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">ZONA</text></svg>
    <b>POČETAK ZONE</b><span>od ovog mesta važi režim zone (npr. 30 km/h)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 130"><rect x="4" y="4" width="102" height="122" rx="8" fill="#fff" stroke="#7d8792" stroke-width="5"/>
      <circle cx="55" cy="52" r="30" fill="#fff" stroke="#7d8792" stroke-width="7"/><text x="55" y="63" text-anchor="middle" font-size="27" font-weight="bold" fill="#5b636b">30</text>
      <text x="55" y="107" text-anchor="middle" font-size="17" font-weight="bold" fill="#5b636b">ZONA</text>
      <path d="M14 118 L98 16" stroke="#c0392b" stroke-width="7" stroke-linecap="round"/></svg>
    <b>KRAJ ZONE</b><span>isti znak, precrtan kosom crtom = režim prestaje</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" fill="#fff" stroke="#111" stroke-width="4"/>
      <text x="55" y="70" text-anchor="middle" font-size="34" font-weight="bold" fill="#111">60</text>
      <path d="M22 88 L88 22 M30 96 L96 30 M14 80 L80 14" stroke="#111" stroke-width="4"/></svg>
    <b>PRESTANAK ZABRANE</b><span>bela podloga + kose crte preko znaka = ograničenje više ne važi</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 110"><rect x="4" y="18" width="102" height="74" rx="8" fill="#2c6aa0"/>
      <path d="M22 76 L36 34 L50 76 M60 34 L60 76 M60 34 L88 34 M60 55 L82 55" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>
    <b>AUTOPUT / MOTOPUT</b><span>početak — plava tabla; kraj — ista tabla precrtana crvenom crtom</span>
  </div>
</div>
<p class="mut" style="text-align:center">Zabrane i obaveze su zajedno jedna zakonska porodica`, 'zone');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('pruga + zone vizuali ubačeni');
