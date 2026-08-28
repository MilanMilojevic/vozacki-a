import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
const ids = [10711,10712,10713,10531,10222,10225,10400,8936,8937,8938,8939,8941,8944,8946,8947,8948,8949,10780,8950,10781,8952,10782,9007,10612,10841,9074,9202,11056,11057,9406,10417];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] već postoji'); process.exit(1); }
}
// 1) ukloni loše vezanu karticu: svetlosne oznake (163) nisu semafori
{
  const o = "BYSUB[163] = 'semafori';\n";
  const c = s.split(o).length - 1;
  if (c !== 1) { console.log('FAIL [bysub163] count=' + c); fails++; }
  else { s = s.split(o).join(''); console.log('ok  [bysub163 removed]'); }
}
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
// 2) tekstovi — TEK POSLE zamena računamo tačku umetanja (lekcija iz batch16!)
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const xBlock = `
// --- Sitne podoblasti (138/141/143/149/155-160/163/165), 31 pitanje — pisano pojedinačno
// (ZOBS čl. 41/71/84/87/111/132/134/135/155/166; Pravilnik o signalizaciji čl. 6/10/22/32/87) ---
X[10711] = { x: 'NASILNIČKA vožnja u NASELJU: prekoračenje za više od 90 km/h preko dozvoljene (ZOBS čl. 41). Van naselja granica je 100 km/h preko dozvoljene — pamti par 90/100, u naselju je strože.' };
X[10712] = { x: 'NASILNIČKA vožnja VAN naselja: prekoračenje za više od 100 km/h preko dozvoljene (ZOBS čl. 41); u naselju je granica 90 km/h preko dozvoljene.' };
X[10713] = { x: 'Nasilnička vožnja je i upravljanje u stanju POTPUNE alkoholisanosti — više od 2,00 mg/ml (ZOBS čl. 41). Teška i veoma teška alkoholisanost su kažnjive, ali tek potpuna (preko 2,00) čini vožnju nasilničkom.' };
X[10531] = { x: 'Motorno vozilo NE SME da vuče: motocikl, moped i laki i teški TRICIKL (ZOBS čl. 71 — spisak je izričit). Četvorocikli, putnička i teretna vozila smeju da se vuku po pravilima o vuči; dvotočkaši i tricikli ne — vučeni su nestabilni.' };
X[10222] = { x: 'Odredbe ZOBS-a primenjuju se I NA vozače tramvaja — osim kad to isključuju konstrukcione osobine tih vozila ili način njihovog kretanja (ZOBS čl. 84). Tramvaj se, na primer, ne može skloniti sa šina, ali pravila za vozače važe i za tramvajdžije.' };
X[10225] = { x: 'Životinje je ZABRANJENO voditi iz vozila ili sa vozila (ZOBS čl. 87) — bez izuzetka za put van naselja. Domaće životinje na putu vode lica koja idu uz njih i obezbeđuju ih da ne ugrožavaju saobraćaj.' };
X[10400] = { x: 'Žuto rotaciono/trepćuće svetlo (radovi, vanredni prevoz, prinudno zaustavljeno vozilo...) = POVEĆAJ OPREZNOST i prilagodi brzinu i način kretanja (ZOBS čl. 111). Ne traži ni obavezno zaustavljanje ni pomeranje s kolovoza — takve obaveze nose plava svetla i znaci ovlašćenih lica.' };
X[8936] = { x: 'Dužnost vozača je dvostruka: pridržavaj se ograničenja, zabrana i obaveza iz saobraćajne signalizacije I prilagodi kretanje opasnostima na koje upozoravaju znakovi opasnosti (ZOBS čl. 132). Mamci nude "sopstvenu procenu" umesto signalizacije — sopstvena procena nikad ne pobija znak; a znakovi obaveštenja ne izriču naredbe.' };
X[8937] = { x: 'Učesnicima u saobraćaju NIJE dozvoljeno postavljanje, uklanjanje ni izmena značenja signalizacije i opreme puta (ZOBS čl. 134: zabranjeno je neovlašćeno) — to radi samo ovlašćeni upravljač puta. Izuzetak za garaže i kolske prilaze ne postoji.' };
X[8938] = { x: 'Zaklanjanje ili umanjivanje uočljivosti signalizacije tablama, znakovima, svetlima, stubovima i sličnim predmetima je ZABRANJENO (ZOBS čl. 134) — bez izuzetaka, pa ni uz odobrenje lokalne samouprave.' };
X[8939] = { x: 'Predmeti koji podražavaju ili liče na signalizaciju, zaslepljuju učesnike ili odvraćaju pažnju u meri opasnoj za bezbednost — ZABRANJENI su (ZOBS čl. 134). Nikakvo odobrenje ni namena (garaža, prilaz) to ne legalizuje.' };
X[8941] = { x: 'Znakovi sa izmenljivim sadržajem poruka mogu biti STALNO aktivirani ili se aktiviraju PREMA POTREBI — i isključuju kad potrebe nema (ZOBS čl. 135). Ne moraju se uklanjati niti stalno davati poruku — u tome i jeste smisao izmenljivog sadržaja.' };
X[8944] = { x: 'SAOBRAĆAJNI ZNAKOVI su tri porodice: znakovi OPASNOSTI, IZRIČITIH NAREDBI i OBAVEŠTENJA (ZOBS čl. 135; dopunska tabla je sastavni deo znaka). Semafori, oznake na kolovozu i znaci policijskih službenika su DRUGE vrste signalizacije (čl. 133) — nisu saobraćajni znakovi.' };
X[8946] = { x: 'Zabrane, ograničenja i obaveze izriču znakovi IZRIČITIH NAREDBI (ZOBS čl. 135). Znakovi opasnosti upozoravaju, znakovi obaveštenja obaveštavaju — naredbe naređuju.' };
X[8947] = { x: 'Upozorenje na opasnost na određenom mestu ili delu puta i obaveštenje o prirodi te opasnosti daju znakovi OPASNOSTI (ZOBS čl. 135).' };
X[8948] = { x: 'Potrebna obaveštenja o putu kojim se krećeš i druga korisna obaveštenja pružaju znakovi OBAVEŠTENJA (ZOBS čl. 135).' };
X[8949] = { x: 'Dopunska tabla: SASTAVNI je deo saobraćajnog znaka uz koji je postavljena i BLIŽE ODREĐUJE njegovo značenje (ZOBS čl. 135) — zato idu oba odgovora. Nije samostalan tekstualni znak niti putokaz.' };
X[10780] = { x: 'Znakovi se postavljaju sa DESNE strane puta; kad je potrebna bolja uočljivost ili dodatno upozorenje, znak se postavlja I NA LEVOJ strani (Pravilnik o signalizaciji čl. 10) — zato idu oba odgovora. "Desna ili leva po izboru" je pogrešno: leva je uvek dodatak desnoj.' };
X[8950] = { x: 'Znakovi opasnosti postavljaju se, po pravilu, na 150 m do 250 m ISPRED opasnog mesta (Pravilnik o signalizaciji čl. 22) — dovoljno unapred da stigneš da reaguješ. Neposredno ispred mesta postavljaju se znakovi izričitih naredbi (čl. 32), ne opasnosti.' };
X[10781] = { x: 'Pravilo za znakove opasnosti: 150 m do 250 m ispred opasnog mesta (Pravilnik o signalizaciji čl. 22). Izuzeci postoje (uz dopunsku tablu o udaljenosti van naselja, odnosno uz obrazloženje u projektu u naselju), ali pravilo je 150-250 m.' };
X[8952] = { x: 'U NASELJU znak opasnosti sme da stoji i na manje od 150 m od opasnog mesta BEZ dopunske table — dovoljno je obrazloženje u saobraćajnom projektu (Pravilnik o signalizaciji čl. 22). Dopunska tabla sa udaljenošću je obavezna VAN naselja, kad je znak izvan opsega 150-250 m.' };
X[10782] = { x: 'VAN naselja znak opasnosti postavljen bliže od 150 m ili dalje od 250 m MORA imati dopunsku tablu sa UDALJENOŠĆU do opasnog mesta (Pravilnik o signalizaciji čl. 22) — da znaš koliko još ima. Vrsta opasnosti se vidi iz samog znaka, nju tabla ne ponavlja.' };
X[9007] = { x: 'Izričita naredba važi do PRVE NAREDNE RASKRSNICE, odnosno do znaka obaveštenja o prestanku naredbe (Pravilnik o signalizaciji čl. 32: posle svake raskrsnice znak se mora PONOVO postaviti ako naredba važi i dalje). Zato "do znaka o prestanku bez obzira na raskrsnicu" nije tačno — neponovljen znak prestaje da važi na raskrsnici.' };
X[10612] = { x: 'Naredba važi OD MESTA na kome je znak postavljen (Pravilnik o signalizaciji čl. 32 — znak stoji neposredno ispred mesta odakle nastaje obaveza; najava unapred ide uz dopunsku tablu sa udaljenošću). Trenutak kada si znak uočio nije merilo — merilo je mesto znaka.' };
X[10841] = { x: 'Znak izričite naredbe postavlja se NEPOSREDNO ISPRED mesta odakle nastaje obaveza (Pravilnik o signalizaciji čl. 32). Razdaljina 150-250 m važi za znakove OPASNOSTI (čl. 22) — naredba ne sme da "visi" daleko od mesta primene.' };
X[9074] = { x: 'Prethodna obaveštenja, obaveštenja o prestrojavanju i skretanju, potvrda pravca i označavanje objekata, terena i ulica — sve su to znakovi OBAVEŠTENJA (ZOBS čl. 135). Opasnosti upozoravaju, naredbe naređuju — obaveštenja vode i informišu.' };
X[9202] = { x: 'Dopunska tabla postavlja se ISPOD DONJE IVICE znaka na koji se odnosi (Pravilnik o signalizaciji čl. 6) — uvek ispod, nikad sa strane niti iznad.' };
X[11056] = { x: 'Ivicu KOLOVOZA obeležavaju: SMEROKAZI (crveni sa desne, beli sa leve strane), KATADIOPTERI (na ogradama i bočnim smetnjama) i ŠTAP za označavanje puta u zimskim uslovima (Pravilnik o signalizaciji čl. 87). Table stalnih prepreka i indikator obeležavaju PUTNE OBJEKTE — to je drugi par iz istog člana.' };
X[11057] = { x: 'PUTNE OBJEKTE obeležavaju: INDIKATOR za označavanje putnog objekta i zona izdignutih ivičnjaka i TABLE za označavanje stalnih prepreka unutar gabarita slobodnog profila puta (Pravilnik o signalizaciji čl. 87). Smerokazi, katadiopteri i zimski štap obeležavaju ivicu kolovoza.' };
X[9406] = { x: 'Kod radova na putu: NE SMEŠ da ometaš radnika koji obavlja radove na putu ili pored puta i DUŽAN si da ukloniš vozilo na zahtev izvođača radova — zahtev može biti i javni poziv (ZOBS čl. 155). Znaci radnika koga je odredio izvođač obavezuju te (čl. 166), ne samo postavljena signalizacija; a zahtev ne mora doći od policije.' };
X[10417] = { x: 'Radove reguliše najmanje DVA radnika izvođača, zastavicama CRVENE i ZELENE boje: podignuta CRVENA = zabranjen prolaz, podignuta ZELENA = slobodan prolaz, za smer iz koga je zastavica podignuta (ZOBS čl. 166). Jedna zastavica sa "podignuto/spušteno" logikom nije propisani način.' };

`;
s = s.slice(0, ti) + xBlock + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch18 (sitne podoblasti, 31) inserted');
