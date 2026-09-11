# A6-047 — prelazi puta preko železničke pruge

Datum:2026-09-11. Verzija:v192. Cela kartica L/C,4 postojeća SVG i **15 pitanja /45 opcija /12 originalnih JPEG**. Nema atlasa; svih12 situacija ulazi u ovih15 pitanja.8113 ostaje ispravno eksplicitno povezano uprkos nocard;9405 je van ovog skupa.

## Ispravke

Deset objašnjenja dobija uske korekcije: uklanjanje netačnih apsoluta o nemogućnosti zaustavljanja voza, preciziranje obaveznog stajanja na nezaštićenom prelazu, obaveze kada su branici podignuti ali signal zabranjuje prolaz i vremenskog konteksta starog semafora. Root je odbio nepotrebno prepisivanje10282: u starom EX nema izmišljenog kočenja iz prvobitnog razloga predloga; dodati su samo polubranik i precizan naziv uređaja.10557 dobija samo zamenu nagađanja da voz fizički već dolazi neposrednim razlogom aktivne zabrane. Pet ostalih EX ostaje isto.

Oba Andrejina krsta prate identifikacioni oblik službenog znaka; drugi sada ima X i donji krov Λ, umesto dva puna X. Dijagrami ostaju pojednostavljeni, bez tvrdnje o tehničkoj razmeri za proizvodnju. Četvrti crtež prikazuje crveno-žuti semafor i branik; razdvojeni su stalno i trepćuće žuto. Zona manjeg rastojanja od5m tačno obuhvata i zaustavljanje i parkiranje. Svih4ARIA prevedeno je kroz postojeću petlju, bez dupliranja cele C kartice.

Nema izmene pitanja, ključeva, opcija/redosleda, slika, bodova, veza, globalnog CSS-a, app.js ili ispitne simulacije. Izvor je promenjen kroz12 tačnih operacija, uključujući11 kartičnih fragmenata; četiri NUL bajta i ostatak EX su očuvani.

## Vremensko ograničenje10415

Na11.9.2026 sva tri označena odgovora33073/33071/33070 odgovaraju još važećem prelaznom režimu. Rok zamene starog semafora je15.9.2026. Status needs-expert čuva obaveznu ponovnu proveru primarnog stanja i izvorne banke posle tog roka; ne označava da je današnji ključ dokazan kao pogrešan. Nema automatskog menjanja odgovora niti dozvole za ignorisanje aktivnog crvenog signala.

Čvrst osnov: datum objavljivanja76/2023 je7.9.2023; čl.74 daje osmi dan,15.9.2023. Čl.71 daje najviše tri godine za zamenu i primenu starog režima. Pravilnik21/2024 čl.3–4 čuva isto značenje do zamene i vezuje rok za zakon. Zaključak da opšti rok iz Pravilnika76/2026 čl.49 ne produžava poseban zakonski maksimum jeste pravno tumačenje odnosa propisa, ne doslovna nova rečenica zakona. U aktuelnom primarnom tekstu produženje nije nađeno. Portal/banka posle15.9 nije unapred proglašen proverenim.

Kartica izričito kaže da rok zamene nije dozvola za prelazak uz aktivan crveni signal. Ključ10415 danas je pregledan; buduća odluka ostaje otvorena u standardnom statusu needs-expert, bez nove vrste statusa ili automatskog povlačenja pitanja.

## Provera i izvori

- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311); [Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1); [usvojeni tekst Narodne skupštine](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/13_saziv/1456-23%20-%20lat..pdf). Sveži11.9 primarni odgovori i hashovi su sačuvani uz dokaze. Root zasebno pročitao cele100/101/149/153, prelazne71/74, pravilničke81/84,23(5–7) i sačuvane prelazne21/2024/76/2026.
- Prvi047 i nezavisni053: sva15 pitanja/45 opcija L/C, svih12 originalnih JPEG i cela kartica/4SVG. Root pročitao10 završnih parova EX i celu L/C karticu; neposredno otvorio original10415/10557, sve njihove opcije i10282, primarni znak I-34/I-34.1,4kandidatska L/C crteža i4integrisana C crteža.
- Rootova integraciona provera otkrila je da peer kandidat čuva rawHTML bez postojećeg grupisanja. Očekivani izlaz je nezavisno provučen kroz neizmenjene poTemamaKartica(...,400),capCells i uklanjanje komentara na oba pisma, pa potpuno upoređen sa stvarnim generatorom. Sav vidljiv tekst/ARIA/crteži ostaje isti; stvarne dve tematske sekcije proverene su u browseru. Nije promenjen generator grupisanja.
- Integrisani Chromium16/16 kartica,320/1280,oba pisma/teme,100/200% osnovnog fonta;60/60 prikaza pitanja. Svih12 galerijskih odgovora/ARIA/redosleda i4SVG su tačni, bez pageoverflow/grešaka/sintetičkih upisa. Stvarni prikaz ima i treći sklopivi odeljak galerije.
- Nezavisni vizuelni kandidat8/8, HTML legenda min16,15px na320pri125% fonta, tekst kontrast≥4,759:1; crveno svetlo/kućište3,312 i crveno/žuto3,199. SVG nemaju tekstualne elemente, pa se ne izmišlja minimum SVG fonta. To nisu potpuna WCAG potvrda ili proba fizičkog telefona.
- node tools/verify.mjs: zaseban rezultat ignored047/root-verify-v192.log. Dokazi: frozen047/053,root-approved.json,root-source-operations.json,root-integration-proof.json,root-browser-result.json. Četiri greške u početnoj evidenciji047 (broj člana, situacije, razlog10282 i početni commit) ispravljene su u ovom konačnom zapisu, bez menjanja zamrznutih dokaza.

