# A6-083/089 — parovi znakova, obaveštenja i kazne

Datum: 2026-09-14. Verzija: v209. Dva potpuna pregleda 18 pitanja, 54 opcije, 17 originalnih JPEG, starih i konačnih EX oba pisma. Tri cele kartice: zn-ob-parovi, znakovi-obavestenja i kazne, ukupno dve tabele, bez SVG. Poslednja je pregledana iako nema povezanih pitanja. Prihvaćeno 12 EX i 19 uskih kartičnih operacija, spojeno u 15 jedinstvenih izvornih zahvata. Nema promene pitanja, opcija, ključeva, slika, veza ili simulacije. Svih 18 reviewed, bez novih needs-expert.

## Šta je popravljeno

Parovi znakova preciznije razlikuju obaveštenje i režim koji se mora poštovati, oznaku parkiranja, vrste prelaza i namenu traka. Zabrana autobusa nije logička suprotnost rezervaciji trake za sva vozila javnog prevoza; uklonjena je takva tvrdnja iz kartice i 10918. Završetak puta sa prvenstvom u 9122 ne znači automatski da sledeća raskrsnica nema drugu signalizaciju. Pregled obaveštenja pravilno razdvaja boje samostalnih brojeva puta i bele kilometarske table, uz aktuelne odredbe i prelazni rok. Kazne nisu automatski zbir svih prikazanih mera: pojašnjene su alternative i zakonski uslovi.

Postojeći rombovi i duga oznaka zabrane upravljanja sada se prelamaju u sopstvenim granicama. Uži naslov kartice staje i u vezu prikazanu uz pitanje na telefonu sa uvećanim tekstom. Nema novih dijagrama ili zajedničke CSS promene.

Prvi pregled predložio je 11 EX; drugi je precizirao dve kartične rečenice i 10918, te dodao usku dopunu 9122. Šest EX ostaje neizmenjeno uz individualni pregled. Root je posebno proverio te četiri dopune i primarne odredbe. [SIGNAL76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): puni relevantni18,25–26,34–35,43–45,49–52 i posebni završni prelazni49–50; [ZOBS19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311):20,135,329–330. Sveži HTTP14Sep potvrđuju iste primarne bajtove; 089 dodatno neposredno čita primarne prikaze znakova. Nije stručna pravna potvrda.

## Provera

Nezavisni089:144 stvarna odgovaranja/432 opcije/136 originalnih slika, 48 celih kartičnih konteksta, 32 pomeranja tabela do kraja, 256 granica teksta ćelija pri200%, 176 granica oznaka i272 atlas učitavanja. Sopstvene pre/posle/vrati provere dokazuju svaki od tri uska layout zahvata: širina naslova325→320→325 na latinici; rombovi3L/4C izlaska→0→povratak; oznaka kazni326L/323C→320→povratak. Najmanji mereni obični kontrast4,75884:1.

Root na stvarnom v209, bez injekcije kandidata:48 celih kartica i144 stvarna odgovaranja,432 opcije i12 zoom/pan/fit tokova, oba pisma/teme320/1280 i stvarnih200% za odgovore. Provereni celi tekstovi, tabele do poslednje kolone, slike, odgovori i dostupni nezaklonjeni završeci. Početna greška root mernog selektora brojala je izvorni HTML kao da već sadrži runtime dugmad odeljaka; sačuvana dijagnostika, očekivanje potom vezano za stvarnu strukturu i atlas. Proizvod nije menjan zbog te greške.

Potvrđeno svih390 zamrznutih datoteka083/089. Cela stara generacija jednaka v208 runtime-u; nova menja samo tri odobrene kartice i12 EX. Originalni SUB objekat, četiri NUL, potpuno vraćanje izvornih zahvata i jednakost ostalog sadržaja. Source SHA778a1ad7e5c383a9ae336e9d0b47720d44fc7bd391e3072e9368565606fd65b6. Korisnikov Chrome/napredak i8137/18980 nisu korišćeni; root19171, prazni odbačeni konteksti.

Dokazi: output/revizija-20260911/083/{report.md,root-approved.json,root-integration-proof.json,root-integrated-browser-result.json,root-verify-v209.log};089/{report.md,individual-records.json,card-records.json,verification.json,browser-result.json,cards-browser-result.json,table-cell-result.json,peer-deltas.json}. Rezultat celog projektnog verifikatora beleži IZVRSAVANJE-PLANA.md. Lokalna Chromium provera nije fizički telefon ili WCAG sertifikat.
