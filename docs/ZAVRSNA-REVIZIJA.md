# Završna revizija — 14. septembar 2026.

Razvojna grana `codex/stabilizacija`, v215. Ovo je predaja zaokružene razvojne ture, uz jasno izdvojene preostale stručne provere i odluke vlasnika.

## Moje mišljenje

Projekat je već bio sadržajno bogata, korisna vežbaonica. Njegova vrednost je u objašnjenjima, povezivanju pravila i ponavljanju bez naloga. Najveći nedostaci bili su pouzdanost pojedinih rubnih tokova, čitljivost gustih prikaza i tvrdnje u objašnjenjima koje su bile šire nego što pravilo dopušta. Zato rezultat ove ture treba prvenstveno da se oseti kao pouzdanija i jasnija ista aplikacija.

Ne bih pravio novi dizajn simulacije. Vežbanje može biti udobno, dok simulacija treba da zadrži poznatu strukturu, vremensko ograničenje i odsustvo pomoći tokom pokušaja. Ne bih dodavao naloge, rang-liste, AI razgovor ili više animacija radi utiska.

## Šta možeš da primetiš

Ove promene odnose se na razvojnu granu i novu probnu adresu navedenu na kraju. Javni sajt i tvoja postojeća sesija nisu ažurirani.

| Probaj | Očekivana razlika |
|---|---|
| Otvori oblast/pitanje, pa browser Nazad/Napred | Smislen povratak kroz stranice, uz odgovarajući fokus i poziciju. Srednji ili Ctrl/Cmd klik otvara pravi link u drugom tabu; pregled ne upisuje odgovore u napredak. |
| Menjaj auto cilj, datum ispita, isključi auto i upiši ručnu kvotu; osveži | Sačuvan cilj, prikazana kvota i tekst ostaju saglasni. Sklapanje podešavanja ostaje po sesiji. |
| Povećaj tekst i otvori pojmovnik na uskom ekranu | Pregledniji raspored, čitljiviji natpisi, preciznije tabele i korisnije povezani odeljci. Uvećanje crteža/slike radi i tastaturom, uz vraćanje fokusa. |
| Pokreni postojeći vodič iz podešavanja | Svih sedam koraka i komande dostupni su i na uskom/kratkom prikazu. Vodič nije zamenjen drugim tutorijalom. |
| Pročitaj objašnjenja prvenstva, ograničenja, opreme i kazni | Jasnije su odvojeni uslov, izuzetak, sačuvani odgovor i aktuelno pravilo. Izbačene su nepouzdane prečice po formulaciji pitanja. |
| Probaj umetak za sajt auto-škole | Tačan odgovor i pogrešan izbor imaju vidljiv tekst i simbol uz boju. |

Svih 28 postojećih pokretnih crteža sada počinje mirno. Dugmetom uz crtež pokrećeš ili pauziraš prikaz; sistemska postavka smanjenog kretanja ima prednost. Nisu dodate nove animacije. [Ponašanje i provere](provere-pokreta-crteza.md).

## Koliko je završeno

Svih **1.327 pitanja i 39 kartica** (38 tema i FAQ) ima pojedinačnu evidenciju. Nema više nepregledanih. **1.250 pitanja ima zatvoren pregled, a 77 ostaje za stručnu potvrdu.** To nije tvrdnja da je stručnjak odobrio sve ostalo, niti da tehnički test može dokazati pravnu tačnost.

Od 77 otvorenih: 57 su neslaganja kaznenog režima, 5 druge razlike prema propisu, 5 nedovoljno određeni uslovi/pojmovi, 7 preklopi odgovora/formulacije, 2 pitanja čije slike ne daju dovoljno podataka za pouzdan izbor i 1 datirana provera prelaznog režima. Svako ima razlog i dokaz u [spisku za vlasnika/instruktora](revizija-sadrzaja/OTVORENA-PITANJA.md). Pitanje 10415 posebno traži proveru posle roka 15.09.2026; ovaj pregled od 14.09. ne tvrdi sutrašnje stanje.

Poređenje sa v126 potvrđuje isti broj pitanja i 4.170 opcija, iste ključeve, bodove, potreban broj odgovora i redosled. Postoje tekstualne korekcije u 32 pitanja. Promenjeno je 569 pojedinačnih zapisa objašnjenja ili njihovih veza; svih 39 kartica ima neku izmenu. To nije 569 novih pitanja niti 569 dokazanih grešaka u ključu. Originalnih 704 JPEG-a ostalo je isto.

