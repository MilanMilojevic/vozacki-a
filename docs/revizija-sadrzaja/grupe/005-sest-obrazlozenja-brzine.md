# Grupa 005 — šest objašnjenja o brzini

Datum: 2026-09-10. Izvršilac: Codex `/root/learning_visual_second_review`. Predlog svih šest tekstova na oba pisma i ograničeni obuhvat odobrio je `/root`; `/root/a0_sanitize` nezavisno je pregledao sva pitanja, sve opcije, tri slike i primarne izvore. Novi generisani izlaz potom su nezavisno pročitali i odobrili `/root` i `/root/a0_sanitize`. Završna provera i zatvaranje šest zapisa pripadaju v153.

Osnova je objavljeni **v151 / 5be29d8**, sa već integrisanim FAQ paketom 006. Menjaju se samo `byQ.x` za **9868, 9870, 9873, 9878, 10488 i 10489**, na oba pisma. Svih 39 kartica, uključujući odobrenu `brzine` i novi FAQ, ostaju iste.

## Pročitani izvori i pitanja

Ponovo su pročitani efektivni tekstovi oba pisma, ceo tekst svakog pitanja, sve tačne i netačne opcije, i originalne slike `img/9870.jpg` (magla), `img/9873.jpg` (označena oštećenja kolovoza) i `img/9878.jpg` (znak naselje). Sva pitanja imaju 3 boda. Nije menjan niti ispravljen zvanični ključ odgovora.

