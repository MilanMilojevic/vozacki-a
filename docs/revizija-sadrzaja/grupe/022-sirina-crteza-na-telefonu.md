# A4-022 — više prostora za crteže u pojmovniku

U v177 crteži pune širine u pojmovniku koriste po 18 px unutrašnjeg bočnog prostora kartice kada je ekran širok najviše 370 px. Na ekranu od 320 px tipično platno raste sa 258 na 294 px, unutar spoljašnjeg okvira kartice. Tekst i elementi crteža povećavaju se zajedno, bez promene njihovog međusobnog rasporeda. Zadržani su postojeći `max-width` i male sličice sa fiksnim dimenzijama.

Promena je pet redova CSS-a, uz verzionisanje. Pitanja, objašnjenja, podaci, bodovanje i napredak nisu menjani. Šire prikaze i crteže uz pitanje novi selektor ne obuhvata.

## Dokazi i granice

- Prvi inventar: 35 kartica i 165 SVG-a; 66 crteža u 14 kartica ima bar jedan natpis ispod internog cilja od 12 efektivnih piksela na 320 px. Ovo je radni prag čitljivosti, ne tvrdnja da WCAG propisuje univerzalni minimum fonta.
- Agentov prototip: 120 poređenja reprezentativnih pet kartica na 320/390/1280, oba pisma i teme, u pojmovniku i uz pitanje. Na širem ekranu i uz pitanje dimenzije su iste; na uskom ekranu poboljšani prikazi ostaju unutar kartice. Root je pregledao mobilni prikaz svetala i parkiranja.
- Root je proširio proveru na svih **26 aktuelnih kartica sa SVG-om**: oba pisma i teme, širine 320/370/371, aplikacijski font 1,25. **312/312 poređenja** sa privremenim kandidatom, pa još **312/312 sa stvarnim produkcionim CSS-om v177**, privremeno isključenim i ponovo uključenim u praznim test-kontekstima. Nema novog izlaska iz kartice, preklapanja zasebnih SVG-a, smanjenja natpisa, prelivanja stranice, izmene HTML-a ili upisa sintetičkog napretka. Selektor ne menja dimenzije fiksnih sličica; preko granice od 370 px veličine ostaju iste.
- `node tools/verify.mjs`: 249/249. Pojedinačni dokazi i snimci su u ignorisanom `output/revizija-20260911/022/`.

Ovo povećanje **ne zatvara sve nalaze sitnih natpisa**. Na primer, prototip podiže pojedine legende dometa svetala sa približno 9,27 na 10,57 px; i dalje treba pažljivo skratiti ili prelomiti odgovarajuće natpise. Konačna čitljivost, značenje i kontrast vode se po kartici. Nije izvršena nova provera fizičkog telefona ili nativnog browser zoom-a. Ranija matematička ideja platna od 306 px odbačena je jer bi prešla spoljašnji okvir; nije primenjena.
