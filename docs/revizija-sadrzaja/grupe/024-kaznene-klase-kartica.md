# A6-024 — kazne, poeni i zabrana upravljanja

Datum: 2026-09-11. Verzija: v181. Završena cela kartica `kaznene-klase`, na oba pisma, nakon pojedinačnog pregleda [111 pitanja u v180](024-kaznena-pitanja.md).

## Šta je ispravljeno

Kartica je ranije mešala obrasce starih odgovora baze sa važećim kaznenim odredbama. Sada su odvojeni, uz precizne uslove za brzinu, alkohol, dozvolu, registraciju, zaustavnu traku i odgovornost vlasnika. Obavezna zabrana upravljanja razlikuje se od mogućnosti suda da je izrekne u drugom slučaju. Ispravljeni su i zadržani kratki opisi uz četiri crteža isprava, koji su protivrečili novim crtežima.

Sačuvani su identifikator kartice, sve veze, 13 SVG crteža, pet tabela i šest autorskih odeljaka. Aplikacija prikazuje i postojeći sedmi odeljak sa 23 situacije. Nema novih funkcija, slika, promene ključeva ili simulacije. Naslov više ne predstavlja stare obrasce odgovora kao zakonske klase.

Nezavisno je ponovo prebrojana banka: od 111 pitanja, 89 pita za kaznu; izabrane opcije imaju 25 fiksnih iznosa, 48 raspona, 15 oblika „zatvor ili novčana kazna” i jedan oblik „zatvor i poeni”. Bankovne pamtilice ostaju izričito ograničene na postojeće odgovore. One nisu garancija budućeg ispita niti izvor današnjih sankcija.

## Izvori i pregled

- [ZOBS, prečišćen tekst PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), zaključno sa 19/2025: relevantne materijalne odredbe i čl. 197, 323, 329–338. Pojedinačna mapa je u dokumentu v180.
- [Zakon o prekršajima, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=434479&uuid=faf55794-488b-4680-8fd2-bbff1d658f67), zaključno sa 112/2022–US: čl. 58, opšti okvir zaštitne mere od 30 dana do jedne godine. U evidenciji pitanja 8225 ispravljena je pripadnost izvora ovoj odredbi.
- [Pravilnik o saobraćajnoj signalizaciji, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), zaključno sa 76/2026: čl. 25, tač. 26, znak II-26.1. Ispravljen izvor veze pitanja 8375 i 8409.

Prvi pregled `/root/a1_safe_harness`; root je pročitao ceo završni tekst oba pisma, primarne odredbe i pregledao svih 26 završnih snimaka crteža. Nezavisni završni pregled `/root/learning_visual_second_review` (033) ponovo proverava celu karticu, stvarne brojeve odgovora i završne crteže. Izvori i njihovi otisci registrovani su u `izvori.json`.

## Čitljivost i provere

Sitni natpisi povećani su na 13 jedinica SVG-a; na širini 320 px najmanji stvarni natpis je 12,49 px. Crveni i zeleni tekst koriste postojeće boje teme. U tri crteža poboljšan je kontrast kolovoza, oznaka i putanja; položaji i značenje ostaju isti. Svi SVG pristupačni opisi odgovaraju izabranom pismu.

- Stvarni Chromium: 16/16 kombinacija širine 320/1280, oba pisma, obe teme i običnog/dvostrukog osnovnog fonta; tačna kartica i ćelije tabela, bez prelivanja, isečenih ili preklopljenih natpisa.
- Veze svih 111 pitanja na oba pisma: 222/222. Bez grešaka stranice i upisa u sintetičko skladište.
- Posle povećanja četiri mala natpisa ponovljena je matrica geometrije 16/16. Nakon poslednjih izmena samo boja ponovljeni su konačni mobilni prikazi oba pisma i pregled svih 26 snimaka.
- Posebna provera stvarnih boja i teme: 2/2. Odabrane informativne granice imaju najmanje 3,406:1 (kontura vozila na poluprovidnoj zaustavnoj traci u tamnoj temi); bele oznake na neprozirnom kolovozu 3,435:1. Prva pomoćna formula čitala je CSS promenljivu sa korena dokumenta, umesto sa kartice; ispravljena provera potvrđuje i stvarnu tamnu pozadinu. Nije reč o promeni aplikacije.
- Tačna rekonstrukcija generatora iz v180, četiri NUL bajta očuvana; menja se samo jedna kartica u `EXPLAIN`. `node tools/verify.mjs`: 249/249.

Dokazi su u ignorisanim `output/revizija-20260911/024/` i `033/`. Konačni otisak generatorskog izvora: `2f3ddeab547da286e2a8003b8c6f2904f17dc6bfc034af052fb0d942f3c0ec14`.

Kartica zatvara 51 prethodno pojedinačno provereno pitanje. Preostalih 60 pitanja iz ove grupe zadržava `needs-expert`: ispravka objašnjenja nije potvrda aktuelnog ključa zvaničnog portala. Ukupno: 247 reviewed, 4 in-progress, 62 needs-expert, 1.014 unreviewed; kartice 9 reviewed, 1 in-progress, 29 unreviewed. Ovo nije potvrda celokupnog sadržaja, svih kombinacija kontrasta, stvarnih čitača ekrana ili fizičkih telefona.
