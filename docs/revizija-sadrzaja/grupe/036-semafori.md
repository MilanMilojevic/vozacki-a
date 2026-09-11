# A6-036 — semafori

Datum: 2026-09-11. Verzija: v185. Pregledana su **44 pitanja / 133 opcije na oba pisma**, 24 originalne slike i cela kartica sa osam SVG-a. Obuhvat je svih 43 pitanja podoblasti 162 i izričito povezano 11044. Karticu stvarno otvara 40 pitanja; 9377 je samo u atlasu, a 9339/9340/9391 imaju samostalna objašnjenja bez kartice.

## Ispravke

Promenjeno je 14 objašnjenja. Najvažnija ispravka je pešačko trepćuće zeleno: prolaz je i dalje dozvoljen, a crveno tek sledi. Ispravljene su tvrdnje da postojano žuto ne najavljuje crveno, mešanje direkcione i dodatne uslovne strelice, kao i mešanje trepćućeg žutog sa kosom strelicom iznad trake. Opšte crveno više nema apsolut „bez ikakvog izuzetka”; konkretni uslovi žutog i ispitni odgovori ostaju.

Iz 10411 uklonjena je izmišljena susedna traka. Pristup vozila nije više nepotrebno ograničen na „vozilo po vozilo”, a 9377 opisuje upravo svetlosni broj sa slike. Dodatno je 9391 ograničen na njegovu stvarnu situaciju, umesto opšte tvrdnje da svaki semafor uz istu stranu kolovoza reguliše tvoje kretanje. Ostalih 30 objašnjenja je sačuvano.

Kartica zadržava svih osam crteža. Pešački i biciklistički simboli koriste jasne jednobojne siluete; dodatna strelica je uz trobojni glavni uređaj. Precizirani su pešačko zeleno, smerovi i propuštanje, tramvajski signali i raniji železnički uređaj. Primeri tramvajskih simbola imaju kratko objašnjen stvarni vertikalni raspored. Nije dodat novi crtež, animacija ili biblioteka.

Raniji uređaj sa dva crvena svetla nije proglašen nevažećim: prelazna odredba iz 21/2024 čuva njegovo značenje do zamene. Uz crtež se razlikuje od sada propisanog crveno/žutog tipa. Dodati su jasni L/C pristupačni nazivi svih crteža, a aktivna crvena na njihovoj tamnoj podlozi ima potvrđen odnos kontrasta 3,254:1.

Nema utvrđenog nesklada ključa u ovom skupu. Pitanja, opcije, ključevi, bodovi, redosled, slike i veze ostaju nepromenjeni. Raniji spoj reči u netačnoj opciji 9365 („prolazu smeru”) zabeležen je za zasebnu usku source/data ispravku.

## Izvori i nezavisni pregledi

