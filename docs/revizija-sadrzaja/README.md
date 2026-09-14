# Rezultat sadržajne revizije

Stanje razvojne grane od 14. septembra 2026: svih **1.327 pitanja i 39 kartica** (38 tema i FAQ) pojedinačno je obuhvaćeno. **1.250 pitanja ima zatvoren pregled, 77 ostaje za stručnu potvrdu.** Svako pitanje ima pojedinačan nalaz; stručni zaključak za 77 pitanja ostaje otvoren. Svih 39 kartica ima zatvoren pregled.

Završen je planirani pojedinačni pregled pitanja i kartica. To ne znači da je instruktor potvrdio svaku tvrdnju, da nema preostalih grešaka ili da tekući zvanični portal nužno koristi identičnu banku. Ključevi odgovora nisu samovoljno menjani da bi odgovarali objašnjenju.

- [Otvorena pitanja za vlasnika/instruktora](OTVORENA-PITANJA.md): svih 77 ID-jeva, kratak razlog, prioritet i dokazni link.
- [Manifest](manifest.json): aktuelni brojevi i otisci ulaza. Oznaka `semanticAccuracy` izričito kaže da alat sam ne potvrđuje semantičku tačnost.
- [Metodologija](METODOLOGIJA.md): šta znači svaki status, kako se beleže izvori i kako promena sadržaja ponovo otvara proveru.
- [Dokazi po grupama](grupe/): pročitani opseg, nalazi, ispravke, izvori, drugi prolaz i provere prikaza.
- [Pitanja](pitanja.jsonl), [kartice](kartice.jsonl) i [izvori](izvori.json): potpuna mašinski čitljiva evidencija i istorija. To nisu dodatni podaci koji se učitavaju u aplikaciju.

Broj 39 uključuje FAQ; opis proizvoda sa 38 tematskih kartica zato nije neslaganje. Postoje 704 originalne slike pitanja, a 652 različite slike koriste se i u atlasu/situacijama pojmovnika.

`node tools/audit-content.mjs --check` potvrđuje da su evidencija i otisci saglasni. Stroži `--require-reviewed` namerno ne prolazi dok postoji 77 stručnih nedoumica. Za njihovo zatvaranje potreban je konkretan datiran dokaz, a ne promena statusa radi zelenog testa.

Izmena zajedničke kartice može promeniti otisak više pitanja. Takav prenos prethodnog pregleda mora imati precizan dokaz o tome šta se promenilo, kao kod [četiri tipografske korekcije v213](grupe/092-stamparske-korekcije.md); broj zavisnih zapisa nije broj novopročitanih pitanja.
