import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const ids = [9339,9340,9341,9342,9343,9344,9349,9354,9355,9356,9362,9365,9366,9367,9369,9378,9379,9383,9385,11055];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] već postoji'); process.exit(1); }
}
const xBlock = `
// --- Semafori (sub 162), 20 tekstualnih pitanja — pisano pojedinačno (ZOBS čl. 136-147) ---
X[9339] = { x: 'Zakon obe namene navodi u istoj rečenici: semafori se upotrebljavaju "za regulisanje saobraćaja i označavanje radova i prepreka na putu" (ZOBS čl. 136). Obaveštenja i poruke sa izmenjivim sadržajem daju drugi uređaji, a vozila se semaforima ne označavaju.' };
X[9340] = { x: 'Svetlosne saobraćajne znakove emituju SEMAFORI (ZOBS čl. 136). Svetlosne oznake na putu i znakovi sa izmenljivim sadržajem poruka su druge kategorije signalizacije — nisu uređaji za davanje svetlosnih saobraćajnih znakova.' };
X[9341] = { x: 'Crveno svetlo = ZABRANJEN PROLAZ, bez ikakvog izuzetka (ZOBS čl. 142 t. 1). Izuzetak "osim kada se vozilo ne može bezbedno zaustaviti" važi za ŽUTO svetlo (t. 2) — to je glavni mamac; "prolaz uz povećanu opreznost" je trepćuće žuto.' };
X[9342] = { x: 'Zeleno svetlo = DOZVOLJEN PROLAZ (ZOBS čl. 142 t. 3). "Povećana opreznost" je značenje trepćućeg žutog, a zabrana je crveno — samo zapamti da pri skretanju i dalje propuštaš pešake na prelazu.' };
X[9343] = { x: 'Crveno + žuto ISTOVREMENO = i dalje ZABRANJEN prolaz + nagoveštaj da će se uključiti zeleno (ZOBS čl. 142 t. 4) — "pripremi se", ali kretanje još nije dozvoljeno. Najava crvenog ovom kombinacijom ne postoji: žuto uz crveno se pali samo pre zelenog (čl. 141).' };
X[9344] = { x: 'Isto značenje kao crveno+žuto bez strelica, samo suženo na smer strelice: ZABRANJEN prolaz u tom smeru + nagoveštaj zelenog (ZOBS čl. 142 t. 4; direkcioni semafor po čl. 138 reguliše smerove). Dok crveno gori, nikakav prolaz nije dozvoljen.' };
X[9349] = { x: 'Trepćuće zeleno sa strelicom = DOZVOLJEN prolaz u smeru strelice + nagoveštaj skorog prestanka: sledi žuto, pa crveno (ZOBS čl. 142 t. 6; smerovi po čl. 138). Trepćuće zeleno nikad ne znači zabranu — to je poslednji deo zelene faze.' };
X[9354] = { x: 'Zeleno sa strelicom (direkcioni semafor) = dozvoljen prolaz SAMO u smeru strelice (ZOBS čl. 138 i čl. 142 t. 3), inače kao obično zeleno. Mamac sa "moraš propustiti sva vozila" opisuje DODATNU zelenu strelicu (uslovni znak, čl. 143) koja gori uz crveno/žuto — to je drugi uređaj.' };
X[9355] = { x: 'Trepćuće žuto = obaveza za SVE učesnike da se kreću uz povećanu opreznost (ZOBS čl. 142 t. 5) — semafor tada ništa ne zabranjuje, raskrsnicom vladaju znakovi i pravila prvenstva. Zabrana sa izuzetkom je značenje POSTOJANOG žutog.' };
X[9356] = { x: 'Trepćuće zeleno = prolaz i dalje DOZVOLJEN + nagoveštaj skorog prestanka: uključiće se žuto, pa crveno (ZOBS čl. 142 t. 6). Zabrane tu nema — to je najava kraja zelene faze.' };
X[9362] = { x: 'Žuto sa strelicom = ZABRANJEN prolaz u smeru strelice, OSIM ako se vozilo ne može bezbedno zaustaviti ispred znaka (ZOBS čl. 142 t. 2; smerovi po čl. 138). Žuto nikad ne znači "dozvoljen prolaz uz najavu crvenog" — žuto je zabrana sa jednim izuzetkom.' };
X[9365] = { x: 'Crveno sa strelicom = ZABRANJEN prolaz u smeru strelice, BEZ izuzetka (ZOBS čl. 142 t. 1; smerovi po čl. 138). Izuzetak "ne može bezbedno da se zaustavi" pripada žutom svetlu — kod crvenog ne postoji.' };
X[9366] = { x: 'Trepćuće žuto (i sa strelicom) = obaveza povećane opreznosti za sve učesnike (ZOBS čl. 142 t. 5) — ne zabranjuje prolaz. Par za pamćenje: POSTOJANO žuto = zabrana s izuzetkom; TREPĆUĆE žuto = oprez.' };
X[9367] = { x: 'Zelena strelica dodata semaforu (uslovni znak) dozvoljava prolaz SAMO u smeru strelice dok gori crveno ili žuto — ali uz obavezu da propustiš pešake koji prelaze kolovoz i SVA vozila na putu na koji ulaziš (ZOBS čl. 143). Uslovni prolaz znači: bez ikakvog prvenstva; ne važi samo za javni prevoz.' };
X[9369] = { x: 'Vertikalni raspored: CRVENO GORE, žuto u sredini, zeleno dole (ZOBS čl. 139). Pomoć za pamćenje: što opasnije, to više — crveno je na vrhu.' };
X[9378] = { x: 'Horizontalni raspored (kada je semafor iznad saobraćajne trake): CRVENO LEVO, žuto u sredini, zeleno desno (ZOBS čl. 139). Isto pravilo kao kod vertikale, samo "gore" postaje "levo".' };
X[9379] = { x: 'Postojano žuto = ZABRANJEN prolaz, osim kada se vozilo ne može bezbedno zaustaviti ispred znaka (ZOBS čl. 142 t. 2). "Dozvoljen prolaz uz najavu crvenog" ne postoji u zakonu — žuto nije "požuri", nego "stani ako bezbedno možeš".' };
X[9383] = { x: 'Uređaji za tramvaje daju BELA svetla u obliku crta: POLOŽENA (vodoravna) crta = ZABRANA saobraćaja tramvaja, a uspravna ili kosa = slobodan prolaz u odgovarajućem smeru (ZOBS čl. 147). Položena crta = "spuštena rampa".' };
X[9385] = { x: 'Tramvajski svetlosni znakovi važe i za vozila javnog prevoza putnika, ali SAMO kada se ona kreću trakom kojom se kreću i tramvaji (ZOBS čl. 147). Mamac: traka rezervisana za javni prevoz na kojoj NEMA tramvaja ne potpada — uslov je zajednička traka sa tramvajima.' };
X[11055] = { x: 'Uspravna ili kosa bela crta = SLOBODAN PROLAZ u odgovarajućem smeru (ZOBS čl. 147); zabrana je položena crta. Crta pokazuje smer u kome je prolaz dozvoljen, a ne pravac pružanja šina.' };

`;
s = s.slice(0, ti) + xBlock + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch15 (semafori, 20) inserted');
