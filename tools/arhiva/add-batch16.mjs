import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const ids = [9244,9247,9262,9286,10994,10995,10996,10997,10998,11000,11001,11004,11006,11011,11040,11041,11042,11051];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] već postoji'); process.exit(1); }
}

// 1) ispravka kartice: red "Boje" — uklonjene tvrdnje neproverljive u važećim propisima
const oldBoje = '<p><b>Boje:</b> oznake su po pravilu BELE; ŽUTE oznake obeležavaju privremeni režim (radovi) i tada VAŽE UMESTO belih; žuta ivična linija = zabrana zaustavljanja/parkiranja sa te strane; BUS traka se obeležava žutom.</p>';
const newBoje = '<p><b>Boje (Pravilnik o signalizaciji čl. 59):</b> oznake su po pravilu BELE; ŽUTE su izuzeci — zona radova, javni prevoz (BUS traka), elektronska naplata putarine, površine za posebne namene (mesta zabrane zaustavljanja/parkiranja, stajališta, taksi) i invalidska parking mesta (čiji se delovi smeju obeležiti i plavom).</p>';
{
  const c = s.split(oldBoje).length - 1;
  if (c !== 1) { console.log('FAIL [card-boje] count=' + c); fails++; }
  else { s = s.split(oldBoje).join(newBoje); console.log('ok  [card-boje]'); }
}

