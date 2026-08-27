import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function repX(id, newText) {
  const anchor = 'X[' + id + '] = ';
  const i = s.indexOf(anchor);
  if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL [X' + id + '] anchor'); fails++; return; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; return; }
  s = s.slice(0, i) + 'X[' + id + '] = { x: ' + JSON.stringify(newText) + ' }' + s.slice(end);
  console.log('ok  [X' + id + ']');
}
repX(9344, 'Isto značenje kao crveno+žuto bez strelica, samo suženo na smer strelice: ZABRANJEN prolaz u smeru označenom strelicom + nagoveštaj da će se uključiti zeleno (ZOBS čl. 142 t. 4; direkcioni semafor po čl. 138 reguliše kretanje po smerovima). Oba mamca nude "dozvoljen prolaz" — dok je na ovom znaku uključeno crveno, prolaz u smeru strelice je zabranjen.');
repX(9354, 'Zeleno svetlo sa strelicom (direkcioni semafor, ZOBS čl. 138) znači dozvoljen prolaz SAMO u smeru strelice (čl. 142 t. 3), inače važi kao obično zeleno. Mamac o propuštanju meša dva pravila: obavezu uz DODATNU zelenu strelicu (uslovni znak, čl. 143 — propuštaš vozila na putu na koji ulaziš i pešake, dok gori crveno ili žuto) i opšte propuštanje vozila iz suprotnog smera pri skretanju ulevo — nijedno nije značenje ovog znaka.');
repX(9379, 'Postojano žuto = ZABRANJEN prolaz, osim kada se vozilo ne može bezbedno zaustaviti ispred znaka (ZOBS čl. 142 t. 2). Žuto nikad ne znači "dozvoljen prolaz uz najavu crvenog" — takvo značenje ima trepćuće ZELENO, a žuto nije "požuri", nego "stani ako bezbedno možeš".');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('3 ispravke primenjene');
