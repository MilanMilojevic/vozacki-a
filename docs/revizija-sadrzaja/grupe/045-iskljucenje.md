# A6-045 — isključenje iz saobraćaja

Datum: 2026-09-11. Verzija: v188. Potpuni pregled **46 pitanja /152 opcije**, oba pisma, cele kartice sa tri postojeća SVG-a i pet tabela. Pitanja nemaju originalne slike. Nema atlasa ni situacija;45 pitanja dolazi preko bySub178, a8465 preko izričite veze koja ostaje važeća uz nocard.

## Ispravke

Devet objašnjenja precizira uslove zadržavanja, vanrednog tehničkog pregleda, isključenja zbog posebnih svetlosnih/zvučnih uređaja, povratka u saobraćaj i troškova uklanjanja. Ostalih37 objašnjenja, sva pitanja, opcije, ključevi, bodovanje, njihov redosled i veze ostaju isti.

Kartica sada daje zakonsko trajanje isključenja i tačan postupak uklanjanja nepropisno parkiranog vozila. Granica tačno1,20mg/ml dosledno je obuhvaćena u tekstu, SVG-u i pristupačnom opisu. Uža pitanja8571/8572 su već tačna i nisu menjana zbog proširenja kartice. Uklonjena je završna rečenica koja odvraća od zahteva za analizu; činjenica da je zahtev razlog isključenja ostaje jasno objašnjena.

Tri postojeća crteža imaju veća slova, prevedene ćirilične pristupačne opise i bolji izmeren kontrast. Žuti natpis skraćen je na „POD DEJSTVOM” kako bi stao; ceo uslov je odmah ispod i u opisu. Crvena dva reda sada koriste boju teksta teme; na crtežu premeštanja zadržane su bela razdelna linija i semantičke crvena/zelena strelica. Nema nove biblioteke, SVG-a, promene app.js/CSS ili geometrije dijagrama.

## Dokaz i granice

- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Čl.30,41,91,178,187,265,267,278–284,287,289–292 i296: isključenje, alkohol, tehnički pregledi, premeštanje i uklanjanje. Svež javni odgovor od11.09.2026. u12:01UTC ima isti SHA-256 kao pregledana kopija.
- Prvi pregled /root/a0_sanitize i nezavisni /root/a1_safe_harness obuhvatili su svih46 pitanja,152 opcije i objašnjenja L/C, celu karticu i tri SVG-a. Nije potvrđen konflikt ključa. Za8465 dodat neposredni osnov178 stav4 tačka2.
- Root pročitao svih devet završnih parova objašnjenja, celu L/C karticu, odlučujuće odredbe čl.178/187/265/267/279–284/287–292/296 i precizne dopune. Neposredno pregledani svih šest završnih L/C kandidatskih SVG snimaka i tri integrisana ćirilična snimka.
- Integrisani Chromium: **16/16 prikaza kartice**,320/1280,oba pisma/teme,100/200% osnovnog fonta; **184/184 prikaza pitanja** sa tačnim ključem, tekstom, objašnjenjem i stvarnim vezama. Nijedan tekst van SVG-a; bez grešaka, prelivanja cele stranice ili upisa sintetičkog napretka. Najmanji tekst:12.862px na320. Tabele podržavaju lokalno pomeranje, najviše274px pri uvećanju.
- Tekst u tamnoj temi:2,784→12,283:1. Bela linija na putu:2,453→8,148:1; crvena strelica3,539 i zelena4,696:1. To nije tvrdnja o potpunoj WCAG usaglašenosti ili proveri stvarnim telefonom.
- Tačno devet generatorskih operacija /14 fragmenata kartice; rekonstrukcija izvora u oba smera, četiri NUL bajta i svi drugi EX podaci očuvani. Kandidatska provera je najpre otkrila samo HTML komentar koji postojeći generator uklanja; nakon primene tog postojećeg pravila očekivani i konačni HTML su potpuno identični.

Završno `node tools/verify.mjs`: sve lokalne provere prošle, uključujući **249/249 automatizovanih testova**. To ne zamenjuje sadržinski pregled naveden iznad.