const xBlock = `
// --- Oznake na kolovozu (sub 161), 18 tekstualnih pitanja — pisano pojedinačno
// (Pravilnik o saobraćajnoj signalizaciji čl. 58-66, ZOBS čl. 133; verbatim provereno u scratchpad tekstovima) ---
X[9244] = { x: 'Linija koja razdvaja kolovoz na kolovozne, odnosno saobraćajne trake je RAZDELNA linija (Pravilnik o signalizaciji čl. 63). Ivična linija označava ivicu kolovoza, a linija upozorenja najavljuje blizinu neisprekidane — obe su mamci iz susednih definicija.' };
X[9247] = { x: 'NE — oznake na kolovozu i trotoaru su POSEBNA vrsta saobraćajne signalizacije, ravnopravna sa znakovima: signalizaciju čine saobraćajni znakovi, oznake na kolovozu i trotoaru, semafori i svetlosne oznake na putu (ZOBS čl. 133). Oznake često prate znakove, ali same nisu znakovi.' };
X[9262] = { x: 'Udvojena ISPREKIDANA razdelna linija obeležava saobraćajnu traku sa IZMENLJIVIM smerom kretanja, na kojoj je saobraćaj regulisan semaforima iznad trake (Pravilnik o signalizaciji čl. 63) — zato idu OBA odgovora zajedno. Takva traka nije "za preticanje": kome je u kom trenutku dozvoljena, određuje semafor iznad nje.' };
X[9286] = { x: 'Na kolovozu pored pešačkog prelaza u blizini škole ispisuje se natpis "ŠKOLA" (Pravilnik o signalizaciji). "Zona škole" je naziv saobraćajnog ZNAKA (III-28), a natpis "DECA NA PUTU" ne postoji — na asfaltu piše samo ŠKOLA.' };
X[10994] = { x: 'Površine za POSEBNE NAMENE (mesta zabrane zaustavljanja/parkiranja, autobuska stajališta, taksi mesta) obeležavaju se ŽUTOM bojom — jedan od izuzetaka od pravila da su oznake bele (Pravilnik o signalizaciji čl. 59). Plavom se, izuzetno, smeju obeležiti samo delovi oznaka invalidskih parking mesta.' };
X[10995] = { x: 'Po pravilu, oznake na putu su BELE boje (Pravilnik o signalizaciji čl. 59). Žuta je rezervisana za pobrojane izuzetke (zona radova, javni prevoz, elektronska naplata putarine, posebne namene, invalidska mesta), a narandžasta ne postoji.' };
X[10996] = { x: 'Oznake za regulisanje kretanja vozila JAVNOG PREVOZA putnika su ŽUTE (Pravilnik o signalizaciji čl. 59) — otud žuta BUS traka. Jedan od pet žutih izuzetaka od belog pravila.' };
X[10997] = { x: 'Oznake u ZONI RADOVA na putu su ŽUTE (Pravilnik o signalizaciji čl. 59) — privremeni režim se bojom jasno razlikuje od stalnih belih oznaka. U zoni radova i znakovi opasnosti i izričitih naredbi dobijaju žutu osnovu (čl. 45).' };
X[10998] = { x: 'Traka za ELEKTRONSKU NAPLATU putarine obeležava se ŽUTOM bojom (Pravilnik o signalizaciji čl. 59). Žute izuzetke pamti kao celinu: radovi, javni prevoz, e-naplata, posebne namene, invalidska mesta — sve ostalo je belo.' };
X[11000] = { x: 'Razdelna NEISPREKIDANA linija = zabrana prelaska preko nje I zabrana kretanja po njoj, bezuslovno (Pravilnik o signalizaciji čl. 63) — ne zavisi od znaka "Zabrana preticanja". Mesto zaustavljanja označava poprečna linija zaustavljanja, ne razdelna.' };
X[11001] = { x: 'Linija vodilja = razdelna KRATKA ISPREKIDANA linija kojom se vozila VODE KROZ RASKRSNICU (Pravilnik o signalizaciji čl. 63). Druga dva odgovora opisuju neisprekidanu, odnosno kombinovanu liniju — druge vrste razdelnih linija.' };
X[11004] = { x: 'Kombinovana linija (neisprekidana i isprekidana uporedo): zabrana važi za vozila u čijoj je traci NEISPREKIDANA linija bliža desnoj ivici kolovoza (Pravilnik o signalizaciji čl. 63). Praktično: gledaj liniju BLIŽU sebi — puna uz tebe = ne smeš preko; isprekidana uz tebe = smeš.' };
X[11006] = { x: 'Kombinovana linija DOZVOLJAVA prelazak vozilima u čijoj je traci ISPREKIDANA linija bliža desnoj ivici kolovoza (Pravilnik o signalizaciji čl. 63) — isprekidana uz tebe = smeš, puna uz tebe = zabrana. Povlači se tamo gde preglednost dopušta preticanje samo u jednom smeru, zato jedna strana sme, a druga ne.' };
X[11011] = { x: 'Linija koja označava IVICU površine kolovoza je IVIČNA linija (Pravilnik o signalizaciji čl. 64). Razdelna deli trake unutar kolovoza, a linija upozorenja najavljuje blizinu neisprekidane.' };
X[11040] = { x: 'Blizinu neisprekidane linije najavljuje razdelna LINIJA UPOZORENJA (Pravilnik o signalizaciji čl. 63). Njena poruka vozaču: uskoro puna linija — završi preticanje na vreme. Obična isprekidana samo razdvaja saobraćajne trake.' };
X[11041] = { x: 'Sve nabrojano — linija zaustavljanja, kosnik, graničnik, pešački prelaz i prelazi biciklističke staze — jesu POPREČNE oznake na putu (Pravilnik o signalizaciji čl. 66): pružaju se popreko kolovoza, preko jedne ili više traka. Uzdužne su razdelne i ivične linije (čl. 62).' };
X[11042] = { x: 'Neisprekidana linija zaustavljanja ispred SEMAFORA obavezuje na zaustavljanje SAMO kada ti je svetlosnim znakom prolaz zabranjen (Pravilnik o signalizaciji) — na zeleno prolaziš bez zaustavljanja. Ista linija ispred znaka "Zabrana prolaska bez zaustavljanja" (carina, policija, putarina) znači bezuslovno zaustavljanje.' };
X[11051] = { x: 'Linija zaustavljanja ispred znaka "Zabrana prolaska bez zaustavljanja" (carina, policija, naplatno mesto) = MORAŠ zaustaviti vozilo, bezuslovno (Pravilnik o signalizaciji). Rampa ili znak ovlašćenog lica NISU uslov — zaustavljanje nalažu sami znak i linija.' };

`;
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
s = s.slice(0, ti) + xBlock + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch16 (oznake, 18) inserted + card boje fixed');
