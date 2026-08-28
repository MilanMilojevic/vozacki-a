import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const ids = [8252,8260,8261,8264,8265,8266,8272,8273,8274,8275,8276,8277,8278,8281,8282,8283];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] postoji'); process.exit(1); }
}
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const block = `
// --- Kaznene mere, podtura B: srednja klasa (novčani raspon + poeni), 16 pitanja — bez iznosa ---
X[8252] = { x: 'Obilaženje vozila koje se zaustavilo ispred pešačkog prelaza da propusti pešake u ispitnoj bazi je u SREDNJOJ klasi (novčani raspon + kazneni poeni). Pazi: po važećem zakonu ovo je preseljeno MEĐU NAJTEŽE prekršaje (čl. 330) — iza zaustavljenog vozila često izlazi pešak koga ne vidiš. U vožnji se ponašaj kao da je najteži prekršaj, jer po aktuelnom zakonu i jeste.' };
X[8260] = { x: 'Noću bez uključenih ZADNJIH pozicionih svetala = SREDNJA klasa (novčani raspon + poeni). Nevidljiv si otpozadi — realan rizik naletanja; ipak blaže od vožnje bez IJEDNOG svetla na neosvetljenom putu, koja je najteža klasa (čl. 330).' };
X[8261] = { x: 'Na neosvetljenom putu noću SAMO sa pozicionim svetlima (bez svetala za osvetljavanje puta) = SREDNJA klasa. Poziciona svetla te čine vidljivim, ali put ne osvetljavaju — voziš naslepo; bez ijednog svetla uopšte bila bi najteža klasa (čl. 330).' };
X[8264] = { x: 'Uključivanje na autoput mimo prilaznog puta namenjenog za uključenje = SREDNJA klasa (novčani raspon + poeni). Prilazni put postoji da ubrzaš i bezbedno se upišeš u tok — upad sa strane iznenađuje vozila u punoj brzini.' };
X[8265] = { x: 'Nepropuštanje vozila SA PRVENSTVOM PROLAZA = SREDNJA klasa (novčani raspon + poeni). Dužnost propuštanja propisuje ZOBS čl. 109 — hitna vozila gube sekunde koje nekoga koštaju života.' };
X[8266] = { x: 'Ne zaustaviti se kada policijsko vozilo s prvenstvom prolaza IZA tebe daje i svetlosni znak upozorenja = SREDNJA klasa, sa više poena nego obično nepropuštanje. Sama dužnost je iz ZOBS čl. 110: odmah bezbedno stani uz desnu ivicu — znak je upućen lično tebi.' };
X[8272] = { x: 'Zona škole u naselju (ograničenje 30 km/h): 85 km/h je prekoračenje za 55 — veliko, ali ispod praga od 60 km/h preko koga zakon u zonama prelazi u najtežu klasu (čl. 330) — zato SREDNJA klasa sa poenima. Uporedi: 100 km/h u istoj zoni (prekoračenje 70) je najteža klasa.' };
X[8273] = { x: 'Napustiti mesto nezgode SA MATERIJALNOM ŠTETOM pre završetka uviđaja (kada ga učesnik zahteva) = SREDNJA klasa sa malo poena. Kontrast: napuštanje nezgode sa POVREĐENIMA je najteža klasa (čl. 330) — težina kazne prati težinu posledica.' };
X[8274] = { x: 'Vožnja sa dozvolom kojoj je rok istekao PRE VIŠE OD ŠEST MESECI = SREDNJA klasa (novčani raspon + poeni). Šest meseci je zakonska prekretnica: do šest meseci je blaži propust, preko toga ozbiljniji — uz kaznu tada ide i zaštitna mera zabrane.' };
X[8275] = { x: 'Korišćenje DVE vozačke dozvole izdate od dve države istovremeno = SREDNJA klasa (novčani raspon, bez poena). Dozvola sme postojati samo jedna — dupla otvara prostor za izigravanje evidencije kazni i poena.' };
X[8276] = { x: 'Korišćenje obrasca dozvole čiji si NESTANAK sam PRIJAVIO = SREDNJA klasa sa poenima. Prijavom nestanka taj obrazac je prestao da važi — vožnja s njim je vožnja sa nevažećom ispravom.' };
X[8277] = { x: 'Vožnja pod dejstvom PSIHOAKTIVNIH SUPSTANCI u ispitnoj bazi je u SREDNJOJ klasi sa visokim poenima. Suština je stroža od klase: nulta tolerancija — vozač ne sme biti ni pod kakvim dejstvom psihoaktivnih supstanci (ZOBS čl. 187), a zakon je kažnjavanje droge za volanom vremenom samo pooštravao.' };
X[8278] = { x: 'Sadržina od 1,80 mg/ml je "veoma teška alkoholisanost" (kategorije iz ZOBS čl. 187). U ispitnoj bazi ovo je SREDNJA klasa sa mnogo poena; po važećem zakonu ceo opseg preko 1,20 mg/ml spada u NAJTEŽU klasu (čl. 330) — u svakom slučaju: skoro vrh lestvice, odmah ispod nasilničke vožnje (preko 2,00).' };
X[8281] = { x: 'Vlasnik koji policiji NE DA PODATKE o tome kome je dao vozilo u ispitnoj bazi je u SREDNJOJ klasi (bez poena — nije prekršaj u vožnji). Danas je ta dužnost u ZOBS čl. 247 (na zahtev policije vlasnik otkriva identitet vozača), a zakon je odbijanje vremenom pooštrio.' };
X[8282] = { x: 'Učestvovanje u saobraćaju vozilom koje NIJE UPISANO u jedinstveni registar = SREDNJA klasa sa poenima, a uz kaznu ide i zaštitna mera zabrane upravljanja. Neregistrovano vozilo je van sistema: bez pregleda, bez osiguranja, bez odgovornosti.' };
X[8283] = { x: 'Ne omogućiti KONTROLNI tehnički pregled na koji je vozilo upućeno = SREDNJA klasa sa poenima. Kontrolni pregled je vanredna provera tehničke ispravnosti — izbegavanje provere se tretira ozbiljno, jer se u ispravnost već sumnja.' };

`;
s = s.slice(0, ti) + block + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch19b (kaznene B, 16) inserted');
