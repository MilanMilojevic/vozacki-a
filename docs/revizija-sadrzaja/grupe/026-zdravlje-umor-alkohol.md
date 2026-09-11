# A6-026 — zdravlje, umor i alkohol

Pregledana je cela kartica `vozac-zdravlje-alkohol`, na oba pisma: pet tabela, poređenje alkohola i svi pasusi. Nema slika, SVG-a, atlasa ili situacija. Osam zavisnih pitanja (8062, 8063, 8064, 8065, 8074, 8075, 8077, 8082) pripada pojedinačnom pregledu A6-018; ova verzija ih ne proglašava završenim.

## Korekcije u v176

- Zabrana zbog umora, bolesti ili psihičkog stanja vezana je za nesposobnost bezbednog upravljanja. Stručni pregled utvrđuje tu nesposobnost; tekst više ne zvuči kao opšte pravilo medicinske dijagnostike.
- Poređenje alkohola tačno odvaja zakonsku listu nulte tolerancije od ostalih vozača. Kategorije AM/A1/A2/A nisu svedene samo na vozila sa dva točka.
- Kontrolni zdravstveni pregled, privremeno isključenje i oduzimanje dozvole opisani su sa svojim uslovima. Uklonjena je neproverena tvrdnja da kod isključenja dozvola nužno ostaje kod vozača.
- Šablon simulacije ne predstavlja se kao garancija sastava budućeg stvarnog ispita. Probne brzine kratko su označene kao opšte pravilo.

Ukupno 12 tačnih zamena izvornog teksta. Nema izmene ključeva, bodovanja, pojedinačnih objašnjenja, drugih kartica, veza ili funkcionalnosti. Raspored odeljaka ostaje isti; lakše pronalaženje pasusa o umoru unutar kartice ostaje uredničko poboljšanje za kasnije.

## Izvor i provera

[PIS — Zakon o bezbednosti saobraćaja na putevima](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), tekst zaključno sa 19/2025, javno ponovo preuzet 11.09.2026. Pročitani puni relevantni čl. 91, 182, 187, 191–193, 279–281. SHA-256: `8796f6a1718bea08ea4fe1dedb3c9a71001b1c6c5245a93526f365a61e668d5d`.

Agent je pregledao celu karticu i vezu sa pregledom pitanja; root je nezavisno pročitao primarne odredbe, sve zamene i ceo generisani izlaz oba pisma. Dokazana je tačna inverzija izvornih zamena, očuvanje četiri NUL znaka i svih ostalih podataka u `EXPLAIN`.

Chromium na odvojenom portu 19171: 16/16 prikaza pojmovnika (oba pisma i teme, širine 320/1280, običan i dvostruki osnovni font), plus 16/16 otvaranja uz osam pitanja na oba pisma. Svih pet tabela ima tačan sadržaj; nema prelivanja stranice, grešaka izvršavanja ni upisa u sintetički napredak. Root je pregledao snimke mobilne tabele i poređenja. Ovo nije provera fizičkog telefona ili čitača ekrana.

Lokalna provera: `node tools/verify.mjs`, 249/249. Detaljni privremeni dokazi: `output/revizija-20260911/026/` (ne šalju se u Git).
