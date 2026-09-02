// Tamna tema: elementi nacrtani DIREKTNO na providnoj pozadini kartice (#333 / #334155)
// imali su kontrast ~1.2:1 na tamnoj podlozi — praktično nevidljivi. Prelaze na
// currentColor, pa nasleđuju boju teksta kartice (--ink) i rade na obe teme.
// NE diraju se vozila u scenama (crtaju se na nacrtanom kolovozu) ni BUS natpis
// (na nacrtanoj narandžastoj podlozi).
import fs from 'node:fs';
let t = fs.readFileSync('../build-explanations.mjs', 'utf8');
let pao = 0;
const rep = (o, n, br, ime) => {
  const c = t.split(o).length - 1;
  if (c !== br) { console.log(`FAIL [${ime}] očekivano ${br}, nađeno ${c}`); pao++; return; }
  t = t.split(o).join(n);
  console.log(`ok [${ime}] x${br}`);
};

// slicni-pojmovi: motka tramvaja
rep('<line x1="60" y1="32" x2="52" y2="10" stroke="#333" stroke-width="2"/>',
    '<line x1="60" y1="32" x2="52" y2="10" stroke="currentColor" stroke-width="2"/>', 1, 'tramvaj motka');
// slicni-pojmovi: dve motke trolejbusa
rep('<line x1="66" y1="30" x2="50" y2="10" stroke="#333" stroke-width="2"/>',
    '<line x1="66" y1="30" x2="50" y2="10" stroke="currentColor" stroke-width="2"/>', 1, 'trolejbus motka 1');
rep('<line x1="74" y1="30" x2="58" y2="10" stroke="#333" stroke-width="2"/>',
    '<line x1="74" y1="30" x2="58" y2="10" stroke="currentColor" stroke-width="2"/>', 1, 'trolejbus motka 2');
// slicni-pojmovi: točkovi trolejbusa i autobusa (isti par, dva crteža)
rep('<circle cx="32" cy="70" r="8" fill="#333"/><circle cx="92" cy="70" r="8" fill="#333"/>',
    '<circle cx="32" cy="70" r="8" fill="currentColor"/><circle cx="92" cy="70" r="8" fill="currentColor"/>', 2, 'točkovi');
// policajac-znaci, crtež „rampa": glava, ruka, šaka i natpis
rep('<circle cx="150" cy="80" r="14" fill="#334155"/>',
    '<circle cx="150" cy="80" r="14" fill="currentColor"/>', 1, 'policajac glava');
rep('stroke="#334155" stroke-width="8" stroke-linecap="round"',
    'stroke="currentColor" stroke-width="8" stroke-linecap="round"', 1, 'policajac ruka');
rep('<rect x="312" y="70" width="26" height="20" rx="6" fill="#334155"/>',
    '<rect x="312" y="70" width="26" height="20" rx="6" fill="currentColor"/>', 1, 'policajac šaka');
rep('fill="#334155">smer predručene ruke</text>',
    'fill="currentColor">smer predručene ruke</text>', 1, 'natpis');

if (pao) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', t);
console.log('--- upisano u build-explanations.mjs ---');
