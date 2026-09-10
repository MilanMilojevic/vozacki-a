# Grupa 002 — prvenstvo i brzine: četiri ograničene ispravke

Datum: **2026-09-10**. Autor pregleda i izmena: **Codex /root/learning_visual_second_review**. Status: **delimična revizija; nijedna kartica ni pitanje nisu proglašeni potpuno pregledanim**.

## Obuhvat

Izmenjeni su samo `byQ[9908].x.l/c`, `byQ[9949].x.l/c`, `byQ[9991].x.l/c` i HTML na oba pisma kartica **`prvenstvo-prolaza`** i **`brzine`**. Izvor je `tools/build-explanations.mjs`; objavljeni podatak je njegov ponovo generisan `explanations.js`. Pitanja, sve opcije, tačnost opcija, ID-jevi, poeni i broj potrebnih odgovora ostali su jednaki. Ostalih **1324 objašnjenja** i **37 kartica**, kao i `bySub`, `atlas`, `situacije`, `zamke` i `updated`, potpuno su jednaki pre i posle.

U generatoru je urađena **31 jednoznačna tekstualna zamena**; dodatak na kraju sadrži tačne stare i nove fragmente. SVG promene obuhvataju natpise i pristupačne opise. Svih **9 + 6 SVG-ova** zadržalo je istu geometriju, koordinate, stilove, boje i putanje. Nisu menjani navigacija, aplikacioni kod, CSS ni verzija.

## Pravni i slikovni dokaz

