# A6-057 — nasilnička vožnja, vučenje i ostala pravila

Datum: 2026-09-14. Verzija: v197. Dva potpuna pregleda **20 pitanja / 66 opcija / 9 slikovnih referenci (7 jedinstvenih JPEG)**, cele kartice L/C i tri tabele. Nema SVG;11 grupisanih odeljaka i9 galerijskih referenci. Zvanična pitanja, opcije, ključevi, bodovi, ID, redosled, slike i veze ostaju sačuvani.

## Ispravke

Pet individualnih EX ispravki:10187 slika potvrđuje vrstu/način vuče, ne sve uslove;10531 precizan zabranjeni spisak bez izmišljenog uzroka nestabilnosti;10416 signalna tabla prema važećem76/2026 nije ograničena samo na zaustavljeno vozilo;10417 kumulativni uslovi radova/neuklonjive prepreke i najmanje dva određena radnika;10713 potpuna alkoholisanost jeste izričit osnov, a niži stepen ne isključuje druge osnove nasilničke vožnje.

Deset prvih, dve peer i dve root kartične korekcije daju14 lokalnih fragmenata kroz ukupno šest source operacija. Uključuju strogo prekoračenje praga90/100, interval između uzastopnih prolazaka na crveno, razmak pri vuči, uključena zadnja poziciona svetla ili korišćenje žutog rotacionog svetla, poređenje ukupnih masa i pravila signalne table. Uklonjen je izmišljeni razlog da dva radnika moraju značiti naizmenično propuštanje iz dva smera; zakonsko najmanje DVA ostaje. Kartica i10713 usklađeni su oko drugih osnova nasilničke vožnje.

Stvarni PO_TEMAMA350 → capCells → stripComments → toCyr daje byte-equal staru, nezavisnu i konačnu L/C karticu; zadržano11 odeljaka. Četiri NUL bajta ostaju, svi ostali EX/byQ/kartice i veze identični. Nema novih ARIA petlji, crteža, CSS ili app.js izmena.

## Dokazi i granice

- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311) i [signalizacija/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1);060/source-http-check.json potvrđuje sveže HTTP20014.9 i identične ranije sačuvane primarne bajtove. Konkretni članovi navedeni su po pitanju.10416 zadržava uži ponuđeni odgovor koji prepoznaje mesto postavljanja; EX izričito navodi šire važeće pravilo, bez prepravljanja ispitnog ključa.
- Prvi057 i nezavisni060 potpuno su pročitali sva20 pitanja/66 opcija, svaEX L/C, obe kartice i tri tabele, pojedinačno svih9 slikovnih referenci. Root je pročitao sva5 konačnih EX parova, celu karticuL/C, ceo41 i72–74, relevantni166 i signalizaciju, i pojedinačno otvorio svih9 JPEG referenci. Dodatne dve ograde i potrebu dopune10713 potvrdio je isti nezavisni recenzent u nastavku062; zamrznuti060 nije prepisan.
- Root integrisani Chromium16/16 kartičnih konteksta (320/1280,L/C,obe teme,100/200% fonta) i80/80 prikaza pitanja: tačni EX/ključevi/veze/9situacija, bez grešaka/prelivanja/sintetičkih storage upisa. Tri tabele tačne i pri otvaranju iz objašnjenja. Nema SVG pa se ne izmišlja minimum SVG fonta. Nezavisni mobilni dokazi zasebno su u060/mobile-result.json.
- Dokazi:057/root-approved.json,root-source-operations.json,root-integration-proof.json,root-browser-result.json;057/finalize.mjs i060/verify-readonly.mjs su u read-only proveri potvrdili izvorne ciljne preimages/ključeve uprkos očekivanim drugim paketima. Prvi dry-run root poređenja pogrešno je uključio peer metapodatke kao runtime polja; poređenje je ispravljeno na t/h, pre ikakvog tracked upisa. Automatska završna provera: node tools/verify.mjs,057/root-verify-v197.log.
- Nema novog ekspertskog slučaja.7924/7925 zatvoreni su po završetku svih svojih zavisnih kartica; raniji pregled drugih kartica ostaje važeći. Ovo nije fizički telefon, potvrda instruktora ili opšta WCAG sertifikacija.

