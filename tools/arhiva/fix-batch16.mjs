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

repX(9247, 'NE — oznake na kolovozu i trotoaru su POSEBNA vrsta saobraćajne signalizacije, ravnopravna sa znakovima: signalizaciju čine saobraćajni znakovi, oznake na kolovozu i trotoaru, semafori, kao i svetlosne i druge oznake na putu (ZOBS čl. 133). Oznake često prate znakove, ali same nisu znakovi.');
repX(10995, 'Po pravilu, oznake na putu su BELE boje (Pravilnik o signalizaciji čl. 59). Žuta je rezervisana za pobrojane izuzetke (zona radova, javni prevoz, elektronska naplata putarine, posebne namene, invalidska mesta), narandžasta ne postoji, a plava se javlja samo izuzetno — njome se smeju obeležiti delovi oznaka invalidskih parking mesta.');
repX(10996, 'Oznake za regulisanje kretanja vozila JAVNOG PREVOZA putnika su ŽUTE (Pravilnik o signalizaciji čl. 59) — otud žuta BUS traka. Jedan od pet žutih izuzetaka od belog pravila; plavom se, izuzetno, smeju obeležiti samo delovi invalidskih parking mesta.');
repX(10997, 'Oznake u ZONI RADOVA na putu su ŽUTE (Pravilnik o signalizaciji čl. 59) — privremeni režim se bojom jasno razlikuje od stalnih belih oznaka; plava tu nije predviđena. U zoni radova i znakovi opasnosti i izričitih naredbi dobijaju žutu osnovu (čl. 45).');
repX(10998, 'Traka za ELEKTRONSKU NAPLATU putarine obeležava se ŽUTOM bojom (Pravilnik o signalizaciji čl. 59). Žute izuzetke pamti kao celinu: radovi, javni prevoz, e-naplata, posebne namene, invalidska mesta — sve ostalo je belo, s tim što se plavom, izuzetno, smeju obeležiti samo delovi invalidskih parking mesta.');
repX(11040, 'Blizinu neisprekidane linije najavljuje razdelna LINIJA UPOZORENJA (Pravilnik o signalizaciji čl. 63). Njena poruka vozaču: uskoro puna linija — završi preticanje na vreme. Obična isprekidana samo razdvaja saobraćajne trake, a ivična označava ivicu površine kolovoza (čl. 64) — ništa ne najavljuje.');
repX(11041, 'Sve nabrojano — linija zaustavljanja, kosnik, graničnik, pešački prelaz i prelazi biciklističke staze — jesu POPREČNE oznake na putu (Pravilnik o signalizaciji čl. 66); obeležavaju se popreko kolovoza i mogu zahvatati jednu ili više saobraćajnih traka (čl. 65). Uzdužne su razdelne i ivične linije (čl. 62), a "ostale oznake" su strelice, natpisi, polja za usmeravanje i slično (čl. 67).');

// kartica: "udvojena kombinovana" nije jedna vrsta — Pravilnik razlikuje udvojenu i kombinovanu
rep('<b>―― - - udvojena kombinovana</b>', '<b>―― - - kombinovana</b>', 'card-kombinovana');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('7 tekstova + kartica primenjeno');
