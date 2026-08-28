import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const ids = [8225,8228,8229,8230,8231,8232,8233,8239,8240,8241,8242,8244,8247,8340];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] postoji'); process.exit(1); }
}
if (s.includes("'kaznene-klase'")) { console.log('FAIL: kartica postoji'); process.exit(1); }
console.log('BYSUB[182] ranije:', /BYSUB\[182\]/.test(s) ? 'POSTOJI — biće pregažen' : 'nema');
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const block = `
// --- Kaznene mere (sub 182) — kartica + podtura A: najteža klasa (ZOBS čl. 330), 14 pitanja ---
// PRISTUP (Milan): BEZ dinarskih iznosa u našim tekstovima — iznosi se menjaju izmenama zakona
// (u ovoj kopiji ZOBS-a čl. 332 već ima drugačiji raspon od ispitne baze!); učimo KLASE i logiku.
CARDS['kaznene-klase'] = {
  title: 'Kaznene klase — logika umesto iznosa',
  html: \`
<p><b>Za ispit, prvo ovo:</b> u zvaničnom šablonu ispita za A kategoriju ova oblast
<b>nema nijedno pitanje</b> (provereno na 4 zvanična izvlačenja). Uči je radi razumevanja posledica, ne radi bodova.</p>
<p><b>Prekršaji su poređani u klase po težini</b> — ne pamti svaki iznos, prepoznaj klasu:</p>
<table>
<tr><th>Klasa</th><th>Kazna</th><th>Šta tu spada</th></tr>
<tr><td><b>Najteža</b> (ZOBS čl. 330)</td><td>zatvor ILI najviša novčana kazna + najviše kaznenih poena</td>
<td>vožnja bez dozvole; vožnja za vreme isključenja ili zabrane; teška alkoholisanost i odbijanje testa;
ekstremna prekoračenja brzine (naročito u zonama); noću bez ijednog svetla; prolaz na crveno preko prelaza sa pešacima;
napuštanje nezgode sa povređenima; vožnja zaustavnom trakom autoputa</td></tr>
<tr><td><b>Srednje</b></td><td>novčani rasponi + kazneni poeni (više stepenika)</td><td>opasne radnje bez ekstremnog rizika (nepropisno preticanje, svetla, prelazi...)</td></tr>
<tr><td><b>Lakše</b></td><td>fiksne manje novčane kazne, po pravilu bez poena</td><td>administrativni propusti i oprema</td></tr>
</table>
<p><b>Kazneni poeni</b> idu UZ kaznu (čl. 335); kad ih skupiš <b>18</b>, MUP ti ODUZIMA vozačku dozvolu —
zakon to zove "ne upravlja savesno i na propisan način" (čl. 197).</p>
<p><b>Zaštitna mera zabrane upravljanja</b> izriče se obavezno, uz kaznu, za pobrojane prekršaje (čl. 338);
opšti okvir trajanja: od 30 dana do godinu dana.</p>
<p class="mut">Iznosi u dinarima se menjaju izmenama zakona — u vežbanju ih čitaj iz ponuđenih odgovora
(baza se osvežava), a trajno pamti klasu i logiku: što neposrednije ugrožava život, to viša klasa.</p>\`,
};
BYSUB[182] = 'kaznene-klase';

X[8225] = { x: 'Opšti okvir zaštitne mere zabrane upravljanja: NAJMANJE 30 DANA, NAJVIŠE GODINU DANA (Zakon o prekršajima). ZOBS uz to za pojedine prekršaje propisuje strože minimume trajanja (čl. 338). Oba pogrešna odgovora sužavaju okvir — pamti celu lestvicu: od 30 dana do godine.' };
X[8228] = { x: 'Vožnja bez vozačke dozvole za kategoriju kojom upravljaš (a nije reč o isteklom roku!) je u NAJTEŽOJ prekršajnoj klasi — zatvor ili najviša novčana kazna uz najviše kaznenih poena (ZOBS čl. 330). Logika: vozač koji za to vozilo nikad nije položio je neproveren rizik za sve; istek roka je poseban, blaži slučaj.' };
X[8229] = { x: 'Potpuna alkoholisanost (preko 2,00 mg/ml) je vrh lestvice — u ispitnoj bazi razvrstana u najtežu klasu (zatvor ili najviša novčana kazna uz najviše poena). Po slovu zakona takva vožnja je čak NASILNIČKA (ZOBS čl. 41) — u svakom slučaju, kažnjava se najstrože što postoji.' };
X[8230] = { x: 'Odbijanje utvrđivanja alkohola/psihoaktivnih supstanci (alkometar, droga-test, stručni pregled) = NAJTEŽA klasa (ZOBS čl. 330). Logika: odbijanjem se odgovornost ne izbegava — zakon odbijanje kažnjava kao da je nalaz najgori.' };
X[8231] = { x: 'Vožnja za vreme trajanja SVOG isključenja iz saobraćaja = najteža klasa (ZOBS čl. 330). Isključenje je naredba, a njeno kršenje je svesno izigravanje sistema — zato ide uz bok vožnji bez dozvole.' };
X[8232] = { x: 'Isto važi i kada je iz saobraćaja isključeno VOZILO: upravljanje njime za vreme isključenja je najteža klasa (ZOBS čl. 330) — svejedno je da li je "na snazi" zabrana za vozača ili za vozilo.' };
X[8233] = { x: 'Vožnja za vreme zaštitne mere, odnosno mere bezbednosti zabrane upravljanja = najteža klasa (ZOBS čl. 330) — kršenje sudski izrečene zabrane je među najtežim prekršajima uopšte.' };
X[8239] = { x: 'U zoni usporenog saobraćaja sme se najviše 10 km/h — vožnja od 80 km/h je prekoračenje za 70, a ekstremna prekoračenja u zonama ZOBS čl. 330 svrstava u NAJTEŽU klasu. Zone postoje baš zato što su tamo pešaci i deca na kolovozu.' };
X[8240] = { x: 'Zona škole u naselju: ograničenje 30 km/h — vožnja od 100 km/h znači prekoračenje za 70, što je najteža klasa (ZOBS čl. 330: ekstremna prekoračenja u zonama). U 14:00 časova zona škole svakako važi.' };
X[8241] = { x: 'Noćna vožnja na neosvetljenom putu BEZ IJEDNOG svetla (ni za osvetljavanje puta ni prednjeg pozicionog) = najteža klasa (ZOBS čl. 330) — nevidljivo vozilo u mraku je neposredna opasnost po život, tvoj i tuđi.' };
X[8242] = { x: 'Proći kad ti je prolaz zabranjen (semaforom ili znakom ovlašćenog lica) preko pešačkog prelaza NA KOME JE PEŠAK = najteža klasa (ZOBS čl. 330). Crveno + pešak na prelazu je scenario sa najvećim rizikom od gaženja — zato vrh lestvice.' };
X[8244] = { x: 'Učestvovati u nezgodi sa povređenima pa NE zaustaviti vozilo, odnosno NE obavestiti policiju = najteža klasa (ZOBS čl. 330; same dužnosti posle nezgode propisuje čl. 168). Ostavljanje povređenog bez pomoći može da bude i krivično delo.' };
X[8247] = { x: 'Vožnja ZAUSTAVNOM trakom autoputa = najteža klasa (ZOBS čl. 330). Zaustavna traka je jedini prostor za nuždu i intervencije — vozilo koje njome vozi udara u zaustavljene i blokira pomoć; zato tako strogo.' };
X[8340] = { x: 'Kada vozač koji je učinio prekršaj NIJE identifikovan, vlasnik vozila odgovara što je OMOGUĆIO da se njegovim vozilom učini prekršaj — dakle za propust nadzora nad vozilom, ne za sam prekršaj (zato su i "odgovoran za taj prekršaj" i "nije odgovoran" pogrešni). Vozilo je tvoja odgovornost i kad ga daš drugome.' };

`;
s = s.slice(0, ti) + block + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch19a (kaznene A, 14 + kartica) inserted');