| ID | Konkretan nalaz | Primarni član |
|---:|---|---|
|7924|Dva označena odgovora odgovaraju policijskim službenicima i zakonom određenim radnicima. Objašnjenje već sadrži neuklonjivu prepreku i najmanje dva radnika.|2;166(4-6)|
|7925|Oba označena odgovora odgovaraju obavezi neometanja/neugrožavanja i potrebnim merama bez dovođenja sebe ili drugog u opasnost. Oba stvarna odredišta su sačuvana.|3|
|10025|Slika pokazuje preticanje kolone uz prelazak pune linije u traku mopeda. Distraktori o bezopasnoj proceni i propisnosti otpadaju.|41(1-2)|
|10027|Slika pokazuje vožnju suprotnim smerom levo od fizičkog razdelnog ostrva i automobil u susret. Opšta definicija nasilničke vožnje podržava ključ; ne predstavljam ovu situaciju kao zasebnu nabrojanu tačku čl. 41 st. 2.|41(1)|
|10711|Ključ je strogo više od 90 km/h iznad dozvoljene brzine u naselju. Pragovi 70 i 80 nisu zakonski prag iz ove tačke.|41(2)(3)|
|10712|Ključ je strogo više od 100 km/h iznad dozvoljene brzine van naselja. Ponuđenih 90 i 80 otpadaju.|41(2)(3)|
|10713|Među ponuđenim stepenima alkoholisanosti zakonski prag iz ove tačke je potpuna, više od 2,00 mg/ml; ostala dva raspona nisu ovaj osnov. Root dopuna: izričito je sačuvano da niži stepen alkoholisanosti ne isključuje druge osnove nasilničke vožnje iz41.|41(2)(4)|
|10187|Prvi prikaz vuče motocikl, izričito zabranjen čl. 71. Drugi pokazuje automobil sa krutom vezom, dopuštenu vrstu i način pod ostalim uslovima. Predlog više ne tvrdi da slika dokazuje sve uslove; ispravnost upravljanja, radna kočnica, odnos ukupnih masa i dozvola vozača nisu proverljivi na slici. Neispravnost je premisa pitanja; čl. 71 dopušta vuču samo kad vozilo zbog neispravnosti/nedostatka delova ne može samo. Prihvatam kandidat bez izmene ključa.|71;72|
|10531|Tri odgovora obuhvataju moped, motocikl i laki/teški tricikl. Putničko, teretno i laki/teški četvorocikl nisu zabranjeni po ovoj taksativnoj listi, ali pod drugim uslovima. Kandidat ispravno uklanja generalizaciju na sve dvotočkaše i neizvorni razlog nestabilnosti.|71-76|
|10222|Odredbe se shodno primenjuju na tramvaj i druga šinska vozila uz konstrukcione osobine i način kretanja; ne važi potpuno izuzimanje ili izuzetak samo za brzinu.|84|
|10225|Vođenje životinja iz ili sa vozila na putu je zabranjeno; ponuđeno izuzeće van naselja ne postoji u čl. 87.|87|
|10226|Fotografija jasno pokazuje povodac psa u jednoj ruci vozača mopeda. Ponuđeno izuzeće po brzini pešaka ne postoji za ovo vođenje.|87|
|10400|Povećanje opreznosti i prilagođavanje brzine/načina kretanja odgovaraju obavezi pri susretu sa žutim svetlima. Obavezno zaustavljanje ili uklanjanje sa kolovoza nisu nalozi tog svetla.|111|
|9406|Čl. 155 potvrđuje oba ključa: ne ometati radnika, ukloniti vozilo na zahtev izvođača, uključujući javni poziv; policijski zahtev nije jedini.|155;166|
|9438|Pojedinačno otvorena slika pokazuje podignutu zelenu, crvenu spuštenu. Slobodan prolaz i obavezujući znak; ostali odgovori netačni.|20;166(4-7)|
|9440|Ista slika kao 9438 ponovo je pojedinačno otvorena: zelena podignuta znači slobodan prolaz, ne usporavanje ili zaustavljanje.|166(4-5)|
|9444|Crvena podignuta zabranjuje prolaz; zelena je spuštena. Zabrana ne zavisi od trenutne zauzetosti suprotne trake.|166(4-5)|
|10416|Nezavisno proverena definicija 76/2026 dopušta tablu na zadnjem delu vozila/prikolice u zoni radova bez uslova mirovanja. Prvi odgovor jedini identifikuje ovo mesto i dopušten podslučaj; ostala dva opisuju druge uređaje (ograda/čeoni branik). Fotografija prikolice i table ne dokazuje mirovanje. Kandidat izričito čuva razliku užeg uvoznog odgovora i šireg važećeg pravila i koristi čeona zapreka. Ključ ostaje.|SIGNAL:2(20);86(1,6,8)|
|10417|Kandidat pravilno vraća kumulativne uslove radova i prepreke koja se ne može odmah ukloniti, najmanje dva određena radnika izvođača/upravljača i značenje podignute crvene/zelene. Jedna zastavica sa spušteno/podignuto logikom nije propisani izbor.|166(4-6)|
|10419|Slika ponovo pojedinačno otvorena: podignuta crvena zabranjuje prolaz i obavezuje. Prazna traka i samo usporavanje ne menjaju znak.|20;166(4-7)|