- [ZOBS, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Celi čl. 136–150 i 153, uz 20, 34, 47 i 97–101: semafori, pešaci, uslovna strelica, trake i pruga.
- [Pravilnik, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Celi relevantni čl. 71–83; čl. 3 izmene 21/2024 i završne/prelazne odredbe 76/2026: oblici, rasporedi i postavljanje semafora, očuvano značenje ranijih uređaja na pruzi.

Prvi puni pregled 036 /root/learning_visual_second_review; nezavisni 040 /root/a1_safe_harness: sva 41 osnovna pitanja, 122 opcije, 23 originala, cela kartica oba pisma, svih osam SVG/ARIA. Svež javni PIS GET 11.09.2026 potvrdio je iste sadržajne otiske izvora.

Root je pročitao sve završne zamene i celu L/C karticu, pune odlučujuće zakonske odredbe, osam ključnih originala, dodatna tri pitanja/11 opcija i original 9391. Pregledano je i svih 16 završnih mobilnih SVG snimaka. Dodatna tramvajska napomena potvrđena je nezavisnim pregledom prema punom čl. 79.

## Provere i granice

- Root Chromium: **16/16 kartica**, 320/1280, oba pisma/teme, 100/200% osnovnog fonta; tačni tekstovi, osam SVG i njihova imena, 13 atlas + 10 situacija u istom redosledu sa tačnim odgovorima/ARIA.
- Osnovna 41 pitanja: **164/164** prikaza. Dodatna tri: **12/12**. Svako pitanje na oba pisma i obe širine: tačni tekstovi, ključ, objašnjenje, slika kada postoji i stvarne veze. Nema grešaka, prelivanja stranice ili upisa sintetičkog napretka.
- Poslednja promena 9391 ostavlja sve ranije proverene EX podatke potpuno iste. Ukupno 31 tačna izvorna operacija, 14 byQ i jedna kartica; ostali EX podaci i četiri NUL bajta očuvani. Izvor je rekonstruisan tačno iz prethodnog Git stanja i zabeleženih operacija.
- `node tools/verify.mjs`: **249/249**. Ne tvrdi se potvrda svih WCAG zahteva, stvarnog telefona, čitača ekrana ili aktuelnog privatnog portala.

Zatvara se kartica i svih 44 pitanja. Ukupno: 506 reviewed, 5 in-progress, 65 needs-expert, 751 unreviewed; kartice 13 reviewed, 1 in-progress, 25 unreviewed.

Dokazi: ignored output/revizija-20260911/036 i 040; root-approved.json, root-extra-approved.json, root-integration-proof.json, root-browser-result.json, root-extra-browser-result.json, root-svg-*.png.

## Pojedinačna mapa

| ID | Objašnjenje | Osnov i nalaz |
|---:|---|---|
| 9341 | Ispravljeno | ZOBS:142/1/1–2: Crveno zabranjuje prolaz; druga opcija je žuto, treća trepćuće žuto. |
| 9342 | Očuvano | ZOBS:142/1/3,99: Zeleno dozvoljava prolaz; obaveza opreznosti kao značenje znaka pripada trepćućem žutom. |
| 9343 | Očuvano | ZOBS:141/2,142/1/4: Istovremeno crveno i žuto zabranjuje prolaz i najavljuje zeleno. |
| 9344 | Očuvano | ZOBS:138,141/2,142/1/4: Isto crveno+žuto značenje ograničeno na označene smerove. |
| 9346 | Očuvano | ZOBS:142/1/3,99: Na originalu su donja zelena svetla; izabrana dozvola je saglasna. |
| 9348 | Ispravljeno | ZOBS:141/2,142/1/2; SIGNALIZACIJA:73: Vidljivo srednje žuto. Ključ tačno zadržava uslov nemogućeg bezbednog zaustavljanja. |
| 9349 | Očuvano | ZOBS:138,142/1/6: Trepćuće zeleno sa strelicom i dalje dozvoljava prolaz u njenom smeru. |
| 9351 | Ispravljeno | ZOBS:142/1/1–2: Vidljivo gornje crveno. Nema bezbednosnog izuzetka postojanog žutog u značenju crvenog. |
| 9353 | Očuvano | ZOBS:141/2,142/1/4: Vidljivo istovremeno crveno i žuto, još nema dozvole prolaza. |
| 9354 | Očuvano | ZOBS:138,142,143,47: Tačno značenje direkcionog zelenog; postojeće objašnjenje korisno razlikuje ponuđeno mešanje uslovne strelice i levog skretanja. |
| 9355 | Očuvano | ZOBS:142/1/5: Trepćuće žuto je obaveza povećane opreznosti; pravilo znakova/prvenstva ostaje primenjivo. |
| 9356 | Očuvano | ZOBS:142/1/6: Zeleno trepćuće dopušta prolaz i najavljuje žuto pa crveno. |
| 9358 | Ispravljeno | ZOBS:138,142/1/3,143; SIGNALIZACIJA:74; SIGNALIZACIJA:76: Na slici su direkcione zelene strelice ulevo, nisu dodatni bočni uslovni znakovi. |
| 9359 | Očuvano | ZOBS:138,142/1/3: Dve upaljene strelice su levo i pravo; ponuđena samo-jedna ili svi-smerovi nisu tačni. |
| 9360 | Ispravljeno | ZOBS:138,141/2,142/1/2; SIGNALIZACIJA:73: Levo je crni simbol na žutom svetlu; za pravo crni simbol na crvenom. |
| 9361 | Ispravljeno | ZOBS:138,142/1/1: Oba direkciona uređaja daju crveno za levo/pravo. |
| 9362 | Očuvano | ZOBS:138,142/1/2: Postojano žuto sa smerom ima isti izuzetak za bezbedno zaustavljanje. Postojeći tekst ne negira redosled faza, samo pogrešnu dozvolu. |
| 9364 | Očuvano | ZOBS:138,141/2,142/1/1,142/1/4: Crveno ulevo i crveno+žuto pravo: oba puta zabranjena. |
| 9365 | Ispravljeno | ZOBS:138,142/1/1: Crveno sa smerom: zabrana u tom smeru. Ponuđeni izuzetak zaustavljanja je značenje žutog. |
| 9366 | Očuvano | ZOBS:138,142/1/5: Direkciono trepćuće žuto takođe znači opreznost. Ovo je protivdokaz sužavanju na „krug bez strelice” u9373/10412. |
| 9367 | Očuvano | ZOBS:143: Dodatna zelena uz crveno/žuto traži propuštanje putnih tokova i pešaka; nema privilegije javnog prevoza. |
| 9369 | Očuvano | ZOBS:139: Vertikalno crveno–žuto–zeleno; ostale dve opcije imaju pogrešan redosled. |
| 9371 | Očuvano | ZOBS:145/2–3: Putanje1/2 vode srednjom/desnom trakom sa zelenim;3 vodi levom sa crvenim ukrštanjem. |
| 9373 | Ispravljeno | ZOBS:145/4,142/1/5; SIGNALIZACIJA:74–75: Vidljiva kosa žuta nalaže prelazak ulevo, gde se vidi zelena nadole; pitanje eksplicitno navodi treptanje. |
| 9378 | Očuvano | ZOBS:139: Horizontalno crveno–žuto–zeleno; nisu dozvoljene ponuđene zamene zelenog/žutog. |
| 9379 | Očuvano | ZOBS:141/2,142/1/2: Ključ tačno daje zabranu sa izuzetkom; postojeće objašnjenje odbacuje ceo netačan iskaz dozvole, ne tvrdi da iza žutog nema crvenog. |
| 9380 | Očuvano | ZOBS:140,34: Original ima crn bicikl na crvenom/žutom i zelen bicikl na tamnom. Ključ bicikli+mopedi je saglasan; motocikli nisu predmet ovog uređaja. |
| 9381 | Ispravljeno | ZOBS:146/2/2–3,97; SIGNALIZACIJA:78: Zeleni pešak i brojač31: dozvoljen prelaz. Trepćuće zeleno takođe je dozvola, suprotno poslednjoj rečenici objašnjenja. |
| 9382 | Očuvano | ZOBS:146/2/1,97: Vidljiv crveni pešak u gornjem polju. Zabrana ne zavisi od trenutnog nailaska vozila. |
| 9383 | Očuvano | ZOBS:147: Vodoravna bela crta je zabrana; uspravna/kosa označava slobodan smer, ne šine. |
| 9385 | Očuvano | ZOBS:137/3,147/4: Uređaji za tramvaje odnose se i na javni prevoz u zajedničkoj tramvajskoj traci. Nema stvarnog neslaganja opšteg ponuđenog pravila. |
| 9386 | Očuvano | ZOBS:147/3: Original je samo položena bela crta. Ključ zabrane saglasan, nije geometrija šina. |
| 9388 | Očuvano | ZOBS:147/2–3: Original pokazuje upaljenu kosu i uspravnu, ne položenu belu crtu. |
| 9389 | Ispravljeno | ZOBS:137/2,144; SIGNALIZACIJA:82: Original crveno/zeleni dvobojni uređaj u oba rasporeda, bez biciklističkog simbola. |
| 10409 | Očuvano | ZOBS:143: Original trobojni glavni semafor sa crvenim plus bočna zelena strelica udesno. |
| 10411 | Ispravljeno | ZOBS:145/2; SIGNALIZACIJA:75: Original samo crveni X; nema susedne zelene strelice koju sadašnje objašnjenje pretpostavlja. |
| 10412 | Ispravljeno | ZOBS:145/4,142/1/5; SIGNALIZACIJA:74–75: Original kosa žuta strelica nadole/desno; treptanje je dato tekstom pitanja. |
| 10413 | Očuvano | ZOBS:145/3: Original zelena strelica nadole: otvorena traka, nije samo tramvajska dozvola niti promena trake. |
| 11044 | Očuvano | ZOBS:142/1/3,99/1: Zeleno i slobodan pešački prelaz; nijedan prikazani znak ne traži zaustavljanje. Opšte objašnjenje mesta zaustavljanja ne menja konkretan zaključak. |
| 11055 | Očuvano | ZOBS:147/3: Uspravna ili kosa bela crta daju slobodan odgovarajući smer. |
| 9377 | Ispravljeno | ZOBS:148; SIGNALIZACIJA:77: Original je sam beli broj50 na crnom; preporuka brzine, nije minimalna ni maksimalna dozvoljena brzina. |
| 9339 | Očuvano | ZOBS:136: Obe namene i ostale tri opcije proverene prema punom čl.136; tačna dva odgovora i korisno objašnjenje ostaju. |
| 9340 | Očuvano | ZOBS:136: Sva tri ponuđena uređaja proverena; semafori su uređaji po punom čl.136. Tačno objašnjenje ostaje. |
| 9391 | Ispravljeno | SIGNALIZACIJA:83; ZOBS:138: Original prikazuje tri opšta semafora za ovaj prilaz; izdvojeni tramvajski signal nije znak za motocikl. Početna rečenica ograničena na stvarnu situaciju; sve opcije/ključ i ostatak objašnjenja ostaju. |