Pravni osnov: puni [čl. 42–43 MGSI ZOBS-a](https://www.mgsi.gov.rs/sites/default/files/zakon_o_bezbednosti_saobracaja_na_putevima.pdf), uz proverene [izmene 19/2025](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/14_saziv/2943-24-lat.pdf), koje ih ne menjaju. Za 9878, [važeći PIS Pravilnik kroz 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), čl. 35 tač. 21, razlikuje znak III-24 (početak naselja) od III-23 (naziv naseljenog mesta). Provereni [čl. 21 izmena 76/2026](https://slgl.pravno-informacioni-sistem.rs/api/prins/viewdoc?uuid=a9a8f425-2be7-4056-af48-ec9bac188e36) ne menja predmetnu tačku. Dokaz važeće revizije, datuma stupanja i originalnog izgleda sačuvan je u grupi 004; postojeće registrovane reference i njihovi SHA-256 nisu menjani.

Korišćene registrovane reference: `zobs-cl20-cl42-cl44-mgsi-76-2023`, `zobs-izmene-19-2025`, `signalizacija-brzine-cl25-cl35-cl50-pis-76-2026`, `signalizacija-brzine-izmene-pis-76-2026` i `signalizacija-naselje-slike-putevi-21-2024`. Nema nove provere sirovog MUP/portal izvora niti instruktorske potvrde.

## Staro i novo

Pet pitanja je delilo isti tekst `prilagodi`, koji je završavao univerzalnom heuristikom i za dva slikovna pitanja nabrajao distraktore kojih u njima nema:

> Brzina se prilagođava USLOVIMA (ZOBS čl. 42): osobinama i stanju puta, vidljivosti, preglednosti, atmosferskim prilikama, stanju vozila i tereta, gustini saobraćaja — tako da vozilo možeš blagovremeno da zaustaviš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš, bez ugrožavanja drugih. Odgovori sa "raspoloživim vremenom", "udobnošću" ili "što pre stigneš" su uvek netačni.

Za 9878, efektivni stari tekst bio je:

> Znak na slici označava ulazak u naseljeno mesto. U naselju vozač ne sme da se kreće brzinom većom od 50 km/h, osim ako je saobraćajnim znakom dozvoljena veća brzina (ZOBS čl. 43) — ovde nema znaka ograničenja sa brojem, pa važi opštih 50 km/h.

Pet `x: prilagodi` dodela zamenjeno je zasebnim tekstovima, a konstanta je uklonjena tek po proveri da više nema upotreba. U 9878 izmenjen je **završni** `X[9878]` override uz očuvan spread. Rana istorijska dodela `znakJaci` i drugi njeni korisnici nisu menjani; novi runtime tekst zato nije slučajno poništen kasnijom dodelom.

### 9868

Bez slike; req=2; tačni ID-jevi 31406/31407. Netačni 31409 daje dozvolu za ometanje, 31408 postavlja što raniji dolazak kao cilj. Novi tekst objašnjava oba tražena ishoda i oba stvarna distraktora.

**Latinica:** Brzina mora omogućiti da blagovremeno staneš pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš i da ne ugrožavaš bezbednost saobraćaja (ZOBS čl. 42). Brži dolazak nije cilj ovog pravila, niti ono daje dozvolu za ometanje drugih.

**Ćirilica:** Брзина мора омогућити да благовремено станеш пред препреком коју можеш да видиш или имаш разлога да предвидиш и да не угрожаваш безбедност саобраћаја (ЗОБС чл. 42). Бржи долазак није циљ овог правила, нити оно даје дозволу за ометање других.

### 9870

Cela slika pročitana: magla i slaba vidljivost. Req=1, tačan 31414; distraktori 31413 (najmanje 20% manje od putnog ograničenja) i 31415 (najviše 60 km/h). Ne dodaje se izmišljena bezbedna brzina niti se tvrdi da 60 fizički nikada nije bezbedno.

**Latinica:** Magla na slici smanjuje vidljivost. Brzinu prilagodi tako da možeš blagovremeno da zaustaviš vozilo pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš (ZOBS čl. 42). Ponuđenih 60 km/h ili umanjenje za najmanje 20% ne zamenjuju tu obavezu.

**Ćirilica:** Магла на слици смањује видљивост. Брзину прилагоди тако да можеш благовремено да зауставиш возило пред препреком коју можеш да видиш или имаш разлога да предвидиш (ЗОБС чл. 42). Понуђених 60 km/h или умањење за најмање 20% не замењују ту обавезу.

### 9873

Cela slika pročitana: žutim elipsama označena oštećenja kolovoza. Req=2, tačni 31424/31425; distraktori 31426 (najmanje 20% manje prema vrsti vozila) i 31427 (najviše 80 km/h). Novi tekst zadržava i zaustavljanje i zaštitu sebe/drugih; ne nagađa dubinu oštećenja ili manevar obilaženja.

**Latinica:** Na slici su označena oštećenja kolovoza. Brzinu prilagodi tako da možeš blagovremeno da staneš pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš i da ne ugrožavaš sebe ni druge (ZOBS čl. 42). Ponuđenih 80 km/h ili umanjenje za najmanje 20% ne zamenjuju te obaveze.

**Ćirilica:** На слици су означена оштећења коловоза. Брзину прилагоди тако да можеш благовремено да станеш пред препреком коју можеш да видиш или имаш разлога да предвидиш и да не угрожаваш себе ни друге (ЗОБС чл. 42). Понуђених 80 km/h или умањење за најмање 20% не замењују те обавезе.

### 9878

Cela slika pročitana: crna silueta na beloj osnovi, III-24. Req=1, tačan 31442 (50 km/h); distraktori 31440 (80) i 31441 (60). Značenje je početak naselja, ne teritorija naseljenog mesta III-23. Granica 50 izvodi se iz čl. 43 za prikazanu situaciju.

**Latinica:** Znak „naselje” označava početak naselja. Ovde nije prikazan znak koji određuje drugačije ograničenje, pa važi opštih 50 km/h (ZOBS čl. 43).

**Ćirilica:** Знак „насеље” означава почетак насеља. Овде није приказан знак који одређује другачије ограничење, па важи општих 50 km/h (ЗОБС чл. 43).

### 10488

Bez slike; req=3, tačni 33319 (vozilo/teret), 33321 (vidljivost/preglednost), 33317 (put). Pročitana sva tri netačna: 33320 (najbrža vozila), 33318 (raspoloživo vreme), 33322 (što pre). Formulacija „među ponuđenim odgovorima” ne predstavlja tri grupe kao iscrpnu listu čl. 42.

**Latinica:** Među ponuđenim odgovorima, brzinu prilagođavaš osobinama i stanju puta, vidljivosti i preglednosti, kao i stanju vozila i tereta (ZOBS čl. 42). Raspoloživo vreme, žurba i brzina najbržih vozila ne zamenjuju te uslove za bezbedno upravljanje i zaustavljanje.

**Ćirilica:** Међу понуђеним одговорима, брзину прилагођаваш особинама и стању пута, видљивости и прегледности, као и стању возила и терета (ЗОБС чл. 42). Расположиво време, журба и брзина најбржих возила не замењују те услове за безбедно управљање и заустављање.

### 10489

Bez slike; req=2, tačni 33325 (gustina i drugi uslovi), 33324 (atmosferske prilike). Netačni 33323 (najudobnija vožnja) i 33326 (raspoloživo vreme). Izričito ostaju „drugi saobraćajni uslovi”, bez zatvaranja zakonske liste.

**Latinica:** Brzinu prilagođavaš atmosferskim prilikama, gustini saobraćaja i drugim saobraćajnim uslovima, radi bezbednog upravljanja i blagovremenog zaustavljanja (ZOBS čl. 42). Udobnost i raspoloživo vreme za dolazak, ponuđeni u ovom pitanju, ne zamenjuju te uslove.

**Ćirilica:** Брзину прилагођаваш атмосферским приликама, густини саобраћаја и другим саобраћајним условима, ради безбедног управљања и благовременог заустављања (ЗОБС чл. 42). Удобност и расположиво време за долазак, понуђени у овом питању, не замењују те услове.

Novi tekstovi imaju 21–47 reči na latinici. Ne tvrde da određena reč automatski određuje tačan odgovor, niti da brojevi 60/80 ili umanjenje za najmanje 20% fizički nikada ne mogu biti bezbedni. Objašnjavaju zašto ponuđene brojčane formule ne zamenjuju procenu uslova iz čl. 42. Oznaka III-24 ostaje u evidenciji, a nije dodata u byQ: postojeći transliterator bi pretvorio rimsko III u ИИИ. Naziv znaka i slika dovoljno ga određuju bez proširenja globalnog parsera.

## Dokaz ograničenog obuhvata

- **Sedam preciznih zahvata**: pet dodela, uklanjanje neupotrebljene konstante i završni 9878 override. Inverzija svih zahvata vraća početne bajtove generatora; pre i posle postoje **4 NUL bajta**. Za inverziju obrisana deklaracija vraća se ispred jedinstvene dodele 9868.
- Parsirani `EXPLAIN` razlikuje se samo u šest odobrenih `byQ.x`; novi tekstovi oba pisma potpuno odgovaraju odobrenom predlogu. Ostalih **1.321 objašnjenje**, svih **39 kartica**, veze/flagovi šest pitanja, `bySub`, `atlas`, `situacije`, `zamke` i datum generisanja ostaju isti. Objavljeni FAQ006 nije promenjen.
- `data.js` jednak je početnoj kopiji po bajtovima. Svih **704 JPG-a** provereno je prema Git blobovima početnog `5be29d8`; svi su isti.
- Prvi `audit-content --write` stvarno je ponovo otvorio šest zapisa i arhivirao prethodne preglede. Hash je promenjen samo za tih šest pitanja; evidencija kartica i registar izvora ostaju semantički isti. `situacije` zavise od zvaničnog pitanja/opcija/slike, ne od zasebnog objašnjenja, pa se cela kartica ovim ne otvara ponovo.
- Generator daje bajtno isti izlaz pri ponovljenom pokretanju. `audit-content --check` prolazi; ponovljeni `--write` ne menja bajtove evidencije. Node testovi evidencije: **19/19**. Provere sintakse i ciljani `git diff --check` prolaze.

## Novi prikaz i odgovor

Nova `tools/tests/brzine-explanations.browser.js` prolazi **48/48 slučajeva**: šest pitanja × oba pisma × 320/1280 px × obe teme, sa podešavanjem slova 125%. Svaki kontekst je nov, bez stalnog profila, sa blokiranim service workerom i spoljnim zahtevima. Provereni su ceo prikazani tekst pitanja, puni tekstovi svih opcija, svi ID-jevi i oznake tačnosti, `req`, 3 boda, učitavanje ispravne slike, potvrda tačnog izbora, tačan rezultat i ceo prikazani tekst objašnjenja. Svako pitanje otvara jednu karticu `brzine` sa šest SVG-ova. Odgovori ostaju vezani za ID, bez oslanjanja na položaj opcije.

Sva objašnjenja staju u viewport posle običnog skrolovanja i nisu zaklonjena zaglavljem ili donjom navigacijom. Sačuvano je 12 reprezentativnih snimaka: svako pitanje na 320/c/dark i 1280/l/light. Izvršilac je pregledao oba pisma; naročito je potvrđen novi završni tekst 9878. Ovo nije nova provera simulacionog bodovanja niti potpuna provera uvećanja svih fontova aplikacije.

Fixture `output/playwright/content005-runtime` je arhiva javnih runtime fajlova sa **5be29d8/v151**, u koju je prekopiran samo novi `explanations.js`; služi na **http://localhost:18769**. Nije korišćen radni CSS iz paralelnog zadatka. SHA-256: `app.js` **da5330a3f513aedd50b8e4ac1c5e9ef9f8e100f61f041c156e7fd2e951a8a99a**, `style.css` **968ca0fa83f56864cb0e63a8164a032b6489eb304122497ed87cd3e807e7004d**, novi `explanations.js` **62183713548e24e918f0b0affb6ea75a8ffd9b91598728dea333056155e40d5c**. Originalna korisnikova kopija i postojeći Chrome profil nisu otvarani niti menjani.

Dokazi u ignorisanom `output/playwright/`: `content-005-before/`, `content-005-edits.json`, `content-005-verify.mjs`, `content-005-verification.json`, `content-005-browser-results.json` i snimci `brzine-005-1789065540111-*.png`.

## Status posle implementacije

Svih šest zapisa je **reviewed** posle završnog nezavisnog pregleda novog izlaza. `questionAnswers`, `image` (ili opravdano N/A), `cardLinks`, `scripts`, `legalSource` i novi `explanation` potvrđeni su konkretnim dokazima. Nije automatski preuzet stari reviewed status preko novog hash-a.

Root je direktno prema Git `5be29d8` ponovio inverziju sedam zahvata, pročitane generisane tekstove oba pisma uporedio sa svim pitanjima/opcijama i odobrenim predlogom, te ponovio **19/19 Node** i **48/48 browser** slučajeva. Runner sada posle hash navigacije čeka baš `qCard.dataset.qid`, kako prethodni `.qText` ne bi prerano zadovoljio čekanje. Root je pregledao nove mobilne i desktop snimke; dokazi su `root-content-005-check.json`, `root-content-005-browser.json` i `brzine-005-1789066398332-*.png`. Nezavisni recenzent zasebno je ponovio **48/48**, otvorio sve tri slike i u privremenoj fascikli dobio bajtno identičan izlaz generatora. Nije pronađen blokirajući sadržajni nalaz.

Četiri susedna objašnjenja 9891/9903/9946/9947 ostaju izvan ovog paketa: nema novog potvrđenog pogrešnog zaključka u njihovoj konkretnoj situaciji. Njihove veze i urednička preciznost razmatraju se zasebno. Širi pregled ostatka baze nije završen. Trenutni zbir: pitanja **1.310 unreviewed / 2 in-progress / 15 reviewed**; kartice **36 unreviewed / 1 in-progress / 2 reviewed**. Testovi potvrđuju navedeni obuhvat i ponašanje; nisu sami odobrili semantičku tačnost.
