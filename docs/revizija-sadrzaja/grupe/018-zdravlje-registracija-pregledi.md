# A6-018 — zdravlje, registracija i tehnički pregledi

Pojedinačno je pregledano svih 40 pitanja podoblasti 103, 126 i 127, sa svim opcijama, ključevima i objašnjenjima na oba pisma. Sva imaju `img:0`. Prvi sadržajni pregled nezavisno je ponovljen u A6-027; root je proverio konačne izmene, relevantne primarne odredbe i stvarni prikaz.

## Konačne izmene v178

Ispravljeno je **17 objašnjenja**: 8063, 8423, 8424, 8427, 8428, 8429, 8434, 8436, 8441, 8442, 8443, 8446, 8451, 8461, 10687, 10705 i 10706. Uklonjene su netačne tvrdnje o isključivanju druge odgovornosti, univerzalnim registracionim rokovima i automatskom skidanju tablica. Precizirani su najduži rok privremenih tablica, odredišta privremene vožnje, opšti režim pregleda i uslov prethodne popravke.

Zadržana su korisna objašnjenja zašto druge opcije ne odgovaraju: razlika kontrolnog i šestomesečnog pregleda, identifikacione oznake i broja motora, kao i saobraćajne dozvole i polise/nalepnice. Ostala 23 objašnjenja ostaju ista. Nema promene pitanja, opcija, ključeva, redosleda, bodova, slika, kartica ili funkcionalnosti.

Ne proširujemo odgovor svim posebnim režimima kada pitanje jasno traži opšte pravilo. Zato 8425 i 8443 ne zahtevaju `needs-expert`: prvo suprotstavlja zabranu izmišljenom automatskom roku od 5/15 dana, a drugo proverava upis korišćenja nasuprot samom ugovoru. Posebni uslovi imaju mesto u kartici i konkretnim pitanjima (npr. 8436). Kod 8462 postojeća sumnja policijskog službenika ima izričit osnov u čl. 287; tačno objašnjenje nije menjano.

## Izvori

- [PIS — ZOBS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), zaključno sa 19/2025; relevantni čl. 187, 191–192, 246, 249, 253–254, 264–266, 268–269, 274, 276 i 287. Ponovo preuzet 11.09.2026; SHA-256 `8796f6a1718bea08ea4fe1dedb3c9a71001b1c6c5245a93526f365a61e668d5d`.
- Pravilnik o tehničkom pregledu vozila, aktuelni PDF sa sajta MUP-a (31/2018, 70/2018, 62/2022), ceo čl. 29. Izvorni URL je u registru `izvori.json`; SHA-256 `c5a5c1c079941b88d0c59838223f74ee9e242d0713059ba7f1f60e44b0e757cc`. Javna PIS pretraga izdanja proverena je radi aktuelnosti konkretnog pravilnika.

## Provera i status

Root je primenio 14 tačnih izvornih zamena za 17 objašnjenja: zajednički tekstovi za parove pitanja ostali su zajednički, a pogrešno objedinjeni rokovi razdvojeni prema pitanju. Dokazana je potpuna inverzija i očuvanje četiri NUL znaka. Generisani izlaz tačno odgovara odobrenom tekstu oba pisma; svi ostali podaci `EXPLAIN` ostaju isti.

Chromium: **160/160 stvarnih prikaza**, svih 40 pitanja na oba pisma i širinama 320/1280, uz proveru teksta, ključeva i otvaranja stvarne zavisne kartice. Bez grešaka izvršavanja, prelivanja ili upisa sintetičkog napretka. Root je pregledao mobilni snimak novog objašnjenja. `node tools/verify.mjs`: **249/249**. Ovo nije tvrdnja da je aktuelni portal ponovo proveren ili da je svaka zavisna kartica već završena.

Osam pitanja o zdravlju sada je `reviewed`, jer je cela kartica završena u A6-026/v176. Ostala 32 pitanja imaju završene pojedinačne provere, ali su `in-progress` do završetka kartice `vozilo-tehnika` u A6-025. Ukupna evidencija: **164 reviewed / 36 in-progress / 2 needs-expert / 1.125 unreviewed**. Ranije mešano pismo u 8429 i 8441 popravljeno je u v173 i ne vodi se ponovo kao otvoren nalaz.

Detaljni privremeni dokazi: `output/revizija-20260911/018/` i `027/`; nisu deo Git isporuke.
