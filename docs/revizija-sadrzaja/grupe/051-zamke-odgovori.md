# A6-051 — zamke u ponuđenim odgovorima

Datum: 2026-09-11. Verzija: v190. Cela kartica oba pisma, njena dva tabelarna prikaza i **3 povezana pitanja /12 opcija**:7925,9531,9689. Nema izvornih slika ni SVG-a u ovom zavisnom skupu.

## Ispravke

Tvrdnja da250m nikad nije tačno uklonjena je: pitanja8950/10781 sadrže tačan raspon150–250m. Primer sada razlikuje odstojanje/rastojanje9531 i mimoilaženje9689. Broj pojava50.000 ispravljen je sa7 na10. Izrazi najudobnija i što pre odgovaraju stvarnim opcijama, bez dodate tvrdnje o stizanju na odredište. Svih13 zadržanih statističkih obrazaca provereno je prema4170 ponuđenih opcija.

Uklonjen je savet da je stroži odgovor verovatnije tačan. Učestalost je jasno označena kao osobina sačuvane banke. Ispravljena je zamena znakova i žmigavaca: Potvrda pravca9176, prethodno prestrojavanje10944 i Raskrsnica10954 su tri različita znaka. Pročitana su sva njihova pitanja/opcije/objašnjenja i pojedinačno pregledane originalne fotografije. Treći primer ujedno čuva zaseban mobilni odeljak sa odgovarajućim naslovom kroz postojeći prag generatora.

Nema izmene pitanja, ključeva, redosleda, bodova, veza, byQ objašnjenja, globalnog CSS-a, app.js ili ponašanja simulacije. Izmena je12 lokalnih fragmenata jedne kartice; ostatak generatora je potpuno rekonstruisan kao nepromenjen, sa očuvana4 NUL bajta.

## Provera i granice

- Prvi pregled /root, nezavisni /root/a0_sanitize u A6-052, završna integracija /root. Pročitana cela L/C kartica i svih12 opcija oba pisma. Dve precizne peer dopune primenjene.
- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Celi čl.3,21,51: načela, odstojanje/rastojanje i mimoilaženje.
- [Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Čl.22; čl.36 t.117,118,129: položaj znakova opasnosti i tri znaka za vođenje. Reference iz36 proverene kao konkretne tačke, ne tvrdi se da je ceo dugi član ponovo pročitan.
- Integrisani Chromium:16/16 prikaza kartice,320/1280,oba pisma/teme,100/200% osnovnog fonta;12/12 prikaza pitanja. Tačan konačni HTML/tabele, bez prelivanja stranice, grešaka ili upisa sintetičkog napretka. Ovo nije test fizičkog telefona ili potpuna WCAG ocena.
- Postojeća celovita provera: node tools/verify.mjs; rezultat je u ignored051/root-verify-v190.log. Posebna scoring skripta se ne računa u taj rezultat.
- Dokazi: ignored051/052, scope.json, proof.json, root-approved.json, root-source-operations.json, root-integration-proof.json i root-browser-result.json. Sadržaj ostalih kartica nije prećutno proglašen pregledanim.

| ID | Nalaz |
|---:|---|
|7925|Oba načela iz čl.3, uključujući uslov bezbednosti, tačno su preneta. Preostaje cela druga kartica razno-pravila.|
|9531|Čl.21 zahteva bezbedno odstojanje i rastojanje prema okolnostima, a ne ponuđene fiksne mere. Preostaje provera i uklanjanje nerelevantne implicitne veze prvenstvo-prolaza u A6-046.|
|9689|Čl.51 zahteva dovoljno levo rastojanje i pomeranje udesno po potrebi. Jedina preostala kartica zamke-odgovori sada je pregledana; nocard je očuvan.|
