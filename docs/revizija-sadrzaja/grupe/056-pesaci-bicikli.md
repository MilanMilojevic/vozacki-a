# A6-056 — obaveze prema pešacima

Datum: 2026-09-14. Verzija: v196. Dva potpuna pregleda **24 pitanja / 74 opcije / 8 originalnih JPEG**, cele kartice L/C, tri tabele i 11 postojećih SVG; četiri ručna odeljka i sedam situacija, bez atlasa. Zvanična pitanja, opcije, ključevi, bodovi, ID, redosled, slike i sve efektivne veze ostaju sačuvani.

## Preciznost i čitljivost

Šest uskih EX ispravki:10244 opšte pravilo leve ivice uz postojeće izuzetke;10245 bez nedokazane neminovnosti pada;10248 obeležavanje lica/mesta bez izmišljene dužnosti izlaska;10255 stvarni bočni položaj policajca;10273 bez nedokazanog zaključka o označenoj zoni škole;10703 namera stupanja i potrebna/posebno propisana zaustavljanja.

Kartica čuva sve uslove čl.99: nameru stupanja, zaštićene pešake u svim slučajevima1–4, skretanje na bočni put bez prelaza i stvarni položaj policajca. Prisustvo dece nije bezuslovan nalog za trubu: čuva se izričit uslov nepažnje iz59. Truba ne zamenjuje obavezno stajanje i nije proglašena zabranjenom u opasnosti. Dopunjeni su postojeći izuzeci93/98 i precizne granice88/91/118. Ne uvodi se pomoć tokom ispita.

34 prva i osam dopunskih fragmenata daju tačan konačni kandidat; osam source operacija (6EX, blok kartice, postojeća ARIA lista11). Kartica nije u PO_TEMAMA, zadržava četiri ručna odeljka; capCells/stripComments/toCyr i ograničeni ARIA prolaz provereni bajtovski. Četiri NUL bajta ostaju; svi ostali EX i kartice isti. CSS i app.js nisu menjani.

Natpisi postojećih11 crteža uvećani su i stavljeni unutar platna. Tekst i važni simboli imaju kontrast prema stvarnoj podlozi u obe teme. Završni peer je otkrio dodatne slabo vidljive strelice na kolovozu: boje su usko popravljene; tri putanje razdvojene tačno na ivici podloge bez promene geometrije. Nema novih scena/animacija.

## Dokazi

- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), [signalizacija/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), [znaci policajca/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/21fba347-6f9f-430e-8bc5-40af04ecd3d8?lawActId=423487). Sveži061 HTTP odgovori14.9 potvrđuju identične ranije sačuvane primarne bajtove. Svako pitanje ima konkretne članke u tabeli.
- Prvi056 i nezavisni061 pročitali su cela24 pitanja/74 opcije, sva EX L/C, celu staru/novu karticu i pojedinačno svih8 JPEG. Root je pročitao svih6 izmenjenih EX parova, celu konačnu karticuL/C, čl.93/98/99 u celini, konkretne tri odlučujuće fotografije10255/10273/10550 i njihove opcije, svih11 L kandidatskih i11 C integrisanih SVG. Puna druga kartica policajca10550 završena je u v193.
- Root integrisani Chromium16/16 kartičnih konteksta (320/1280,L/C,obe teme,100/200% fonta) i96/96 prikaza pitanja: tačni EX/ključevi/veze/7situacija/11ARIA, bez grešaka/prelivanja/sintetičkih upisa. Minimum SVG teksta13,718px na320,14px na1280; svi tekstovi unutar SVG. Nezavisni061 meri tekst5,016:1 i24 konkretna grafička para po kontekstu, minimum3,062:1 u konačnom prikazu. To su konkretna merenja, ne opšta WCAG sertifikacija ili fizički telefon.
- Dokazi:056/root-approved.json,root-source-operations.json,root-integration-proof.json,root-browser-result.json; zamrznuti056 i061/peer-report.md,peer-records.json,verify-peer.mjs. Pre integracije read-only provereno65 zamrznutih056 i107 peer fajlova. Automatska završna provera: node tools/verify.mjs,056/root-verify-v196.log.
- Nema novog ekspertskog slučaja. Zatvorene su i dve ranije zavisnosti9539/10550; eksplicitni card uz nocard9539 ostaje nameran.

