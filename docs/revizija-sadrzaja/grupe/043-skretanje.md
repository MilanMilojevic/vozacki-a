# A6-043 — skretanje i prestrojavanje

Datum:2026-09-11. Verzija:v187. Potpuni pregled **30 pitanja /95 opcija /19 originalnih JPEG**, oba pisma, cele kartice sa dva SVG-a, tri tabele i18 situacija.

## Šta je ispravljeno

Jedanaest uskih korekcija objašnjenja: strelica na slici10462 je ranije pogrešno opisana; pravila za preticanje i polukružno okretanje nisu ista; skretanje ulevo ne znači propuštanje svakog vozila iz suprotnog smera; zabrana ulaska u zagušenu raskrsnicu štiti i pešake. Uklonjeni su izmišljeni fizički razlozi i apsolutne tvrdnje o trakama. Ostalih19 objašnjenja, svi ispitni odgovori, njihov redosled, bodovi i slike su očuvani.

Uz9689 uklonjena je samo automatska veza ka skretanju: pitanje je o mimoilaženju. Eksplicitna kartica zamke-odgovori ostaje; zbog njenog otvorenog pregleda9689 ostaje in-progress. Pitanje9677 je sada zatvoreno jer je skretanje pregledano, a znakovi-naredbi su prethodno završeni u v183.

Kartica je precizirana u devet sadržajnih fragmenata. Dva postojeća crteža imaju isti tekst, koordinate, putanje i dimenzije; veća slova i jači kontrast otklanjaju izmerene probleme. Stvarni najmanji tekst na320px je 13.450px (pre11,529). Bele oznake prema putu imaju3,435:1, poruka NE ULAZI12,158:1, kontura žutog vozila5,210:1. Pristupačni opisi koriste postojeći prevodni prolaz, uz dve lokalne zaštite rimskih oznaka. Dodatak zaštite je414 bajtova; nema duplirane cele kartice, nove biblioteke ili promene app.js/CSS.

## Provera i izvori

- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Celi čl. 20,32,46–51,55–58,99 i105 stav2: prestrojavanje, skretanje, polukružno, mimoilaženje i ulazak u zagušenu raskrsnicu.
- [Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Čl.25 tačke1,2,4;26 tačka44;63 i67 deo2.3.1: prvenstvo, dozvoljeni smerovi i oznake na kolovozu.
- Prvi pregled /root/learning_visual_second_review: sva30 pitanja,95 opcija, oba pisma objašnjenja, svih19 originalnih slika i cela kartica. Sveži javni odgovori izvora imaju iste otiske kao evidentirane kopije.
- Root nezavisno pročitao ista30 pitanja/opcije/objašnjenja, svih11 završnih parova, celu završnu L/C karticu; neposredno pregledao svih19 originalnih JPEG i četiri završna mobilna SVG snimka. Posebno pročitao cele čl.20/32/46–51/99 i odlučujuće odredbe signalizacije. Ranije pročitani čl.55–58 korišćeni za razliku prema preticanju.
- Integrisani Chromium **16/16 prikaza kartice**,320/1280, oba pisma/teme,100/200% osnovnog fonta. Svih18 situacija ima tačan odgovor, pristupačni naziv i redosled; oba SVG-a imaju prevedene opise i sve natpise unutar granica.
- **120/120 prikaza pitanja**: svako na oba pisma i širine, tačno pitanje/ključ/objašnjenje, učitana slika, ispravne stvarne veze. Bez grešaka, prelivanja cele stranice ili upisa sintetičkog napretka. Najveće lokalno pomeranje tabele:72px.
- Nezavisna read-only provera integracije 8/8; rekonstrukcija generatora iz 14 tačnih operacija, 15 fragmenata kartice i sačuvana četiri NUL bajta. Ostali EX podaci nepromenjeni. `node tools/verify.mjs`: **249/249**, zabeleženo u root-verify-v187.log.

Zatvoreno29 pitanja i kartica;9689 je in-progress. Nije tvrđena potpuna WCAG usaglašenost, praktična provera stvarnog telefona niti potvrda današnje privatne eUprava baze.

Dokazi: ignored output/revizija-20260911/043, frozen-hashes.json, root-approved.json, root-integration-proof.json, root-browser-result.json i root-svg-*.png.

## Mapa pitanja

| ID | Ishod | Osnov i nalaz |
|---:|---|---|
| 9639 | Očuvano | ZOBS 46(1),20: Opšte desno uz desnu ivicu; tačna opcija sadrži izuzetak signalizacije. EX zadržati. |
| 9640 | Objašnjenje ispravljeno | ZOBS 46(1),48(2),20: Desna traka1 uz ivičnjak; traka2 uz razdelno ostrvo. Nema osnova za odgovor obe. |
| 9643 | Očuvano | ZOBS 46(2): Levo na jednosmernom uz levu ivicu. Pitanje/tačna opcija već izričito ograničavaju opšte pravilo signalizacijom; ne dodavati nepotrebnu novu ogradu u EX. |
| 9647 | Objašnjenje ispravljeno | ZOBS 46(2): Leva traka svog smera je2 uz ostrvo. Smer ne zavisi isključivo od strelica. |
| 9649 | Očuvano | ZOBS 46(2); SIGNALIZACIJA25(4): Slika prilaza sa dve trake, zaustavna linija preko obe i zabranjen ulaz sa druge strane; levo iz1. Nema novog predloga teksta. |
| 9650 | Očuvano | ZOBS20,46(2); SIGNALIZACIJA67/2.3.1: Traka1 levo, traka2 levo+desno, obe dozvoljavaju levo. EX tačan. |
| 9653 | Očuvano | ZOBS32(3),46(1,3): Traka uz desnu ivicu za javni prevoz, autobus se vidi u retrovizoru. Potrebno bezbedno prestrojavanje/propuštanje, ne desno iz sadašnje trake. |
| 9673 | Očuvano | ZOBS50,55(3)(7,8): Tri tačne opcije o vidljivosti/širini/lokacijama; postojeća korisna razlika prema preticanju tačna. |
| 9677 | Objašnjenje ispravljeno | ZOBS32(3),50; SIGNALIZACIJA26(44),67/2.3.1: Plavi znak dozvoljenih smerova i oznaka pravo+levo ne zabranjuju polukružno u prikazu. Naredbi relevantni pregledani odeljak zadržati. |
| 9681 | Očuvano | ZOBS50: Tunel: zabranu ne ukida propuštanje niti okret bez manevrisanja. EX zadržati; ne uvoditi experts zbog nenavedenih drugih činjenica. |
| 9682 | Objašnjenje ispravljeno | ZOBS50: Most je izričito zabranjena lokacija za okret; oba ponuđena opravdanja ne menjaju pravilo. |
| 9686 | Očuvano | ZOBS32(3),50,105(2): Pitanje izričito isključuje auto-put/motoput; pregledan širok put i isprekidana linija. Nema uslova da bude bez manevrisanja. |
| 9687 | Objašnjenje ispravljeno | ZOBS50: Podvožnjak; obe ponuđene iznimke netačne, bez izmišljanja fizičkog uzroka. |
| 9689 | Veza ispravljena; čeka drugu karticu | ZOBS51(1): Dva tačna zahteva: dovoljno levo rastojanje i pomeranje udesno po potrebi; ponuđeni fiksni1m/0.5m nisu pravilo. Skretanje kartica nepovezana. |
| 10006 | Očuvano | ZOBS48(1): Dva tačna dela: uslovi i mogućnost zaustavljanja/propuštanja. Žurba nije traženi kriterijum. |
| 10007 | Očuvano | ZOBS48(2): Na dovoljnom odstojanju, ne bilo kojom trakom niti tek neposredno pred raskrsnicom. |
| 10008 | Očuvano | ZOBS47; SIGNALIZACIJA25(1,2): Pitanje ulaska na put s prvenstvom: sva vozila, ne samo motorna niti samo jedna strana. Opšti tačan ključ ne postaje sporan zbog nedatog semafora. |
| 10010 | Očuvano | ZOBS20,48(2); SIGNALIZACIJA67/2.3.1: Ista fotografija kao10012/14: sopstvena srednja traka pravo, ostali smerovi iz nje nisu dozvoljeni. |
| 10012 | Objašnjenje ispravljeno | ZOBS20,32(3),48(2); SIGNALIZACIJA63,67/2.3.1: Fotografija: srednja strelica pravo, trake neposredno pred linijom razdvojene punim linijama. Ne opisivati zaustavljanje samo po sebi kao novu zabranu. |
| 10014 | Očuvano | ZOBS20,48(2); SIGNALIZACIJA67/2.3.1: Fotografija iz srednje trake pravo ne dozvoljava desno; korisno obrazloženje ostaje. |
| 10015 | Objašnjenje ispravljeno | ZOBS49: Gustina + zaustavljanje u raskrsnici/prelazu + ometanje vozila ili pešaka; prvenstvo ne ukida uslov. |
| 10016 | Objašnjenje ispravljeno | ZOBS49: Isti uslov i na zeleno; pešačko crveno ne dopušta izazivanje blokade. |
| 10019 | Objašnjenje ispravljeno | ZOBS20,47(4,7),99(2); SIGNALIZACIJA67/2.3.1: Strelica levo i zeleno; dozvoljen smer nije bezuslovan prolaz. Obrazloženje suziti na stvarno pravilo levog skretanja. |
| 10021 | Očuvano | ZOBS49: Stvarna fotografija kolone na putu sa prvenstvom i prelaza neposredno ispred; sačekati, ne blokirati. |
| 10022 | Očuvano | ZOBS49: Zeleno sopstvenom crvenom vozilu; žuto i zeleno ispred stoje, nema mesta iza raskrsnice. |
| 10023 | Očuvano | ZOBS49: Žuti romb prvenstva ne ukida zabranu: kolona ispred, prelaz/raskrsnica bili bi blokirani. |
| 10462 | Objašnjenje ispravljeno | ZOBS20; SIGNALIZACIJA67/2.3.1: Traka1 samo desno, traka2 pravo+desno. Obe dozvoljavaju traženo desno; ključ33235 ostaje. |
| 10463 | Očuvano | ZOBS46(2): Levo uz razdelnu liniju, jednosmerni uz levu ivicu; izuzetak signalizacije izričit. EX zadržati. |
| 10464 | Očuvano | ZOBS20,46(2); SIGNALIZACIJA67/2.3.1: Traka2 levo, traka1 pravo+levo. Obe dozvoljavaju levo; tačan opis slike ostaje. |
| 10470 | Objašnjenje ispravljeno | ZOBS50,55,57: Tunel i most/vijadukt tačni, van naselja i raskrsnica nisu opšta zabrana. Ukloniti lažno poistovećivanje s preticanjem. |
