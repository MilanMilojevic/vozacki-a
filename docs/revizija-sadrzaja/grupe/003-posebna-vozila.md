# Grupa 003 — posebna vozila: izuzeci, uređaji i zaustavljanje

Datum: **2026-09-10**. Autor: **Codex /root/learning_visual_second_review**. Polazni sadržaj: **v142, commit 38dcb83**. Status: **ograničena ispravka; potpuna semantička revizija kartice i povezanih pitanja nije završena**.

## Tačan obuhvat

Četiri jednoznačne zamene u `tools/build-explanations.mjs`, izvorni redovi **265–268**, menjaju samo `EXPLAIN.cards['prvenstvo-prolaza'].h.l/c`. Popravljeni su poređenje dve grupe vozila, različiti uslovi za svetla bez sirene, krug vozila na kojima smeju biti posebni uređaji i preširoko „nikad obavezno” za zaustavljanje. Postojeća tabela o članu 110 ostaje ista.

Nijedno `byQ` objašnjenje nije menjano. Zvanični tekstovi pitanja, sve opcije, njihovi ID-jevi/redosled/tačnost, bodovi, broj potrebnih odgovora i slike ostaju isti. Nisu menjani ostalih **38 kartica**, `bySub`, `atlas`, `situacije`, `zamke`, `updated`, aplikacija, CSS, navigacija ili verzija. Svih **9 SVG-ova kartice identično je po bajtovima na oba pisma**.

## Primarni dokaz i razlike koje se uče