Ne dajem jedan zbirni procenat koji izjednačava malu UI ispravku, pregled cele baze i testiranje sa stvarnim kandidatima. Tehnički urađen posao, završena evidencija i preostala stručna potvrda imaju zasebne statuse u [dnevniku](../IZVRSAVANJE-PLANA.md).

## Iz različitih uglova

| Ugao | Procena i sledeći smislen korak |
|---|---|
| Kandidat | Osnova je dobra: učenje, ponavljanje, obeležavanje, jasni linkovi i simulacija. Najviše koristi sada donosi rešavanje stručnih nedoumica i kratka proba sa novim korisnicima, pa tek onda nove funkcije. |
| Telefon i pristupačnost | Popravljeni su konkretni rasporedi, kontrast, fokus, vodič i čitljivost. Emulacija i DOM provere ne zamenjuju Android/Chrome, iPhone/Safari, fizičku tastaturu i stvarni čitač ekrana. Ne tvrdim potpunu WCAG usaglašenost. |
| Objašnjenja i slike | 195 postojećih SVG crteža i 652 različite slike u pojmovniku već su mnogo. Prednost dati jasnom poređenju sličnih znakova, jednoj smislenoj šemi i koracima odlučivanja. Novi crtež mora rešiti konkretnu nedoumicu; broj nije cilj. Originalna ispitna slika i bodovanje ostaju verni banci. |
| Održavanje | Jednostavna statička aplikacija je prikladna. Nema razloga za obavezni framework. Sada su jasnije odvojeni izvor/generisani fajl, postupak provere, javni resursi i istorija. Veliki app.js i generator ostaju tehnički dug: izdvajati po jednu celinu kada konkretna izmena to opravda. |
| Drugi saradnik | [RAZVOJ](../RAZVOJ.md) je aktuelni vodič, [istorija](../RAZVOJ-ISTORIJA.md) čuva ranije beleške, [CONTRIBUTING](../CONTRIBUTING.md) opisuje prijavu i rad. Postoje komentarima objašnjene važne odluke i trajne regresione provere. |
| Napredak | Otklonjeni su potvrđeni kvarovi oporavka, istorije i redosleda upisa; jedan tab menja napredak. I dalje je lokalno skladište: izvoz ostaje potreban za drugi browser/uređaj i zaštitu od brisanja podataka browser-a. |
| Offline i izdavanje | Potvrđena je bezbednija priprema nove verzije i sadržajno adresiranje slika. Neotvorene slike nisu garantovano dostupne bez mreže. Stara jezgra se namerno ne brišu automatski zbog povratka iz BFCache-a; [odvojena migracija](superpowers/plans/2026-09-10-a5-zadrzavanje-starih-izdanja.md) ostaje otvorena. |
| Auto-škola | Postojeći umetak, QR/plakat i direktni linkovi dobar su prvi obim. Sledeća korisna proba je instruktor koji kandidatima deli konkretna pitanja. Paneli učenika/nalozi nisu potrebni da bi ovo bilo korisno. |
| Druge kategorije | Potrebna je datirana zvanična banka i proveren model ispita svake kategorije, uz odvojeno praćenje napretka i zajedničke ID-jeve gde ih izvor zaista deli. Kopija A simulacije sa drugim naslovom nije dovoljno rešenje. |
| Privatnost i deljenje | Napredak ostaje lokalno, ali javni sajt koristi GoatCounter; opšta tvrdnja da ništa nikada ne odlazi nije tačna. Izbor licence autorskog koda i uslovi korišćenja preuzetih pitanja/slika ostaju odvojene vlasničke odluke. Javno dostupan Git sam ne definiše ta prava. |

## Poređenje sa konkurencijom i standardima

