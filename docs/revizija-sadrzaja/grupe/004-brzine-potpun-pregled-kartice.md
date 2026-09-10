# Grupa 004 — kartica „Brzine” i svih 15 povezanih pitanja

Datum: 2026-09-10. Recenzent i izvršilac: Codex `/root/learning_visual_second_review`. Predlog A i ceo novi izlaz nezavisno pregledao i završno odobrio Codex `/root`. Nema potvrde instruktora niti nove provere sirovog MUP/portal izvora.

Ovaj paket menja **samo karticu `brzine`**, njen generatorski izvor i evidenciju. Sva 1.327 objašnjenja pitanja, drugih 38 kartica, podaci, zvanične slike, veze `bySub`, `atlas`, `situacije` i `zamke` ostaju ista. Potpun pregled jedne kartice nije pregled svih 1.327 pitanja baze.

## Stvarno pročitani obuhvat

Pročitani su svi paragrafi kartice, obe tabele, svih šest SVG-ova sa vidljivim i pristupačnim natpisima na oba pisma, svih 15 pitanja sa svim tačnim i netačnim opcijama i objašnjenjima, i svih osam originalnih slika. Kartica nema atlas; ovih 15 pitanja nema `zamke`. Osam `situacije.brzine` ID-jeva odgovara istim osam slikovnih pitanja. Nema nepročitanog dodatnog povezanog pitanja: cela podoblast 135 ima **15**, a ne 25 zadataka.

Sva pitanja imaju 3 boda. Nije pronađen nesklad zvanično označenih tačnih odgovora sa proverenim relevantnim zakonskim pravilom. To nije tvrdnja da je svako postojeće dopunsko objašnjenje tačno: šest nalaza ostaje otvoreno.

| ID | `req`; tačni ID-jevi odgovora | Sadržajni dokaz i granica pregleda |
| --- | --- | --- |
| 9868 | 2; 31406, 31407 | Čl. 42: blagovremeno zaustavljanje i bezbednost. Pravilo ne daje dozvolu za ometanje. Završna univerzalna heuristika u objašnjenju ostaje otvorena. |
| 9870 | 1; 31414 | Cela slika: magla/slaba vidljivost. Čl. 42 ne propisuje automatskih 60 km/h niti umanjenje od 20%. Zajedničko objašnjenje govori i o tuđim distraktorima. |
| 9873 | 2; 31424, 31425 | Cela slika: žuto označena oštećenja kolovoza. Prilagođavanje i bezbednost, ne automatskih 80 km/h ili 20%. Isti otvoreni završetak objašnjenja. |
| 9878 | 1; 31442 | III-24, crna silueta na beloj osnovi: početak naselja, opštih 50 po čl. 43. Naziv „naseljeno mesto” u objašnjenju ostaje za zasebnu ispravku. |
| 9891 | 1; 31487 | Motoput izvan naselja: 100, čl. 44. Glavni zaključak tačan; skraćene „merdevine” mogu se kasnije precizirati kao ostali putevi izvan naselja. |
| 9903 | 1; 31532 | Ostali put izvan naselja: 80, čl. 44. Glavna tvrdnja objašnjenja tačna. |
| 9908 | 1; 31552 | III-69.1, završetak motoputa, bez broja 80. U prikazanoj situaciji ostali put izvan naselja: 80 po čl. 44. Prethodna ispravka je sačuvana. |
| 9946 | 1; 31669 | III-24 i II-30 sa 40; moped/motocikl: u ovoj situaciji 40 po čl. 43. Završna široka formulacija nije odobrenje za njeno prenošenje na svaku situaciju. |
| 9947 | 1; 31672 | III-24 i II-30 sa 80; motocikl: 80 je dozvoljeno čl. 43 st. 2. Kartica više ne sugeriše pogrešan minimum 50. |
| 9948 | 1; 31675 | III-24.1 sa crvenom kosom trakom: završetak naselja i ostali put izvan naselja, 80 po čl. 44. |
| 9949 | 1; 31678 | III-69 i II-30 sa 60: strožih 60 prema čl. 20 i 44. Prethodno konkretno objašnjenje sačuvano. |
| 10488 | 3; 33319, 33321, 33317 | Čl. 42: vozilo/teret, vidljivost/preglednost, osobine/stanje puta. Zajednička završna heuristika ostaje otvorena. |
| 10489 | 2; 33325, 33324 | Čl. 42: gustina i drugi saobraćajni uslovi, atmosferske prilike. Ista otvorena heuristika. |
| 10491 | 1; 33332 | Čl. 43: opštih 50 bez drugačijeg znaka. Objašnjenje ispravno navodi mogućnost znakom dozvoljenih 80. |
| 10641 | 1; 33811 | Autoput izvan naselja: 130, čl. 44. Sve četiri ponuđene brzine pročitane. |

