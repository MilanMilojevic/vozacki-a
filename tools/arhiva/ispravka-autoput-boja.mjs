import fs from 'node:fs';
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = s.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  s = s.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// ISPRAVKA ČINJENIČNE GREŠKE u objavljenoj kartici:
// autoput je ZELENA tabla (provereno na slikama pitanja 9155 i 9083), motoput je PLAVA (9162).
// Kartica je tvrdila da su oba plava, a i crtež je bio plav.
rep(`    <svg viewBox="0 0 110 110"><rect x="4" y="18" width="102" height="74" rx="8" fill="#2c6aa0"/>
      <path d="M22 76 L36 34 L50 76 M60 34 L60 76 M60 34 L88 34 M60 55 L82 55" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>
    <b>AUTOPUT / MOTOPUT</b><span>početak — plava tabla; kraj — ista tabla precrtana crvenom crtom</span>`,
`    <svg viewBox="0 0 220 110">
      <rect x="4" y="14" width="100" height="82" rx="8" fill="#1e8a3c"/>
      <path d="M34 88 L44 40 M74 88 L64 40 M24 62 L84 62" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="116" y="14" width="100" height="82" rx="8" fill="#2c6aa0"/>
      <path d="M140 74 L140 56 Q140 42 166 42 Q192 42 192 56 L192 74 Z" fill="#fff"/>
      <circle cx="150" cy="72" r="6" fill="#2c6aa0"/><circle cx="182" cy="72" r="6" fill="#2c6aa0"/></svg>
    <b>AUTOPUT / MOTOPUT</b><span>autoput — <b>ZELENA</b> tabla (dve trake i nadvožnjak); motoput — <b>PLAVA</b> tabla (automobil spreda). Kraj: ista tabla precrtana crvenom trakom</span>`, 'autoput-boja');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
console.log('boja autoputa ispravljena');