| ID | Konkretna nezavisna odluka | Primarni članci |
|---:|---|---|
|9535|Ključ 30400+30403 odgovara čl. 23(1): na kolovozu, stupanje i iskazana namera. Trotoar i pešačka staza sami po sebi nisu navedena neposredna situacija; pročitane i odbačene obe netačne opcije.|ZOBS:23(1)|
|9536|30405 čuva svaku vidljivu ili razumno predvidivu situaciju iz 23(2). Uvek stati i nastaviti istom brzinom kada pešaci propuštaju vozača nisu pravilni opšti odgovori.|ZOBS:23(2)|
|9538|Fotografija pojedinačno pregledana: 1 prelazi kolovoz, 2 hoda njegovom desnom ivicom; 3 je na trotoaru, 4 je izlaskom na trotoar završio prelazak. Ključ 30412+30411 potvrđen.|ZOBS:23(1)|
|9539|30416 je naročita opreznost iz 23(3). Sama signalizacija učešća dece ne uvodi fiksno 30 km/h; 163 zasebno uređuje zonu škole. nocard:1 uz eksplicitni card:pesaci-bicikli je namerno očuvana važeća veza.|ZOBS:23(3), ZOBS:163|
|10244|32571 je opšte pravilo leve ivice van naselja iz 93(2). Izuzeci 93(6–7) ne čine opciono proizvoljno biranje leve/desne strane tačnim odgovorom. Prihvaćen dodatak „Po opštem pravilu”; kartica čuva obavezan trotoar/pogodnu površinu iz94.|ZOBS:93(2,6,7), ZOBS:94(1)|
|10245|32573 pravilno zabranjuje pridržavanje za vozilo u pokretu prema93(3), i pri brzini hoda. Prihvaćeno uklanjanje nedokazane neizbežnosti pada. Primeri u kratkom EX ne menjaju relevantnu zabranu.|ZOBS:93(3)|
|10248|32584+32582 su oba ponuđena izuzetka iz98. Odmor i ulazak/izlazak putnika/utovar nisu ponuđeni zakonski izuzeci. Prihvaćeno propisano obeležavanje lica i mesta radnje, bez tvrdnje da sam izuzetak naređuje izlazak.|ZOBS:98(1–3)|
|10249|Zabrana svetlosnim znakom zahteva zaustavljanje ispred prelaza po99(1);32586. Samo propuštanje pešaka ili zvučni znak ne ispunjavaju nalog zabrane.|ZOBS:99(1), SIGNAL-76/2026:73|
|10250|Znak policijskog službenika kojim je zabranjen prolaz zahteva zaustavljanje po99(1);32589. Ponuđeno propuštanje bez zaustavljanja i truba nisu dovoljan odgovor.|ZOBS:99(1)|
|10253|32599 potvrđen: dozvoljen prolaz ne uklanja obavezu prema pešaku koji već prelazi. Puni uslov ranije dozvoljenog pešačkog prelaska i namera iz99(1) izričito su dodati u karticu.|ZOBS:99(1)|
|10255|Pojedinačna fotografija prikazuje policajca bočno, bez odručenih ruku, i tri pešaka na zebri. Položaj dozvoljava prolaz prema pravilniku2(1)(8), ali32605 ostaje obavezno propuštanje. Prihvaćena konkretna identifikacija boka u EX.|POLICIJA-56/2010:2(1)(8), ZOBS:99(1)|
|10257|32612: dozvoljen prolaz prema znaku policajca ne znači prolaz kroz pešaka na prelazu. Netačna opcija o odsustvu dužnosti i opcija samo trube odbijene;99(1).|ZOBS:99(1)|
|10259|Originalna fotografija: upaljeno donje zeleno kružno svetlo i dva pešaka već prelaze neposrednu zebru.32616 je propuštanje; STOP na istom stubu ne menja konkretan svetlosno regulisan uslov. EX ostaje odgovarajući slici.|ZOBS:99(1), SIGNAL-76/2026:73|
|10263|Fotografija prikazuje zeleno svetlo, žutu putanju skretanja udesno i označenu pešakinju na prelazu bočnog puta.32628 odgovara99(2); ni zeleno ni truba ne uklanjaju propuštanje.|ZOBS:99(2)|
|10264|32633: na neregulisanom prelazu dete stupa ili je već stupilo.99(3)+(5) zahteva zaustavljanje i propuštanje. EX već razlikuje upozorenje iz59 od obaveznog stajanja; ne treba menjati ključ.|ZOBS:99(3,5)|
|10266|Fotografija jasno prikazuje skretanje udesno na bočni put bez zebre i pešaka na njegovom kolovozu.32637 potvrđen prema99(4). EX čuva stvarno skretanje; peer ispravlja red kartice koji je taj uslov izostavio.|ZOBS:99(4)|
|10270|Originalna fotografija prikazuje decu kraj kolovoza okrenutu duž puta, zaokupljenu i bez vidljivog praćenja prilazećeg vozila, i dodatnu decu na kolovozu.32651 potvrđen za konkretan uslov23/59; sama brzina je nepotpuna, sama truba uz istu brzinu neodgovarajuća.|ZOBS:23(3), ZOBS:59(1)(2)|
|10271|32653 je potpuna zabrana presecanja organizovane kolone iz99(6). Ne zavisi od toga da li su u njoj deca; oba permisivna ponuđena odgovora su netačna.|ZOBS:99(6)|
|10273|Pojedinačni JPEG prikazuje grupu dece u koloni sa odraslim nadzorom preko puta.32658 potvrđen prema99(6). Prihvaćeno uklanjanje dodatnog zaključka o pravno označenoj zoni škole, koji nije potreban niti sigurno dokazan celinom signalizacije u kadru.|ZOBS:99(6)|
|10550|Pojedinačni JPEG razlikuje se od10255: policajac je prsima prema vozaču, sa obe ruke vodoravno odručene.33515 je obavezno stajanje ispred linije prema pravilniku2(1)(8); samo propuštanje pešaka ne ispunjava nalog. EX ostaje identičan.|POLICIJA-56/2010:2(1)(8), ZOBS:99(1)|
|10551|33517: eksplicitan uslov skretanja na bočni put bez prelaza, sa pešacima koji su već stupili.99(4) potvrđuje ključ; postojeći EX pravilno uključuje i stupanje. Peer usklađuje izdvojeni red tabele sa ovim uslovom.|ZOBS:99(4)|
|10552|33521 potvrđen po99(2)+(5): zeleno, skretanje na bočni put i dete koje prelazi na ulazu zahtevaju zaustavljanje i propuštanje. Ostala dva odgovora ne ispunjavaju dužnost.|ZOBS:99(2,5)|
|10553|33523: policajac dozvoljava prolaz, vozač skreće i pešak prelazi.99(2) zahteva propuštanje; posebna obaveza dece/zaštićenih lica objašnjena je na kartici, a ne svedena na ponuđene primere.|ZOBS:99(1–2)|
|10703|34011 je opšta dužnost pri nailasku po99(3), bez bezuslovnog zaustavljanja ili trube. Prihvaćen puni obuhvat namere stupanja i pojašnjenje da se staje kada je potrebno ili posebno propisano. Odbijena pogrešna generalizacija da su stop ili upozorenje zabranjeni.|ZOBS:99(3,5), ZOBS:23(2), ZOBS:59|
