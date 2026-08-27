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
repX(9477, 'I znaci za zaustavljanje vozila spadaju u tri znaka koja se smeju davati iz vozila, odnosno sa motocikla sa vidnim obeležjem policije (Pravilnik o znacima policijskih službenika čl. 2) — zajedno sa smanjenjem brzine i ubrzanjem kretanja. Uslov je vidno obeležje, ne prvenstvo prolaza.');
repX(9480, 'VIŠE uzastopnih KRATKIH zvižduka = neko je postupio protivno datom znaku, pravilima saobraćaja ili znakovima (Pravilnik o znacima policijskih službenika čl. 6). Par za pamćenje: jedan dug = "pažnja", više kratkih = "prekršaj" — a obavezu zaustavljanja pištaljka sama po sebi ne izriče.');
repX(10420, 'Znaci policijskog službenika daju se: RUKAMA i položajem tela, UREĐAJIMA za svetlosne i zvučne znakove i STOP TABLICOM (Pravilnik o znacima policijskih službenika čl. 1; ZOBS čl. 166). Zamke: usmeno se daju NAREDBE (ne znaci), zastavice koriste RADNICI na radovima na putu (ZOBS čl. 166), a znakovi sa izmenjivim sadržajem poruka su saobraćajna signalizacija, ne znaci policijskog službenika.');
repX(10422, 'Crveno i plavo naizmenično = vozilo POD PRATNJOM: propusti ih i omogući mimoilaženje/preticanje/obilaženje, PO POTREBI zaustavi ili ukloni vozilo s kolovoza, strogo se pridržavaj naredbi lica iz pratnje, a nastavi tek kad SVA vozila pod pratnjom prođu (Pravilnik o znacima policijskih službenika čl. 9 t. 1; ZOBS čl. 107). Oba mamca padaju: bezuslovno "zaustavi se" — zaustavljanje je samo PO POTREBI, a "smanji brzinu i nastavi" — obaveza je propuštanje, ne samo usporavanje.');
repX(10424, 'JEDNO plavo svetlo na vozilu s prvenstvom prolaza u kretanju = obrati pažnju, ustupi mu prvenstvo odnosno propusti ga, i PO POTREBI zaustavi ili ukloni svoje vozilo dok prođe (Pravilnik o znacima policijskih službenika čl. 9 t. 3). Jedno svetlo = samo to vozilo; dva svetla znače da obezbeđuje prolaz i vozilima iza sebe. Mamci: "smanji brzinu i nastavi" nije propisana obaveza, a bezuslovno "zaustavi se dok sva vozila prođu" greši dvostruko — zaustavljanje je samo po potrebi, a reč je o JEDNOM vozilu.');
repX(10431, 'Kad vozilo pod pratnjom ili s prvenstvom prolaza uz svoje posebne svetlosne znake daje i SVETLOSNI ZNAK UPOZORENJA (uzastopno/naizmenično paljenje dugih svetala), vozač NEPOSREDNO ISPRED mora ODMAH bezbedno da stane uz DESNU ivicu kolovoza, po mogućnosti van njega (ZOBS čl. 110; Pravilnik o znacima policijskih službenika čl. 10). Ni smanjenje brzine ni puko omogućavanje preticanja nisu dovoljni — znak je upućen lično tebi: odmah stani uz desnu ivicu i skloni se s putanje.');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('6 ispravki primenjeno');