Pročitani su puni relevantni članovi [ZOBS-a na sajtu MGSI](https://www.mgsi.gov.rs/sites/default/files/zakon_o_bezbednosti_saobracaja_na_putevima.pdf), u tekstu zaključno sa 76/2023, i svih devet članova [izmena 19/2025 na sajtu Narodne skupštine](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/14_saziv/2943-24-lat.pdf). Izmene se odnose na čl. 178, 203, 246, 249, 295, dopunu 318a i izmene 331a i 333; ne menjaju čl. 20, 42–47. Zvanična [lista donetih zakona](https://www.parlament.gov.rs/akti/doneti-zakoni/doneti-zakoni.1033.html) navodi donošenje 6. marta 2025.

Značenja znakova proverena su u [Pravilniku o saobraćajnoj signalizaciji sa sajta MGSI](https://mgsi.gov.rs/sites/default/files/Pravilnik%20o%20saobracajnoj%20signalizaciji_3.pdf), 85/2017 i 14/2021, dostupnom preko zvanične rubrike [Bezbednost saobraćaja](https://mgsi.gov.rs/lat/dokumenti/bezbednost-saobracaja): čl. 25 tač. 30, čl. 26 tač. 45 i čl. 35 tač. 75. Izvori sa konkretnim odredbama, datumom i SHA-256 preuzetog PDF-a registrovani su u `izvori.json`.

Dopunski pregled je utvrdio da taj MGSI PDF ne uključuje izmene 21/2024. Zato su tri definicije i izgled znakova upoređeni i sa [konsolidacijom kroz 21/2024 koju objavljuju Putevi Srbije](https://putevi-srbije.rs/images/pdf/regulativa/Pravilnik_o_saobracajnoj_signalizaciji-21-24.pdf), PDF strane **20, 23 i 41**: podržavaju iste konkretne zaključke. Sačuvani PDF ima SHA-256 `6945b4d703c8fe06f0404712638f91a0821cb6a25ef643a537d91239cf6af179`; registrovan je kao dodatni izvor. Referenca za ograničenje brzine precizirana je na **čl. 25 tač. 30**, dok kružni tok ostaje čl. 26 tač. 45.

**Važeća revizija dodatno potvrđena:** trag o izmenama 76/2026 pronađen je u sekundarnoj Paragrafovoj konsolidaciji, a zatim potvrđen u [zvaničnom prečišćenom tekstu PIS kroz 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1) i [izvornom tekstu izmena 76/2026 u Službenom glasniku preko PIS](https://slgl.pravno-informacioni-sistem.rs/api/prins/viewdoc?uuid=a9a8f425-2be7-4056-af48-ec9bac188e36). Izvore je javnom pretragom PIS pronašao nezavisni recenzent **Codex /root/a1_safe_harness**; autor ove grupe ih je posebno preuzeo i pročitao ciljane odredbe, a **Codex /root** ih je dodatno nezavisno proverio.

Zaglavlje potvrđuje objavljivanje **21.08.2026**, a član 50 izmena određuje osmi dan od objavljivanja: **29.08.2026** je izračunat datum stupanja na snagu. Trogodišnji rok iz čl. 49 odnosi se na usklađivanje postojeće signalizacije i ne odlaže stupanje propisa na snagu. Izmene čl. 18 menjaju tač. 12–14 člana 25, ne tačku 30; čl. 19 menja tač. 40–41 člana 26, ne tačku 45; čl. 21 menja druge tačke člana 35, ne tačku 75. **Ista značenja potvrđena su samo za tri ciljane definicije**, bez tvrdnje da su svi propisi oko tih znakova neizmenjeni: menjan je, na primer, način njihovog postavljanja i kombinovanja.

Oba PIS dokumenta dodata su u registar sa SHA-256 stvarno preuzetih bajtova, uključujući početni UTF-8 BOM: konsolidacija `8f9b78ea7810a5d5028f3b2878773d37080cf9096a2239dc2a306101708c45d7`; izvorne izmene `a8b10736064baca61cca9277b8f30dc957ff74ab0b45a646318f6d24c2741c7f`. Sačuvani su u `output/playwright/content-002-signalizacija-pis-76-2026.html` i `content-002-signalizacija-delta-76-2026.html`. Ovim je otklonjena privremena nedoumica o važećoj verziji; `legalSource` je potvrđen samo za tri konkretna pitanja. Cele kartice ostaju bez pravnog odobrenja.

| Potvrđena greška | Ograničena ispravka i dokaz |
| --- | --- |
| Signalizacija navodno obara sva pravila, pa desna strana i levo skretanje važe samo kada ničeg drugog nema. | Čl. 47 st. 6–8 izričito zadržava ta dva pravila među vozilima kojima je istovremeno dozvoljen prolaz, uključujući semafor i ovlašćeno lice. Usklađeni su uvod, opis hijerarhije, uvod u crteže i isti iskaz u odeljku o međusobnom prvenstvu posebnih vozila. Slikovni primeri 9519 i 9521 dodatno proveravaju signal i međusobno pravilo. |
| „Znak uvek pobija opšte pravilo”, „važi TAJ broj” i zaključivanje o tačnom odgovoru prema formulaciji pitanja. | Čl. 20 st. 6–7 zahteva strože zakonsko ograničenje kada se primenjuje; čl. 43 dopušta posebno označeno ograničenje do 80 u naselju, dok čl. 44 razlikuje puteve izvan naselja. Čl. 42 određuje prilagođavanje uslovima. Natpisi sada traže prepoznavanje znaka i poređenje ograničenja. Primeri odgovora vezani su za konkretne ID-jeve, bez univerzalnog „nikad broj”. |
| 9908 je opisan kao znak sa brojem 80. | Originalni `img/9908.jpg` prikazuje **III-69.1, završetak motoputa**, bez broja 80. Broj proizlazi iz čl. 44 za prikazani ostali put izvan naselja. Tačan odgovor ostaje **31552**, req=1, pts=3; pročitane su sve četiri opcije na oba pisma. Popravljeni su objašnjenje i red tabele, uz pravilno razvrstavanje reference u kartici. |
| 9991 navodno prikazuje vozača koji je već u krugu, gde desna strana ne odlučuje i gde je „sleva” jedini poseban slučaj. | Na vidljivom prilazu u `img/9991.jpg` postoji plavi znak **II-45.2**, a nema vidljivog znaka ustupanja prvenstva. Plavi znak uređuje kretanje oko ostrva. Prema vozilu sleva primenjuje se desna strana: dolaziš mu zdesna. Tačan odgovor ostaje **31820**, req=1, pts=2; obe opcije pročitane su na oba pisma. Nije dodata pretpostavka o nevidljivoj signalizaciji ili tačnom položaju „već u krugu”. Za poređenje, `img/9987.jpg` zaista pokazuje i trougao ustupanja. |

Kod **9949** originalna slika prikazuje znak ograničenja 60 iznad znaka za motoput. Objašnjenje je skraćeno na konkretno niže ograničenje od opštih 100. Tačan odgovor **31678**, req=1, pts=3, ostao je isti; sve četiri opcije i oba pisma pročitani su.

Pregledane su cele dve kartice, svih 15 njihovih SVG-ova i **74 povezana situaciona prikaza**: 66 uz prvenstvo i 8 uz brzine. Pri tom pregledu slike su čitane uz pitanje i tačne opcije. **To nije iscrpna provera svake ponuđene opcije i svakog objašnjenja svih 74 pitanja.** Kartice nemaju povezani atlas. Za imenovane potporne primere i tri promenjena pitanja urađen je detaljniji pregled opisan gore. Nova uporedna provera sirovog MUP izvora i potvrda instruktora nisu urađene.

SHA-256 originalnih slika za ključne zaključke:

| Slika | SHA-256 |
| --- | --- |
| `img/9908.jpg` | `6d1c130d35b9068484c8650518e7911916331df4c93b38445c0caef5dae14177` |
| `img/9949.jpg` | `acd88914ebf3529adfee9514b66e3cb3416119171294b961982c10a79a61086f` |
| `img/9987.jpg` | `eb72d635f43815dddaee09702229a3b42a8ac813453cecfb85c9bb2ff6edede8` |
| `img/9991.jpg` | `773722425446c16dd5ee5373085e94141d393fa0ff33980b54e28aa4d2486487` |

## Tehnička i vizuelna provera

Generator je pokrenut iz `tools/` komandom `node build-explanations.mjs`: skener pisma čist, pokrivenost **1327/1327**. Pre/posle poređenje parsiranog `window.EXPLAIN` potvrđuje gore naveden tačan obuhvat. `data.js` jednak je po bajtovima polaznom radnom fajlu. Generator i dalje sadrži **4 NUL bajta**; obrnute zamene vraćaju sve polazne bajtove. Poređenje SVG-ova posle uklanjanja samo sadržaja tekstualnih čvorova i vrednosti `aria-label` potvrđuje neizmenjenu geometriju i stilove na oba pisma.

Browser je koristio isključivo nove kontekste sopstvene privremene CLI sesije na **localhost:18767**, sa blokiranim service worker-om. Test kopija `output/playwright/content002-runtime` ima javni runtime **v139 / commit 9714150**, kojem je dodat samo novi `explanations.js`. `app.js`, `style.css`, `version.js` i `data.js` jednaki su tim Git blobovima nakon normalizacije CRLF/LF. Razlika u završecima redova nije predstavljena kao jednakost svih bajtova. Parsirani `QUIZ` test kopije potpuno je jednak radnom `data.js`.

| Fajl test kopije | SHA-256 bajtova |
| --- | --- |
| `app.js` | `77bfeb4cb2b65e7829e69e438bfd17173ffbffbc486c667943238900fe3fd3db` |
| `style.css` | `0f770e80b5c104f61baacbe767f3f02705fb0705e3d102b12d27413b96ef333d` |

- **48/48** slučajeva: tri pitanja × oba pisma × širine 320/1280 × svetla/tamna tema × veličina slova 100%/125%. Provereni su pitanje na pravom pismu, odsustvo objašnjenja pre odgovora, objašnjenje posle odgovora, tačan generisani tekst, isti tačni ID-jevi opcija, isti uspešan ishod i odsustvo horizontalnog prelivanja objašnjenja i dokumenta.
- **16/16** prikaza kartica: dve kartice × oba pisma × 320/1280 × svetla/tamna tema, slova 125%. Provereni su prisustvo i vidljivost promenjenih pasusa, njihove granice i novi tekst dijagrama odluke. Pregledani su reprezentativni snimci kružnog toka i dijagrama na telefonu i desktopu, na oba pisma i u obe teme.
- `tools/tests/drawing.browser.js`: **19 konteksta, 3876 pregleda SVG-ova**, bez natpisa manjih od 10 px, otkrivenih sudara teksta ili izlaska van SVG/kartice. Najmanji izmereni natpis: **10,0258 px**. Matrica obuhvata 320/375 sa oba pisma, teme i veličine 100%/125%, zatim 370/371/1280 za latinicu, svetlu temu i 100%. Prvi prolaz je urađen pre poslednje izmene ARIA opisa; završni prolaz na finalnom sadržaju naveden je u završnoj proveri ispod.

Snimci i privremeni izveštaji nalaze se samo u ignorisanom `output/playwright/`: `content-002-{9908,9949,9991}-{l,c}-{320,1280}-{light,dark}.png`, `content-002-card-...png`, `content-002-browser-results.json`, `content-002-cards-results.json`, `content-002-semantic-verification.json` i `content-002-fixture.json`. Vizuelno su pregledani odabrani reprezentativni snimci; svih 48/16 slučajeva imaju automatizovane rezultate. Ove provere ne tvrde potpunu pristupačnost, proveru kontrasta svakog SVG natpisa, 200% uvećanje pregledača niti uspešan prenos znanja na stvarni ispit. Korisnikov Chrome i originalna radna kopija nisu otvarani ili menjani.

## Evidencija i šta ostaje

Promena celih zavisnih kartica i njihovih pravnih referenci menja `contentHash` **122 zapisa pitanja**, što je očekivano. Od tih zapisa samo **9908, 9949 i 9991** dobijaju novi `in-progress` pregled: `questionAnswers`, `image`, `explanation` i `legalSource` pregledani su u ovom obuhvatu, uključujući proveru važećih ciljanih definicija kroz 76/2026. `cardLinks` i sveobuhvatni `scripts` ostaju `unreviewed`, jer nije odobrena celokupna zavisna kartica. Ostalih 119 pogođenih zapisa ostaju `unreviewed`; promena sažetka im ne daje semantičko odobrenje. Zapisi 7962/8007 iz grupe 001 ostali su jednaki. Dodavanje novijih izvora pravilno je ponovo otvorilo pet delimičnih zapisa; prethodni pregledi i privremeno otvorena provera važeće revizije sačuvani su u `history`, a konačan pregled potvrđuje samo ovde navedene tvrdnje.

Kartica **`prvenstvo-prolaza` ostaje `needs-expert`**. Poznate preostale tačke, koje ovaj ograničeni paket nije menjao:

- Izvorni red **266** spaja uslove za pratnju i vozila sa prvenstvom u univerzalna „sva tri” uslova bez sirene; razdvojiti čl. 106 i 108.
- Red **267** svodi uređaje na „vozila nadležnih državnih organa”; proveriti pune propisane kategorije vozila/službi.
- Red **268** tvrdi „nikad obavezno” i da su takve opcije „uvek netačne”; uskladiti sa posebnim naređenjem zaustavljanja iz čl. 110 i konkretnim pitanjima.
- Red **265** u ćirilici prikazuje **`&гт;`**, nastalo transliteracijom HTML entiteta `&gt;`; to ostaje otvorena greška pisma, bez prikrivanja statusom `reviewed`.

Kartica **`brzine` ostaje `in-progress`** sa nepotvrđenim celovitim kontrolama. Ostaju celovita provera svih tvrdnji, vernosti stilizovanih znakova i svih povezanih opcija/objašnjenja. Ovaj paket ne menja druge postojeće `byQ` heuristike, čak i kada su slične popravljenom tekstu kartice; njih treba pregledati u sledećoj ograničenoj grupi.

Ukupno posle upisa: **1322 pitanja unreviewed, 5 in-progress, 0 reviewed; 37 kartica unreviewed, 1 in-progress, 1 needs-expert, 0 reviewed**. **Nije završena potpuna semantička revizija 1327 pitanja.**

## Završna provera

`node --test tools/tests/content-audit.test.mjs`: **19/19**. `node tools/audit-content.mjs --check`: aktuelna evidencija, bez tvrdnje o automatskoj semantičkoj tačnosti. Završni ponovljeni `drawing.browser.js` na finalnom sadržaju (uključujući ARIA opis) prošao je **19/19 konteksta i 3876/3876 pregleda**, minimum **10,0258 px**. `git diff --check` za fajlove ovog paketa nije našao greške belog prostora.

## Dodatak — tačne zamene izvora

Sledeće izmene su tekstualni fragmenti generatora, uključujući potrebne HTML/SVG oznake. Ćirilica se generiše postojećom transliteracijom. Redosled je redosled primene; poslednja zamena dodatno precizira kontekst „izvan naselja” u pristupačnom opisu prvog SVG-a kartice `brzine`.

### 1

Pre:

```text
<p><b>Hijerarhija (ZOBS čl. 20)</b> — jače pobija slabije:</p>
```

Posle:

```text
<p><b>Hijerarhija (ZOBS čl. 20)</b> — redosled postupanja kada se značenja razlikuju:</p>
```

### 2

Pre:

```text
što je traka viša — to je jača: saobraćajac pobija semafor, semafor pobija znakove...
```

Posle:

```text
Prati viši nalog kada se razlikuje od nižeg. Pravila koja nisu njime drugačije uređena i dalje važe.
```

### 3

Pre:

```text
Ovo je poslednja traka piramide, razvijena. Svih pet pravila je u istom članu i sva važe samo <b>ako prvenstvo prolaza nije regulisano na drugi način</b> — čim se pojavi saobraćajac, semafor, žuti romb, trougao ili STOP, pravilo pada.
```

Posle:

```text
Signalizacija određuje kome je prolaz dozvoljen. Među vozilima sa istovremenim pravom prolaza i dalje važe <b>pravila desne strane i levog skretanja</b>, uključujući kada im prolaz istovremeno dozvole semafor ili ovlašćeno lice (čl. 47 st. 6–8).
```

### 4

Pre:

```text
Crteži važe dok <i>nema znaka</i>: čim se između tebe i poprečnog puta pojavi trougao, STOP ili žuti romb, on odlučuje umesto pravila — ali prema vozilu iz suprotnog smera i dalje važi pravilo levog skretanja (zato i uz znak STOP, kad skrećeš ulevo, propuštaš i onog preko puta koji ide pravo).
```

Posle:

```text
Crteži prikazuju raskrsnice bez signalizacije. Kada signalizacija drugačije uređuje prvenstvo, postupi po njoj. Pravilo levog skretanja primeni kad tebi i vozilu iz suprotnog smera istovremeno pripada pravo prolaza.
```

### 5

Pre:

```text
Skoro sva pitanja ove grupe su slikovna i rešavaju se u dva koraka: prvo <i>ima li znaka</i>, pa tek onda pravilo.
```

Posle:

```text
Na slici prvo proveri signalizaciju, zatim pravilo koje uređuje odnos sa konkretnim vozilom.
```

### 6

Pre:

```text
<p><b>Kružni tok je jedino mesto gde je „sleva" tačan odgovor.</b> Prepoznaješ ga po paru znakova na ulazu: <b>trougao „ustupi prvenstvo" + plavi okrugli znak kružnog toka</b>. Kad tek ulaziš — propuštaš vozilo koje ti dolazi <b>sa leve strane</b>. Kad si već u krugu (razdelno ostrvo ti je s leve strane) — prednost je <b>tvoja</b> u odnosu na vozilo sleva. Pravilo desne strane ovde ne odlučuje ništa; odlučuje znak na ulazu.</p>
```

Posle:

```text
<p><b>Kružni tok: proveri znakove koji uređuju prvenstvo.</b> Plavi znak određuje kružni smer kretanja, ne prvenstvo. U #9987 uz njega stoji trougao „ustupi prvenstvo", pa propuštaš vozilo sleva. U #9991 na prikazanom prilazu nema znaka ustupanja prvenstva: imaš prednost prema vozilu sleva po pravilu desne strane, jer mu dolaziš zdesna (čl. 47).</p>
```

### 7

Pre:

```text
(STOP, žuti romb, linija zaustavljanja), i tek ako ničega od toga nema — desna strana i levo skretanje.
```

Posle:

```text
(STOP, žuti romb, linija zaustavljanja); među vozilima kojima je istovremeno dozvoljen prolaz primenjuju se desna strana i levo skretanje (čl. 47).
```

### 8

Pre:

```text
<text x="94" y="114" font-size="14" font-weight="bold" fill="currentColor">VAN NASELJA</text>
```

Posle:

```text
<text x="94" y="114" font-size="14" font-weight="bold" fill="currentColor">OSTALI PUTEVI</text>
```

### 9

Pre:

```text
<p><b>Opšta ograničenja</b> (kad znak ne kaže drugačije): naselje 50 (čl. 43), van naselja 80, motoput 100, autoput 130 (čl. 44). Pamti merdevine: <b>50 → 80 → 100 → 130</b> — što bolji put, to više.</p>
```

Posle:

```text
<p><b>Opšta ograničenja:</b> u naselju 50 km/h (čl. 43); izvan naselja 80 na ostalim putevima, 100 na motoputu i 130 na autoputu (čl. 44). Pamti <b>50 → 80 → 100 → 130</b> uz odgovarajuću vrstu puta.</p>
```

### 10

Pre:

```text
<p><b>Znak uvek pobija opšte pravilo</b> — i naniže i naviše: znakom se u naselju može dozvoliti i do 80 (čl. 43 st. 2).</p>
```

Posle:

```text
<p><b>Proveri znak i zakonsko ograničenje.</b> U naselju znak može odrediti niže ograničenje ili, kada uslovi puta dopuštaju, najviše 80 km/h (čl. 43). Ako se primenjuje strože zakonsko ograničenje, poštuje se ono (čl. 20 st. 6–7).</p>
```

### 11

Pre:

```text
<p><b>Zamka u odgovorima:</b> varijante sa "raspoloživim vremenom", "udobnošću" ili "da što pre stigneš" su UVEK netačne — vreme dolaska nikad nije zakonski faktor.</p>
```

Posle:

```text
<p><b>U #10488 i #10489</b> biraju se uslovi vožnje iz čl. 42; ponuđeni raspoloživo vreme, žurba i udobnost ne zamenjuju te uslove.</p>
```

### 12

Pre:

```text
Pitanja sa znakom: prvo traži broj NA znaku
```

Posle:

```text
Ograničenje brzine: pročitaj značenje znaka
```

### 13

Pre:

```text
aria-label="odluka: ako znak nosi broj vazi taj broj, ako znak nema broj citas sta znak znaci"
```

Posle:

```text
aria-label="Pročitaj znak: ograničenje brzine uporedi sa zakonskim ograničenjem; za druge znakove utvrdi značenje i primeni odgovarajuća pravila"
```

### 14

Pre:

```text
>pitanje: „nakon saobraćajnog znaka"</text>
```

Posle:

```text
>Koliko je dozvoljeno?</text>
```

### 15

Pre:

```text
>ima li NA ZNAKU broj?</text>
```

Posle:

```text
>znak ograničenja brzine?</text>
```

### 16

Pre:

```text
>važi TAJ broj</text>
```

Posle:

```text
>uporedi ograničenja</text>
```

### 17

Pre:

```text
>opšte pravilo pada</text>
```

Posle:

```text
>primeni strože</text>
```

### 18

Pre:

```text
>čitaš ŠTA znak</text>
```

Posle:

```text
>pročitaj značenje</text>
```

### 19

Pre:

```text
<text x="240" y="154" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">znači</text>
```

Posle:

```text
<text x="240" y="154" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">primeni pravila</text>
```

### 20

Pre:

```text
aria-label="kad znak nosi broj: 40 je ispod opsteg pravila, 80 je iznad njega u naselju, 60 tamo gde bi bilo 100"
```

Posle:

```text
aria-label="Primeri ograničenja: 40 u naselju, 80 u naselju kada je dozvoljeno znakom, 60 na motoputu"
```

### 21

Pre:

```text
>ZNAK NOSI BROJ → važi taj broj</text>
```

Posle:

```text
>PRIMERI OGRANIČENJA BRZINE</text>
```

### 22

Pre:

```text
<p><b>Kad pitanje kaže „nakon saobraćajnog znaka", odgovor je broj</b> — ostaje samo da odlučiš odakle taj broj dolazi. Nosi li znak broj, važi taj broj, a opšte pravilo pada (#9908, #9946, #9947, #9949). Nema li broja, čitaš šta znak znači i primenjuješ merdevine po vrsti puta sa slike gore (#9878, #9948).</p>
```

Posle:

```text
<p><b>Prepoznaj konkretan znak.</b> U #9946, #9947 i #9949 znak ograničava brzinu na 40, 80 i 60 km/h. U #9878 i #9948 znak označava početak odnosno završetak naselja. U #9908 označava završetak motoputa, pa se primenjuje ograničenje za put kojim nastavljaš.</p>
```

### 23

Pre:

```text
<tr><td>postavljen znak sa brojem 80</td><td><b>80</b> — konkretan znak jači je od opšteg ograničenja (#9908)</td></tr>
```

Posle:

```text
<tr><td>završetak motoputa, bez broja na znaku</td><td><b>80</b> — u prikazanoj situaciji nastavljaš ostalim putem izvan naselja (#9908, čl. 44)</td></tr>
```

### 24

Pre:

```text
<p><b>Vrsta vozila te ne spasava:</b> i kad pitanje kaže „vozač mopeda, odnosno motocikla", odgovor je i dalje broj sa znaka — u ovim situacijama za njih nema posebne opšte granice (#9946, #9947, #9949).</p>
```

Posle:

```text
<p>Proveri i navedeno vozilo: #9946 obuhvata moped i motocikl; #9947 i #9949 pitaju za motocikl.</p>
```

### 25

Pre:

```text
<p><b>Merilo nije broj nego rastojanje:</b> smeš onoliko brzo koliko ti treba da vozilo blagovremeno zaustaviš pred svakom preprekom koju pod datim okolnostima možeš da vidiš ili imaš razloga da predvidiš. Zato u ovim pitanjima nijedan broj ni procenat nije tačan — ni „najmanje 20% manje od dozvoljene", ni „najviše 60 km/h", ni „najviše 80 km/h" (#9870, #9873).</p>
```

Posle:

```text
<p><b>Prilagođena brzina</b> mora omogućiti blagovremeno zaustavljanje pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš. To može zahtevati vožnju sporiju od najveće dozvoljene brzine. U #9870 (magla) i #9873 (oštećen kolovoz) ponuđeni brojevi i procenat ne zamenjuju taj uslov (čl. 42).</p>
```

### 26

Pre:

```text
<p><b>Dva oblika pitanja traže dva oblika tačnog odgovora:</b></p>
```

Posle:

```text
<p><b>U ovim primerima razlikuj uslove vožnje i potreban ishod:</b></p>
```

### 27

Pre:

```text
<p class="mut">Pamtilica na formulaciju: „nakon saobraćajnog znaka" → odgovor je BROJ (#9878, #9908, #9946, #9947, #9948, #9949); „u situaciji prikazanoj na slici" bez pomena znaka → odgovor je rečenica o zaustavljanju pred preprekom, nikad broj (#9870, #9873).</p>
```

Posle:

```text
<p class="mut">Svaki ponuđeni odgovor proceni prema situaciji i pravilu, ne samo prema formulaciji pitanja.</p>
```

### 28

Pre:

```text
X[9991] = { ...(X[9991] || {}), x: 'Ti si već u kružnom toku, ostrvo ti je sa leve strane, pa prema vozilu koje ti dolazi sleva prednost pripada tebi. Prvenstvo u krugu određuju znakovi na ulazima, a ne pravilo desne strane, i zato je ovo jedino mesto gde leva strana daje drugačiji ishod. Zamka je da se pravilo desne strane primeni naopako, pa da tražiš propuštanje tamo gde ga nema.' };
```

Posle:

```text
X[9991] = { ...(X[9991] || {}), x: 'Plavi znak određuje kružni smer kretanja, ne prvenstvo. Na prikazanom prilazu nema znaka ustupanja prvenstva. Prema vozilu sleva imaš prednost po pravilu desne strane, jer mu dolaziš zdesna (ZOBS čl. 47).' };
```

### 29

Pre:

```text
X[9908] = { x: znakJaci, card: 'brzine' };
```

Posle:

```text
X[9908] = { x: 'Znak označava završetak motoputa. U prikazanoj situaciji nastavljaš ostalim putem izvan naselja, gde je opšte ograničenje 80 km/h (ZOBS čl. 44).', card: 'brzine' };
```

### 30

Pre:

```text
X[9949] = { x: 'Na putu za motorna vozila / motoputu opšte ograničenje je 100 km/h (čl. 44), ali postavljeni znak (60) je jači — važi 60. Znak uvek pobija opšte pravilo.', card: 'brzine' };
```

Posle:

```text
X[9949] = { x: 'Na prikazanom motoputu znak ograničava brzinu na 60 km/h, manje od opštih 100 km/h (ZOBS čl. 20 i 44).', card: 'brzine' };
```

### 31

Pre:

```text
aria-label="ograničenja brzine po vrsti puta: 50 u naselju, 80 van naselja, 100 na motoputu, 130 na autoputu"
```

Posle:

```text
aria-label="Opšta ograničenja: u naselju 50; izvan naselja 80 na ostalim putevima, 100 na motoputu, 130 na autoputu"
```