Dokazi: ignored output/revizija-20260911/045 i048; frozen-hashes.json, root-approved.json, root-integration-proof.json, root-browser-result.json i root-verify-v188.log. Lični Chrome, napredak i javna glavna grana nisu korišćeni za proveru.

## Mapa pitanja

| ID | Ishod | Osnov i nezavisni nalaz |
|---:|---|---|
| 8465 | Očuvano | ZOBS:178/4/2, ZOBS:279: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. Izričita veza byQ.card važi i pored nocard:true; dopunjen neposredni osnov178 st.4 t.2. |
| 8552 | Očuvano | ZOBS:279, ZOBS:289: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8553 | Očuvano | ZOBS:279: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8555 | Očuvano | ZOBS:41, ZOBS:279, ZOBS:289: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8556 | Očuvano | ZOBS:279: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8557 | Očuvano | ZOBS:41, ZOBS:279: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8558 | Očuvano | ZOBS:279, ZOBS:289: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8559 | Očuvano | ZOBS:279, ZOBS:280, ZOBS:283: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8560 | Očuvano | ZOBS:280: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8561 | Očuvano | ZOBS:280/5: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8562 | Očuvano | ZOBS:280/5: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8563 | Očuvano | ZOBS:282: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8564 | Očuvano | ZOBS:282: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8565 | Očuvano | ZOBS:282: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8566 | Očuvano | ZOBS:282: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8567 | Očuvano | ZOBS:282/2-3: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. Čl.282 st.3 izričito određuje vlasnika ili korisnika; prethodni stav ne čini ponuđeni odgovor netačnim. |
| 8568 | Očuvano | ZOBS:282/2-3: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. Čl.282 st.3 izričito određuje vlasnika ili korisnika; prethodni stav ne čini ponuđeni odgovor netačnim. |
| 8569 | Očuvano | ZOBS:187, ZOBS:283: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8570 | Objašnjenje ispravljeno | ZOBS:279, ZOBS:280, ZOBS:283: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8571 | Očuvano | ZOBS:187, ZOBS:283: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. Uže postavljen nivo alkohola ne traži promenu ključa. Tačno1,20 pripada uslovnoj grani u celoj kartici. |
| 8572 | Objašnjenje ispravljeno | ZOBS:187, ZOBS:283: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. Uže postavljen nivo alkohola ne traži promenu ključa. Tačno1,20 pripada uslovnoj grani u celoj kartici. |
| 8575 | Objašnjenje ispravljeno | ZOBS:265, ZOBS:287: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8576 | Očuvano | ZOBS:287: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8577 | Očuvano | ZOBS:287: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8578 | Očuvano | ZOBS:287, ZOBS:289/13: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8579 | Očuvano | ZOBS:267: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8584 | Objašnjenje ispravljeno | ZOBS:289: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8588 | Očuvano | ZOBS:289/8,10: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8590 | Objašnjenje ispravljeno | ZOBS:289/9: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8592 | Objašnjenje ispravljeno | ZOBS:289/15-16: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8593 | Očuvano | ZOBS:289/2: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8594 | Očuvano | ZOBS:290: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8597 | Očuvano | ZOBS:292/1-2: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8598 | Objašnjenje ispravljeno | ZOBS:292/3: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8599 | Objašnjenje ispravljeno | ZOBS:292/4: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8600 | Očuvano | ZOBS:292/4: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8601 | Očuvano | ZOBS:292/5,9: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8603 | Očuvano | ZOBS:292/10: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8606 | Očuvano | ZOBS:296/1: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 8609 | Objašnjenje ispravljeno | ZOBS:296/2-4: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Predlog objašnjenja045 odobren posle poređenja sa punom odredbom. |
| 8611 | Očuvano | ZOBS:296/6-7: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 10701 | Očuvano | ZOBS:30, ZOBS:91, ZOBS:279/13: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 10714 | Očuvano | ZOBS:284/1: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 10715 | Očuvano | ZOBS:284/1-2: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 10716 | Očuvano | ZOBS:290/1-3: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
| 10717 | Očuvano | ZOBS:292/5-7: Pitanje i sve ponuđene opcije pročitani na oba pisma; ključ saglasan tačno postavljenom pitanju. Zadržano objašnjenje sadržajno prihvatljivo u kontekstu pitanja. |
