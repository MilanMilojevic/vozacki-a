# Grupa 001: dve potvrđene greške u objašnjenjima

Datum pregleda: **2026-09-10**. Recenzent: **Codex /root/learning_visual_second_review**. Polazna revizija: `65a79c7`, aplikacija v137. Obuhvat je ograničen na pitanja **7962 i 8007**, oblast 25, podoblast 94. Ovo nije završena semantička revizija cele podoblasti, cele baze ili povezanih kartica.

Pročitani su oba pisma pitanja, sve ponuđene opcije i novo objašnjenje. Pregledane su pune relevantne zakonske definicije i sve izmene iz 19/2025. Izmenjena su samo dva latinična objašnjenja u `tools/build-explanations.mjs`; ćirilica je nastala postojećom transliteracijom. Zvanični tekstovi, opcije, ID-jevi, bodovi i broj potrebnih odgovora nisu menjani.

## Izvori i pravna provera

1. [ZOBS, tekst na sajtu MGSI](https://www.mgsi.gov.rs/sites/default/files/zakon_o_bezbednosti_saobracaja_na_putevima.pdf), sa izmenama zaključno sa 76/2023: član 7, pune tačke 34 i 36 na PDF strani 7, tačka 80 na PDF strani 11. Pročitani su tekst i slike tih strana. Registarski ID-jevi su `zobs-cl7-t34-t36-mgsi-76-2023` i `zobs-cl7-t80-mgsi-76-2023`.
2. [Zakon o izmenama i dopunama ZOBS, Narodna skupština](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/14_saziv/2943-24-lat.pdf), 19/2025: pročitano svih devet članova i obe PDF strane. Menja čl. 178, 203, 246, 249 i 295, dodaje 318a, menja 331a i 333. Član 7 ovog akta menja **331a osnovnog zakona**, a ne njegov član 7. Registarski ID je `zobs-izmene-19-2025`.
3. [Zvanična lista donetih zakona](https://www.parlament.gov.rs/akti/doneti-zakoni/doneti-zakoni.1033.html), proverena 2026-09-10, navodi donošenje ovih izmena 6. marta 2025. i glasilo 19/25. Provera ovog paketa zasniva se na navedenom tekstu MGSI i punom tekstu ovih izmena; datum generisanja objašnjenja nije dokaz pravne ažurnosti.

SHA-256 preuzetih javnih PDF datoteka, takođe upisan u registar:

| Dokument | SHA-256 bajtova |
| --- | --- |
| MGSI, kroz 76/2023 | `f0ba25df5eda00ef7172f6421a26c2dc4a543e7de96e23a97de0fa7fa0975aeb` |
| Izmene 19/2025 | `1d7580ea086508deb83cd0cf40adfc11e08d4134f415cd359acdf100e97174d3` |

Lokalne radne kopije su u ignorisanom `output/playwright/content-001-pdf/zobs-mgsi-76-2023.pdf` i `output/playwright/content-001-pdf/zobs-izmene-19-2025.pdf`. Nisu runtime resursi niti deo ove izmene za objavu.

## 7962: smanjena vidljivost u naselju

Pitanje traži prag u naselju. Tačan odgovor ostaje **25406: 100 m**; `req=1`, `pts=1`, `img=0`. Ostale opcije su 250, 200 i 150 m. Tačka 80 određuje strogo manje od 100 m u naselju, odnosno manje od 200 m izvan naselja. Zato opcija 200 m pripada drugom okruženju, a 150 i 250 m nisu traženi prag. Zakon u ovoj definiciji ne daje uzrok razlike u pragovima. Tvrdnja o rasveti bila je nepotkrepljeno objašnjenje uzroka.

**Pre — tačan latinični tekst:**

> Smanjena vidljivost U naselju: manja od 100 m (ZOBS čl. 7). Van naselja prag je 200 m — u naselju rasveta pomaže, pa je prag niži.

**Posle — tačan latinični tekst:**

> U naselju su uslovi smanjene vidljivosti kada je vidljivost manja od 100 m. Izvan naselja: vidljivost manja od 200 m (ZOBS čl. 7, tač. 80).

**Posle — generisana i pregledana ćirilica:**

> У насељу су услови смањене видљивости када је видљивост мања од 100 m. Изван насеља: видљивост мања од 200 m (ЗОБС чл. 7, тач. 80).

## 8007: električni motocikl i pogrešan obrat

Tačni odgovori ostaju **25594** (dva točka ili tri asimetrično raspoređena u odnosu na srednju podužnu ravan vozila) i **25596** (najveća trajna nominalna snaga preko 4 kW); `req=2`, `pts=1`, `img=0`. Ova dva uslova zajedno dovoljna su za traženi električni motocikl. Zapremina motora iz 25595 nije merilo električnog pogona; „najmanje dva točka” iz 25593 je preširoko; snaga do 4 kW iz 25592 i brzina do 45 km/h iz 25591 nisu dovoljna kombinacija za motocikl.

Tačka 36 dopušta alternativni uslov najveće konstruktivne brzine preko 45 km/h. Tačka 34 za električni moped zajednički traži dva točka, najveću konstruktivnu brzinu do 45 km/h i najveću trajnu nominalnu snagu do 4 kW. Iz snage do 4 kW same ne sledi da je vozilo moped. Brži električni dvotočkaš može biti motocikl i pri toj snazi. Ovde se ne tvrdi da je svako vozilo sa dva točka i slabijim motorom moped, niti se konstruktivna brzina meša sa trenutnom brzinom vožnje.

**Pre — tačan latinični tekst:**

> Električni MOTOCIKL: 2 ili 3 asimetrična točka + trajna nominalna snaga PREKO 4 kW (ZOBS čl. 7) — kod struje snaga igra ulogu kubikaže. Do 4 kW bio bi moped.

**Posle — tačan latinični tekst:**

> U ovom pitanju dovoljna su oba uslova zajedno: dva točka ili tri asimetrično raspoređena točka, i najveća trajna nominalna snaga preko 4 kW. Snaga do 4 kW sama ne znači moped: električni moped ima dva točka, najveću konstruktivnu brzinu do 45 km/h i najveću trajnu nominalnu snagu do 4 kW. Električno vozilo sa dva točka i najvećom konstruktivnom brzinom preko 45 km/h može biti motocikl i sa snagom do 4 kW (ZOBS čl. 7, tač. 34 i 36).

**Posle — generisana i pregledana ćirilica:**

> У овом питању довољна су оба услова заједно: два точка или три асиметрично распоређена точка, и највећа трајна номинална снага преко 4 kW. Снага до 4 kW сама не значи мопед: електрични мопед има два точка, највећу конструктивну брзину до 45 km/h и највећу трајну номиналну снагу до 4 kW. Електрично возило са два точка и највећом конструктивном брзином преко 45 km/h може бити мотоцикл и са снагом до 4 kW (ЗОБС чл. 7, тач. 34 и 36).

## Provera promene

Generator je pokrenut komandom `node build-explanations.mjs` iz `tools/`. Prijavio je čistu proveru pisma i pokrivenost 1327/1327.

Poređenje parsiranog `window.EXPLAIN` pre i posle utvrdilo je:

- Promenjeni su samo `byQ[7962].x.l/c`, `byQ[8007].x.l/c` i datum `updated` sa `2026-09-07` na `2026-09-10`.
- Ostalih **1325 objašnjenja**, svih **39 kartica**, `bySub`, `atlas`, `situacije` i `zamke` potpuno su jednaki. Polja `card` i `nocard` nisu menjana.
- `data.js` je jednak po bajtovima. Generator i dalje ima **4 NUL bajta**. Obrnuta zamena ta dva cela iskaza vraća sve bajtove polaznog generatora; nema drugih promena izvora.
- Svaki početni ID i svaka postojeća opcija ostali su prisutni. Ažurirana su samo dva zapisa pitanja u evidenciji; evidencija kartica ostala je jednaka po bajtovima.

Chrome provera je koristila osam novih konteksta na `localhost:18764`: oba pitanja × oba pisma × širine **320 i 1280 px**, visina 900 px, svetla tema i standardna veličina slova. Svih **8/8** slučajeva prošlo je: objašnjenje odsutno pre odgovora i prisutno posle njega, tačan tekst za izabrano pismo, isti tačni ID-jevi opcija, ispravan ishod i bez horizontalnog prelivanja teksta ili dokumenta. Izmereni tekst objašnjenja je 13,8 px na telefonu i 14,72 px na desktopu. Vizuelno su pregledani svi snimci `output/playwright/content-001-{7962,8007}-{l,c}-{320,1280}.png`. Nisu proverene sve teme, veličine slova ili uvećanje pregledača. Privremena CLI sesija je zatvorena; korisnikov profil nije otvaran.

## Status i preostali posao

Oba zapisa ostaju **`in-progress`**. `questionAnswers`, `explanation` i `legalSource` označeni su kao pregledani u ovom obuhvatu. Originalna pitanja nemaju sliku, pa njihov `image` ostaje obrazloženo `not-applicable`. `cardLinks` ostaje `unreviewed`. I `scripts` ostaje `unreviewed`, jer metodologija tim poljem obuhvata i zavisne crteže: pregled pitanja i objašnjenja na oba pisma nije pregled celih kartica.

Za 7962 ostaje pregled kartice **`slicni-pojmovi`**, njenih odeljaka, 22 povezana slikovna pitanja i korisnosti konkretne veze. Za 8007 ostaje celovit pregled kartice **`kategorije-vozila`**, crteža i svih njenih definicija; ovaj paket ih ne potvrđuje. Nije obavljena nova uporedna provera sa sirovim MUP izvorom niti dobijena potvrda instruktora.

Nezavisni pregled **Codex /root**, 2026-09-10: ponovo pročitane pune definicije člana 7 tač. 34/36/80 i svih devet članova izmena 19/2025; tekst ispravki odobren. Ponovljeno semantičko poređenje svih objašnjenja/kartica, Node provere **19/19** i browser **8/8**, bez odstupanja. Vizuelno pregledani mobilni prikazi 8007 ćirilicom i 7962 latinicom. Paket je izdanje **v139** na razvojnoj grani; preostali statusi nisu unapređeni ovim nezavisnim pregledom.

Nakon upisa: **1325 pitanja unreviewed, 2 in-progress, 0 reviewed; svih 39 kartica unreviewed**. `node --test tools/tests/content-audit.test.mjs` prošao je **19/19**, a `git diff --check` za fajlove ovog paketa nije našao greške belog prostora. Prolazak `node tools/audit-content.mjs --check` potvrđuje aktuelnost evidencije, ne semantičku tačnost preostalih pitanja.
