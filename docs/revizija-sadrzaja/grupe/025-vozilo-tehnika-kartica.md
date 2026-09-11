# A6-025 — vozilo, registracija i tehnički pregled

Cela kartica `vozilo-tehnika`, oba pisma, četiri tabele i četiri SVG crteža pregledani su 11.09.2026. Pojedinačni pregled njenih 32 povezanih pitanja već je završen u [A6-018](018-zdravlje-registracija-pregledi.md); ova celina završava proveru njihove zajedničke kartice. Pitanja, ključevi, bodovi i slike ostaju isti.

## Stvarne ispravke

- Jednogodišnji rok i dokumenti označeni su kao opšti režim. Zadržani su jasni ishodi „SME / NE SME NA PUT”, uz konkretan izuzetak za odlazak do pregleda, opravke ili ispitivanja sa privremenim tablicama i potvrdom. Tačno „najranije 30 dana” ostaje isto.
- Vanredni pregled u tabeli, crtežu i prozi sledi **posle opravke** u oba obavezna slučaja. Zakon dopušta i zahtev vozača radi provere ispravnosti; to se ne meša sa nalogom za kontrolni pregled.
- Precizirani su dubina šare i osnovni pragovi pneumatika, zamenski dokazi i izuzeci pri tehničkom pregledu, izuzetak za rentakar i odnos registracione nalepnice prema identitetu vozila. Pamtilica „uvek Da” ograničena je na dva konkretna pitanja.
- Sva četiri pristupačna opisa sada prate izabrano pismo. Sedam postojećih odeljaka sačuvano je bez skraćenih naslova.

Početni predlog od 31 operacije nije primenjen u celini. Root je odbacio deset operacija koje su nepotrebno menjale dobru formulaciju, ponavljale izuzetak ili slabile pouku crteža. Konačni paket ima 23 operacije sadržaja i četiri dorade SVG čitljivosti. Nema novih funkcija niti promene simulacije.

## Izvori i nezavisna kontrola

- [ZOBS, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), zaključno sa 19/2025: čl. 246, 249, 253–254, 264–266, 268–269, 274 i 276. Zahtev vozača za vanredni pregled pripada čl. 265 st. 1; početna revizijska oznaka „stav 3” bila je pogrešna i nije preneta u aplikaciju.
- [Pravilnik o tehničkom pregledu vozila, MUP](https://www.mup.gov.rs/wps/wcm/connect/985a565c-1d19-4cad-9176-8b321b2287cd/pdf-lat-%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%BD%D0%B8%D0%BA%2B%D0%BE%2B%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%BA%D0%BE%D0%BC%2B%D0%BF%D1%80%D0%B5%D0%B3%D0%BB%D0%B5%D0%B4%D1%83%2B%D0%B2%D0%BE%D0%B7%D0%B8%D0%BB%D0%B0.pdf?CVID=og8WVAF&MOD=AJPERES), 31/2018, 70/2018 и 62/2022: ceo čl. 29.
- [Pravilnik o podeli i tehničkim uslovima vozila, MGSI](https://www.mgsi.gov.rs/sites/default/files/pravilnik_o_podeli_motornih_i_prikljucnih_vozila_i_tehnickim_uslovima_za_vozila_u_saobracaju_na_putevima.pdf), zaključno sa 54/2026: čl. 86 i 113. Prag za zimsku opremu nije predstavljen kao obaveza zimske opreme za motocikl.

Prvi pregled: `/root/a0_sanitize`. Root je nezavisno pročitao završni sadržaj na oba pisma, relevantne pune odredbe i snimke sva četiri crteža. Tačni izvori, revizije i otisci registrovani su u `izvori.json`.

## Čitljivost i provere

Na snimcima tamne teme potvrđen je slab kontrast starih crvenih i zelenih natpisa. Četiri SVG-a koriste postojeće boje `--ok` i `--bad`, koje se prilagođavaju temi. Sitni natpisi povećani su na 13 jedinica u crtežu; razmaci na dva crteža korigovani su nakon što je provera otkrila preklapanja. Nisu menjane teme aplikacije niti drugi crteži.

- Chromium: 16 prikaza cele kartice — oba pisma, obe teme, širine 320/1280, običan i dvostruk osnovni font. Tačne ćelije tabela, sedam odeljaka, četiri SVG-a i četiri opisa; bez isečenih ili preklopljenih natpisa, horizontalnog prelivanja stranice ili grešaka izvršavanja.
- Otvaranje kartice uz svako od 32 pitanja na oba pisma: 64/64. Sintetičko skladište ostaje isto, bez upisa.
- Posebna provera na 320 px: najmanji natpis 12,74 px; najmanji kontrast teksta 5,015:1. Root je pregledao osam završnih snimaka, sva četiri crteža na oba pisma.
- Rekonstrukcija generatora iz prethodnog Git stanja daje tačno konačni izvor; četiri NUL bajta i svi ostali podaci `EXPLAIN` očuvani su.
- `node tools/verify.mjs`: 249/249. Prvi upis evidencije odbijen je zbog nedostajućeg praznog objekta za N/A razloge; metapodatak je ispravljen i konačna provera prolazi. To nije bio kvar aplikacije.

Dokazi su u ignorisanom `output/revizija-20260911/025/`: `root-approved.json`, `root-integration-proof.json`, `root-browser-result.json`, `root-contrast-result.json` i `root-svg-*.png`. To nisu novi runtime resursi.

Ovim se ne proglašavaju pregledanim ostali crteži, fizički telefoni ili stvarni čitači ekrana. Završava se ova kartica i 32 prethodno pojedinačno proverena pitanja.
