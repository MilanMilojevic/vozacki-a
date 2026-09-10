# Merljiv napredak i obim

Presek 2026-09-10, poslata v161 (`d7c003c775f40d12bc27e1d7ea1ddb87a77cc5f2`). Nastao nakon korisnikove opravdane primedbe na ponavljanje procene „trećina”. Ta procena je povučena: nije bila zasnovana na definisanom ukupnom radu. Ovaj dokument je istorijski presek, ne živi brojač kasnijih izdanja.

## Šta je završeno

Izolacija, bezbedna provera bodovanja i dnevni cilj/procena spremnosti su završene celine. Osnovna zaštita čuvanja, oštećenog zapisa, rezervnih kopija i više tabova je završena. Pristupačnost/telefon, offline izdavanje i dokumentacija/prava imaju otvorene delove. B1–B3 (novo obogaćivanje sadržaja i druge kategorije) nisu započeti kao završene celine. Nisu potvrđeni stvarni telefoni, kompletna upotreba čitača ekrana ili stručna instruktorska revizija.

Sadržajni status iz `manifest.json`, zasebno od broja tehničkih testova:

| Obuhvat | v140 | v161 |
| --- | ---: | ---: |
| Potpuno pregledana pitanja | 0 | 15 |
| Pitanja u toku | 2 | 29 |
| Nepregledana pitanja | 1.325 | 1.283 |
| Potpuno pregledane kartice | 0 | 2 |
| Kartice u toku | 0 | 2 |
| Nepregledane kartice | 39 | 35 |

Na v161, 15/1.327 = **1,13%** pitanja je potpuno zatvoreno. Ukupno 44/1.327 = **3,32%** ima započet ili završen pojedinačni pregled. To ne znači da je trećina cele revizije završena. Kod parkiranja su pitanja/objašnjenja pročitani, ali povezani crteži ostaju otvoreni. Jedan ukupan procenat koji jednako sabira malu tehničku ispravku i kompletnu reviziju baze bio bi obmanjujući.

## Koliko je koda dodato

Izmereno sa `git diff --numstat v140 v161` i veličinama Git blobova (bez Windows CRLF razlika):

| Neto redovi od v140 do v161 | Broj |
| --- | ---: |
| Aplikacijski fajlovi, uključujući CSS/SW/server | +516 |
| Testovi i testne fiksture | +1.991 |
| Dokumentacija i evidencija pregleda | +1.733 |
| Nastavni izvori/generisani podaci | +82 |
| Razvojni alati | +34 |

Oko **85% neto novih redova** čine testovi i dokumentacija/evidencija, koji se ne učitavaju kao aplikacija. To nije dokaz da je preostali rast besplatan: `app.js` je od v140 porastao sa 4.541 na 4.968 redova (**+427, 9,4%**), odnosno sa 300.149 na 327.854 bajta. Od polazne v126 ima **+913 redova, 22,5%**. Generisani `explanations.js` ostaje približno 2,44 MB i nešto je kraći nego u v140; broj redova jednog JSON izlaza nije dobra mera njegove složenosti.

Pripremljeni pregled sačuvanih ispita, kasnije v162, zasebno dodaje još **126 neto redova app.js** i ovde nije uključen u poređenje poslatih verzija.

## Kritički zaključak i nastavak

Zaštita napretka ima potvrđene slučajeve prepisivanja/gubitka podataka i opravdava dodatne provere. Browser istorija i prikazi novih tabova jesu tražena funkcionalna dogradnja, a ne samo popravka početne aplikacije. Posebno otvaranje konkretnog starog pokušaja nije neophodno za bezbednost osnovnog učenja; zato je odvojena, samostalno povratna celina.

Najveću složenost nose međuzavisna stanja pisanja/rezervnih kopija i paralelni mehanizmi navigacije, skrola i privremenog prikaza. Moguće kasnije sređivanje: zajednička validacija ruta i objedinjeno pamćenje skrola/fokusa. Samo razbijanje fajla na module ne rešava tu složenost. Ne uklanjati zaštite pre/posle asinhronog rada radi lepšeg broja redova.

Obim novih funkcija se zamrzava; završavaju se prihvaćene celine i potvrđeni kvarovi. Predlozi novih naslova tabova i dodatnih funkcija ostaju odvojeni. Za male tekstualne/CSS izmene dovoljan je fokusiran dokaz sa odgovarajućom integracijom i jedan završni `verify`; ponavljanje cele velike vizuelne matrice za `byQ` tekst bilo je preširoko. Sadržajna revizija nastavlja se po manjim grupama sa jasnim brojem stvarno pročitanih i zatvorenih zapisa.

Broj verzija i prolaznih testova nije procenat napretka. Budući status treba da navede konkretno završene celine, preostale prepreke i merljivu pokrivenost sadržaja.
