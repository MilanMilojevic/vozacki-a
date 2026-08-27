import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function repX(id, newText) {
  const anchor = 'X[' + id + '] = ';
  const i = s.lastIndexOf(anchor);
  if (i < 0) { console.log('FAIL [X' + id + ']'); fails++; return; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; return; }
  s = s.slice(0, i) + 'X[' + id + '] = { x: ' + JSON.stringify(newText) + ' }' + s.slice(end);
  console.log('ok  [X' + id + ']');
}
repX(8413, 'Dozvola istekla VIŠE OD ŠEST meseci: u ispitnoj bazi mera se IZRIČE — preko šest meseci prestaje "administrativni zaborav": predugo voziš bez periodične provere uslova za upravljanje. Pazi: po važećem zakonu ovaj prekršaj (čl. 178) nije na listi obavezne mere iz čl. 338 — danas je to teži novčani prekršaj bez obavezne zabrane (sud je može izreći samo izuzetno).');
repX(8418, 'DETE MLAĐE OD 12 GODINA U KRILU vozača: mera se IZRIČE. Dete u vozačevom krilu je dete "na mestu vozača" — najteža kaznena klasa (ZOBS čl. 330), koja uz kaznu obavezno nosi i zabranu upravljanja. Vazdušni jastuk i udar za dete u krilu su smrtonosni.');
repX(8422, 'Dozvola istekla NAJVIŠE ŠEST meseci: kazna DA (blaga), zaštitna mera NE — do šest meseci zakon to tretira kao administrativni propust. Preko šest meseci u ispitnoj bazi ide i mera (po važećem zakonu ni tada nije obavezna — ali prekršaj jeste teži).');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('19d ispravke primenjene');