Uvodi i prvi SVG ispravno vezuju 50 za naselje, a 80/100/130 za odgovarajuće puteve izvan naselja. Svi brojevi i vozila u prvoj tabeli odgovaraju navedenim slikovnim pitanjima. Uslovi i ishodi vožnje u drugom odeljku odgovaraju čl. 42; tvrdnje o formulaciji pitanja ograničene su na konkretne primere i praćene upozorenjem da svaku opciju treba ceniti zasebno. Broj potrebnih odgovora 1/2/3 proveren je naspram svakog pitanja. Kartica se ne predstavlja kao prepis svih stavova čl. 42; nisu dodavane odredbe o prosečnoj brzini i ometanju sporom vožnjom koje ovih 15 pitanja ne traži.

Topička veza svih 15 pitanja prema kartici je opravdana. Relevantan je prvi odeljak za znakove, a drugi za prilagođavanje brzine. Odeljci se još otvaraju ručno: precizno otvaranje pododeljka je zaseban UX posao i nije razlog za dodavanje duple kartice.

## Primarni izvori i važeće izmene

Pročitani su puni čl. 20, 42–45 i 182 [ZOBS-a koji objavljuje MGSI](https://www.mgsi.gov.rs/sites/default/files/zakon_o_bezbednosti_saobracaja_na_putevima.pdf), uz svih devet članova [izmena 19/2025 Narodne skupštine](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/14_saziv/2943-24-lat.pdf). Izmene 19/2025 ne menjaju navedene odredbe. Za ovaj paket bitno je da čl. 20 st. 6 nabraja čl. 44/45/75/119/161/162/163/182, **ne čl. 43**. Zato opštih 50 ne poništava znakom dopuštenih 80 u uslovima čl. 43 st. 2.

Za znakove su pročitani čl. 25 tač. 30, čl. 35 tač. 19–22 i 74–75 i pun čl. 50 [važećeg PIS teksta kroz 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1). Upoređeni su [izvorni čl. 18, 21 i 28 izmena 76/2026](https://slgl.pravno-informacioni-sistem.rs/api/prins/viewdoc?uuid=a9a8f425-2be7-4056-af48-ec9bac188e36). Oni ne menjaju predmetne definicije niti bele/crne boje III-24/24.1 sa crvenom kosom trakom za završetak; druge okolne odredbe jesu menjane. Objavljeno 21.08.2026, stupanje osmog dana po čl. 50: izračunato 29.08.2026. Trogodišnji rok iz čl. 49 odnosi se na usklađivanje postojeće signalizacije.

Izgled III-24/24.1 neposredno je pregledan na PDF strani 30 [zvanične konsolidacije Puteva Srbije kroz 21/2024](https://putevi-srbije.rs/images/pdf/regulativa/Pravilnik_o_saobracajnoj_signalizaciji-21-24.pdf), kao i u originalnim slikama 9878/9946/9947/9948. PIS HTML povezuje odgovarajuće ilustracije, ali pojedinačni JPEG-ovi nisu otvoreni; njima nije pripisan neposredni vizuelni pregled. Nove usko određene reference dodate su u `izvori.json`; stare reference nisu prepisane niti proširene tako da neprimetno ponište druge preglede.

| Sačuvani izvor | SHA-256 bajtova |
| --- | --- |
| MGSI ZOBS kroz 76/2023 | `f0ba25df5eda00ef7172f6421a26c2dc4a543e7de96e23a97de0fa7fa0975aeb` |
| Narodna skupština, 19/2025 | `1d7580ea086508deb83cd0cf40adfc11e08d4134f415cd359acdf100e97174d3` |
| PIS prečišćen tekst 76/2026, lokalni HTML sa BOM | `8f9b78ea7810a5d5028f3b2878773d37080cf9096a2239dc2a306101708c45d7` |
| PIS izvorne izmene 76/2026, lokalni HTML sa BOM | `a8b10736064baca61cca9277b8f30dc957ff74ab0b45a646318f6d24c2741c7f` |
| Putevi Srbije, konsolidacija 21/2024 | `6945b4d703c8fe06f0404712638f91a0821cb6a25ef643a537d91239cf6af179` |

## Tačne izmene odobrenog predloga A

U `tools/build-explanations.mjs`, samo blok `CARDS['brzine']`:

1. U pasusu „Proveri znak i zakonsko ograničenje” završetak „Ako se primenjuje strože zakonsko ograničenje, poštuje se ono (čl. 20 st. 6–7).” zamenjen je sa: **„Izvan naselja uporedi znak sa ograničenjem za vrstu puta i primeni strože (čl. 20 st. 6 i čl. 44). Proveri i posebna ograničenja za konkretno vozilo i vozača (čl. 20 st. 6–7).”** Prethodna rečenica o najviše 80 u naselju ostaje.
2. SVG 2: `uporedi ograničenja` → `znak + važeća pravila`; `primeni strože` → `uključi i izuzetke`. Druga grana i sve pozicije ostaju.
3. SVG 3: tri kruga II-30 dobijaju belu ispunu umesto providne; samo brojevi 40/80/60 dobijaju stalnu `#111` umesto `currentColor`. Crveni obod ostaje.
4. SVG 4: dve plave osnove znakova postaju bele, okvir i dve grupe zgrada `#111`. Crvena traka ostaje, kao i svi brojevi i geometrija. To ispravlja pogrešnu plavo-belu predstavu III-24/24.1.
5. Sedam običnih informativnih natpisa (`DA`, `NE`, naslov primera, naslov znaka bez broja, `PREPREKA`, opis ishoda, opis uslova) prelazi sa fiksne zelene/plave/crvene na `currentColor`.
6. SVG 5: informativna linija zaustavljanja prelazi sa zelene na `currentColor`; dekorativna siva ispuna puta postaje `none`, pa ceo motocikl zadržava kontrastnu `currentColor` liniju; crvena prepreka dobija `currentColor` obod debljine 1. Nije menjana geometrija niti crvena semantika prepreke.
7. Šest ARIA vrednosti precizirano je na latinici. Posle sastavljanja izlaza, **samo** šest ARIA atributa `out.cards.brzine.h.c` prolazi postojeću transliteraciju. Broj šest se proverava pre upisa. Opšti parser, `toCyr`, druge kartice i objašnjenja nisu menjani.

Pristupačni opisi sada pokrivaju: (1) 50 i tri vrste puta izvan naselja; (2) znak i odgovarajuća pravila, mogućih 80 u naselju i posebna stroža ograničenja; (3) primere 40/80/60; (4) naselje/završetak u prikazanim primerima bez drugog ograničenja; (5) zaustavljanje pred vidljivom/predvidivom preprekom; (6) uslove i ishode u navedenim primerima. Svih šest ćiriličnih opisa je pročitano; SI oznaka `km/h` ostaje latinicom. Nema mešanja latinice u ćiriličnim rečima.

Prethodni kontrast običnih zelenih/plavih/crvenih natpisa na tamnoj kartici bio je približno 2,65–2,82:1. Provera je zasnovana na stvarnim bojama teksta i susedne podloge, prema [W3C objašnjenju SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Za liniju zaustavljanja, motocikl i granicu prepreke korišćen je prag 3:1 za bitne grafičke informacije iz [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Obojeni okviri SVG 2/6 su dodatna dekoracija uz potpuno iskazane tekstove/grane i nisu menjani. Ovo nije potpuna WCAG revizija aplikacije.

## Provere novog izlaza

- Inverzija svih preciznih zamena i dodatog lokalnog ARIA bloka vraća početne bajtove generatora: **27 ciljanih pogodaka, 4 NUL bajta pre/posle**.
- Parsirani `EXPLAIN`: promenjen samo `cards.brzine`; svih 1.327 `byQ`, drugih 38 kartica, metapodatak datuma i ostale mape jednaki su prethodnom stanju. `data.js` jednak po bajtovima. Svih **704 JPG-a** jednako je Git blobovima početnog HEAD-a.
- Geometrija svih šest SVG-ova × oba pisma identična je pre/posle: poređenje strukture i atributa ignoriše samo odobrene tekstove/boje/ARIA i dodat obod prepreke.
- Promena evidencije obuhvata tačno ovih 15 ID-jeva i jednu karticu. Ponovljeni `audit-content --write` ne menja bajtove evidencije; `--check` prolazi. Node testovi evidencije: **19/19**.
- Nova `tools/tests/brzine-card.browser.js`: **32/32 slučaja, 192 prikaza SVG-a** — 320/1280 px, oba pisma, obe teme, pojmovnik/uz pitanje, app slova 125% i stvarnih 200% osnovnog root fonta. Izmereno 19/20 px za app125% i 30/32 px za 200%. SVG natpisi imaju sopstvene veličine i ne udvostručuju se sa root fontom; zato ovo nije tvrdnja da su svi tekstovi aplikacije prošli SC 1.4.4.
- Najmanji izmereni odnos tekst/podloga i predmetna ključna linija/podloga: **12,28:1**. Provereni su boje propisanih znakova, natpisi van SVG-a, sudari teksta, granice kartice, svih šest ćiriličnih ARIA vrednosti, i **zaklanjanje svih 192 crteža zaglavljem ili navigacijom**. Pre snimanja se sadržaj stvarno skroluje u raspoloživi prostor; UI se ne skriva, visina se ne menja, ne koristi se force-click.
- Postojeći `drawing.browser.js`: **19 konteksta / 3.876 prikaza**, bez nalaza. Obuhvata sve postojeće crteže, ne samo ovu karticu; ovo je geometrijska provera, ne automatsko odobrenje smisla drugih kartica.
- Dodatni prolaz svih 15 pitanja na oba pisma: **30/30**, uz proveru prikazanog teksta pitanja, svih ID-jeva opcija, uspešnog izbora tačnih odgovora, tačnog teksta objašnjenja i otvaranja jedne kartice `brzine`. Puni tekstovi svih opcija pročitani su zasebno iz javnih podataka; ovaj browser prolaz poredi njihove ID-jeve. Sačuvano je i pregledano svih 12 prikaza SVG-a (L: 1280/light, C: 320/dark, app125%).

Browser radi na sopstvenom izolovanom `http://localhost:18767`, u `output/playwright/content002-runtime`, uz potpuno nove profile i blokirane service workere. Aplikacija je zamrznuti v139/`9714150`, SHA-256 `app.js` `77bfeb4cb2b65e7829e69e438bfd17173ffbffbc486c667943238900fe3fd3db`; nakon odobrenja korišćen je aktuelni CSS sa HEAD-a `0862e9a`, SHA-256 `4f9ff6e32a25c556076330df2a7d24cb6d44c56b7c4a295d723b8d3b367e56d1`, i novi `explanations.js`. Ovo je namerno opisan kombinovani fixture za sadržaj, a ne tvrdnja da je ceo v145 izvršen. Stvarni Chrome korisnika i originalna kopija nisu otvarani niti menjani.

Prvi pokušaj matrice odbačen je zato što je isti page zadržavao povećani root font pri drugoj ruti i dostizao 400%; tri snimka bila su zaklonjena. Test sada koristi zasebnu stranicu za svaki prikaz i proverava stvaran root font i zaklanjanje. Važeći snimci nose timestamp **1789062962040**. Stariji `1789062582678` nisu vizuelni dokaz. Rezultati i detaljni snimci su u ignorisanom `output/playwright/content-004-*.json` i `brzine-004-1789062962040-*.png`; reprezentativno su pregledani oba pisma, oba mesta i teme, uključujući pun mobilni viewport.

## Pošten status i šta ostaje

Svih 15 `questionAnswers` označeno je kao `reviewed` posle stvarnog čitanja svih opcija i poređenja sa izvorom; osam `image` je `reviewed`, a sedam je opravdano `not-applicable`. Devet objašnjenja ima zatvorenu konkretnu proveru, a **9868, 9870, 9873, 9878, 10488 i 10489 ostaju otvorena**, uključujući `legalSource` za njihove sporne dopunske tvrdnje. Proveren pravni osnov tačnog odgovora sam ne odobrava netačnu dodatnu rečenicu.

U pet zajedničkih objašnjenja ostaje „Odgovori sa … su uvek netačni”; za 9870/9873 ta rečenica govori i o distraktorima kojih tamo nema. U 9878 ostaje „ulazak u naseljeno mesto” umesto početka naselja III-24. To je **predlog B za zaseban sledeći paket**, ovde nije menjan. Moguće kasnije uredničko preciziranje merdevina 9891/9903 i sažimanje 9946/9947 ne predstavljaju novo pronađen pogrešan ključ odgovora.

Završno nezavisno odobrenje `/root`, 2026-09-10: ponovo pročitana cela nova kartica na oba pisma, svi SVG tekstovi/ARIA i obe tabele, uz raniji nezavisni pregled svih 15 pitanja/svih opcija/osam originalnih slika i izvora. Ponovljena inverzija 27 zamena i lokalnog ARIA bloka prolazi. Nezavisni browser rezultat: **32/32 slučaja i 192 nezaklonjena prikaza**, timestamp **1789063822041**, i drawing **3.876/19**. Neposredno su pregledani 320/c/dark/inline SVG2 i SVG4, pun viewport SVG5 i desktop SVG5. To je stvarni drugi sadržajni i vizuelni pregled, uz tehničke provere.

Kartica `brzine` i sva četiri njena aspekta sada su `reviewed`. Svih 15 pitanja ima odobrene `cardLinks` i `scripts`, na osnovu celog dvojezičnog pregleda. Zatvorena su pitanja **9891, 9903, 9908, 9946, 9947, 9948, 9949, 10491 i 10641**. Prethodno imenovanih šest ostaje `in-progress`, sa otvorenim `explanation` i `legalSource` za sporne dopunske tvrdnje. Odobrenje kartice ne označava te zasebne tvrdnje kao tačne. Nema potrebe za `needs-expert` zbog popravljivih natpisa.

Zbir posle završnog odobrenja: pitanja **1.310 unreviewed / 8 in-progress / 9 reviewed**; kartice **37 unreviewed / 1 in-progress / 1 reviewed**. `audit-content --write`/`--check` prolaze, a ponovljeni upis ne menja bajtove evidencije. Nijedan test nije sam proglasio sadržaj semantički tačnim.
