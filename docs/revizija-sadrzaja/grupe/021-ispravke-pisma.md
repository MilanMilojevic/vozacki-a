# A6-021 — Ispravke pomešanih pisama

Datum 2026-09-11, v173. Pregledana su sva 5.600 ćirilična polja javne baze. A1 je izdvojio neželjena latinična slova i zasebno proverio međunarodne kodove pneumatika; root je pročitao svih 37 konkretnih parova prema latiničnoj verziji i primenio samo njihove vrednosti. Ovo je urednička provera pisma, ne potvrda tačnosti cele baze.

Ispravljene su 22 vrednosti srpskih reči: nazivi podoblasti 91, 98 i 125; tekstovi pitanja 10613, 8092, 8094, 8441, 9360 i 8314; opcije 33705/10611, 28200/8821, 26937/8429, 30478/9559, 30894 i 30892/9691, 28808/9018, 28811/9019, 34883/10990, 30186/9467, 26577/8301, 26580/8302 i 26727/8351. Zamene su samo zaostala slova O/e/a/o i reč je.

Zasebno je ispravljeno 15 vrednosti međunarodnih kodova: pitanja 8815–8824 koriste doslovne N/T iz svog latiničnog para; četiri opcije 28180, 28191, 28205 i 28210 koriste N; pitanje 8829 koristi TWI. Ćirilično Н izgleda kao latinično H, pa nije odgovarajuća zamena za fabrički N. Jedinice, ostali fabrički kodovi i natpisi BUS/STOP ostaju nepromenjeni. Značenje brzinskih indeksa ovim paketom nije novo potvrđeno.

Istih 37 javnih vrednosti usklađeno je sa 45 izvornih vrednosti u `tools/base-A-cyr.json`; dodatnih osam su ponovljeni nazivi podoblasti 91 u metapodacima njenih pitanja. Promenjeni su samo locirani JSON string tokeni, uz proveru stabilnih ID-jeva i tačnog prethodnog teksta. Sve ostalo je očuvano bajt po bajt: latinični sadržaj, ID-jevi, ključevi, bodovi, redosledi, datumi i otisci slika.

Puni generator baze nije pokrenut zbog već dokumentovane razlike od 1.112 redosleda opcija pri obnovi. Ova mala urednička ispravka nije povod da se promeni raspored odgovora. Ispravljeni izvor će sačuvati ove tekstove i pri budućoj stvarnoj obnovi.

Provere: tačna inverzija svih zamena, odbijanje zastarelog before teksta, nepromenjenost svih ostalih JSON putanja; 72/72 stvarna prikaza pitanja na oba pisma u zasebnim praznim Chromium kontekstima i četiri prava osvežavanja. Renderovani tekst i sve opcije poklapaju se sa očekivanim podacima; bez upisa napretka i prelivanja stranice. `node tools/verify.mjs`: 249/249.

Raniji sadržajni pregledi ostaju važeći samo gde dokaz potvrđuje da se promenilo isključivo pismo. Zatvaraju se tačno ranije evidentirane prepreke u nazivu podoblasti 91 i pitanju 10613; nova neproverena pitanja nisu automatski proglašena sadržajno pregledanim.

Dokazi: `output/revizija-20260911/021/changes.json`, `proof.json`, `root-apply-proof.json`, `root-browser-result.json` i `root-verify.log`. Git diff sadrži tačne primenjene tekstove u oba javna fajla.