| ID | Nalaz i osnov |
|---:|---|
|8113|SIGNALIZACIJA:18(29); SIGNALIZACIJA:84: Prepoznaje se prelaz puta preko pruge: Andrejin krst, polubranici i kolosek. Veza sa pruga je korisna; explicit card ima prednost nad nocard. Nijedna ponuđena tramvajska baštica/raskrsnica/parkiralište ne opisuje ovu sliku.|
|9404|SIGNALIZACIJA:84: Spušteni branici zatvaraju celu širinu puta; polubranik zatvara do polovine. Predlog pravilno uklanja univerzalnu tvrdnju o zaprečnim trakama.|
|10274|ZOBS:100-101: Član 100(1) nalaže propuštanje šinskog vozila. Tačan odgovor ostaje; predlog uklanja netačno apsolutno da voz ne može stati.|
|10276|ZOBS:100-101: Voz dolazi sleva, nema branika/polubranika/uređaja. 101(2) traži prethodno stajanje i proveru; 100(1) propuštanje. After čuva konkretan smer.|
|10278|ZOBS:100-101: Voz dolazi zdesna; isti uslovi 100/101. After čuva konkretan smer i ne nagađa zaustavni put voza.|
|10282|ZOBS:100-101: Dopunjen izostavljen polubranik i preciziran uređaj za najavu; ostatak ispravnog objašnjenja očuvan. Prvobitni razlog o kočenju ne postoji u preimage tekstu.|
|10284|ZOBS:100-101: Svetlosni uređaj bez branika, vozilo ispred upravo prilazi/prelazi prugu. Objašnjenje tačno razdvaja prilagođavanje prilaza od bezuslovnog stajanja na nezaštićenom prelazu.|
|10285|ZOBS:100-101: Početak spuštanja već nalaže stajanje. After pravilno čuva zabranu kroz sve aktivne signale, a ne samo do podizanja grede.|
|10286|ZOBS:100-101: Opšti način prilaska: moguće bezbedno stajanje, ne bezuslovno stajanje na svakom prelazu. Postojeći ključ je tačan. Tipografsko prilogodi/прилогоди evidentirano zasebno; nije pravni sukob.|
|10288|ZOBS:100-101: Automobil stvarno postoji ispred i svetla kočnice su osvetljena. Prilagođavanje prilaza je obaveza i uz podignut uređaj; 047 opravdano ne menja ovo objašnjenje.|
|10290|ZOBS:100-101: Žute strelice pokazuju spuštanje punih branika. Stajanje je obavezno već pri spuštanju, prostor ispod grede ne daje dozvolu za prolazak.|
|10292|ZOBS:100-101: Polubranik zatvara sopstvenu polovinu; prazna suprotna strana ne daje pravo na zaobilaženje. After ne izjednačava neodređeno lice iz opcije sa zakonski ovlašćenim licem.|
|10294|ZOBS:100-101: Obe spuštene grede zatvaraju širinu puta. After čuva svetlosne/zvučne uslove i uklanja tvrdnju da je podizanje jedini znak.|
|10415|ZOBS-76/2023:71,74; SIGNALIZACIJA-21/2024:3-5; SIGNALIZACIJA-76/2026:49-50: Na11.9.2026 sva tri označena odgovora33073/33071/33070 odgovaraju još važećem prelaznom režimu. Rok zamene starog semafora je15.9.2026. Status needs-expert čuva obaveznu ponovnu proveru primarnog stanja i izvorne banke posle tog roka; ne označava da je današnji ključ dokazan kao pogrešan. Nema automatskog menjanja odgovora niti dozvole za ignorisanje aktivnog crvenog signala.|
|10557|ZOBS:100-101: Iz fotografije i signala nije potrebno izvoditi da je voz već fizički u nailasku; tri značenja uređaja već su razdvojena u 10415.|
