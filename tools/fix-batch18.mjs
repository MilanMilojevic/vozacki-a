import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const c = s.split(o).length - 1;
  if (c !== 1) { console.log('FAIL [' + label + '] count=' + c); fails++; return; }
  s = s.split(o).join(n); console.log('ok  [' + label + ']');
}
function repX(id, newText) {
  const anchor = 'X[' + id + '] = ';
  const i = s.indexOf(anchor);
  if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL [X' + id + '] anchor'); fails++; return; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; return; }
  s = s.slice(0, i) + 'X[' + id + '] = { x: ' + JSON.stringify(newText) + ' }' + s.slice(end);
  console.log('ok  [X' + id + ']');
}

repX(8944, 'SAOBRAĆAJNI ZNAKOVI su tri porodice: znakovi OPASNOSTI, IZRIČITIH NAREDBI i OBAVEŠTENJA (ZOBS čl. 135; dopunska tabla je sastavni deo znaka). Semafori i oznake na kolovozu jesu saobraćajna signalizacija, ali kao DRUGI njeni elementi (čl. 133) — nisu saobraćajni znakovi. Znaci koje daju policijski službenici uopšte nisu signalizacija: to su znaci i naredbe ovlašćenog lica, po kojima postupaš i kad su suprotni signalizaciji (čl. 166).');
repX(8947, 'Upozorenje na opasnost na određenom mestu ili delu puta i obaveštenje o prirodi te opasnosti daju znakovi OPASNOSTI (ZOBS čl. 135). Izričite naredbe zabranjuju i obavezuju, obaveštenja informišu — jedino znakovi opasnosti upozoravaju unapred.');
repX(8948, 'Potrebna obaveštenja o putu kojim se krećeš i druga korisna obaveštenja pružaju znakovi OBAVEŠTENJA (ZOBS čl. 135). Opasnosti upozoravaju, naredbe zabranjuju i obavezuju — kad znak samo informiše, to je znak obaveštenja.');
repX(10417, 'Na delu puta gde se izvode radovi saobraćaj regulišu najmanje DVA radnika određena od strane izvođača, zastavicama CRVENE i ZELENE boje: podignuta CRVENA = zabranjen prolaz, podignuta ZELENA = slobodan prolaz, za smer iz koga je zastavica podignuta (ZOBS čl. 166). Jedna zastavica sa "podignuto/spušteno" logikom nije propisani način.');

// kartica znakovi-porodice: imenuj roditeljsku porodicu za zabrane+obaveze
rep('<p style="text-align:center"><b>Dva oblika koja moraš da prepoznaš i naopako:</b></p>',
    '<p class="mut" style="text-align:center">Zabrane i obaveze su zajedno jedna zakonska porodica — znakovi IZRIČITIH NAREDBI (ZOBS čl. 135); porodice su dakle tri: opasnosti, izričite naredbe, obaveštenja.</p>\n<p style="text-align:center"><b>Dva oblika koja moraš da prepoznaš i naopako:</b></p>', 'card-porodice');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('4 teksta + kartica primenjeno');
