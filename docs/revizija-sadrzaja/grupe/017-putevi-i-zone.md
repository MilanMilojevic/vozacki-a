# A6-017 — Putevi i tehničko regulisanje

Datum 2026-09-11, v174. A1 je pregledao svih 44 pitanja podoblasti 109 i 115: oba pisma, sve opcije, ključeve i objašnjenja, uz neposredni pregled svih 24 originalnih JPEG. A0 je nezavisno preispitao svih 19 predloga ispravki; root ih je pročitao uz stvarne opcije i neposredno pregledao svih deset fotografija na koje se izmenjena objašnjenja odnose.

ID-jevi grupe: 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8101, 8102, 8103, 8104, 8105, 8106, 8107, 8108, 8109, 8111, 8113, 8114, 8116, 8118, 8124, 8125, 10603, 10604, 10605, 10606, 10607, 10608, 10609, 10610, 10611 i 10702.

Primenjena su 19 kratkih objašnjenja. Konkretno, 8109 sada pravilno razlikuje biciklistički od pešačkog prelaza; 8111 pravilno opisuje sive i crvene površine i položaj bicikliste. Ostale ispravke uklanjaju preširoko tumačenje pomoćnih strelica i vraćaju precizne definicije staza, traka, trotoara i ostrva. Motoput dobija tačan spisak vozila, prvenstvo sa zemljanog puta odgovarajući uslov, a školska zona izuzetak koji se odnosi na vreme važenja. Uklonjene su nedokazane tvrdnje o dečjoj igri i izjednačavanje trajanja prekida sa definicijom zaustavljanja.

Početne nedoumice za 8083/8084 preispitane su u drugom prolazu uz svaku stvarnu opciju. Ulica, pešačka/biciklistička staza i zemljani put izričite su zakonske vrste puta; ostali konkretni opisi ne daju potrebne zakonske elemente. Generički plato nije samim tim zakonski proglašen trg. Tekst zato objašnjava konkretan izbor, bez univerzalnog isključivanja svake privatne površine. Ovaj zaključak ne zatvara druga ranije sporna pitanja 7930/7931.

Primarni izvori: [važeći ZOBS kroz 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), član 7 i članovi 47, 100–101, 160–164; [signalizacija kroz 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), konkretni znaci i oznake iz registra. Svako pitanje ima pojedinačnu referencu i nalaz u evidenciji; ovo nije pripisana potvrda instruktora.

Root je potvrdio tačnu inverziju izvornih zamena, četiri očuvana NUL bajta i nepromenjenost svih ostalih EX podataka. Pitanja, opcije, ključevi, bodovi, slike i veze nisu menjani. Chromium: 76/76 stvarnih prikaza izmenjenih objašnjenja, oba pisma i širine 320/1280, bez prelivanja stranice i upisa napretka. `node tools/verify.mjs`: 249/249.

Sadržaj pojedinačnih pitanja je pregledan; zavisnosti `put-pojmovi` i `pruga` ostaju otvorene do sopstvene završne provere. Ispravke slova u 8092/8094/10611 završene su prethodno u v173. Radni dokazi: `output/revizija-20260911/017/records.json`, `root-approved.json`, `integration-proof.json`, `root-browser-result.json`, `root-verify.log` i nezavisni pregled `../023/review.md`.