Pročitani su puni članovi **106, 107, 108, 109 i 110** [ZOBS-a koji objavljuje MGSI](https://www.mgsi.gov.rs/sites/default/files/zakon_o_bezbednosti_saobracaja_na_putevima.pdf), PDF strane 51–54, tekst zaključno sa 76/2023. Ponovo je pročitano svih devet članova, obe strane [izmena 19/2025 koje objavljuje Narodna skupština](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/14_saziv/2943-24-lat.pdf): izmene čl. 178, 203, 246, 249, 295, dopuna 318a i izmene 331a i 333 ne menjaju čl. 106–110. Ovo je provera imenovanih odredaba, ne pravno odobrenje cele kartice.

Novi izvor `zobs-cl106-cl110-mgsi-76-2023` dodat je u `izvori.json` i vezan samo uz karticu. Raniji izvori nisu prepisivani. Sačuvani javni PDF-ovi u `output/playwright/content-001-pdf/` imaju SHA-256:

- `zobs-mgsi-76-2023.pdf`: `f0ba25df5eda00ef7172f6421a26c2dc4a543e7de96e23a97de0fa7fa0975aeb`.
- `zobs-izmene-19-2025.pdf`: `1d7580ea086508deb83cd0cf40adfc11e08d4134f415cd359acdf100e97174d3`.

| Nalaz | Potvrđen ograničen zaključak |
| --- | --- |
| Red 266 tražio je sva tri uslova za obe grupe vozila. | Čl. 106 st. 3 dopušta vozilu pod pratnjom samo svetla uz vidljivost/bezbednost i bez prekoračenja dozvoljene brzine. Dodatni uslov o ometanju službenog zadatka sirenom nalazi se u čl. 108 st. 4 za vozilo sa prvenstvom prolaza. Pitanje **10569** razlikuje prvi slučaj, **10584/10585** drugi; njihova postojeća objašnjenja već prave potrebnu razliku. |
| Red 267 svodio je sva dozvoljena vozila na vozila državnih organa. | Čl. 106 st. 1 i 5 određuje vozila imenovanih organa namenjena pratnji; čl. 108 st. 1, 2 i 5 uključuje i hitnu medicinsku pomoć, vatrogasnu službu i određena vozila za prevoz lica lišenih slobode. Uslov za upotrebu ostaje odvojen: pratnja, odnosno neodložna službena radnja iz čl. 106 st. 6 i 108 st. 6. |
| Red 268 tvrdio je da su ponude „obavezno zaustavite” uvek netačne. | Čl. 107 i 109 uređuju opšti susret/propustanje i zaustavljanje ili sklanjanje po potrebi, uz postupanje po naređenjima. Čl. 110 st. 1 nalaže odmah bezbedno zaustavljanje neposredno ispred policijskog vozila koje daje i znak upozorenja; st. 2 nalaže praćenje policijskog vozila i zaustavljanje iza njega na pogodnom mestu. **10383/10384** i postojeća tabela to tačno razlikuju. |
| Latinično `&gt;` postajalo je vidljivo ćirilično `&гт;`. | `toCyr()` štiti tagove, ali ova tekstualna HTML oznaka ostaje van zaštite i slova se preslovljavaju. Poređenje je napisano rečima na jednom mestu. Nije menjan globalni postupak preslovljavanja. Međusobna prednost podržana je čl. 106 st. 7 i 108 st. 7. |

## Pročitana pitanja i granica tog pregleda

Za sledećih **17 ID-jeva** pročitani su ceo tekst, sve ponuđene opcije i postojeće objašnjenje na oba pisma. Sva nose po 2 boda. Tabela služi kao trag pregleda; ne predstavlja nove oznake `reviewed` u evidenciji.

| ID-jevi | Konkretna provera |
| --- | --- |
| 10567, 10569, 10582, 10584, 10585 | Opšte davanje znakova i različiti izuzeci za sirenu. Kod 10585 req=3 i tačni ID-jevi 33624/33626/33628; kod 10569 req=1, tačan 33575. |
| 10571, 10572, 10586, 10587 | Ugradnja uređaja i uslovi upotrebe. Req=1; tačni ID-jevi redom 33581, 33584, 33631 i 33632. |
| 10374, 10375, 10579, 10580 | Opšte postupanje pri susretu: req redom 2/3/2/3. Razlikovani su propustanje, omogućavanje prolaza, postupanje po naređenjima i sklanjanje/zaustavljanje po potrebi. |
| 10383, 10384 | Posebna zaustavljanja iz čl. 110; req=1, tačni ID-jevi 32973 i 32976. |
| 10381, 10385 | Prolaz kolone iza vozila sa prvenstvom i preticanje pojedinačnog policijskog vozila; req=1, tačni 32969 i 32979. Ove zadržane tvrdnje nisu prepisivane. |

Među ovih 17 pitanja **samo 10385 ima sliku**. Otvorena je cela originalna `img/10385.jpg` (800 × 472): prikaz vozila koje pretiče policijsko vozilo uz isprekidanu središnju liniju pročitan je zajedno sa svim opcijama. SHA-256: `d55770daf7c7396c92a2c2a8b06c56b2cb9e1ad37b7b48394200bfc9f3b36271`. Nije pregledano novih 17 slika niti je ovim završen pregled svih 66 situacionih slika kartice.

**Preostalo:** zvanično označen odgovor **10586 / 33631** koristi skraćeno „samo na vozilima nadležnih državnih organa”, dok čl. 108 izričito imenuje i medicinsku/vatrogasnu službu bez takvog opšteg ograničenja vlasništva. Odgovor i postojeće objašnjenje (koje dodaje „i službi iz zakona”) ostavljeni su isti; za razrešenje odnosa skraćenog odgovora i punog zakonskog kruga potrebni su poređenje sa izvornom ispitnom bazom i stručna provera. Formulacije pojedinačnih objašnjenja o „obavezno” i obaveznom davanju znakova treba dalje proveravati u konkretnom kontekstu njihovih pitanja, bez pretvaranja u univerzalne heuristike. Nije urađena nova provera sirovog MUP izvora niti potvrda instruktora.

## Provere i granice vizuelnog dokaza

Generator: `node build-explanations.mjs` iz `tools/`; skener pisma čist, **1327/1327** objašnjenja. `output/playwright/content-003-verify.mjs` potvrđuje parsiranu razliku samo jedne kartice, svih 1327 objašnjenja i ostale javne mape neizmenjene, `data.js` jednak po bajtovima i sve SVG-ove identične. Četiri NUL bajta su očuvana; obrnute četiri zamene vraćaju svaki početni bajt generatora. Poređenje ne izvršava javni JavaScript.

Browser koristi samo nove kontekste privremene CLI sesije **vozacki-content003**, sa blokiranim service worker-om, na **localhost:18767**. Test kopija `output/playwright/content002-runtime` ostaje javni runtime **v139 / commit 9714150**, uz zamenjen samo `explanations.js` ovim paketom. Nije korišćen aktivni korisnikov Chrome niti živa razvojna aplikacija. `app.js` SHA-256 je `77bfeb4cb2b65e7829e69e438bfd17173ffbffbc486c667943238900fe3fd3db`, a `style.css` `0f770e80b5c104f61baacbe767f3f02705fb0705e3d102b12d27413b96ef333d`; prethodno je potvrđena jednakost tim Git blobovima uz normalizaciju CRLF/LF. To je granica dokaza prikaza, ne tvrdnja da je ispitan svaki kasniji aplikacioni commit.

- **16/16 prikaza:** širine 320/1280 × oba pisma × svetla/tamna tema × font 100%/125%. Četiri pasusa i postojeća tabela su prisutni i vidljivi; pojedinačni tekstualni redovi ne prelaze horizontalne granice viewporta. Nema vidljivog neobrađenog entiteta niti zalutalih latiničnih slova u ćiriličnim izmenjenim pasusima.
- **4/4 dodatna prikaza skrolovanja:** oba pisma i teme, 320 px, 125%. Kraj dugog pasusa o uređajima može se skrolovanjem čitati iznad donje navigacije. Snimak samog dugog elementa može sadržati preklop fiksne navigacije pri snimanju; zato su posebno sačuvani i pregledani snimci kraja pasusa u stvarnom viewportu. Ne tvrdi se da ceo pasus staje na jedan ekran.
- Pregledani su reprezentativni snimci pasusa na oba pisma, pri telefonskoj i desktop širini. Dokazi: `output/playwright/content-003-browser-results.json`, `content-003-scroll-results.json`, `content-003-*.png` i `content-003-semantic-verification.json`.
- **19/19** Node testova `tools/tests/content-audit.test.mjs` prolazi; `node tools/audit-content.mjs --check` prolazi. Pošto nema promene nijednog SVG-a, nije ponavljana kompletna provera geometrije crteža iz grupe 002.

## Evidencija: ispravljena četiri nalaza, bez odobrenja cele kartice

Nezavisan root pregled: ponovo pročitani primarni čl. 106–110 i izmene 19/2025,
četiri zamene proverene prema stvarnom Git sadržaju `38dcb83`, ne samo radnom
snimku. Ponovljene provere daju **19/19 Node**, **16/16 browser**, neizmenjene
pojedinačne tekstove/SVG-ove i uspešan `audit --check`. Dokazi su
`output/playwright/root-content-003-check.mjs`, `root-content-003-node.log`
i `root-content-003-browser.json`.

Promena cele zavisne kartice konzervativno menja otiske **107 pitanja**; **1220 zapisa pitanja** ostaje potpuno isto. Prethodni delimični pregled **9991** arhiviran je u `history`, a njegov trenutni status vraćen na `unreviewed`; njegovo objašnjenje nije promenjeno. Raniji nalazi nisu izgubljeni niti su automatski preneti na novi otisak.

Kartica `prvenstvo-prolaza` sada je **in-progress**: ova četiri poznata nalaza su zatvorena, ali `content`, `image`, `legalSource` i `scripts` cele kartice ostaju **unreviewed**. Preostaje potpuna revizija ostalih tvrdnji, slika/SVG-ova, svih povezanih opcija i objašnjenja i obe azbuke. Nema oznake `reviewed` za celu karticu ili novog takvog pitanja. Ukupno: pitanja **1323 unreviewed / 4 in-progress / 0 reviewed**; kartice **37 unreviewed / 2 in-progress / 0 reviewed**.

## Dodatak: tačne četiri zamene izvornog HTML-a

Sledeći blokovi služe pregledu razlike i ne dodaju poseban runtime sadržaj.

### Zamena 1 (izvorni red 265)

Pre:

```html
<p>Međusobno: <b>pod pratnjom &gt; sa pravom prvenstva prolaza</b>. A kad se sretnu dva ista (dva vozila sa upaljenom rotacijom), njihovo međusobno prvenstvo rešava se po <b>opštim odredbama o prvenstvu prolaza</b> — dakle celom lestvicom: prvo policajac i semafor, pa <b>znakovi i oznake na kolovozu</b> (STOP, žuti romb, linija zaustavljanja); među vozilima kojima je istovremeno dozvoljen prolaz primenjuju se desna strana i levo skretanje (čl. 47). <span class="mut">Baza to proverava parovima skoro istih slika: bez ijednog znaka odlučuje desna strana, a čim se pojavi linija zaustavljanja ili STOP pred jednim vozilom — prednost ima drugo.</span></p>
```

Posle:

```html
<p>Međusobno: <b>vozilo pod pratnjom ima prednost u odnosu na vozilo sa prvenstvom prolaza</b>. A kad se sretnu dva ista (dva vozila sa upaljenom rotacijom), njihovo međusobno prvenstvo rešava se po <b>opštim odredbama o prvenstvu prolaza</b> — dakle celom lestvicom: prvo policajac i semafor, pa <b>znakovi i oznake na kolovozu</b> (STOP, žuti romb, linija zaustavljanja); među vozilima kojima je istovremeno dozvoljen prolaz primenjuju se desna strana i levo skretanje (čl. 47). <span class="mut">Baza to proverava parovima skoro istih slika: bez ijednog znaka odlučuje desna strana, a čim se pojavi linija zaustavljanja ili STOP pred jednim vozilom — prednost ima drugo.</span></p>
```

### Zamena 2 (izvorni red 266)

Pre:

```html
<p><b>Samo svetla, bez sirene.</b> Pravilo je da ta vozila <b>moraju</b> davati i zvučne i svetlosne znake; davanje samo svetlosnih je izuzetak i traži <b>sva tri</b> uslova istovremeno: dovoljna vidljivost tog vozila i bezbednost učesnika · vozilo se kreće brzinom dozvoljenom na tom delu puta · to je neophodno za neometano izvršenje službenog zadatka. „U naselju" i „van naselja" nisu uslovi.</p>
```

Posle:

```html
<p><b>Samo svetla, bez sirene.</b> Pravilo je davanje i zvučnih i svetlosnih znakova. Vozilo <b>pod pratnjom</b> sme bez sirene ako su omogućene dovoljna vidljivost vozila i bezbednost učesnika i ako ne prekoračuje dozvoljenu brzinu (čl. 106 st. 3; #10569). Za vozilo <b>sa prvenstvom prolaza</b> važi i dodatni uslov: sirena bi onemogućila ili omela uspešno izvršenje službenog zadatka (čl. 108 st. 4; #10585). Samo mesto vožnje — u naselju ili van njega — nije jedan od tih uslova.</p>
```

### Zamena 3 (izvorni red 267)

Pre:

```html
<p><b>Uređaji za posebne znake</b> smeju se ugrađivati i postavljati <b>samo na vozila nadležnih državnih organa</b> — ne „uz dozvolu nadležnog organa" i ne „ako ih posle ugradnje ispita ovlašćena organizacija". Upotrebljavaju se samo dok se vrši pratnja, odnosno kad je to neophodno za efikasno i bezbedno izvršenje službene radnje koja ne trpi odlaganje — ne „kad se odstupa od pravila saobraćaja" i ne „noću i u uslovima smanjene vidljivosti".</p>
```

Posle:

```html
<p><b>Uređaji za posebne znake</b> ugrađuju se samo na zakonom određenim vozilima. Za pratnju: na vozilima policije, Bezbednosno-informativne agencije, Vojske Srbije i Vojno-bezbednosne agencije namenjenim pratnji (čl. 106 st. 1 i 5). Za prvenstvo prolaza zakon obuhvata i vozila hitne medicinske pomoći i vatrogasne službe, kao i vozila ministarstva nadležnog za izvršenje zavodskih sankcija kada prevoze lica lišena slobode (čl. 108 st. 1, 2 i 5). Dozvola ili naknadno ispitivanje sami po sebi ne proširuju taj krug vozila. Uređaji se upotrebljavaju samo dok se vrši pratnja, odnosno kada je to neophodno za efikasno i bezbedno izvršenje službene radnje koja ne trpi odlaganje.</p>
```

### Zamena 4 (izvorni red 268)

Pre:

```html
<p><b>Tvoja obaveza je „po potrebi", nikad „obavezno" (čl. 107 i 109).</b> Ponude „obavezno zaustavite vozilo" i „obavezno pomerite vozilo sa kolovoza" su uvek netačne. Tačno je: propusti ta vozila, omogući im mimoilaženje i preticanje odnosno obilaženje, <b>po potrebi</b> zaustavi vozilo i <b>po potrebi</b> ga pomeri sa kolovoza, pridržavaj se naredbi lica iz pratnje i kreni tek kad prođu <b>sva</b> vozila. Kad vozilo sa prvenstvom obezbeđuje prolaz koloni iza sebe, prema celoj toj koloni postupaš kao prema vozilima sa prvenstvom — a ne tako što joj se i sam priključiš. I obrnuta zamka: preticanje <b>pojedinačnog</b> vozila sa prvenstvom prolaza jeste dozvoljeno, ako policijski službenik iz vozila ne daje druge znake i naredbe; <b>kolonu</b> vozila pod pratnjom ne smeš da pretičeš.</p>
```

Posle:

```html
<p><b>Pri susretu sa ovim vozilima (čl. 107 i 109):</b> propusti ta vozila, omogući im mimoilaženje i preticanje odnosno obilaženje, <b>po potrebi</b> zaustavi vozilo i <b>po potrebi</b> ga pomeri sa kolovoza, pridržavaj se naredbi lica iz pratnje i kreni tek kad prođu <b>sva</b> vozila. Obaveza postupanja po naređenjima ostaje; posebna zaustavljanja uz policijsko vozilo iz čl. 110 prikazana su u tabeli ispod (#10383, #10384). Kad vozilo sa prvenstvom obezbeđuje prolaz koloni iza sebe, prema celoj toj koloni postupaš kao prema vozilima sa prvenstvom — a ne tako što joj se i sam priključiš. I obrnuta zamka: preticanje <b>pojedinačnog</b> vozila sa prvenstvom prolaza jeste dozvoljeno, ako policijski službenik iz vozila ne daje druge znake i naredbe; <b>kolonu</b> vozila pod pratnjom ne smeš da pretičeš.</p>
```
