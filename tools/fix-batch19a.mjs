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

repX(8225, 'Opšti okvir zaštitne mere zabrane upravljanja: NAJMANJE 30 DANA, NAJVIŠE GODINU DANA (Zakon o prekršajima čl. 58). ZOBS uz to za pojedine prekršaje propisuje strože minimume trajanja (čl. 338). Oba pogrešna odgovora sužavaju okvir — pamti celu lestvicu: od 30 dana do jedne godine.');
repX(8228, 'Vožnja bez vozačke dozvole za kategoriju kojom upravljaš (a nije reč o isteklom roku!) u ispitnoj bazi je u NAJTEŽOJ prekršajnoj klasi — zatvor ili najviša novčana kazna uz najviše kaznenih poena (režim ZOBS čl. 330). Logika: vozač koji za to vozilo nikad nije položio je neproveren rizik za sve; istek roka je poseban, blaži slučaj.');
repX(8239, 'U zoni usporenog saobraćaja sme se najviše 10 km/h — brzinom kretanja pešaka (ZOBS čl. 161). Vožnja od 80 km/h je prekoračenje za 70 km/h, a čl. 330 prekoračenje za više od 50 km/h u ovoj zoni svrstava u NAJTEŽU klasu — zatvor ili najviša novčana kazna uz najviše poena. Zone postoje baš zato što su tamo pešaci i deca na kolovozu.');
repX(8240, 'Zona škole u naselju: ograničenje 30 km/h, i to od 7 do 21 čas, osim ako znak odredi drugačije (ZOBS čl. 163) — u 14:00 zona svakako važi. Vožnja od 100 km/h je prekoračenje za 70 km/h, a čl. 330 prekoračenje za više od 60 km/h u zoni "30" i zoni škole svrstava u NAJTEŽU klasu.');
repX(8247, 'Vožnja ZAUSTAVNOM trakom autoputa je izričito zabranjena (ZOBS čl. 104: zaustavnom trakom zabranjeno je kretanje vozila) i u ispitnoj bazi je razvrstana u NAJTEŽU klasu — zatvor ili najviša novčana kazna uz najviše kaznenih poena. Zaustavna traka je jedini prostor za nuždu i intervencije — vozilo koje njome vozi udara u zaustavljene i blokira pomoć.');
repX(8340, 'Kada vozač koji je učinio prekršaj NIJE identifikovan, vlasnik vozila odgovara što je OMOGUĆIO da se njegovim vozilom učini prekršaj — za propust nadzora nad vozilom, ne za sam prekršaj (zato su i "odgovoran za taj prekršaj" i "nije odgovoran" pogrešni). Napomena: ovo je pravilo ranijeg čl. 320 ZOBS; po izmenama iz 2018. vlasnik danas odgovara ako na zahtev policije ne otkrije identitet vozača — poenta je ista: vozilo je tvoja odgovornost i kad ga daš drugome.');

// kartica: pošten vrh lestvice + izmeštanje zaustavne trake + probna dozvola + čl. 58
rep(`<tr><td><b>Najteža</b> (ZOBS čl. 330)</td><td>zatvor ILI najviša novčana kazna + najviše kaznenih poena</td>
<td>vožnja bez dozvole; vožnja za vreme isključenja ili zabrane; teška alkoholisanost i odbijanje testa;
ekstremna prekoračenja brzine (naročito u zonama); noću bez ijednog svetla; prolaz na crveno preko prelaza sa pešacima;
napuštanje nezgode sa povređenima; vožnja zaustavnom trakom autoputa</td></tr>`,
`<tr><td><b>Vrh: nasilnička vožnja</b> (čl. 329)</td><td>zatvor I novčana kazna ZAJEDNO + najviše kaznenih poena + najduža obavezna zabrana</td>
<td>gruba, bezobzirna vožnja (čl. 41): potpuna alkoholisanost (preko 2,00 mg/ml), dva prolaska na crveno u 10 minuta,
preticanje kolone preko pune linije, najekstremnija prekoračenja brzine</td></tr>
<tr><td><b>Najteža klasa prekršaja</b> (čl. 330)</td><td>zatvor ILI najviša novčana kazna + visoki kazneni poeni</td>
<td>vožnja bez dozvole; vožnja za vreme isključenja ili zabrane; odbijanje alko/droga testa;
prekoračenja preko zakonskih pragova u zonama; noću bez ijednog svetla; prolaz na crveno preko prelaza sa pešacima;
napuštanje nezgode sa povređenima. (Ispitna baza ovde svrstava i poneki prekršaj koji su kasnije izmene zakona
preselile u drugu klasu — npr. zaustavnu traku autoputa.)</td></tr>`, 'card-vrh');

rep('kad ih skupiš <b>18</b>, MUP ti ODUZIMA vozačku dozvolu —\nzakon to zove "ne upravlja savesno i na propisan način" (čl. 197).',
    'kad ih skupiš <b>18</b>, MUP ti ODUZIMA vozačku dozvolu —\nzakon to zove "ne upravlja savesno i na propisan način" (čl. 197); za PROBNU dozvolu prag je već <b>9</b> poena.', 'card-probna');

rep('opšti okvir trajanja: od 30 dana do godinu dana.</p>',
    'opšti okvir trajanja: od 30 dana do jedne godine (Zakon o prekršajima čl. 58).</p>', 'card-cl58');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('19a ispravke primenjene');