Kod [Auto-škole PRAVO](https://autoskolapravo.com/testovi/testovi-za-a-kategoriju/) korisno je jasno grupisanje i kratak put do testa. Dva javna ulaza proverena su na 320/1280: jedan Start klik vodi do prvog pitanja bez naloga; mobilna potvrda ostaje pri dnu. Pregled je ograničen na uvod/prvo pitanje. Ne tvrdim da su njihova cela baza ili objašnjenja provereni.

[Položi lako](https://www.polozilako.com/testovi/za-b-kategoriju) javno prikazuje oblasti, a za učenje/simulacije/statistiku traži nalog; zatvoreni deo nije pregledan. [Auto škola SRB na Google Play-u](https://play.google.com/store/apps/details?hl=en_US&id=com.vozacki.app) navodi A/B, offline rad, greške, obeležavanje i statistiku; to su tvrdnje izdavača, aplikacija nije instalirana. Naša postojeća lista funkcija već pokriva veliki deo tog opisa. Prednost treba graditi kvalitetom i poverenjem, bez nadmetanja brojem dugmadi.

[Zvanični britanski pristup pripremi](https://www.gov.uk/motorcycle-theory-test/revision-and-practice) korisno razdvaja razumevanje pravila od vežbanja formata. To podržava tvoju odluku da sama simulacija ostane nalik stvarnom ispitu; britanske specifične zadatke ne treba prenositi u srpski ispit.

Za [WCAG 2.2](https://www.w3.org/TR/WCAG22/) provereni konkretni kriterijumi i tokovi važniji su od deklaracije „po svim standardima”. 44 px je dobar cilj za udobnost glavnih komandi; minimum kriterijuma 2.5.8 je 24 px uz definisane izuzetke. Laboratorijski rezultat nije dokaz javnih [Core Web Vitals](https://web.dev/articles/vitals) na 75. percentilu.

Laboratorija v215 obuhvata tri nova desktop i tri nova mobilna konteksta, na 1280/320 px. Mobilni profil ima CPU usporen 4×, vezu 1,6 Mbps i latenciju 150 ms. Provereni su prvi dolazak, oblast, pitanje sa slikom, izbor opcije, velika kartica, pretraga i stvarno ponovno učitavanje. SW je isključen; ovo nije offline provera ili fizički telefon.

| Mera, medijana tri ponavljanja | Desktop | Usporeni mobilni profil |
|---|---:|---:|
| Prvo učitavanje, DOMContentLoaded | 438 ms | 22,37 s |
| Ponovno HTTP učitavanje, DOMContentLoaded | 45 ms | 22,04 s |
| Otvaranje svih 1.327 pitanja | 151 ms | 1.051 ms |
| Otvaranje oblasti sa 471 pitanjem | 63 ms | 472 ms |
| Otvaranje velike kartice prvenstva | 10 ms | 68 ms |
| Izbor opcije | 9 ms | 8 ms |

Interakcije u tabeli mere događaj do drugog animation frame-a; nisu INP. Lokalni server prenosi oko 4,32 MB bez kompresije i pri ponovnom otvaranju ponovo šalje glavne JS fajlove. **To nije brzina javnog sajta:** javni v126 već deklarisano koristi gzip i desetominutni HTTP keš; tri glavna JS resursa zajedno imaju oko 0,90 MB prema HEAD zaglavljima. Lokalna gzip procena za v215 je oko 0,93 MB, ali njeno javno učitavanje nije izmereno.

Najjasniji preostali zastoj je pravljenje dugog spiska. Zaseban profiler 105 potvrdio je jedan render, zatim veliki posao raspoređivanja i iscrtavanja. Probno grupisanje DOM upisa dalo je samo oko 2,8% poboljšanja kroz tri uparena pokušaja, uz nepromenjen sadržaj i stanje, pa nije uvrštena nova izmena koda. Ovo ostaje konkretan tehnički dug; veća promena liste traži posebnu proveru pretrage, pristupačnosti i povratka na mesto.

Mobilni CLS pri ponovnom učitavanju je 0,1013 u sva tri uzorka, malo iznad orijentira 0,1; ova provera nije lokalizovala izvor pomeranja. Obe stavke treba meriti i na stvarnom uređaju pre tvrdnje o vrhunskim performansama. Pretraga daje pravi rezultat u svih šest tokova; njeni širi početni upiti traju do oko 167 ms. Dva pomoćna desktop vremena odložene najave pogodaka nisu validna i izuzeta su iz agregata, uz sačuvanu dijagnostiku.

Dokazi i metodologija: lokalni `output/revizija-20260911/100/report.md`, šest pojedinačnih merenja, `analysis.json`, `public-headers.json` i read-only `verify.mjs`. Ovaj zapis razlikuje uspešan korisnički tok od ograničenja pojedine metrike; ne predstavlja ih kao bezuslovnu potvrdu svih standarda.

## Veličina i obim izmena

Izmereno 14.09.2026: javni resursi sa svim slikama zauzimaju **44,41 MB**, naspram **44,09 MB** originala: rast oko **0,72%**. To je zbir nekomprimovanih fajlova, ne veličina jednog početnog učitavanja. Slike su i dalje oko 40 MB.

Radni folder zauzima oko **1,87 GB**, od čega je oko **1,82 GB u `output/`**: screenshotovi, DOM zapisi, logovi i ranije testne kopije. Deljena Git istorija je još oko 42 MB u originalnom `.git` direktorijumu; nije duplirana u ovom worktree-u. Ovi rezultati nisu deo aplikacije, nisu poslati kao javni resursi i server ih ne izlaže. Ranije umnožavanje probnih kopija bilo je preterano; završne provere koriste stvarni checkout i prazne kontekste. Novi veliki zapisi pokreta sažeti su bez gubitka dokaza. Stariji `output` nije masovno brisan, kako se ne bi izgubili dokazi ili nepregledani fajlovi.

Najveći rast broja redova pripada proverama i evidenciji, koji se ne učitavaju u aplikaciju. Sam app.js jeste porastao, sa oko 273 KB na 346 KB — približno 27%. Ovaj rast nije besplatan: deo je neophodan za oporavak i više tabova/navigaciju, ali dalji rad treba da pojednostavljuje jasne celine, a ne stalno dodaje nove zaštitne slojeve. Odvojeni mali commit-i služe pregledu i povratku, nisu dokaz da je svaka dodatna linija automatski potrebna.

## Provere i ograničenja

- Poslednja završena opšta provera v215: **249/249 Node testova**, javni resursi, sintaksa, slike i aktuelna evidencija. Ista verzija prolazi [GitHub CI na Windows-u i Ubuntu-u](https://github.com/MilanMilojevic/vozacki-a/actions/runs/34858361099). Browser i sadržajna tačnost imaju zasebne dokaze.
- Završni UX krug 095 na v210: dnevni cilj 10, navigacija 19, native linkovi 18, tastatura 10, vodič 20, zaključavanje vodiča 4 i kratki ekran 6 tokova; mobilni raspored 410 merenja. To nisu sve isti tipovi testova i ne sabiraju se u lažni ukupan broj.
- U tom testnom omotaču zabeležene su 52 greške inicijalizatora skladišta na about:blank, pre učitavanja aplikacije, i 6 namerno blokiranih udaljenih provera. Ove poruke su sačuvane i odvojene od grešaka same aplikacije; ceo browser log zato se ne opisuje kao potpuno bez grešaka.
- Naknadne izmene imaju svoje ciljane provere: v213 tipografija, v214 umetak, v215 kontrola pokreta sa 14/14 keyboard provera i 10 dodatnih prikaza svih pet kartica na stvarnom dvostrukom tekstu. Izmene posle v210 ne predstavljaju novo izvršavanje celog UX kruga.
- Stvarni kandidati, instruktor, fizički telefoni i pomoćne tehnologije nisu zamenjeni agentima ili emulacijom. Potrebna je kratka stvarna proba pre široke preporuke.

## Primena i povratak

Nova proba je **[http://localhost:18981/](http://localhost:18981/)**, pokrenuta iz `vozacki-a-stabilizacija`, bez nove kopije aplikacije. To je zasebna adresa sa svojim skladištem; prazan napredak na njoj ne znači da je stari napredak obrisan. Server radi lokalno dok je računar uključen i proces aktivan. Za ponovno pokretanje u tom folderu: u PowerShell-u postavi `$env:PORT = '18981'`, pa pokreni `node serve.mjs`.

Originalni checkout ostao je na main/v126; njegove tracked datoteke nisu menjane. Stara proba v165 na 18980 ostaje odvojena. Rad je slat u malim celinama na `origin/codex/stabilizacija`, bez spajanja na main ili ažuriranja javne korisnikove sesije.

Za povratak koda koristi se revert konkretne promene i novo, veće izdanje, kako je opisano u RAZVOJ. Napredak se ne vraća automatski zajedno sa kodom. Pre prelaska na drugi origin potreban je tvoj postojeći izvoz/uvoz, jer nova adresa ima sopstveno skladište.
